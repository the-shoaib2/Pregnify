import { Octokit } from '@octokit/rest';
import UserModel from '../../models/userModel.js';
import { generateTokens, setAuthCookies } from '../../token/tokenController.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';

const octokit = new Octokit();

/**
 * @description Handles GitHub OAuth login
 * @param {Object} req - The request object containing the GitHub code
 * @param {Object} res - The response object to send the response
 * @returns {Promise<void>}
 */
export const githubAuth = asyncHandler(async (req, res) => {
    const { code } = req.body;

    // Exchange the code for an access token
    const { data } = await octokit.request('POST /login/oauth/access_token', {
        headers: {
            accept: 'application/json',
        },
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
    });

    const accessToken = data.access_token;

    // Get user information from GitHub
    const userResponse = await octokit.request('GET /user', {
        headers: {
            authorization: `token ${accessToken}`,
        },
    });

    const { email, login, name } = userResponse.data;

    let user = await UserModel.findOne({ email });
    if (!user) {
        user = new UserModel({
            email,
            username: login,
            first_name: name.split(' ')[0],
            last_name: name.split(' ')[1],
            accountProvider: 'GITHUB',
        });
        await user.save();
    }

    const tokens = await generateTokens(user);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(200).json({ message: 'Login successful!', tokens });
});
