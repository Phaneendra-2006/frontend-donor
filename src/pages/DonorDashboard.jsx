import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import LiveMap from '../components/LiveMap';
import api from '../services/api';

const donorFeatureCards = [
  'Upload food photos',
  'Set expiry time',
  'Auto notify nearby NGOs',
  'View donation history',
  'Cancel donation option',
  'Schedule future donation',
  'Live pickup tracking',
  'Rate NGO after pickup',
  'Quantity suggestions',
  'Repost previous donation',
];

const donorImpactCards = [
  { label: 'Meals redirected', value: '1,248' },
  { label: 'Nearby NGOs alerted', value: '26' },
  { label: 'Avg. pickup ETA', value: '34 min' },
  { label: 'CO2 saved', value: '312 kg' },
];

const initialFormState = {
  foodName: '',
  quantity: '',
  foodType: '',
  expiryTime: '',
  location: '',
  description: '',
  imageFile: null,
};

const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [customMapPoints, setCustomMapPoints] = useState([]);
  const [mapLocationInput, setMapLocationInput] = useState('');
  const [addingLocation, setAddingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    fetchMyDonations();
    fetchRequests();
    fetchDeliveries();

    const intervalId = setInterval(() => {
      fetchMyDonations();
      fetchRequests();
      fetchDeliveries();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const query = mapLocationInput.trim();

    if (query.length < 3) {
      setLocationSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    let isMounted = true;
    const timeoutId = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const data = await response.json();
        if (!isMounted) {
          return;
        }

        setLocationSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        if (isMounted) {
          setLocationSuggestions([]);
        }
      } finally {
        if (isMounted) {
          setLoadingSuggestions(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [mapLocationInput]);

  const fetchMyDonations = async () => {
    try {
      const response = await api.get('/donor/my-donations');
      setDonations(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch your donations');
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get('/donor/requests');
      setRequests(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch requests');
    }
  };

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/donor/deliveries');
      setDeliveries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      setDeliveries([]);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, files } = event.target;
    
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('foodName', formData.foodName);
      formDataToSend.append('quantity', Number(formData.quantity));
      formDataToSend.append('foodType', formData.foodType);
      formDataToSend.append('expiryTime', formData.expiryTime || '');
      formDataToSend.append('location', formData.location);
      formDataToSend.append('description', formData.description);
      
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }

      await api.post('/donor/add-food', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Donation added successfully');
      setFormData(initialFormState);
      fetchMyDonations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add donation');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      if (action === 'APPROVED') {
        await api.put(`/donor/requests/${requestId}/approve`);
      } else {
        await api.put(`/donor/requests/${requestId}/reject`);
      }

      toast.success(`Request ${action.toLowerCase()} successfully`);
      fetchRequests();
      fetchMyDonations();
      fetchDeliveries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update request');
    }
  };

  const donorMapPoints = [
    {
      id: 'donor-point',
      label: 'Donor location',
      location: donations[0]?.location || formData.location || 'Hyderabad',
      color: '#22c55e',
      meta: donations[0]?.foodName ? `Latest donation: ${donations[0].foodName}` : undefined,
    },
    {
      id: 'ngo-point',
      label: 'Recipient organization',
      location: donations[0]?.location || 'Secunderabad',
      color: '#2563eb',
      meta: requests[0]?.ngoName || 'Nearest NGO',
    },
  ];

  const handleAddDonorMapPoint = async () => {
    if (!mapLocationInput.trim()) {
      toast.info('Enter a location name first');
      return;
    }

    setAddingLocation(true);
    try {
      let result = selectedSuggestion;

      if (!result) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(mapLocationInput)}`
        );

        if (!response.ok) {
          throw new Error('Failed to geocode location');
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          toast.error('Location not found. Try a clearer place name.');
          return;
        }

        result = data[0];
      }

      setCustomMapPoints((prev) => [
        ...prev,
        {
          id: `custom-${Date.now()}-${prev.length}`,
          label: mapLocationInput,
          location: result.display_name,
          lat: Number(result.lat),
          lng: Number(result.lon),
          color: '#f97316',
          meta: 'Added by text',
        },
      ]);
      setMapLocationInput('');
      setSelectedSuggestion(null);
      setLocationSuggestions([]);
      toast.success('Location pin added');
    } catch (error) {
      toast.error('Could not add location right now');
    } finally {
      setAddingLocation(false);
    }
  };

  const handleClearDonorMapPoints = () => {
    setCustomMapPoints([]);
  };

  const handleSelectSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setMapLocationInput(suggestion.display_name);
    setLocationSuggestions([]);
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
            <div style={styles.badge}>Food Donor</div>
            <h1 style={styles.title}>Food Donor Dashboard</h1>
            <p style={styles.subtitle}>
              Share surplus food quickly, track pickup flow, and monitor your social impact in one place.
            </p>
          </div>
          <div style={styles.heroStats}>
            {donorImpactCards.map((item) => (
              <div key={item.label} style={styles.metricCard}>
                <div style={styles.metricValue}>{item.value}</div>
                <div style={styles.metricLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Donor tools</h2>
          <div style={styles.featureGrid}>
            {donorFeatureCards.map((feature) => (
              <div key={feature} style={styles.featureCard}>
                <span style={styles.featureDot} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Add New Donation</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Food Name</label>
                <input
                  type="text"
                  name="foodName"
                  value={formData.foodName}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Quantity (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Food Type</label>
                <input
                  type="text"
                  name="foodType"
                  value={formData.foodType}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Expiry Time</label>
                <input
                  type="datetime-local"
                  name="expiryTime"
                  value={formData.expiryTime}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Add Image (optional)</label>
              <input
                type="file"
                name="imageFile"
                onChange={handleChange}
                accept="image/*"
                style={styles.input}
              />
              {formData.imageFile && (
                <p style={styles.fileInfo}>Selected: {formData.imageFile.name}</p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                style={styles.textarea}
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Adding...' : 'Add Donation'}
            </button>
          </form>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Live Map & Location Tracking</h2>
          <div style={styles.mapGrid}>
            <div style={styles.mapPanel}>
              <div style={styles.mapTitle}>Donation route preview</div>
              <LiveMap
                points={[...donorMapPoints, ...customMapPoints]}
                showRoute={true}
              />
            </div>
            <div style={styles.sidePanel}>
              <h3 style={styles.cardTitle}>Smart helpers</h3>
              <ul style={styles.list}>
                <li>Auto notify nearby NGOs</li>
                <li>Estimated pickup time</li>
                <li>Quantity suggestions based on servings</li>
                <li>Repost previous donation in one click</li>
              </ul>
              <div style={styles.mapActions}>
                <p style={styles.mapActionText}>Custom map pins: {customMapPoints.length}</p>
                <div style={styles.mapInputRow}>
                  <input
                    type="text"
                    value={mapLocationInput}
                    onChange={(event) => {
                      setMapLocationInput(event.target.value);
                      setSelectedSuggestion(null);
                    }}
                    placeholder="Type location name and add pin"
                    style={styles.mapInput}
                  />
                  {loadingSuggestions ? <div style={styles.suggestionHint}>Searching locations...</div> : null}
                  {locationSuggestions.length > 0 ? (
                    <div style={styles.suggestionList}>
                      {locationSuggestions.map((item) => (
                        <button
                          key={item.place_id}
                          type="button"
                          style={styles.suggestionItem}
                          onClick={() => handleSelectSuggestion(item)}
                        >
                          {item.display_name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div style={styles.mapButtonRow}>
                  <button
                    type="button"
                    style={styles.smallActionButton}
                    onClick={handleAddDonorMapPoint}
                    disabled={addingLocation}
                  >
                    {addingLocation ? 'Adding...' : 'Add location pin'}
                  </button>
                  <button
                    type="button"
                    style={styles.smallActionButton}
                    onClick={handleClearDonorMapPoints}
                    disabled={customMapPoints.length === 0}
                  >
                    Clear custom pins
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Donation Activity</h2>
          <div style={styles.grid}>
            {donations.length > 0 ? (
              donations.map((donation) => (
                <div key={donation.id} style={styles.card}>
                  {getImageUrl(donation.imageUrl) && (
                    <img
                      src={getImageUrl(donation.imageUrl)}
                      alt={donation.foodName}
                      style={styles.cardImage}
                    />
                  )}
                  <h3 style={styles.cardTitle}>{donation.foodName}</h3>
                  <p><strong>Quantity:</strong> {donation.quantity}</p>
                  <p><strong>Type:</strong> {donation.foodType}</p>
                  <p><strong>Location:</strong> {donation.location}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span style={getStatusStyle(donation.status)}>{donation.status}</span>
                  </p>
                  {donation.expiryTime && (
                    <p><strong>Expiry:</strong> {new Date(donation.expiryTime).toLocaleString()}</p>
                  )}
                  {donation.description && <p>{donation.description}</p>}
                </div>
              ))
            ) : (
              <p>No donations yet. Add your first donation above.</p>
            )}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Requests from Recipient Organizations</h2>
          <div style={styles.grid}>
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.id} style={styles.card}>
                  {getImageUrl(request.imageUrl) && (
                    <img
                      src={getImageUrl(request.imageUrl)}
                      alt={request.foodName || 'Donation request'}
                      style={styles.cardImage}
                    />
                  )}
                  <h3 style={styles.cardTitle}>{request.foodName || 'Donation request'}</h3>
                  <p><strong>NGO:</strong> {request.ngoName || 'Recipient Organization'}</p>
                  <p><strong>Available Quantity:</strong> {request.availableQuantity || 'N/A'}</p>
                  <p><strong>Required Quantity:</strong> {request.requiredQuantity || 'N/A'}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span style={getStatusStyle(request.status)}>{request.status}</span>
                  </p>
                  {request.requestTime && (
                    <p><strong>Requested:</strong> {new Date(request.requestTime).toLocaleString()}</p>
                  )}
                  {request.status === 'PENDING' && (
                    <div style={styles.buttonGroup}>
                      <button
                        onClick={() => handleRequestAction(request.id, 'APPROVED')}
                        style={{ ...styles.actionButton, ...styles.approveButton }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequestAction(request.id, 'REJECTED')}
                        style={{ ...styles.actionButton, ...styles.rejectButton }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No incoming requests yet.</p>
            )}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Delivery Tracking</h2>
          <div style={styles.grid}>
            {deliveries && deliveries.length > 0 ? (
              deliveries.map((delivery) => (
                <div key={delivery.id} style={styles.card}>
                  <h3 style={styles.cardTitle}>{delivery.request?.donation?.foodName || 'Delivery'}</h3>
                  <p><strong>Required Quantity:</strong> {delivery.request?.requiredQuantity || delivery.request?.donation?.quantity || 'N/A'}</p>
                  <p><strong>Pickup Location:</strong> {delivery.request?.donation?.location || 'N/A'}</p>
                  <p><strong>Delivery To:</strong> {delivery.request?.ngo?.name || 'NGO'}</p>
                  <p><strong>Status:</strong> <span style={getStatusStyle(delivery.deliveryStatus)}>{delivery.deliveryStatus}</span></p>
                  {delivery.pickupTime && (
                    <p><strong>Pickup Time:</strong> {new Date(delivery.pickupTime).toLocaleString()}</p>
                  )}
                  {delivery.deliveryTime && (
                    <p><strong>Delivered At:</strong> {new Date(delivery.deliveryTime).toLocaleString()}</p>
                  )}
                  {delivery.notes && (
                    <p><strong>Notes:</strong> {delivery.notes}</p>
                  )}
                </div>
              ))
            ) : (
              <p>No deliveries scheduled.</p>
            )}
          </div>
        </section>
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
    case 'AVAILABLE':
    case 'APPROVED':
    case 'DELIVERED':
      return { ...baseStyle, background: '#d4edda', color: '#155724' };
    case 'PENDING':
    case 'IN_PROGRESS':
    case 'SCHEDULED':
    case 'IN_TRANSIT':
      return { ...baseStyle, background: '#fff3cd', color: '#856404' };
    case 'REJECTED':
    case 'EXPIRED':
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
    background: 'rgba(15,118,110,0.12)',
    color: '#0f766e',
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
    background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)',
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
    background: 'linear-gradient(135deg, #0f766e, #2563eb)',
    flexShrink: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '6px',
    color: '#334155',
    fontWeight: '600',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '14px',
    background: 'white',
  },
  fileInfo: {
    marginTop: '8px',
    fontSize: '13px',
    color: '#0f766e',
    fontWeight: '500',
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    background: 'white',
  },
  button: {
    alignSelf: 'flex-start',
    padding: '12px 18px',
    background: 'linear-gradient(135deg, #0f766e, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
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
  mapInputRow: {
    marginBottom: '10px',
    position: 'relative',
  },
  mapInput: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    background: 'white',
  },
  suggestionHint: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#64748b',
  },
  suggestionList: {
    marginTop: '6px',
    maxHeight: '180px',
    overflowY: 'auto',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#fff',
  },
  suggestionItem: {
    width: '100%',
    textAlign: 'left',
    border: 'none',
    borderBottom: '1px solid #e2e8f0',
    background: 'white',
    padding: '10px 12px',
    fontSize: '13px',
    color: '#0f172a',
    cursor: 'pointer',
  },
  mapButtonRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
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
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
  },
  actionButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  approveButton: {
    background: '#16a34a',
    color: 'white',
  },
  rejectButton: {
    background: '#dc2626',
    color: 'white',
  },
};

export default DonorDashboard;
