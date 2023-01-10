const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Sends email using SendGrid
const sendMail = async (options) => {
    await sgMail.send({
        to: options.receiverID,
        from: 'graderu.bot@gmail.com',
        subject: 'GraderU Reset Code',
        text: options.message,
    });
};

module.exports = sendMail;
