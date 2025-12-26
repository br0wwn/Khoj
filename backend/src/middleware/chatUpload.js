const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Storage for chat media (images and videos)
const chatMediaStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith('video/');
        return {
            folder: 'khoj/chat-media',
            allowed_formats: isVideo
                ? ['mp4', 'mov', 'avi', 'mkv', 'webm']
                : ['jpg', 'png', 'jpeg', 'gif', 'webp'],
            resource_type: isVideo ? 'video' : 'image',
            transformation: isVideo ? [] : [{ width: 1200, height: 1200, crop: 'limit' }]
        };
    }
});

const uploadChatMedia = multer({
    storage: chatMediaStorage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit (for videos)
    },
    fileFilter: (req, file, cb) => {
        // Accept images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed!'), false);
        }
    }
});

module.exports = { uploadChatMedia };
