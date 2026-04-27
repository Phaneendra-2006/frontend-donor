import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMapEvents } from 'react-leaflet';

const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 }; // Hyderabad fallback

const haversineDistanceKm = (from, to) => {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const geocodeLocation = async (query) => {
  if (!query || !query.trim()) {
    return null;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    return {
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
    };
  } catch (error) {
    return null;
  }
};

const MapClickHandler = ({ allowAddPoint, onAddPoint, addPointLabel }) => {
  useMapEvents({
    click(event) {
      if (!allowAddPoint || typeof onAddPoint !== 'function') {
        return;
      }

      const lat = Number(event.latlng.lat.toFixed(6));
      const lng = Number(event.latlng.lng.toFixed(6));
      onAddPoint({
        lat,
        lng,
        location: `${lat}, ${lng}`,
        label: addPointLabel || 'Custom location',
      });
    },
  });

  return null;
};

const LiveMap = ({
  points = [],
  height = 320,
  showRoute = true,
  allowAddPoint = false,
  onAddPoint,
  addPointLabel,
}) => {
  const [resolvedPoints, setResolvedPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const resolvePoints = async () => {
      setLoading(true);

      const mapped = await Promise.all(
        points.map(async (point, index) => {
          if (typeof point.lat === 'number' && typeof point.lng === 'number') {
            return {
              ...point,
              id: point.id || `${index}`,
              lat: point.lat,
              lng: point.lng,
            };
          }

          const geocoded = await geocodeLocation(point.location || point.label);
          if (!geocoded) {
            return null;
          }

          return {
            ...point,
            id: point.id || `${index}`,
            lat: geocoded.lat,
            lng: geocoded.lng,
          };
        })
      );

      if (!isMounted) {
        return;
      }

      setResolvedPoints(mapped.filter(Boolean));
      setLoading(false);
    };

    resolvePoints();

    return () => {
      isMounted = false;
    };
  }, [points]);

  const mapCenter = useMemo(() => {
    if (resolvedPoints.length === 0) {
      return DEFAULT_CENTER;
    }

    const totals = resolvedPoints.reduce(
      (acc, point) => ({ lat: acc.lat + point.lat, lng: acc.lng + point.lng }),
      { lat: 0, lng: 0 }
    );

    return {
      lat: totals.lat / resolvedPoints.length,
      lng: totals.lng / resolvedPoints.length,
    };
  }, [resolvedPoints]);

  const routePoints = showRoute && resolvedPoints.length >= 2 ? [resolvedPoints[0], resolvedPoints[1]] : null;
  const distanceKm = routePoints
    ? haversineDistanceKm(
        { lat: routePoints[0].lat, lng: routePoints[0].lng },
        { lat: routePoints[1].lat, lng: routePoints[1].lng }
      )
    : null;
  const estimatedMinutes = distanceKm ? Math.max(5, Math.round((distanceKm / 30) * 60)) : null;

  if (loading) {
    return <div style={styles.loading}>Loading map...</div>;
  }

  if (resolvedPoints.length === 0) {
    return <div style={styles.loading}>No mappable locations found yet.</div>;
  }

  return (
    <div>
      <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={11} style={{ height, width: '100%', borderRadius: '16px' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler allowAddPoint={allowAddPoint} onAddPoint={onAddPoint} addPointLabel={addPointLabel} />

        {resolvedPoints.map((point) => (
          <CircleMarker
            key={point.id}
            center={[point.lat, point.lng]}
            radius={8}
            pathOptions={{ color: point.color || '#2563eb', fillColor: point.color || '#2563eb', fillOpacity: 0.7 }}
          >
            <Popup>
              <strong>{point.label || 'Location'}</strong>
              {point.location ? <div>{point.location}</div> : null}
              {point.meta ? <div>{point.meta}</div> : null}
            </Popup>
          </CircleMarker>
        ))}

        {routePoints ? (
          <Polyline
            positions={[
              [routePoints[0].lat, routePoints[0].lng],
              [routePoints[1].lat, routePoints[1].lng],
            ]}
            pathOptions={{ color: '#22c55e', weight: 4, opacity: 0.8 }}
          />
        ) : null}
      </MapContainer>

      {routePoints && distanceKm && estimatedMinutes ? (
        <div style={styles.routeSummary}>
          <span><strong>Distance:</strong> {distanceKm.toFixed(1)} km</span>
          <span><strong>Estimated pickup:</strong> {estimatedMinutes} min</span>
        </div>
      ) : null}
      {allowAddPoint ? (
        <div style={styles.helperText}>Click anywhere on the map to add a custom location pin.</div>
      ) : null}
    </div>
  );
};

const styles = {
  loading: {
    minHeight: '220px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.14)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
    fontWeight: 700,
  },
  routeSummary: {
    marginTop: '10px',
    display: 'flex',
    gap: '18px',
    flexWrap: 'wrap',
    color: 'rgba(255,255,255,0.92)',
    fontSize: '14px',
  },
  helperText: {
    marginTop: '8px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.86)',
  },
};

export default LiveMap;
