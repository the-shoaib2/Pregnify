import axios from 'axios';
import UserModel from '../../models/userModel.js';
import { generateTokens, setAuthCookies } from '../../token/tokenController.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';

/**
 * @description Handles LinkedIn OAuth login
 * @param {Object} req - The request object containing the LinkedIn access token
 * @param {Object} res - The response object to send the response
 * @returns {Promise<void>}
 */
export const linkedinAuth = asyncHandler(async (req, res) => {
    const { accessToken } = req.body;

    // Verify the access token with LinkedIn
    const response = await axios.get('https://api.linkedin.com/v2/user', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const { id, localizedFirstName, localizedLastName } = response.data;

    // Get email address
    const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const email = emailResponse.data.elements[0]['handle~'].emailAddress;

    let user = await UserModel.findOne({ email });
    if (!user) {
        user = new UserModel({
            email,
            first_name: localizedFirstName,
            last_name: localizedLastName,
            accountProvider: 'LINKEDIN',
        });
        await user.save();
    }

    const tokens = await generateTokens(user);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(200).json({ message: 'Login successful!', tokens });
});
