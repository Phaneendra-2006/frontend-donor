import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';

const hasGoogleClientId =
  Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID) &&
  import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData);
      navigateToDashboard(user.role);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const user = await googleLogin(credentialResponse.credential);
      navigateToDashboard(user.role);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const navigateToDashboard = (role) => {
    switch (role) {
      case 'DONOR':
        navigate('/donor');
        break;
      case 'NGO':
        navigate('/ngo');
        break;
      case 'ADMIN':
        navigate('/admin');
        break;
      case 'ANALYST':
        navigate('/analyst');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <AuthShell
      eyebrow="Secure access"
      title="Move food faster, not paperwork."
      subtitle="Sign in to coordinate donations, approvals, deliveries, and analytics from a single dashboard."
      footer={
        <p>
          New here? <Link to="/register" style={styles.footerLink}>Create your account</Link>
        </p>
      }
    >
      <div style={styles.headerBlock}>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.description}>Use email/password or Google sign-in to continue.</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="name@example.com"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          style={styles.button}
          disabled={loading}
        >
          {loading ? 'Signing you in...' : 'Login'}
        </button>
      </form>

      {hasGoogleClientId ? (
        <>
          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>or continue with</span>
            <span style={styles.dividerLine} />
          </div>

          <div style={styles.googleContainer}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Login Failed')}
              useOneTap
              theme="outline"
              shape="pill"
              size="large"
            />
          </div>
        </>
      ) : null}
    </AuthShell>
  );
};

const styles = {
  headerBlock: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '32px',
    lineHeight: 1.1,
    marginBottom: '8px',
    color: '#0f172a',
    letterSpacing: '-0.8px',
  },
  description: {
    color: '#64748b',
    lineHeight: 1.6,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#334155',
    fontWeight: '700',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #dbe3ee',
    borderRadius: '16px',
    fontSize: '15px',
    background: '#f8fafc',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
  },
  button: {
    width: '100%',
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #0f766e 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 16px 30px rgba(15, 118, 110, 0.28)',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0 18px',
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  dividerLine: {
    height: '1px',
    flex: 1,
    background: 'linear-gradient(90deg, transparent, #dbe3ee, transparent)',
  },
  googleContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2px',
  },
  footerLink: {
    color: '#0f766e',
    textDecoration: 'none',
    fontWeight: '800',
  },
};

export default Login;
