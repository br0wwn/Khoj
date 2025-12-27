const transporter = require('../config/emailConfig');

// Send new alert notification email
exports.sendNewAlertEmail = async (userEmail, userName, alert) => {
    // Skip if Nodemailer is not configured
    if (!transporter) {
        return { success: false, error: 'Email service not configured' };
    }
    
    try {
        const mailOptions = {
            from: `"Khoj Alerts" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `New Alert Posted: ${alert.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9fafb; padding: 20px; }
                        .alert-box { background-color: white; padding: 15px; border-left: 4px solid #4F46E5; margin: 15px 0; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Khoj Community Alert</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${userName},</p>
                            <p>🚨 A new safety alert has been posted in your community:</p>
                            
                            <div class="alert-box">
                                <h2>${alert.title}</h2>
                                <p><strong>📍 Location:</strong> ${alert.location}, ${alert.upazila}, ${alert.district}</p>
                                <p><strong>📊 Status:</strong> ${alert.status}</p>
                                <p><strong>📝 Details:</strong> ${alert.description}</p>
                            </div>
                            
                            <p>Please stay alert and take necessary precautions. Check the full details below:</p>
                            
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts/${alert._id}" class="button">
                                View Alert Details
                            </a>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from Khoj Community Safety Platform</p>
                            <p>If you no longer wish to receive these notifications, please update your preferences in your account settings.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully to:', userEmail, 'ID:', info.messageId);
        return { success: true, data: info };
    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, error: error.message };
    }
};

// Send alert update email
exports.sendAlertUpdateEmail = async (userEmail, userName, alert, updateType) => {
    // Skip if Nodemailer is not configured
    if (!transporter) {
        return { success: false, error: 'Email service not configured' };
    }
    
    try {
        const mailOptions = {
            from: `"Khoj Alerts" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Alert Updated: ${alert.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9fafb; padding: 20px; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Alert Update</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${userName},</p>
                            <p>An alert you're following has been updated:</p>
                            <h2>${alert.title}</h2>
                            <p><strong>New Status:</strong> ${alert.status}</p>
                            
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts/${alert._id}" class="button">
                                View Updated Alert
                            </a>
                        </div>
                        <div class="footer">
                            <p>Khoj Community Safety Platform</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully to:', userEmail, 'ID:', info.messageId);
        return { success: true, data: info };
    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, error: error.message };
    }
};
