const User = require('../model/Schema/user')

const findByEmail = async (email) => {
    return await User.findOne({ email })
}

const findById = async (id) => {
    return await User.findOne({ _id: id })
}

const create = async ({ name, email, password, sex, verify, verifyToken }) => {
    const user = new User({ name, email, password, sex, verify, verifyToken })
    return await user.save()
}

const updateToken = async (id, token) => {
    return await User.updateOne({ _id: id }, { token })

}
const findByVerifyToken = async (verifyToken) => {
    return await User.findOne({ verifyToken })
}

const updateVerifyToken = async (id, verify, verifyToken) => {
    return await User.updateOne({ _id: id }, { verify, verifyToken });
};

const updateAvatar = async (id, avatar) => {
    return await User.updateOne({ _id: id }, { avatar });
};
module.exports = {
    findByEmail,
    findById,
    create,
    updateToken,
    updateAvatar,
    findByVerifyToken,
    updateVerifyToken
}