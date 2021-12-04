const Joi = require("joi");
const { HttpCode } = require("../../config/constants");

const schemaCreateUsers = Joi.object({
    name: Joi.string().alphanum().min(2).max(10).required(),
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "net"] },
        })
        .required(),
    password: Joi.string().alphanum().min(6).max(40).required(),
    sex: Joi.string().max(1).optional(),
});

const schemaLoginUsers = Joi.object({
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "net"] },
        })
        .required(),
    password: Joi.string().alphanum().min(6).max(40).required(),
});

const validate = (schema, obj, next) => {
    const { error } = schema.validate(obj);
    if (error) {
        const [{ message }] = error.details;
        return next({
            status: 400,
            message: `Filed: ${message.replace(/"/g, "")}`,
        });
    }

    next();
};

module.exports.createUsers = (req, res, next) => {
    return validate(schemaCreateUsers, req.body, next);
};
module.exports.loginUsers = (req, res, next) => {
    return validate(schemaLoginUsers, req.body, next);
};
module.exports.uploadValidateAvatar = (req, res, next) => {
    if (!req.file) {
        return res.status(HttpCode.BAD_REQUEST).json({
            status: "error",
            code: HttpCode.BAD_REQUEST,
            data: "Bad request",
            message: "Field of avatar with not found",
        });
    }
    next();
};