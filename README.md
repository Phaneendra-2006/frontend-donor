# Food Donation System - Frontend

A modern React-based frontend application for the Food Donation System that connects donors with NGOs.

## Features

- **User Authentication**
  - Email/password login
  - Google OAuth integration
  - Role-based access (Donor, NGO, Admin, Analyst)
  
- **Donor Dashboard**
  - Add food donations with images
  - View donation history
  - Manage NGO requests (approve/reject)
  
- **NGO Dashboard**
  - Browse available food donations
  - Request food items
  - Track request status
  - View delivery information
  
- **Admin Dashboard**
  - User management (activate/block users)
  - View system statistics
  - Manage donations
  
- **Analyst Dashboard**
  - View analytics and statistics
  - Interactive charts (Bar, Pie)
  - Monthly donation trends
  - Location-based insights

## Tech Stack

- **React 19.2.4** - UI library
- **React Router DOM 7.14.0** - Routing
- **Axios 1.14.0** - HTTP client
- **Chart.js 4.5.1** & **React-Chartjs-2 5.3.1** - Data visualization
- **React Toastify 11.0.5** - Notifications
- **@react-oauth/google 0.13.4** - Google authentication
- **Vite 8.0.1** - Build tool

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

To get a Google Client ID:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins: `http://localhost:5173`
6. Add authorized redirect URIs: `http://localhost:5173`

### 3. Start the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── FoodCard.jsx         # Reusable food card component
│   │   └── Navbar.jsx           # Navigation bar
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context
│   ├── pages/
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx         # Registration page
│   │   ├── DonorDashboard.jsx   # Donor dashboard
│   │   ├── NgoDashboard.jsx     # NGO dashboard
│   │   ├── AdminDashboard.jsx   # Admin dashboard
│   │   └── AnalystDashboard.jsx # Analytics dashboard
│   ├── services/
│   │   └── api.js               # Axios instance with interceptors
│   ├── utils/
│   │   └── ProtectedRoute.jsx   # Route protection component
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── .env.example                 # Environment variables template
├── vite.config.js               # Vite configuration
└── package.json                 # Dependencies
```

## API Integration

The frontend connects to the backend API at `http://localhost:8080/api`. 

### API Endpoints Used:

**Authentication:**
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user
- `POST /auth/google` - Login with Google

**Donor:**
- `POST /donor/donate` - Create food donation
- `GET /donor/my-donations` - Get donor's donations
- `GET /donor/requests` - Get requests for donor's food
- `PUT /donor/requests/:id` - Approve/reject request

**NGO:**
- `GET /ngo/available-food` - Get available food donations
- `POST /ngo/request/:id` - Request food item
- `GET /ngo/my-requests` - Get NGO's requests
- `GET /ngo/deliveries` - Get deliveries

**Admin:**
- `GET /admin/users` - Get all users
- `PUT /admin/users/:id/status` - Update user status
- `DELETE /admin/donations/:id` - Delete donation
- `GET /admin/stats` - Get system statistics

**Analytics:**
- `GET /analytics/dashboard` - Get analytics data

## Features by Role

### Donor
- Add food donations with details (name, quantity, type, expiry, location, image)
- View all their donations
- Approve or reject requests from NGOs

### NGO
- Browse available food donations
- Request food items
- Track request status
- View assigned deliveries

### Admin
- Manage users (activate/block)
- View system-wide statistics
- Moderate donations

### Analyst
- View comprehensive analytics
- Interactive charts and graphs
- Track trends over time
- Location-based insights

## Authentication Flow

1. User logs in with email/password or Google OAuth
2. JWT token is stored in localStorage
3. Token is automatically added to all API requests via Axios interceptor
4. User is redirected to role-specific dashboard
5. Protected routes check for valid token and correct role

## Styling

The application uses inline styles with a modern, clean design:
- Gradient backgrounds
- Card-based layouts
- Responsive grid systems
- Hover effects and transitions
- Mobile-friendly (responsive design)

## Error Handling

- Toast notifications for all user actions
- Try-catch blocks for all API calls
- Loading states during async operations
- Automatic redirect to login on 401 errors

## Development Tips

1. **Hot Module Replacement (HMR)**: Vite provides instant HMR for a smooth development experience
2. **React DevTools**: Install React DevTools browser extension for debugging
3. **API Proxy**: Vite proxy configuration forwards `/api` requests to backend

## Troubleshooting

**CORS Issues:**
- Ensure backend has CORS enabled for `http://localhost:5173`

**Google Login Not Working:**
- Verify Google Client ID is correct
- Check authorized origins in Google Cloud Console

**API Connection Failed:**
- Ensure backend is running on `http://localhost:8080`
- Check network tab in browser DevTools

## License

MIT
