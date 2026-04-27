import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LiveMap from '../components/LiveMap';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

const analystHighlights = [
  'Graphs: donations per day',
  'Food waste reduction chart',
  'Most active donors leaderboard',
  'Heatmap by location',
  'NGO performance analytics',
  'Peak donation time analysis',
  'Food category trends',
  'Monthly and yearly reports',
  'CO2 savings estimation',
  'Download analytics CSV',
];

const analystStats = [
  { label: 'Donations saved', value: '4,820' },
  { label: 'CO2 avoided', value: '1.2t' },
  { label: 'Peak day', value: 'Tuesday' },
  { label: 'Top region', value: 'Central zone' },
];

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

const AnalystDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalDonations: 0,
    activeDonations: 0,
    totalRequests: 0,
    completedDeliveries: 0,
    dailyDonations: [],
    monthlyDonations: [],
    donationsByLocation: [],
    donationsByType: [],
    recentDonationItems: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      const data = response.data || {};

      const monthlyDonations = Array.isArray(data.monthlyDonations)
        ? data.monthlyDonations
        : data.monthlyStats && typeof data.monthlyStats === 'object'
          ? Object.entries(data.monthlyStats)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([month, count]) => ({ month, count }))
          : [];

      const dailyDonations = Array.isArray(data.dailyDonations)
        ? data.dailyDonations
        : [];

      const donationsByLocation = Array.isArray(data.donationsByLocation)
        ? data.donationsByLocation
        : Array.isArray(data.donationsByLocationList)
          ? data.donationsByLocationList
          : data.donationsByLocation && typeof data.donationsByLocation === 'object'
            ? Object.entries(data.donationsByLocation).map(([location, count]) => ({ location, count }))
            : [];

      const normalizedLocations = donationsByLocation
        .map((item) => ({
          location: item?.location || 'Unknown',
          count: Number(item?.count || 0),
        }))
        .filter((item) => item.count > 0);

      const finalDonationsByLocation = normalizedLocations.length > 0
        ? normalizedLocations
        : (data.totalDonations || 0) > 0
          ? [{ location: 'Unknown', count: Number(data.totalDonations || 0) }]
          : [];

      const donationsByType = Array.isArray(data.donationsByType)
        ? data.donationsByType
        : [];

      const recentDonationItems = Array.isArray(data.recentDonationItems)
        ? data.recentDonationItems
        : [];
      
      // Ensure all array fields are actually arrays
      setDashboardData({
        totalDonations: data.totalDonations || 0,
        activeDonations: data.activeDonations || 0,
        totalRequests: data.totalRequests || 0,
        completedDeliveries: data.completedDeliveries || 0,
        dailyDonations,
        monthlyDonations,
        donationsByLocation: finalDonationsByLocation,
        donationsByType,
        recentDonationItems,
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      // Set default empty data structure on error
      setDashboardData({
        totalDonations: 0,
        activeDonations: 0,
        totalRequests: 0,
        completedDeliveries: 0,
        dailyDonations: [],
        monthlyDonations: [],
        donationsByLocation: [],
        donationsByType: [],
        recentDonationItems: [],
      });
      toast.error('Failed to fetch analytics data');
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!dashboardData) {
      return;
    }

    const rows = [
      ['Metric', 'Value'],
      ['Total Donations', dashboardData.totalDonations || 0],
      ['Active Donations', dashboardData.activeDonations || 0],
      ['Total Requests', dashboardData.totalRequests || 0],
      ['Completed Deliveries', dashboardData.completedDeliveries || 0],
    ];

    (dashboardData.dailyDonations || []).forEach((item) => {
      rows.push([`Daily ${item.day}`, item.count]);
    });

    (dashboardData.monthlyDonations || []).forEach((item) => {
      rows.push([`Monthly ${item.month}`, item.count]);
    });

    const csv = rows
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics CSV downloaded');
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.loadingContainer}>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div>
        <Navbar />
        <div style={styles.container}>
          <p>No analytics data available</p>
        </div>
      </div>
    );
  }

  const dailySeries = (dashboardData?.dailyDonations && dashboardData.dailyDonations.length > 0)
    ? dashboardData.dailyDonations
    : (dashboardData?.monthlyDonations || []).map((item) => ({ day: item?.month || '', count: item?.count || 0 }));

  const dailyDonationsData = {
    labels: dailySeries.map(item => item?.day || ''),
    datasets: [
      {
        label: 'Daily Donations',
        data: dailySeries.map(item => item?.count || 0),
        backgroundColor: 'rgba(37, 99, 235, 0.75)',
        borderColor: 'rgba(30, 64, 175, 1)',
        borderWidth: 1,
        borderRadius: 10,
        maxBarThickness: 56,
      },
    ],
  };

  const monthlyBarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const locationSeries = [...(dashboardData?.donationsByLocation || [])]
    .sort((a, b) => (b?.count || 0) - (a?.count || 0))
    .slice(0, 8);

  const locationData = {
    labels: locationSeries.map((item) => item?.location || 'Unknown'),
    datasets: [
      {
        label: 'Donations by Location',
        data: locationSeries.map((item) => item?.count || 0),
        backgroundColor: [
          'rgba(29, 78, 216, 0.78)',
          'rgba(14, 116, 144, 0.78)',
          'rgba(5, 150, 105, 0.78)',
          'rgba(22, 163, 74, 0.78)',
          'rgba(161, 98, 7, 0.78)',
          'rgba(220, 38, 38, 0.78)',
          'rgba(190, 24, 93, 0.78)',
          'rgba(126, 34, 206, 0.78)',
        ],
        borderColor: [
          'rgba(29, 78, 216, 1)',
          'rgba(14, 116, 144, 1)',
          'rgba(5, 150, 105, 1)',
          'rgba(22, 163, 74, 1)',
          'rgba(161, 98, 7, 1)',
          'rgba(220, 38, 38, 1)',
          'rgba(190, 24, 93, 1)',
          'rgba(126, 34, 206, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const typeSeries = [...(dashboardData?.donationsByType || [])]
    .sort((a, b) => (b?.count || 0) - (a?.count || 0))
    .slice(0, 8);

  const foodTypeData = {
    labels: typeSeries.map((item) => item?.foodType || 'Unknown'),
    datasets: [
      {
        label: 'Donations by Food Type',
        data: typeSeries.map((item) => item?.count || 0),
        backgroundColor: 'rgba(15, 118, 110, 0.75)',
        borderColor: 'rgba(15, 118, 110, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const locationChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const foodTypeChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const analystMapPoints = (dashboardData?.donationsByLocation || []).slice(0, 8).map((item, index) => ({
    id: `loc-${index}`,
    label: item?.location || 'Unknown',
    location: item?.location || 'Hyderabad',
    color: '#2563eb',
    meta: `Donations: ${item?.count || 0}`,
  }));

  const graphImageItems = (dashboardData?.recentDonationItems || [])
    .filter((item) => item?.imageUrl)
    .slice(0, 6);

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
            <div style={styles.badge}>Data Analyst</div>
            <h1 style={styles.title}>Data Analyst Dashboard</h1>
            <p style={styles.subtitle}>
              Track food waste trends, analyze data, and generate reports that improve platform efficiency.
            </p>
          </div>
          <div style={styles.heroStats}>
            {analystStats.map((item) => (
              <div key={item.label} style={styles.metricCard}>
                <div style={styles.metricValue}>{item.value}</div>
                <div style={styles.metricLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Analyst toolkit</h2>
          <div style={styles.featureGrid}>
            {analystHighlights.map((item) => (
              <div key={item} style={styles.featureCard}>
                <span style={styles.featureDot} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Total Donations</h3>
            <p style={styles.statValue}>{dashboardData.totalDonations || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Active Donations</h3>
            <p style={styles.statValue}>{dashboardData.activeDonations || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Total Requests</h3>
            <p style={styles.statValue}>{dashboardData.totalRequests || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Completed Deliveries</h3>
            <p style={styles.statValue}>{dashboardData.completedDeliveries || 0}</p>
          </div>
        </div>

        <div style={styles.chartsContainer}>
          <div style={styles.chartSection}>
            <h2 style={styles.sectionTitle}>Daily Donations Record</h2>
            <div style={styles.chartWrapper}>
              {dailySeries.length > 0 ? (
                <Bar data={dailyDonationsData} options={monthlyBarOptions} />
              ) : (
                <p>No daily donation data available</p>
              )}
            </div>
            {graphImageItems.length > 0 && (
              <div style={styles.graphImageStrip}>
                {graphImageItems.map((item) => (
                  <div key={`daily-${item.id}`} style={styles.graphImageCard}>
                    <img src={getImageUrl(item.imageUrl)} alt={item.foodName || 'Food item'} style={styles.graphImageThumb} />
                    <span style={styles.graphImageLabel}>{item.foodName || 'Item'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.chartSection}>
            <h2 style={styles.sectionTitle}>Donations by Location</h2>
            <div style={styles.chartWrapper}>
              {dashboardData.donationsByLocation && dashboardData.donationsByLocation.length > 0 ? (
                <Doughnut data={locationData} options={locationChartOptions} />
              ) : (
                <p>No location data available</p>
              )}
            </div>
            {graphImageItems.length > 0 && (
              <div style={styles.graphImageStrip}>
                {graphImageItems.map((item) => (
                  <div key={`location-${item.id}`} style={styles.graphImageCard}>
                    <img src={getImageUrl(item.imageUrl)} alt={item.foodName || 'Food item'} style={styles.graphImageThumb} />
                    <span style={styles.graphImageLabel}>{item.foodName || 'Item'}</span>
                  </div>
                ))}
              </div>
            )}
            {dashboardData.donationsByLocation && dashboardData.donationsByLocation.length > 0 && (
              <div style={styles.locationList}>
                {dashboardData.donationsByLocation
                  .slice()
                  .sort((a, b) => (b?.count || 0) - (a?.count || 0))
                  .map((item) => (
                    <div key={item.location} style={styles.locationItem}>
                      <span>{item.location}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div style={styles.chartSection}>
            <h2 style={styles.sectionTitle}>Donations by Food Type</h2>
            <div style={styles.chartWrapper}>
              {typeSeries.length > 0 ? (
                <Bar data={foodTypeData} options={foodTypeChartOptions} />
              ) : (
                <p>No food type data available</p>
              )}
            </div>
            {graphImageItems.length > 0 && (
              <div style={styles.graphImageStrip}>
                {graphImageItems.map((item) => (
                  <div key={`type-${item.id}`} style={styles.graphImageCard}>
                    <img src={getImageUrl(item.imageUrl)} alt={item.foodName || 'Food item'} style={styles.graphImageThumb} />
                    <span style={styles.graphImageLabel}>{item.foodName || 'Item'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Insights & Reports</h2>
          <div style={styles.toolbar}>
            <button style={styles.downloadButton} onClick={handleDownloadCsv}>
              Download Analytics CSV
            </button>
          </div>
          <div style={styles.mapGrid}>
            <div style={styles.mapPanel}>
              <div style={styles.mapTitle}>Location heatmap</div>
              <LiveMap
                points={
                  analystMapPoints.length > 0
                    ? analystMapPoints
                    : [{ id: 'fallback', label: 'Hyderabad', location: 'Hyderabad', color: '#2563eb' }]
                }
                showRoute={false}
              />
            </div>
            <div style={styles.sidePanel}>
              <h3 style={styles.cardTitle}>Suggested outputs</h3>
              <ul style={styles.list}>
                <li>Monthly / yearly reports</li>
                <li>CSV export for leadership</li>
                <li>Food category trend summary</li>
                <li>Peak donation time analysis</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Donation Items</h2>
          <p style={styles.gallerySubtitle}>Visual feed of latest donated items with quantity and availability status.</p>
          {dashboardData.recentDonationItems && dashboardData.recentDonationItems.length > 0 ? (
            <div style={styles.galleryGrid}>
              {dashboardData.recentDonationItems.map((item) => {
                const imageUrl = getImageUrl(item.imageUrl);
                return (
                  <div key={item.id} style={styles.galleryCard}>
                    <div style={styles.galleryImageWrap}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.foodName || 'Donation item'}
                          style={styles.galleryImage}
                        />
                      ) : (
                        <div style={styles.galleryFallback}>No image</div>
                      )}
                      <span style={styles.galleryBadge}>{item.status || 'UNKNOWN'}</span>
                    </div>
                    <div style={styles.galleryContent}>
                      <h3 style={styles.galleryTitle}>{item.foodName || 'Donation item'}</h3>
                      <p style={styles.galleryMeta}>{item.foodType || 'Unknown type'} • {item.location || 'Unknown location'}</p>
                      <div style={styles.galleryStatsRow}>
                        <span style={styles.galleryStatChip}>Qty: {item.quantity ?? 'N/A'}</span>
                        <span style={styles.galleryStatChip}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No item image data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
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
    background: 'rgba(59,130,246,0.12)',
    color: '#1d4ed8',
    fontWeight: 800,
    marginBottom: '12px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
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
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
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
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '30px',
    marginBottom: '30px',
  },
  chartSection: {
    background: 'rgba(255,255,255,0.92)',
    padding: '28px',
    borderRadius: '24px',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
    border: '1px solid rgba(148,163,184,0.18)',
  },
  chartWrapper: {
    position: 'relative',
    height: '300px',
    marginTop: '20px',
  },
  graphImageStrip: {
    display: 'flex',
    gap: '10px',
    marginTop: '14px',
    overflowX: 'auto',
    paddingBottom: '6px',
  },
  graphImageCard: {
    minWidth: '92px',
    maxWidth: '92px',
    background: '#eff6ff',
    border: '1px solid rgba(37, 99, 235, 0.22)',
    borderRadius: '12px',
    padding: '6px',
    boxShadow: '0 8px 16px rgba(30, 64, 175, 0.12)',
  },
  graphImageThumb: {
    width: '100%',
    height: '62px',
    objectFit: 'cover',
    borderRadius: '8px',
    display: 'block',
  },
  graphImageLabel: {
    display: 'block',
    marginTop: '6px',
    fontSize: '11px',
    color: '#1e3a8a',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  locationList: {
    marginTop: '12px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '10px',
    display: 'grid',
    gap: '6px',
  },
  locationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#334155',
    fontSize: '14px',
  },
  section: {
    background: 'rgba(255,255,255,0.92)',
    padding: '28px',
    borderRadius: '24px',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
    border: '1px solid rgba(148,163,184,0.18)',
    marginBottom: '22px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '14px',
  },
  downloadButton: {
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    fontWeight: 700,
    cursor: 'pointer',
    color: 'white',
    background: 'linear-gradient(135deg, #0f766e 0%, #2563eb 100%)',
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
    marginBottom: '20px',
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
    background: 'linear-gradient(135deg, #1d4ed8, #0f766e)',
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
  gallerySubtitle: {
    color: '#475569',
    marginBottom: '14px',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  galleryCard: {
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(148,163,184,0.2)',
    background: 'linear-gradient(180deg, #ffffff 0%, #eff6ff 100%)',
    boxShadow: '0 14px 32px rgba(15, 23, 42, 0.12)',
  },
  galleryImageWrap: {
    position: 'relative',
    height: '160px',
    background: '#dbeafe',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  galleryFallback: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    color: '#1e3a8a',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  },
  galleryBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.4px',
    color: '#082f49',
    background: 'rgba(125, 211, 252, 0.92)',
    border: '1px solid rgba(8, 47, 73, 0.2)',
  },
  galleryContent: {
    padding: '14px',
  },
  galleryTitle: {
    margin: 0,
    marginBottom: '8px',
    color: '#0f172a',
    fontSize: '18px',
  },
  galleryMeta: {
    margin: 0,
    marginBottom: '10px',
    color: '#475569',
    fontSize: '14px',
  },
  galleryStatsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  galleryStatChip: {
    padding: '5px 9px',
    borderRadius: '999px',
    background: 'rgba(37, 99, 235, 0.12)',
    border: '1px solid rgba(37, 99, 235, 0.2)',
    color: '#1d4ed8',
    fontSize: '12px',
    fontWeight: 700,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid #e2e8f0',
    borderRadius: '18px',
    padding: '20px',
    background: '#ffffff',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#0f172a',
  },
  cardValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#667eea',
    margin: 0,
  },
};

export default AnalystDashboard;
