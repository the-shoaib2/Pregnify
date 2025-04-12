import axios from 'axios';
import UserModel from '../../models/userModel.js';
import { generateTokens, setAuthCookies } from '../../token/tokenController.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';

/**
 * @description Handles Facebook OAuth login
 * @param {Object} req - The request object containing the Facebook access token
 * @param {Object} res - The response object to send the response
 * @returns {Promise<void>}
 */
export const facebookAuth = asyncHandler(async (req, res) => {
    const { accessToken } = req.body;

    // Verify the access token with Facebook
    const response = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email`);
    const { email, name } = response.data;

    let user = await UserModel.findOne({ email });
    if (!user) {
        user = new UserModel({
            email,
            first_name: name.split(' ')[0],
            last_name: name.split(' ')[1],
            accountProvider: 'FACEBOOK',
        });
        await user.save();
    }

    const tokens = await generateTokens(user);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(200).json({ message: 'Login successful!', tokens });
});

