import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './utils/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard from './pages/NgoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AnalystDashboard from './pages/AnalystDashboard';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const hasGoogleClientId = GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID';

const OAuthWrapper = ({ children }) => {
  if (!hasGoogleClientId) {
    return children;
  }

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
};

function App() {
  return (
    <ErrorBoundary>
      <OAuthWrapper>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute allowedRoles={['DONOR', 'NGO', 'ADMIN', 'ANALYST']}>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/donor" 
                  element={
                    <ProtectedRoute allowedRoles={['DONOR']}>
                      <DonorDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/ngo" 
                  element={
                    <ProtectedRoute allowedRoles={['NGO']}>
                      <ErrorBoundary>
                        <NgoDashboard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/analyst" 
                  element={
                    <ProtectedRoute allowedRoles={['ANALYST']}>
                      <AnalystDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
              
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </div>
          </Router>
        </AuthProvider>
      </OAuthWrapper>
    </ErrorBoundary>
  );
}

export default App;
