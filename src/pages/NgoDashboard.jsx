import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FoodCard from '../components/FoodCard';
import LiveMap from '../components/LiveMap';
import api from '../services/api';
import { toast } from 'react-toastify';

const ngoFeatureCards = [
  'Filter by food type',
  'Filter by distance',
  'Accept or reject request',
  'Assign volunteer for pickup',
  'Map-based nearby donations',
  'Pickup route navigation',
  'Food requirement posting',
  'Track multiple pickups',
  'Donation priority flag',
  'Chat with donor',
];

const ngoKpis = [
  { label: 'Active requests', value: '14' },
  { label: 'Pickup routes', value: '6' },
  { label: 'Nearby donors', value: '38' },
  { label: 'Volunteers assigned', value: '9' },
];

const NgoDashboard = () => {
  const [availableFood, setAvailableFood] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customMapPoints, setCustomMapPoints] = useState([]);

  useEffect(() => {
    fetchAvailableFood();
    fetchMyRequests();
    fetchDeliveries();

    const intervalId = setInterval(() => {
      fetchAvailableFood();
      fetchMyRequests();
      fetchDeliveries();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchAvailableFood = async () => {
    try {
      const response = await api.get('/ngo/available-food');
      setAvailableFood(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch available food:', error);
      setAvailableFood([]); // Set empty array on error
      toast.error('Failed to fetch available food');
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await api.get('/ngo/my-requests');
      setMyRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      setMyRequests([]); // Set empty array on error
      toast.error('Failed to fetch requests');
    }
  };

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/ngo/deliveries');
      setDeliveries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      setDeliveries([]); // Set empty array on error
      // Don't show toast error to avoid cluttering UI
    }
  };

  const handleRequest = async (food, requiredQuantity) => {
    if (!Number.isFinite(requiredQuantity) || requiredQuantity <= 0) {
      toast.error('Please enter a valid required quantity');
      return;
    }

    if (requiredQuantity > Number(food.quantity || 0)) {
      toast.error('Required quantity cannot exceed available donation quantity');
      return;
    }

    setLoading(true);
    try {
      await api.post('/ngo/request-food', {
        donationId: food.id,
        requiredQuantity,
        notes: `Requested quantity: ${requiredQuantity}`,
      });
      toast.success('Request sent successfully!');
      fetchAvailableFood();
      fetchMyRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDelivery = async (deliveryId) => {
    setLoading(true);
    try {
      await api.put(`/ngo/deliveries/${deliveryId}/accept`);
      toast.success('Delivery accepted successfully!');
      fetchDeliveries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDelivery = async (deliveryId) => {
    if (!window.confirm('Are you sure you want to reject this delivery?')) {
      return;
    }
    setLoading(true);
    try {
      await api.put(`/ngo/deliveries/${deliveryId}/reject`);
      toast.success('Delivery rejected');
      fetchDeliveries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDelivery = async (deliveryId) => {
    if (!window.confirm('Mark this delivery as completed?')) {
      return;
    }
    setLoading(true);
    try {
      await api.put(`/ngo/deliveries/${deliveryId}/complete`);
      toast.success('Delivery marked as delivered successfully!');
      fetchDeliveries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptApprovedRequest = async (requestId) => {
    setLoading(true);
    try {
      await api.put(`/ngo/requests/${requestId}/accept`);
      toast.success('Pickup accepted. Delivery moved to in-transit.');
      fetchMyRequests();
      fetchDeliveries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept pickup');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectApprovedRequest = async (requestId) => {
    if (!window.confirm('Reject this approved request? The donation will become available again.')) {
      return;
    }
    setLoading(true);
    try {
      await api.put(`/ngo/requests/${requestId}/reject`);
      toast.success('Approved request rejected');
      fetchMyRequests();
      fetchDeliveries();
      fetchAvailableFood();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject approved request');
    } finally {
      setLoading(false);
    }
  };

  const ngoMapPoints = availableFood.slice(0, 8).map((food) => ({
    id: `food-${food.id}`,
    label: food.foodName,
    location: food.location,
    color: '#2563eb',
    meta: `${food.foodType} | Qty: ${food.quantity}`,
  }));

  const fallbackNgoMapPoints = [
    { id: 'fallback-1', label: 'Hyderabad', location: 'Hyderabad', color: '#2563eb' },
    { id: 'fallback-2', label: 'Secunderabad', location: 'Secunderabad', color: '#22c55e' },
  ];

  const handleAddNgoMapPoint = (point) => {
    setCustomMapPoints((prev) => [
      ...prev,
      {
        ...point,
        id: `ngo-custom-${Date.now()}-${prev.length}`,
        color: '#f97316',
        meta: 'Added by NGO',
      },
    ]);
  };

  const handleClearNgoMapPoints = () => {
    setCustomMapPoints([]);
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:8080${imageUrl}`;
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <div style={styles.badge}>Recipient Organization</div>
            <h1 style={styles.title}>Recipient Organization Dashboard</h1>
            <p style={styles.subtitle}>
              Request food donations, manage logistics, and distribute supplies to people in need.
            </p>
          </div>
          <div style={styles.heroStats}>
            {ngoKpis.map((item) => (
              <div key={item.label} style={styles.metricCard}>
                <div style={styles.metricValue}>{item.value}</div>
                <div style={styles.metricLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Available tools</h2>
          <div style={styles.featureGrid}>
            {ngoFeatureCards.map((feature) => (
              <div key={feature} style={styles.featureCard}>
                <span style={styles.featureDot} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Map & Nearby Donations</h2>
          <div style={styles.mapGrid}>
            <div style={styles.mapPanel}>
              <div style={styles.mapTitle}>Nearby donor map</div>
              <LiveMap
                points={[...(ngoMapPoints.length > 0 ? ngoMapPoints : fallbackNgoMapPoints), ...customMapPoints]}
                showRoute={false}
                allowAddPoint={true}
                onAddPoint={handleAddNgoMapPoint}
                addPointLabel="NGO custom location"
              />
            </div>
            <div style={styles.sidePanel}>
              <h3 style={styles.cardTitle}>Smart logistics</h3>
              <ul style={styles.list}>
                <li>Distance-based sorting</li>
                <li>Pickup route navigation</li>
                <li>Assign volunteer for pickup</li>
                <li>Chat with donor before collection</li>
              </ul>
              <div style={styles.mapActions}>
                <p style={styles.mapActionText}>Custom map pins: {customMapPoints.length}</p>
                <button
                  type="button"
                  style={styles.smallActionButton}
                  onClick={handleClearNgoMapPoints}
                  disabled={customMapPoints.length === 0}
                >
                  Clear custom pins
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Available Food Donations</h2>
          <div style={styles.grid}>
            {availableFood.length > 0 ? (
              availableFood.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  showRequestButton={true}
                  onRequest={handleRequest}
                />
              ))
            ) : (
              <p>No available food donations at the moment.</p>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>My Requests</h2>
          <div style={styles.grid}>
            {myRequests && myRequests.length > 0 ? (
              myRequests.map((request) => (
                <div key={request.id} style={styles.card}>
                  {getImageUrl(request.imageUrl) && (
                    <img
                      src={getImageUrl(request.imageUrl)}
                      alt={request.foodName || 'Donation request'}
                      style={styles.cardImage}
                    />
                  )}
                  <h3 style={styles.cardTitle}>{request.foodName || 'Donation request'}</h3>
                  <p><strong>Donation ID:</strong> {request.donationId}</p>
                  <p><strong>NGO:</strong> {request.ngoName}</p>
                  <p><strong>Available Quantity:</strong> {request.availableQuantity || 'N/A'}</p>
                  <p><strong>Required Quantity:</strong> {request.requiredQuantity || 'N/A'}</p>
                  <p><strong>Status:</strong> <span style={getStatusStyle(request.status)}>{request.status}</span></p>
                  <p><strong>Requested:</strong> {new Date(request.requestTime).toLocaleString()}</p>
                  {request.notes && (
                    <p><strong>Notes:</strong> {request.notes}</p>
                  )}
                  {request.status === 'APPROVED' && (
                    <div style={styles.requestActions}>
                      <button
                        onClick={() => handleAcceptApprovedRequest(request.id)}
                        style={styles.acceptButton}
                        disabled={loading}
                      >
                        Accept Pickup
                      </button>
                      <button
                        onClick={() => handleRejectApprovedRequest(request.id)}
                        style={styles.rejectButton}
                        disabled={loading}
                      >
                        Reject Pickup
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No requests yet.</p>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Logistics & Deliveries</h2>
          <div style={styles.grid}>
            {deliveries && deliveries.length > 0 ? (
              deliveries.map((delivery) => (
                <div key={delivery.id} style={styles.card}>
                  <h3 style={styles.cardTitle}>{delivery.request?.donation?.foodName || 'Delivery'}</h3>
                  <p><strong>Required Quantity:</strong> {delivery.request?.requiredQuantity || delivery.request?.donation?.quantity || 'N/A'} {delivery.request?.donation?.foodType || ''}</p>
                  <p><strong>Pickup Location:</strong> {delivery.request?.donation?.location || 'N/A'}</p>
                  <p><strong>Delivery To:</strong> {delivery.request?.ngo?.name || 'Your NGO'}</p>
                  <p><strong>Status:</strong> <span style={getStatusStyle(delivery.deliveryStatus)}>{delivery.deliveryStatus}</span></p>
                  {delivery.pickupTime && (
                    <p><strong>Pickup Time:</strong> {new Date(delivery.pickupTime).toLocaleString()}</p>
                  )}
                  {delivery.deliveryTime && (
                    <p><strong>Delivered At:</strong> {new Date(delivery.deliveryTime).toLocaleString()}</p>
                  )}
                  {delivery.deliveryStatus === 'SCHEDULED' && (
                    <div style={styles.deliveryActions}>
                      <button
                        onClick={() => handleAcceptDelivery(delivery.id)}
                        style={styles.acceptButton}
                        disabled={loading}
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleRejectDelivery(delivery.id)}
                        style={styles.rejectButton}
                        disabled={loading}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                  {delivery.deliveryStatus === 'IN_TRANSIT' && (
                    <div style={styles.deliveryActions}>
                      <button
                        onClick={() => handleCompleteDelivery(delivery.id)}
                        style={styles.acceptButton}
                        disabled={loading}
                      >
                        Mark Delivered
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No deliveries at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusStyle = (status) => {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '600',
  };

  switch (status) {
    case 'APPROVED':
    case 'DELIVERED':
      return { ...baseStyle, background: '#d4edda', color: '#155724' };
    case 'SCHEDULED':
    case 'PENDING':
    case 'IN_TRANSIT':
      return { ...baseStyle, background: '#fff3cd', color: '#856404' };
    case 'REJECTED':
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
    background: 'rgba(37,99,235,0.12)',
    color: '#2563eb',
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
    background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
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
    background: 'linear-gradient(135deg, #2563eb, #0f766e)',
    flexShrink: 0,
  },
  mapGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '16px',
  },
  mapPanel: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 60%, #0f766e 100%)',
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
  mapActions: {
    marginTop: '14px',
    paddingTop: '14px',
    borderTop: '1px solid #e2e8f0',
  },
  mapActionText: {
    marginBottom: '10px',
    color: '#334155',
    fontWeight: 600,
  },
  smallActionButton: {
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    fontWeight: 700,
    cursor: 'pointer',
    color: 'white',
    background: 'linear-gradient(135deg, #0f766e 0%, #2563eb 100%)',
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
  cardImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '12px',
    marginBottom: '12px',
    border: '1px solid #e2e8f0',
  },
  cardTitle: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#0f172a',
  },
  deliveryActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e2e8f0',
  },
  requestActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e2e8f0',
  },
  acceptButton: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  rejectButton: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
  },
};

export default NgoDashboard;
