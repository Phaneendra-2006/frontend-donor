import { useState } from 'react';

const FoodCard = ({ food, showRequestButton, onRequest }) => {
  const [requiredQuantity, setRequiredQuantity] = useState(food.quantity || 1);

  // Construct full image URL if it's a relative path
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:8080${imageUrl}`;
  };

  const imageUrl = getImageUrl(food.imageUrl);

  return (
    <div style={styles.card}>
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={food.foodName} 
          style={styles.image}
        />
      )}
      <div style={styles.content}>
        <h3 style={styles.title}>{food.foodName}</h3>
        
        <div style={styles.details}>
          <p><strong>Quantity:</strong> {food.quantity}</p>
          <p><strong>Type:</strong> {food.foodType}</p>
          <p><strong>Location:</strong> {food.location}</p>
          <p><strong>Status:</strong> <span style={getStatusStyle(food.status)}>{food.status}</span></p>
          <p><strong>Expiry:</strong> {new Date(food.expiryTime).toLocaleString()}</p>
          
          {food.description && (
            <p style={styles.description}><strong>Description:</strong> {food.description}</p>
          )}

          {food.donor && (
            <p><strong>Donor:</strong> {food.donor.name}</p>
          )}
        </div>

        {showRequestButton && food.status === 'AVAILABLE' && (
          <div style={styles.requestSection}>
            <label style={styles.inputLabel}>Required Quantity</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={requiredQuantity}
              onChange={(event) => setRequiredQuantity(event.target.value)}
              style={styles.quantityInput}
            />
            <button
              onClick={() => onRequest(food, Number(requiredQuantity))}
              style={styles.requestButton}
            >
              Request This Food
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusStyle = (status) => {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '12px',
  };

  switch (status) {
    case 'AVAILABLE':
      return { ...baseStyle, background: '#d4edda', color: '#155724' };
    case 'PENDING':
      return { ...baseStyle, background: '#fff3cd', color: '#856404' };
    case 'COMPLETED':
      return { ...baseStyle, background: '#d1ecf1', color: '#0c5460' };
    case 'EXPIRED':
      return { ...baseStyle, background: '#f8d7da', color: '#721c24' };
    default:
      return baseStyle;
  }
};

const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  content: {
    padding: '20px',
  },
  title: {
    fontSize: '20px',
    marginBottom: '15px',
    color: '#333',
  },
  details: {
    marginBottom: '15px',
  },
  description: {
    marginTop: '10px',
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '5px',
    fontSize: '14px',
  },
  requestButton: {
    width: '100%',
    padding: '12px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  requestSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  inputLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  quantityInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
  },
};

export default FoodCard;
