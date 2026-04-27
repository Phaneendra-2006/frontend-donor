import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LiveMap from '../components/LiveMap';
import api from '../services/api';
import { toast } from 'react-toastify';

const adminHighlights = [
  'Dashboard with total stats',
  'Heatmap of donations',
  'User verification system',
  'Block or unblock users',
  'Fake donation detection',
  'Manage delivery volunteers',
  'System-wide announcements',
  'Export reports',
  'Monitor live pickups',
  'Role-based access control',
];

const adminSummary = [
  { label: 'Verified users', value: '1,284' },
  { label: 'Flagged donations', value: '7' },
  { label: 'Live pickups', value: '18' },
  { label: 'Reports exported', value: '42' },
];

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchDeliveries();

    const intervalId = setInterval(() => {
      fetchStats();
      fetchDeliveries();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
      toast.error('Failed to fetch users');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch stats');
    }
  };

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/admin/deliveries');
      setDeliveries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      setDeliveries([]);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, null, {
        params: { status: newStatus },
      });
      toast.success('User status updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) {
      return;
    }

    try {
      await api.delete(`/admin/donations/${donationId}`);
      toast.success('Donation deleted successfully');
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete donation');
    }
  };

  const adminMapPoints = [
    { id: 'hq', label: 'Platform HQ', location: 'Hyderabad', color: '#f97316' },
    { id: 'active-pickup', label: 'Active pickup zone', location: 'Madhapur, Hyderabad', color: '#22c55e' },
    { id: 'flagged', label: 'Flagged donation alert', location: 'Kukatpally, Hyderabad', color: '#ef4444' },
  ];

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <div style={styles.badge}>Platform Admin</div>
            <h1 style={styles.title}>Admin Dashboard</h1>
            <p style={styles.subtitle}>
              Oversee users, content, data accuracy, and platform safety from a central control panel.
            </p>
          </div>
          <div style={styles.heroStats}>
            {adminSummary.map((item) => (
              <div key={item.label} style={styles.metricCard}>
                <div style={styles.metricValue}>{item.value}</div>
                <div style={styles.metricLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Platform controls</h2>
          <div style={styles.featureGrid}>
            {adminHighlights.map((item) => (
              <div key={item} style={styles.featureCard}>
                <span style={styles.featureDot} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {stats && (
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <h3 style={styles.statTitle}>Total Users</h3>
              <p style={styles.statValue}>{stats.totalUsers || 0}</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statTitle}>Total Donations</h3>
              <p style={styles.statValue}>{stats.totalDonations || 0}</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statTitle}>Active Donations</h3>
              <p style={styles.statValue}>{stats.activeDonations || 0}</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statTitle}>Total Requests</h3>
              <p style={styles.statValue}>{stats.totalRequests || 0}</p>
            </div>
          </div>
        )}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>User Management</h2>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                  <tr key={user.id} style={styles.tr}>
                    <td style={styles.td}>{user.id}</td>
                    <td style={styles.td}>{user.name}</td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>
                      <span style={getRoleStyle(user.role)}>{user.role}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={getStatusStyle(user.status || 'ACTIVE')}>
                        {user.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        {user.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                            style={{ ...styles.actionButton, ...styles.activateButton }}
                          >
                            Activate
                          </button>
                        )}
                        {user.status !== 'INACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(user.id, 'INACTIVE')}
                            style={{ ...styles.actionButton, ...styles.blockButton }}
                          >
                            Block
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '20px' }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Delivery Management</h2>
          <div style={styles.grid}>
            {deliveries && deliveries.length > 0 ? (
              deliveries.map((delivery) => (
                <div key={delivery.id} style={styles.card}>
                  <h3 style={styles.cardTitle}>{delivery.request?.donation?.foodName || 'Delivery'}</h3>
                  <p><strong>Donor:</strong> {delivery.request?.donation?.donor?.name || 'Unknown'}</p>
                  <p><strong>NGO:</strong> {delivery.request?.ngo?.name || 'Not assigned'}</p>
                  <p><strong>Pickup:</strong> {delivery.request?.donation?.location || 'N/A'}</p>
                  <p><strong>Status:</strong> <span style={getDeliveryStatusStyle(delivery.deliveryStatus)}>{delivery.deliveryStatus}</span></p>
                  {delivery.pickupTime && (
                    <p><strong>Pickup Time:</strong> {new Date(delivery.pickupTime).toLocaleString()}</p>
                  )}
                  {delivery.deliveryTime && (
                    <p><strong>Delivered At:</strong> {new Date(delivery.deliveryTime).toLocaleString()}</p>
                  )}
                </div>
              ))
            ) : (
              <p>No deliveries found.</p>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Trust & Safety</h2>
          <div style={styles.mapGrid}>
            <div style={styles.mapPanel}>
              <div style={styles.mapTitle}>Donation heatmap</div>
              <LiveMap points={adminMapPoints} showRoute={false} />
            </div>
            <div style={styles.sidePanel}>
              <h3 style={styles.cardTitle}>Admin actions</h3>
              <ul style={styles.list}>
                <li>User verification and role control</li>
                <li>System-wide announcements</li>
                <li>Report exports for leadership</li>
                <li>Monitor suspicious or fake donations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getRoleStyle = (role) => {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '12px',
  };

  switch (role) {
    case 'ADMIN':
      return { ...baseStyle, background: '#ff6b6b', color: 'white' };
    case 'DONOR':
      return { ...baseStyle, background: '#4ecdc4', color: 'white' };
    case 'NGO':
      return { ...baseStyle, background: '#95e1d3', color: '#333' };
    case 'ANALYST':
      return { ...baseStyle, background: '#ffd93d', color: '#333' };
    default:
      return baseStyle;
  }
};

const getStatusStyle = (status) => {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '12px',
  };

  switch (status) {
    case 'ACTIVE':
      return { ...baseStyle, background: '#d4edda', color: '#155724' };
    case 'INACTIVE':
      return { ...baseStyle, background: '#f8d7da', color: '#721c24' };
    case 'PENDING_APPROVAL':
      return { ...baseStyle, background: '#fff3cd', color: '#856404' };
    default:
      return baseStyle;
  }
};

const getDeliveryStatusStyle = (status) => {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '12px',
  };

  switch (status) {
    case 'DELIVERED':
      return { ...baseStyle, background: '#d4edda', color: '#155724' };
    case 'SCHEDULED':
    case 'IN_TRANSIT':
      return { ...baseStyle, background: '#fff3cd', color: '#856404' };
    case 'CANCELLED':
      return { ...baseStyle, background: '#f8d7da', color: '#721c24' };
    default:
      return baseStyle;
  }
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '20px',
    alignItems: 'stretch',
    marginBottom: '22px',
  },
  badge: {
    display: 'inline-flex',
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'rgba(239,68,68,0.12)',
    color: '#b91c1c',
    fontWeight: 800,
    marginBottom: '12px',
  },
  title: {
    fontSize: '42px',
    lineHeight: 1.05,
    color: '#0f172a',
    marginBottom: '12px',
    letterSpacing: '-1.2px',
  },
  subtitle: {
    color: '#475569',
    fontSize: '17px',
    lineHeight: 1.7,
    maxWidth: '60ch',
  },
  heroStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '14px',
  },
  metricCard: {
    background: 'linear-gradient(135deg, #0f172a 0%, #991b1b 100%)',
    color: 'white',
    padding: '22px',
    borderRadius: '22px',
    boxShadow: '0 18px 40px rgba(2, 6, 23, 0.18)',
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: 800,
    marginBottom: '6px',
  },
  metricLabel: {
    fontSize: '14px',
    opacity: 0.85,
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)',
    color: 'white',
    padding: '30px',
    borderRadius: '22px',
    boxShadow: '0 18px 40px rgba(2, 6, 23, 0.18)',
  },
  statTitle: {
    fontSize: '16px',
    marginBottom: '10px',
    opacity: 0.9,
  },
  statValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: 0,
  },
  section: {
    background: 'rgba(255,255,255,0.92)',
    padding: '28px',
    borderRadius: '24px',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
    border: '1px solid rgba(148,163,184,0.18)',
    marginBottom: '22px',
  },
  sectionTitle: {
    fontSize: '24px',
    color: '#0f172a',
    marginBottom: '18px',
    letterSpacing: '-0.4px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  featureCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    background: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
    fontWeight: 700,
  },
  featureDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ef4444, #7c3aed)',
    flexShrink: 0,
  },
  mapGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '16px',
  },
  mapPanel: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 60%, #7c3aed 100%)',
    color: 'white',
    borderRadius: '22px',
    padding: '22px',
    minHeight: '220px',
  },
  mapTitle: {
    fontSize: '16px',
    fontWeight: 800,
    marginBottom: '18px',
  },
  mapPlaceholder: {
    minHeight: '150px',
    borderRadius: '18px',
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    padding: '20px',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.16)',
    color: 'rgba(255,255,255,0.92)',
    fontWeight: 700,
  },
  sidePanel: {
    background: '#f8fafc',
    borderRadius: '22px',
    padding: '22px',
    border: '1px solid #e2e8f0',
  },
  list: {
    marginTop: '12px',
    paddingLeft: '18px',
    color: '#334155',
    lineHeight: 1.9,
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    background: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
    fontWeight: '600',
    color: '#333',
  },
  tr: {
    borderBottom: '1px solid #dee2e6',
  },
  td: {
    padding: '12px',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  activateButton: {
    background: '#28a745',
    color: 'white',
  },
  blockButton: {
    background: '#dc3545',
    color: 'white',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid #e2e8f0',
    borderRadius: '18px',
    padding: '20px',
    background: '#ffffff',
  },
  cardTitle: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#0f172a',
  },
};

export default AdminDashboard;
