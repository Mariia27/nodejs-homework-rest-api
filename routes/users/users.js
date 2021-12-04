const express = require('express');
const router = express.Router();

const {
    registration, login, logout
} = require('../../controllers/users');
const guard = require('../../helpers/guard')
const userController = require('../../../controllers/users')
const upload = require('../../helpers/uploads')
const { createUsers, loginUsers, uploadValidateAvatar } = require('./validation')


router.post('/registration', createUsers, registration)
router.post('/login', loginUsers, login)
router.post('/logout', guard, logout)
router.patch('/avatars', [guard, upload.single('avatar')], uploadValidateAvatar,
    userController.avatars,
)


module.exports = router
