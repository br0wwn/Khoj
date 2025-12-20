const nodemailer = require('nodemailer');

let transporter = null;

// Initialize Nodemailer only if credentials are provided
if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
    console.log('✅ Nodemailer email service initialized');
    console.log('📧 Sending emails from:', process.env.EMAIL_USER);
} else {
    console.warn('⚠️  EMAIL_USER or EMAIL_APP_PASSWORD not found. Email notifications will be disabled.');
    console.warn('   Add these to your .env file to enable email notifications.');
    console.warn('   Guide: https://support.google.com/accounts/answer/185833');
}

module.exports = transporter;
