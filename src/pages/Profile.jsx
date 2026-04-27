import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserDetails();
  }, [user, navigate]);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUserDetails(response.data);
      setFormData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Fallback to user from context
      setUserDetails(user);
      setFormData(user);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/auth/profile', formData);
      toast.success('Profile updated successfully');
      setUserDetails(formData);
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete('/auth/profile');
      toast.success('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.container}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const currentUser = userDetails || user;

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <section style={styles.profileSection}>
          <div style={styles.profileHeader}>
            <div style={styles.profileIcon}>
              {currentUser?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={styles.title}>{currentUser?.name}</h1>
              <p style={styles.subtitle}>{currentUser?.email}</p>
              <p style={styles.role}>Role: {currentUser?.role}</p>
            </div>
          </div>

          <div style={styles.detailsSection}>
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <label style={styles.label}>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                ) : (
                  <p style={styles.value}>{currentUser?.name}</p>
                )}
              </div>

              <div style={styles.detailItem}>
                <label style={styles.label}>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                ) : (
                  <p style={styles.value}>{currentUser?.email}</p>
                )}
              </div>

              <div style={styles.detailItem}>
                <label style={styles.label}>User ID</label>
                <p style={styles.value}>{currentUser?.id}</p>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.label}>Account Role</label>
                <p style={styles.value}>{currentUser?.role}</p>
              </div>

              {isEditing && (
                <div style={styles.detailItem}>
                  <label style={styles.label}>Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter phone number"
                  />
                </div>
              )}

              {isEditing && (
                <div style={styles.detailItem}>
                  <label style={styles.label}>Address (Optional)</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter address"
                  />
                </div>
              )}
            </div>

            <div style={styles.actionButtons}>
              {isEditing ? (
                <>
                  <button onClick={handleSaveProfile} style={styles.saveButton}>
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(userDetails || user);
                    }}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} style={styles.editButton}>
                  Edit Profile
                </button>
              )}
              <button onClick={handleDeleteAccount} style={styles.deleteButton}>
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  profileSection: {
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '30px',
    marginBottom: '40px',
    borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
    paddingBottom: '30px',
  },
  profileIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #34d399 0%, #2563eb 100%)',
    color: 'white',
    display: 'grid',
    placeItems: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'white',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: '0 0 4px 0',
  },
  role: {
    fontSize: '13px',
    color: 'rgba(34, 197, 94, 0.8)',
    fontWeight: '600',
    margin: '0',
  },
  detailsSection: {
    marginTop: '30px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '30px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    fontSize: '16px',
    color: 'white',
    fontWeight: '600',
    margin: '0',
    wordBreak: 'break-all',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    background: 'rgba(30, 41, 59, 0.5)',
    color: 'white',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '30px',
    paddingTop: '30px',
    borderTop: '1px solid rgba(148, 163, 184, 0.2)',
  },
  editButton: {
    padding: '12px 24px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 10px 24px rgba(37, 99, 235, 0.3)',
  },
  saveButton: {
    padding: '12px 24px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 10px 24px rgba(16, 185, 129, 0.3)',
  },
  cancelButton: {
    padding: '12px 24px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  deleteButton: {
    padding: '12px 24px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 10px 24px rgba(239, 68, 68, 0.3)',
    marginLeft: 'auto',
  },
};

export default Profile;
