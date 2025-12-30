# Inventory Management System

A comprehensive full-stack inventory management application built with Next.js and Node.js, designed to help businesses efficiently manage their stock, track sales, monitor expiring items, and generate detailed reports.

## 🔑 Testing Credentials

For testing purposes, you can use the following admin credentials:

- **Email**: `admin@gmail.com`
- **Password**: `admin123`

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Key Features Details](#key-features-details)
- [Assumptions](#assumptions)

## 🎯 Overview

This Inventory Management System provides a complete solution for managing inventory with the following core capabilities:

- **User Management**: Role-based access control with admin and user roles
- **Stock Management**: Track available and out-of-stock items with detailed properties
- **Sales Tracking**: Automatic sales recording and comprehensive analytics
- **Expiry Monitoring**: Automated alerts for items expiring soon or expired
- **Report Generation**: PDF reports with insights and recommendations

## ✨ Features

### 1. **User Authentication & Authorization**
- User registration and login
- JWT-based authentication
- Role-based access control (Admin/User)
- Admin approval system for new users
- Pre-approved email system for auto-approval

### 2. **Stock Management**
- Add, update, and delete stock items
- Two separate tables: Available Stock and Out of Stock
- Automatic movement between tables based on quantity
- Properties tracked:
  - Name
  - Quantity (with type: numbers, kg, liters, boxes, pieces, units)
  - Company Name
  - Price
  - Expiry Date
  - Date Added
  - Sold Out Status
  - Date Out of Stock
- Server-side search, sort, filter, and pagination (10 items per page)

### 3. **Sales Management**
- Automatic sales recording when quantity is decreased
- Sales table showing:
  - Date of sale
  - Item name
  - Quantity sold
  - Company name
  - Price
- Sales Analytics Dashboard:
  - Sales trends visualization
  - Best performing items
  - Company performance analysis
  - Sales velocity tracking
  - Restocking suggestions
- Per-item and combined analytics views
- Server-side search, sort, filter, and pagination

### 4. **Expiring Soon Management**
- Two categories: Expiring Soon (within 3 months) and Expired
- Daily cron job (runs at 9:00 AM) to check expiry dates
- Email notifications to admin for:
  - Items expiring within 3 months
  - Items that have expired
- Automatic table updates
- Server-side search, sort, filter, and pagination

### 5. **Report Generation**
- PDF report generation
- Report includes:
  - Executive summary (revenue, quantity, sales count)
  - Peak sales day identification
  - Best performing items
  - Restocking suggestions
  - Items to avoid restocking
  - Company performance breakdown
  - Key recommendations
- Time period options:
  - Weekly reports
  - Monthly reports (configurable: 3, 6, 12 months)

### 6. **Admin Panel**
- View all users
- Approve/reject user access
- Add pre-approved emails
- Promote users to admin
- Demote admins to users
- Manage user access

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **node-cron** for scheduled tasks
- **Puppeteer** for PDF generation
- **Resend** for email notifications

### Frontend
- **Next.js 16** (React framework)
- **React 19**
- **Redux Toolkit** for state management
- **Redux Persist** for state persistence
- **Axios** for API calls
- **Recharts** for data visualization
- **Tailwind CSS** for styling
- **Lucide React** for icons

## 📁 Project Structure

```
Invenza/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── adminController.js  # User management
│   │   │   ├── authController.js   # Authentication
│   │   │   ├── expiringSoonController.js
│   │   │   ├── reportController.js # PDF report generation
│   │   │   ├── salesController.js  # Sales & analytics
│   │   │   └── stockController.js  # Stock management
│   │   ├── jobs/
│   │   │   └── expiryCheckJob.js   # Daily expiry check cron job
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js   # JWT authentication
│   │   │   ├── conditionalAuth.js # Conditional admin auth
│   │   │   └── errorHandler.js     # Error handling
│   │   ├── models/
│   │   │   ├── PreApprovedEmail.js
│   │   │   ├── Sales.js
│   │   │   ├── Stock.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── expiringSoonRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── salesRoutes.js
│   │   │   └── stockRoutes.js
│   │   ├── services/
│   │   │   └── emailService.js     # Email notifications
│   │   └── index.js                # Express app entry
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── admin/          # Admin panel
│   │   │   │   ├── expiring-soon/  # Expiry management
│   │   │   │   ├── reports/        # Report generation
│   │   │   │   ├── sales/          # Sales & analytics
│   │   │   │   ├── stock/          # Stock management
│   │   │   │   ├── layout.js
│   │   │   │   └── page.js         # Dashboard home
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── layout.js
│   │   │   └── page.js
│   │   ├── components/
│   │   │   ├── Footer.js
│   │   │   ├── Header.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── ReduxProvider.js
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── lib/
│   │   │   ├── slices/
│   │   │   │   └── authSlice.js
│   │   │   └── store.js
│   │   └── services/
│   │       ├── adminService.js
│   │       ├── authService.js
│   │       ├── expiringSoonService.js
│   │       ├── reportService.js
│   │       ├── salesService.js
│   │       └── stockService.js
│   ├── package.json
│   └── next.config.mjs
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Invenza
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

4. **Set up environment variables** (see [Environment Variables](#environment-variables))

5. **Start MongoDB**
   - Make sure MongoDB is running locally or use a cloud instance

6. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The backend will run on the port specified in your `.env` file (default: 5000)

7. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

## 🔐 Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/invenza
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/invenza

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
```

### Frontend

The frontend uses environment variables for API endpoints. Create a `.env` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

### Authentication Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Admin Routes (Admin Only)

- `GET /api/admin/users` - Get all users
- `GET /api/admin/pending` - Get pending users
- `POST /api/admin/approve` - Approve a user
- `POST /api/admin/reject` - Reject/deactivate a user
- `POST /api/admin/pre-approve` - Add pre-approved email
- `POST /api/admin/promote` - Promote user to admin
- `POST /api/admin/demote` - Demote admin to user

### Stock Routes (Protected)

- `GET /api/stock/available` - Get available stock (with pagination, search, filter, sort)
- `GET /api/stock/out-of-stock` - Get out of stock items
- `GET /api/stock/:id` - Get single stock item
- `POST /api/stock` - Add new stock item
- `PUT /api/stock/:id` - Update stock item
- `DELETE /api/stock/:id` - Delete stock item

### Sales Routes (Protected)

- `GET /api/sales` - Get all sales (with pagination, search, filter, sort)
- `GET /api/sales/analytics` - Get sales analytics

### Expiring Soon Routes (Protected)

- `GET /api/expiring-soon/expiring` - Get expiring soon items
- `GET /api/expiring-soon/expired` - Get expired items

### Report Routes (Protected)

- `GET /api/reports/data` - Get report data (preview)
- `GET /api/reports/generate` - Generate PDF report

## 🔍 Key Features Details

### Stock Management Workflow

1. **Adding Stock**: Admin adds new items with all required properties
2. **Updating Quantity**: When quantity is decreased and saved, a sales record is automatically created
3. **Sold Out**: When quantity reaches 0 or item is marked as sold out:
   - Item moves from Available to Out of Stock table
   - `dateOutOfStock` is recorded
   - Sales record is created for remaining quantity

### Sales Analytics

The analytics system calculates:
- **Sales Velocity**: Quantity sold per day
- **Performance Score**: Weighted combination of:
  - Total Revenue (40%)
  - Total Quantity (20%)
  - Sales Frequency (20%)
  - Sales Velocity (20%)
- **Restocking Suggestions**: Items that are out of stock or low in stock with good performance
- **Best Performing Items**: Top 10 items by performance score
- **Company Performance**: Aggregated metrics per company

### Expiry Check System

- **Cron Job**: Runs daily at 9:00 AM
- **Expiring Soon**: Items expiring within 3 months
- **Expired**: Items past their expiry date
- **Email Notifications**: Admin receives email alerts for both categories
- **Automatic Updates**: Items are automatically moved to appropriate tables

### Report Generation

Reports include:
- Executive summary with key metrics
- Peak sales day identification
- Best and worst performing items
- Restocking suggestions with priority levels
- Items to avoid restocking
- Company performance breakdown
- Actionable recommendations

### User Approval System

1. **First User**: Automatically becomes admin
2. **Pre-approved Emails**: Admin can add emails that get auto-approved on registration
3. **Manual Approval**: Admin can approve/reject users from admin panel
4. **Access Control**: Users without approval see a message asking them to contact admin

## 📝 Assumptions

1. **Single Inventory per Business**: The system is designed assuming each business has a single inventory. Multi-inventory or multi-warehouse support is not included in the current implementation.

2. **Admin Email**: The expiry notification email is currently hardcoded to a single admin email address due to limitations of Resend.

3. **Expiry Threshold**: Items are considered "expiring soon" if they expire within 3 months. This threshold is hardcoded.

4. **Quantity Types**: Supported quantity types are: numbers, kg, liters, boxes, pieces, units. Additional types can be added by modifying the Stock model enum.

5. **Email Service**: The system uses Resend for email notifications.

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes
- Role-based access control
- Input validation
- Error handling without exposing sensitive information

## 📊 Database Models

### User Model
- name, email, password (hashed)
- role (admin/user)
- isActive, isApproved, wasApproved
- timestamps

### Stock Model
- name, quantity, quantityType
- companyName, price
- expiryDate, dateAdded
- isSoldOut, dateOutOfStock
- isExpiringSoon, isExpired
- dateExpired, dateExpiringSoonNotified, dateExpiredNotified
- timestamps

### Sales Model
- stockId (reference to Stock)
- itemName, quantitySold
- saleDate, companyName, price
- timestamps

### PreApprovedEmail Model
- email (unique)
- addedBy (reference to User)
- timestamps

---

**Built with ❤️ for efficient inventory management**

