const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const chatMediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'khoj/chat-media',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv'],
    resource_type: 'auto'
  }
});

const chatMediaUpload = multer({
  storage: chatMediaStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for video
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

module.exports = chatMediaUpload;
