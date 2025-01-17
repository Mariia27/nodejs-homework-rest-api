const jwt = ('jsonwebtoken')
const Users = require('../repository/users')
const Jimp = require("jimp");
const fs = require('fs').promises
const path = require("path");
const { nanoid } = require("nanoid");
const { HttpCode } = require('../config/constants')
const EmailService = require('../services/email')
require('dotenv').config()
const SECRET_KEY = process.env.JWT_SECRET_KEY
const createFolderIsExist = require("../helpers/create-dir");
const cloudinary = require('cloudinary').v2


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


const registration = async (req, res, next) => {
    try {
        const { email, name } = req.body
        const user = await Users.findByEmail(email)
        if (user) {
            return res.status(HttpCode.CONFLICT).json({
                status: 'error',
                code: HttpCode.CONFLICT,
                data: 'Conflict',
                message: 'Email is already use',
            })
        }
        const verifyToken = nanoid();
        const emailService = new EmailService(process.env.NODE_ENV);
        await emailService.sendEmail(verifyToken, email, name);
        const newUser = await Users.create({
            ...req.body,
            verify: false,
            verifyToken,
        })

        return res.status(HttpCode.CREATED).json({
            status: 'success',
            code: HttpCode.CREATED,
            data: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                avatar: newUser.avatar,
            },
        })
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await Users.findByEmail(email)
        if (!user || !user.validPassword(password) || !user.verify) {
            return res.status(HttpCode.UNAUTHORIZED).json({
                status: 'error',
                code: HttpCode.UNAUTHORIZED,
                data: 'UNAUTHORIZED',
                message: 'Invalid credentials',
            })
        }
        const id = user._id
        const payload = { id }
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '3h' })
        await Users.updateToken(id, token)
        return res.status(HttpCode.OK).json({
            status: 'success',
            code: HttpCode.OK,
            data: {
                token,
            },
        })
    } catch (e) {
        next(e)
    }
}

const logout = async (req, res, next) => {
    const id = req.user._id
    await Users.updateToken(id, null)
    return res.status(HttpCode.NO_CONTENT).json({})
}


const avatars = async (req, res, next) => {
    try {
        const id = req.user.id;

        const avatarUrl = await saveAvatarToStatic(req);
        await Users.updateAvatar(id, avatarUrl);
        return res.json({
            status: "seccess",
            code: HttpCode.OK,
            data: {
                avatarUrl,
            },
        });
    } catch (error) {
        next(error);
    }
};

const saveAvatarToStatic = async (req) => {
    const id = req.user.id;

    const AVATARS_OF_USERS = process.env.AVATARS_OF_USERS;
    const pathFile = req.file.path;
    const newNameAvatar = `${Date.now()}-${req.file.originalname}`;
    const img = await Jimp.read(pathFile);
    await img
        .autocrop()
        .cover(250, 250, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
        .writeAsync(pathFile);
    await createFolderIsExist(path.join(AVATARS_OF_USERS, id));
    await fs.rename(pathFile, path.join(AVATARS_OF_USERS, id, newNameAvatar));
    const avatarUrl = path.normalize(path.join(id, newNameAvatar));

    try {
        await fs.unlink(
            path.join(process.cwd(), AVATARS_OF_USERS, req.user.avatar)
        );
    } catch (error) {
        console.log(error.message);
    }
    return avatarUrl;
};

const verify = async (req, res, next) => {
    try {
        const user = await Users.findByVerifyToken(req.params.token);
        if (user) {
            await Users.updateVerifyToken(user.id, true, null);
            return res.json({
                status: "seccess",
                code: HttpCode.OK,
                message: "Verification successful!",
            });
        }
        return res.status(HttpCode.BAD_REQUEST).json({
            status: "error",
            code: HttpCode.BAD_REQUEST,
            data: "Bad request",
            message: "Link is not valid",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registration,
    login,
    logout,
    avatars,
    verify,

}
