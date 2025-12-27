const ReportToAdmin = require('../models/ReportToAdmin');
const User = require('../models/User');
const Police = require('../models/police');
const Alert = require('../models/Alert');
const Report = require('../models/Report');
const Admin = require('../models/Admin');
const emailService = require('../services/emailService');

// @desc    Create a report to admin
// @route   POST /api/report-to-admin
// @access  Private (Authenticated users only)
exports.createReportToAdmin = async (req, res) => {
  try {
    const { reportid, reportModel, category, details } = req.body;

    // Validate required fields
    if (!reportid || !reportModel || !category) {
      return res.status(400).json({
        success: false,
        error: 'Please provide reportid, reportModel, and category'
      });
    }

    // Validate reportModel enum
    const validModels = ['User', 'Police', 'Alert', 'Group', 'Report'];
    if (!validModels.includes(reportModel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reportModel. Must be one of: User, Police, Alert, Group, Report'
      });
    }

    // Verify that the reported entity exists
    let entityExists = false;
    try {
      switch (reportModel) {
        case 'User':
          entityExists = await User.findById(reportid);
          break;
        case 'Police':
          entityExists = await Police.findById(reportid);
          break;
        case 'Alert':
          entityExists = await Alert.findById(reportid);
          break;
        case 'Report':
          entityExists = await Report.findById(reportid);
          break;
        case 'Group':
          // Group model not yet implemented - skip validation for now
          entityExists = true;
          break;
      }

      if (!entityExists && reportModel !== 'Group') {
        return res.status(404).json({
          success: false,
          error: `${reportModel} with the provided ID does not exist`
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    // Create the report
    const reportToAdmin = await ReportToAdmin.create({
      reportid,
      reportModel,
      category,
      details,
      status: 'pending'
    });

    // Send email notifications to all admins with email notifications enabled
    try {
      const adminsWithNotifications = await Admin.find({ 
        emailNotifications: true 
      }).select('name email');

      if (adminsWithNotifications && adminsWithNotifications.length > 0) {
        console.log(`📧 Sending report notification to ${adminsWithNotifications.length} admin(s) with notifications enabled`);
        
        // Get reporter information from session
        let reporterName = 'User';
        let reporterEmail = null;
        
        if (req.userId && req.userType) {
          try {
            if (req.userType === 'user') {
              const reporter = await User.findById(req.userId).select('name email');
              if (reporter) {
                reporterName = reporter.name;
                reporterEmail = reporter.email;
              }
            } else if (req.userType === 'police') {
              const reporter = await Police.findById(req.userId).select('name email');
              if (reporter) {
                reporterName = reporter.name;
                reporterEmail = reporter.email;
              }
            }
          } catch (userError) {
            console.error('Error fetching reporter info:', userError);
          }
        }
        
        // Prepare report data for email
        const reportData = {
          type: category,
          status: 'pending',
          description: `New ${reportModel} report submitted`,
          details: details || 'No additional details provided',
          createdAt: reportToAdmin.createdAt,
          reportedBy: {
            name: reporterName,
            email: reporterEmail
          }
        };

        // Send email to each admin (await to ensure emails are sent)
        const emailPromises = adminsWithNotifications.map(admin => 
          emailService.sendReportToAdminEmail(admin.email, admin.name, reportData)
            .then(result => {
              if (result.success) {
                console.log(`✅ Email sent successfully to ${admin.email}`);
              } else {
                console.error(`❌ Failed to send email to ${admin.email}:`, result.error);
              }
              return result;
            })
            .catch(error => {
              console.error(`❌ Error sending email to ${admin.email}:`, error);
              return { success: false, error };
            })
        );
        
        // Wait for all emails to be sent (but don't block the response)
        Promise.all(emailPromises).then(() => {
          console.log('📧 All notification emails processed');
        }).catch(error => {
          console.error('❌ Error processing notification emails:', error);
        });
      } else {
        console.log('⚠️ No admins with email notifications enabled');
      }
    } catch (emailError) {
      console.error('❌ Error sending admin notification emails:', emailError);
      // Don't fail the request if email notifications fail
    }

    res.status(201).json({
      success: true,
      data: reportToAdmin,
      message: 'Report submitted successfully'
    });

  } catch (error) {
    console.error('Error creating report to admin:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all reports to admin
// @route   GET /api/report-to-admin
// @access  Private (Admin only - to be implemented)
exports.getAllReportsToAdmin = async (req, res) => {
  try {
    const { status, reportModel } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (reportModel) filter.reportModel = reportModel;

    const reports = await ReportToAdmin.find(filter)
      .populate('reportid')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });

  } catch (error) {
    console.error('Error fetching reports to admin:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single report to admin by ID
// @route   GET /api/report-to-admin/:id
// @access  Private (Admin only - to be implemented)
exports.getReportToAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await ReportToAdmin.findById(id)
      .populate('reportid')
      .lean();

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error fetching report to admin:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update report status
// @route   PUT /api/report-to-admin/:id/status
// @access  Private (Admin only - to be implemented)
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: pending, reviewed, resolved, rejected'
      });
    }

    const report = await ReportToAdmin.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('reportid');

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'Report status updated successfully'
    });

  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete report to admin
// @route   DELETE /api/report-to-admin/:id
// @access  Private (Admin only - to be implemented)
exports.deleteReportToAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await ReportToAdmin.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting report to admin:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
