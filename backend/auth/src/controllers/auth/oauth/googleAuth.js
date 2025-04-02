import { OAuth2Client } from 'google-auth-library';
import UserModel from '../../models/userModel.js';
import { generateTokens, setAuthCookies } from '../../token/tokenController.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @description Handles Google OAuth signup/login
 * @param {Object} req - The request object containing the Google token
 * @param {Object} res - The response object to send the response
 * @returns {Promise<void>}
 */
export const googleAuth = asyncHandler(async (req, res) => {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    let user = await UserModel.findOne({ email });
    if (!user) {
        user = new UserModel({
            email,
            first_name: name.split(' ')[0],
            last_name: name.split(' ')[1],
            accountProvider: 'GOOGLE',
        });
        await user.save();
    }

    const tokens = await generateTokens(user);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(200).json({ message: 'Login successful!', tokens });
});

