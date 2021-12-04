const jwt = ('jsonwebtoken')

const Users = require('../repository/users')
const Jimp = require("jimp");
const fs = require('fs').promises
const path = require("path");
const { HttpCode } = require('../config/constants')
require('dotenv').config()
const SECRET_KEY = process.env.JWT_SECRET_KEY
const createFolderIsExist = require("../helpers/create-dir");
const cloudinary = require('cloudinary').v2
// const { promisify } = require('util')




cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
// const uploadCloud = promisify(cloudinary.uploader.upload)

const registration = async (req, res, next) => {
    try {
        const { email } = req.body
        const user = await Users.findByEmail(email)
        if (user) {
            return res.status(HttpCode.CONFLICT).json({
                status: 'error',
                code: HttpCode.CONFLICT,
                data: 'Conflict',
                message: 'Email is already use',
            })
        }
        const newUser = await Users.create(req.body)
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
        if (!user || !user.validPassword(password)) {
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
        // const {
        //     public_id: imgIdCloud,
        //     secure_url: avatarUrl,
        // } = await saveAvatarToCloud(req)
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

// const saveAvatarToCloud = async (req) => {
//     const filePath = req.file.path
//     const result = await uploadCloud(filePath, {
//         folder: 'Photo',
//         transformation: { width: 250, height: 250, crop: 'fill' },
//     })
//     cloudinary.uploader.destroy(req.user.imgIdCloud, (err, result) => {
//         console.log(err, result)
//     })
//     try {
//         await fs.unlink(filePath)
//     } catch (e) {
//         console.log(e.message)
//     }
//     return result
// }



module.exports = {
    registration,
    login,
    logout,
    avatars,
}