const Mailgen = require("mailgen");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const config = require("../config/email.json");

class EmailService {
    #sender = sgMail;
    #GenerateTemlate = Mailgen;
    constructor(env) {
        switch (env) {
            case "development":
                this.link = config.dev;
                break;
            case "stage":
                this.link = config.stage;
            case "production":
                this.link = config.prod;
            default:
                this.link = config.dev;
                break;
        }
    }

    #createTemplate(verifyToken, name = "Guest") {
        const mailGenerator = new this.#GenerateTemlate({
            theme: "cerberus",
            product: {
                name: "PhoneBook",
                link: this.link,
            },
        });
        const template = {
            body: {
                name,
                intro: "Доброго дня, дякую за реєстрацю!",
                action: {
                    instructions: "Закінчити реєстрацю натиснувши на кнопку",
                    button: {
                        color: "#22BC66", // Optional action button color
                        text: "Підтвердити",
                        link: `${this.link}/auth/verify/${verifyToken}`,
                    },
                },
                outro: "qweqweqweqweqwe",
            },
        };
        return mailGenerator.generate(template);
    }

    async sendEmail(verifyToken, email, name) {
        const emailBody = this.#createTemplate(verifyToken, name);
        this.#sender.setApiKey(process.env.SENGRID_API_KAY);
        const msg = {
            to: email,
            from: "Makcimys001@gmail.com",
            subject: "Підтвердження реєстрації",
            html: emailBody,
        };
        await this.#sender.send(msg);
    }
}

module.exports = EmailService;