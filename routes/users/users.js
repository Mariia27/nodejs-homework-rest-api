const express = require('express');
const router = express.Router();
const {
    registration, login, logout, avatars, verify
} = require('../../controllers/users');
const guard = require('../../helpers/guard')
const upload = require('../../helpers/uploads')
const { createUsers, loginUsers, uploadValidateAvatar } = require('./validation')


router.post('/registration', createUsers, registration)
router.post('/login', loginUsers, login)
router.post('/logout', guard, logout)
router.patch('/avatars', [guard, upload.single('avatar')], uploadValidateAvatar,
    avatars,
)
router.get('/verify/:token', verify)

module.exports = router
