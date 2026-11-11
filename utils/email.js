import nodemailer from "nodemailer"

export const sendPasswordResetMail = async ({ userEmail, subject, message }) => {

    const transport = nodemailer.createTransport({
        host: process.env.PASSWORD_RESET_EMAIL_HOST,
        port: 2525,
        auth: {
            user: process.env.PASSWORD_RESET_EMAIL_USER,
            pass: process.env.PASSWORD_RESET_EMAIL_PASSWORD
        }
    });

    await transport.sendMail({
        from: 'saket.parasher@gmail.com',
        to: userEmail,
        subject,
        text: message
    })

}