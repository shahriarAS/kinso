# EZ - Enterprise Management System

A comprehensive enterprise management system built with Next.js 15, TypeScript, Ant Design, and Redux Toolkit Query.

## 🚀 Features

- **Production-Ready Authentication System** - JWT-based authentication with refresh tokens, password hashing, and rate limiting
- **Dashboard** - Real-time statistics and analytics
- **Customer Management** - CRUD operations with search and filtering
- **Product Management** - Inventory tracking with warehouse support
- **Order Management** - Order processing and status tracking
- **Warehouse Management** - Multi-warehouse inventory system
- **Real-time Notifications** - Toast notifications and alerts
- **Responsive Design** - Mobile-first approach with Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Library**: Ant Design v5
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: Tailwind CSS
- **Icons**: Ant Design Icons + Iconify
- **Notifications**: React Hot Toast
- **Authentication**: JWT with bcrypt password hashing
- **Database**: MongoDB with Mongoose

## 🔐 Authentication System

The application now includes a production-ready authentication system with the following features:

- **JWT-based authentication** with access and refresh tokens
- **Secure password hashing** using bcrypt with 12 salt rounds
- **Rate limiting** on login and registration endpoints
- **Role-based authorization** (admin, manager, staff)
- **Automatic token refresh** when access tokens expire
- **Secure HTTP-only cookies** for token storage
- **Input validation** and sanitization

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/register` - User registration

## 📁 Project Structure

```
├── app/                          # Next.js 15 app directory
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── forget-password/
│   │   └── reset-password/
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── profile/
│   │   │   └── register/
│   │   ├── customers/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── warehouses/
│   │   ├── categories/
│   │   └── users/
│   └── dashboard/                # Dashboard routes
│       ├── customers/
│       ├── orders/
│       ├── products/
│       ├── inventory/
│       ├── pos/
│       └── warehouse/
├── components/                   # Reusable components
├── lib/                         # Utility libraries
│   ├── auth.ts                  # Authentication utilities
│   └── database.ts              # Database connection
├── models/                      # Mongoose models
├── store/                       # Redux store and API slices
├── types/                       # TypeScript type definitions
└── hooks/                       # Custom React hooks
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- MongoDB instance

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ez
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/your-database-name
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   REFRESH_TOKEN_EXPIRES_IN=30d
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Production Deployment

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

- `MONGODB_URI` - Your production MongoDB connection string
- `JWT_SECRET` - A strong, unique secret key for JWT signing
- `JWT_EXPIRES_IN` - Access token expiration (default: 7d)
- `REFRESH_TOKEN_EXPIRES_IN` - Refresh token expiration (default: 30d)
- `NODE_ENV` - Set to "production"

### Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret key
2. **HTTPS**: Always use HTTPS in production
3. **Database**: Use a secure MongoDB connection with authentication
4. **Rate Limiting**: The built-in rate limiting helps prevent brute force attacks
5. **Password Policy**: Implement strong password requirements in your frontend

### Building for Production

```bash
pnpm build
pnpm start
```

## 📝 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password2": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
```

#### Logout
```http
POST /api/auth/logout
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
