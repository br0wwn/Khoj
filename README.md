# 🔍 Khoj - Lost & Found Safety Platform

A comprehensive MERN stack application for reporting and tracking missing persons, lost items, and safety alerts with advanced features like facial recognition notifications, social media sharing, and statistical danger tracking.

![Platform Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Database Seeding](#database-seeding)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## ✨ Features

### Core Features
- 🚨 **Alert System** - Create and manage alerts for missing persons and lost items
- 📝 **Report Management** - Submit detailed reports with media attachments
- 👤 **User Profiles** - Personalized profiles for citizens and police officers
- 🗺️ **Interactive Maps** - Location-based alert visualization using Leaflet
- 📱 **Responsive Design** - Mobile-friendly interface with Tailwind CSS

### Advanced Features
- 🔔 **Facial Recognition Notifications** - Real-time alerts when potential matches are found
  - Multi-level priority system (Low, Medium, High, Urgent)
  - Confidence score tracking
  - Location-based match information
  
- 🌐 **Social Media Sharing** - Spread awareness across multiple platforms
  - Facebook, Twitter, WhatsApp, Telegram
  - Email sharing and direct link copying
  - Share tracking and analytics
  
- 📊 **Statistical Danger Tracking** - Area-level safety analysis
  - Auto-calculated danger levels (Safe → Critical)
  - Monthly trend analysis
  - District-wise statistics dashboard
  - Dangerous area identification
  
- 🔒 **Content Censoring** - Sensitive content management for privacy protection
- 📸 **Media Management** - Cloudinary integration for image uploads

## 🛠 Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** - Database with Mongoose ODM
- **Cloudinary** - Media storage and management
- **Express-Session** - Session-based authentication
- **Bcrypt.js** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Leaflet** - Map integration
- **Axios** - HTTP client

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Cloudinary account (for media uploads)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Dipto22299520/lost-and-found-simple-implementation.git
cd lost-and-found-simple-implementation
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Secret
SESSION_SECRET=your_session_secret_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Configuration

Update API base URL in frontend if needed (default: `http://localhost:5000`)

## 🏃 Running the Application

### Development Mode

1. **Start the backend server**
```bash
cd backend
npm start
```
The server will run on `http://localhost:5000`

2. **Start the frontend development server**
```bash
cd frontend
npm start
```
The app will open at `http://localhost:3000`

### Production Mode

```bash
# Build frontend
cd frontend
npm run build

# Serve with backend
cd ../backend
npm start
```

## 🌱 Database Seeding

Populate the database with sample data for testing:

```bash
cd backend
npm run seed
```

This creates:
- 50 alerts across 5 districts
- 40 reports with various statuses
- 15 notifications including facial recognition alerts
- 100 social shares across platforms
- 21 area statistics with calculated danger levels
- Test user accounts

**Test Credentials:**
- **User**: user@example.com / password123
- **Police**: police@example.com / police123

## 📁 Project Structure

```
lost-and-found-simple-implementation/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Cloudinary config
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth & upload middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   └── utils/           # Helper functions
│   ├── server.js            # Entry point
│   ├── seed-database.js     # Database seeding script
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Page components
│   │   ├── services/        # API integration
│   │   ├── styles/          # CSS files
│   │   └── utils/           # Utility functions
│   └── package.json
└── README.md
```

## 📡 API Documentation

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get alert by ID
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read

### Statistics
- `GET /api/statistics/area` - Get area statistics
- `GET /api/statistics/dangerous-areas` - Get dangerous areas
- `GET /api/statistics/overall` - Get overall statistics
- `GET /api/statistics/trends` - Get trend data

### Social Sharing
- `POST /api/social-shares/track` - Track a share
- `GET /api/social-shares/generate-link` - Generate share link
- `POST /api/social-shares/share` - Share to social media

## 📚 Additional Documentation

- [Database Schema](DATABASE_SCHEMA.md) - Detailed database structure
- [New Features Documentation](NEW_FEATURES_DOCUMENTATION.md) - Feature specifications
- [Quick Setup Guide](QUICK_SETUP_GUIDE.md) - Step-by-step setup
- [Architecture Diagram](ARCHITECTURE_DIAGRAM.md) - System architecture
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Development details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

##  Acknowledgments

- React community for excellent documentation
- MongoDB for robust database solutions
- Cloudinary for media management
- Leaflet for mapping capabilities

---

**Made with ❤️ for community safety**
