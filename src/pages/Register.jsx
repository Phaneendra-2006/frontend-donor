import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import api from '../services/api';
import { toast } from 'react-toastify';

const roleOptions = [
  { value: 'DONOR', label: 'Food Donor' },
  { value: 'NGO', label: 'Recipient Organization' },
  { value: 'ANALYST', label: 'Data Analyst' },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DONOR',
    phone: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'email') {
      setOtpSent(false);
      setOtpVerified(false);
      setFormData({
        ...formData,
        email: value,
        otp: '',
      });
      return;
    }

    if (name === 'otp') {
      setOtpVerified(false);
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error('Please enter your email first');
      return;
    }

    setSendingOtp(true);
    try {
      await api.post('/auth/send-otp', { email: formData.email });
      setOtpSent(true);
      setOtpVerified(false);
      toast.success('OTP sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.email || !formData.otp) {
      toast.error('Enter email and OTP to verify');
      return;
    }

    setVerifyingOtp(true);
    try {
      await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp,
      });
      setOtpVerified(true);
      toast.success('OTP verified successfully');
    } catch (error) {
      setOtpVerified(false);
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      toast.error('Please verify OTP before registration');
      return;
    }

    setLoading(true);
    try {
      const user = await register(formData);
      navigateToDashboard(user.role);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
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
        navigate('/login');
    }
  };

  return (
    <AuthShell
      eyebrow="Create an account"
      title="Bring more meals to the table."
      subtitle="Set up your profile in minutes and join the network that connects donors, NGOs, and impact reporting."
      footer={
        <p>
          Already have an account? <Link to="/login" style={styles.footerLink}>Sign in</Link>
        </p>
      }
    >
      <div style={styles.headerBlock}>
        <h2 style={styles.title}>Join the network</h2>
        <p style={styles.description}>Choose the role that fits your work best.</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your full name"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <div style={styles.inlineRow}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="name@example.com"
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp}
              style={styles.smallButton}
            >
              {sendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email OTP</label>
          <div style={styles.inlineRow}>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={verifyingOtp || !otpSent}
              style={styles.smallButtonSecondary}
            >
              {verifyingOtp ? 'Verifying...' : otpVerified ? 'Verified' : 'Verify OTP'}
            </button>
          </div>
          {otpVerified && <p style={styles.otpVerifiedText}>OTP verified</p>}
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
            placeholder="Create a secure password"
            minLength="6"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            style={styles.select}
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          style={styles.button}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
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
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  formGroup: {
    marginBottom: '18px',
  },
  inlineRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '10px',
    alignItems: 'center',
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
  },
  select: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #dbe3ee',
    borderRadius: '16px',
    fontSize: '15px',
    background: '#f8fafc',
    background: 'white',
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
    marginTop: '6px',
    boxShadow: '0 16px 30px rgba(15, 118, 110, 0.28)',
  },
  smallButton: {
    padding: '12px 14px',
    background: 'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  smallButtonSecondary: {
    padding: '12px 14px',
    background: 'linear-gradient(135deg, #0f766e 0%, #16a34a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  otpVerifiedText: {
    margin: '8px 0 0',
    color: '#15803d',
    fontWeight: 700,
    fontSize: '13px',
  },
  footerLink: {
    color: '#0f766e',
    textDecoration: 'none',
    fontWeight: '800',
  },
};

export default Register;
