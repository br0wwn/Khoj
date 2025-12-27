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

// Send admin approval notification email
exports.sendAdminApprovalEmail = async (email, approvedByName) => {
    // Skip if Nodemailer is not configured
    if (!transporter) {
        return { success: false, error: 'Email service not configured' };
    }
    
    try {
        const mailOptions = {
            from: `"Khoj Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'You have been granted Admin Access - Khoj Platform',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #8E1616; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9fafb; padding: 20px; }
                        .info-box { background-color: white; padding: 15px; border-left: 4px solid #8E1616; margin: 15px 0; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #8E1616; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                        .highlight { color: #8E1616; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Admin Access Granted</h1>
                        </div>
                        <div class="content">
                            <p>Congratulations!</p>
                            <p>You have been granted <span class="highlight">Administrator Access</span> to the Khoj Community Safety Platform.</p>
                            
                            <div class="info-box">
                                <p><strong>Approved By:</strong> ${approvedByName}</p>
                                <p><strong>Your Email:</strong> ${email}</p>
                            </div>
                            
                            <p>You can now create your admin account using this email address:</p>
                            
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/signup" class="button">
                                Create Admin Account
                            </a>
                            
                            <p><strong>Next Steps:</strong></p>
                            <ul>
                                <li>Click the button above to access the admin signup page</li>
                                <li>Use this email address (${email}) to register</li>
                                <li>Create a secure password</li>
                                <li>Complete your admin profile</li>
                            </ul>
                            
                            <p><strong>Note:</strong> This email has been pre-approved for admin access. Please keep your credentials secure.</p>
                        </div>
                        <div class="footer">
                            <p>Khoj Community Safety Platform - Admin Panel</p>
                            <p>If you didn't expect this email, please contact the system administrator.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Admin approval email sent successfully to:', email, 'ID:', info.messageId);
        return { success: true, data: info };
    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, error: error.message };
    }
};

// Send report to admin notification email
exports.sendReportToAdminEmail = async (adminEmail, adminName, report) => {
    // Skip if Nodemailer is not configured
    if (!transporter) {
        console.warn('⚠️  Email service not configured - skipping email to', adminEmail);
        return { success: false, error: 'Email service not configured' };
    }
    
    console.log(`📧 Preparing to send report email to ${adminEmail}...`);
    
    try {
        const reportTypeLabels = {
            'bug': 'Bug Report',
            'suggestion': 'Suggestion',
            'content': 'Content Issue',
            'user': 'User Report',
            'police': 'Police Report',
            'other': 'Other Issue'
        };

        const statusColors = {
            'pending': '#FFA500',
            'reviewing': '#1E90FF',
            'resolved': '#32CD32',
            'rejected': '#DC143C'
        };

        const reportType = reportTypeLabels[report.type] || report.type;
        const statusColor = statusColors[report.status] || '#6B7280';

        const mailOptions = {
            from: `"Khoj Admin Alerts" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `New Report to Admin: ${reportType}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #8E1616; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9fafb; padding: 20px; }
                        .report-box { background-color: white; padding: 15px; border-left: 4px solid #8E1616; margin: 15px 0; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #8E1616; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; color: white; background-color: ${statusColor}; }
                        .info-row { margin: 8px 0; }
                        .label { font-weight: bold; color: #555; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚨 New Report to Admin</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${adminName},</p>
                            <p>A new report has been submitted that requires your attention:</p>
                            
                            <div class="report-box">
                                <div class="info-row">
                                    <span class="label">Report Type:</span> ${reportType}
                                </div>
                                <div class="info-row">
                                    <span class="label">Status:</span> <span class="status-badge">${report.status}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Reported By:</span> ${report.reportedBy?.name || 'Anonymous'}
                                </div>
                                ${report.reportedBy?.email ? `<div class="info-row"><span class="label">Email:</span> ${report.reportedBy.email}</div>` : ''}
                                <div class="info-row">
                                    <span class="label">Submitted:</span> ${new Date(report.createdAt).toLocaleString()}
                                </div>
                                <hr style="margin: 15px 0; border: none; border-top: 1px solid #e5e7eb;">
                                <div class="info-row">
                                    <span class="label">Description:</span>
                                    <p style="margin: 5px 0 0 0; color: #374151;">${report.description}</p>
                                </div>
                                ${report.details ? `<div class="info-row" style="margin-top: 10px;"><span class="label">Additional Details:</span><p style="margin: 5px 0 0 0; color: #374151;">${report.details}</p></div>` : ''}
                            </div>
                            
                            <p>Please review this report and take appropriate action:</p>
                            
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reports" class="button">
                                View Report in Dashboard
                            </a>
                            
                            <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                                💡 <strong>Tip:</strong> You can manage your email notification preferences in your admin settings.
                            </p>
                        </div>
                        <div class="footer">
                            <p>Khoj Community Safety Platform - Admin Panel</p>
                            <p>This is an automated notification. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Report to admin email sent successfully to:', adminEmail, 'ID:', info.messageId);
        return { success: true, data: info };
    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, error: error.message };
    }
};
