import pkg from '@simplewebauthn/server';
const { 
    generateRegistrationOptions,
    generateAuthenticationOptions,
    verifyRegistrationResponse,
    verifyAuthenticationResponse
} = pkg;


// Import helpers for encoding and decoding
import helpersPkg from '@simplewebauthn/server/helpers';
const { base64url } = helpersPkg;

import prisma from '../../../utils/database/prisma.js';
import ApiError from '../../../utils/error/api.error.js';
import asyncHandler from '../../../utils/middleware/async.handler.js';
import { generateTokens } from '../../token/token.controller.js';
import { encode } from 'querystring';


// Constants for WebAuthn
const rpName = process.env.WEBAUTHN_NAME;  // Pregnify
const rpID = process.env.WEBAUTHN_RP_ID; // localhost
const origin = process.env.WEBAUTHN_ORIGIN; // http://localhost:8080

/**
 * Generate registration options for passkey
 */
export const generatePasskeyRegistration = asyncHandler(async (req, res) => {
    // Check if user exists in request
    if (!req.user) {
        throw new ApiError(401, 'User not authenticated');
    }

    // Get user ID from authenticated user object
    const Id = req.user.id || req.user.userId;
    
    if (!Id) {
        throw new ApiError(401, 'Invalid user ID');
    }

    try {
        // Get user from database
        const user = await prisma.user.findUnique({
            where: { 
            id: Id 
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            passkeys: {
                select: {
                    credentialID: true
                }
            }
        }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Generate registration options
    const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: user.id,
        userName: user.email,
        userDisplayName: `${user.firstName} ${user.lastName}`,
        attestationType: 'none',
        authenticatorSelection: {
            residentKey: 'required',
            userVerification: 'preferred',
            authenticatorAttachment: 'platform'
        }
    });

    // Store challenge in database
    await prisma.webAuthnChallenge.create({
        data: {
            userId: user.id,
            challenge: options.challenge,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        }
    });

    res.json({ 
        message: 'Passkey registration options generated successfully', 
        success: true,
        options
    });

    } catch (error) {
        throw new ApiError(500, 'Failed to generate passkey registration options');
    }
    
});

/**
 * Verify passkey registration
 */
export const verifyPasskeyRegistration = asyncHandler(async (req, res) => {
    // Check if user exists in request
    if (!req.user) {
        throw new ApiError(401, 'User not authenticated');
    }

    // Get user ID from authenticated user object
    const Id = req.user.id || req.user.userId;
    
    if (!Id) {
        throw new ApiError(401, 'Invalid user ID');
    }

    const { credential } = req.body;

    if (!credential) {
        throw new ApiError(400, 'Credential data is required');
    }

    const user = await prisma.user.findUnique({
        where: { id: Id },
        include: { passkeys: true }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Get stored challenge
    const expectedChallenge = await prisma.webAuthnChallenge.findFirst({
        where: {
            userId: user.id,
            expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
    });

    if (!expectedChallenge) {
        throw new ApiError(400, 'Challenge expired or not found');
    }

    let verification;
    try {
        verification = await verifyRegistrationResponse({
            response: credential,
            expectedChallenge: expectedChallenge.challenge,
            expectedOrigin: origin,
            expectedRPID: rpID
        });
    } catch (error) {
        console.error('Verification error:', error);
        throw new ApiError(400, `Passkey verification failed: ${error.message}`);
    }

    const { verified, registrationInfo } = verification;

    if (!verified || !registrationInfo) {
        throw new ApiError(400, 'Passkey verification failed');
    }

    try {
        // Store the new passkey
        await prisma.passkey.create({
            data: {
                userId: user.id,
                credentialID: base64url.encode(registrationInfo.credentialID),
                credentialPublicKey: base64url.encode(registrationInfo.credentialPublicKey),
                counter: registrationInfo.counter,
                transports: JSON.stringify(credential.response.transports || [])
            }
        });

        res.json({
            success: true,
            message: 'Passkey registered successfully'
        });
    } catch (error) {
        console.error('Passkey storage error:', error);
        throw new ApiError(500, 'Failed to store passkey');
    }
});

/**
 * Generate authentication options for passkey login
 */
export const generatePasskeyAuthentication = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
        include: { passkeys: true }
    });

    if (!user || !user.passkeys.length) {
        throw new ApiError(404, 'No passkeys found for this user');
    }

    const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: user.passkeys.map(key => ({
            id: base64url.decode(key.credentialID),
            type: 'public-key',
            transports: JSON.parse(key.transports)
        })),
        userVerification: 'preferred'
    });

    // Store challenge
    await prisma.webAuthnChallenge.create({
        data: {
            userId: user.id,
            challenge: options.challenge,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        }
    });

    res.json(options);
});

/**
 * Verify passkey authentication and login
 */
export const verifyPasskeyAuthentication = asyncHandler(async (req, res) => {
    const { email, credential } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
        include: { passkeys: true }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Get stored challenge
    const expectedChallenge = await prisma.webAuthnChallenge.findFirst({
        where: {
            userId: user.id,
            expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
    });

    if (!expectedChallenge) {
        throw new ApiError(400, 'Challenge expired or not found');
    }

    // Find the passkey
    const passkey = user.passkeys.find(
        key => key.credentialID === credential.id
    );

    if (!passkey) {
        throw new ApiError(400, 'Passkey not found');
    }

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response: credential,
            expectedChallenge: expectedChallenge.challenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                credentialPublicKey: base64url.decode(passkey.credentialPublicKey),
                credentialID: base64url.decode(passkey.credentialID),
                counter: passkey.counter
            }
        });
    } catch (error) {
        throw new ApiError(400, 'Passkey verification failed');
    }

    const { verified, authenticationInfo } = verification;

    if (!verified) {
        throw new ApiError(400, 'Passkey verification failed');
    }

    // Update the passkey counter
    await prisma.passkey.update({
        where: { id: passkey.id },
        data: { counter: authenticationInfo.newCounter }
    });

    // Generate tokens
    const tokens = await generateTokens(user);

    // Set cookies
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        sameSite: 'strict',
        path: '/',
        maxAge: process.env.ACCESS_TOKEN_EXPIRY_TIME
    };

    res.cookie('accessToken', tokens.accessToken, cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, {
        ...cookieOptions,
        maxAge: process.env.REFRESH_TOKEN_EXPIRY_TIME
    });

    // Log the login
    await prisma.userActivityLog.create({
        data: {
            userId: user.id,
            activity: "PASSKEY_LOGIN",
            timestamp: new Date()
        }
    });

    res.json({
        success: true,
        message: 'Login successful',
        user: {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim()
        },
        tokens
    });
});

/**
 * Get all passkeys for a user
 */
export const getUserPasskeys = asyncHandler(async (req, res) => {
    const passkeys = await prisma.passkey.findMany({
        where: { userId: req.user.id }
    });
    res.json(passkeys);
});

/**
 * Delete a passkey
 */
export const deletePasskey = asyncHandler(async (req, res) => {
    const { credentialId } = req.params;
    await prisma.passkey.deleteMany({
        where: {
            userId: req.user.id,
            credentialID: credentialId
        }
    });
    res.status(204).send();
});
