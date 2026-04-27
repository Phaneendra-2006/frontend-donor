const highlights = [
  {
    title: 'Fast onboarding',
    text: 'Simple login and registration flows with role-based routing.',
  },
  {
    title: 'Smarter handoff',
    text: 'Donors, NGOs, admins, and analysts get tailored dashboards.',
  },
  {
    title: 'Live visibility',
    text: 'Track donations, requests, deliveries, and impact in one place.',
  },
];

const AuthShell = ({ eyebrow, title, subtitle, children, footer }) => {
  return (
    <div style={styles.page}>
      <div style={styles.backdrop} />
      <div style={styles.grid}>
        <section style={styles.hero}>
          <div style={styles.brandPill}>Food Donation System</div>
          <h1 style={styles.heroTitle}>{title}</h1>
          <p style={styles.heroSubtitle}>{subtitle}</p>

          <div style={styles.metricsRow}>
            <div style={styles.metricCard}>
              <span style={styles.metricValue}>24/7</span>
              <span style={styles.metricLabel}>Access</span>
            </div>
            <div style={styles.metricCard}>
              <span style={styles.metricValue}>4</span>
              <span style={styles.metricLabel}>User roles</span>
            </div>
            <div style={styles.metricCard}>
              <span style={styles.metricValue}>Live</span>
              <span style={styles.metricLabel}>Status updates</span>
            </div>
          </div>

          <div style={styles.featuresList}>
            {highlights.map((item) => (
              <div key={item.title} style={styles.featureCard}>
                <div style={styles.featureDot} />
                <div>
                  <h3 style={styles.featureTitle}>{item.title}</h3>
                  <p style={styles.featureText}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.formWrap}>
          {eyebrow && <div style={styles.eyebrow}>{eyebrow}</div>}
          <div style={styles.formCard}>
            {children}
          </div>
          {footer && <div style={styles.footer}>{footer}</div>}
        </section>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background:
      'radial-gradient(circle at top left, rgba(16,185,129,0.18), transparent 30%), radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 28%), linear-gradient(135deg, #06111f 0%, #102a43 42%, #0f766e 100%)',
    color: '#e5eef7',
    padding: '32px',
  },
  backdrop: {
    position: 'absolute',
    inset: 'auto -10% -20% auto',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    filter: 'blur(12px)',
  },
  grid: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1280px',
    minHeight: 'calc(100vh - 64px)',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.15fr 0.85fr',
    gap: '28px',
    alignItems: 'center',
  },
  hero: {
    padding: '24px 20px 24px 8px',
  },
  brandPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: '#f8fbff',
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
    marginBottom: '18px',
    backdropFilter: 'blur(16px)',
  },
  heroTitle: {
    fontSize: 'clamp(42px, 5vw, 68px)',
    lineHeight: 1.03,
    letterSpacing: '-1.8px',
    marginBottom: '18px',
    color: '#ffffff',
    maxWidth: '11ch',
  },
  heroSubtitle: {
    fontSize: '18px',
    lineHeight: 1.7,
    color: 'rgba(229,238,247,0.88)',
    maxWidth: '56ch',
    marginBottom: '28px',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    maxWidth: '560px',
    marginBottom: '28px',
  },
  metricCard: {
    padding: '18px 16px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.14)',
    backdropFilter: 'blur(16px)',
  },
  metricValue: {
    display: 'block',
    fontSize: '28px',
    fontWeight: 800,
    color: '#ffffff',
    marginBottom: '4px',
  },
  metricLabel: {
    fontSize: '13px',
    color: 'rgba(229,238,247,0.8)',
  },
  featuresList: {
    display: 'grid',
    gap: '14px',
    maxWidth: '620px',
  },
  featureCard: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '14px',
    alignItems: 'start',
    padding: '18px 20px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(16px)',
  },
  featureDot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    marginTop: '5px',
    background: 'linear-gradient(135deg, #7dd3fc, #34d399)',
    boxShadow: '0 0 0 6px rgba(125,211,252,0.15)',
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: '17px',
    marginBottom: '4px',
  },
  featureText: {
    color: 'rgba(229,238,247,0.8)',
    lineHeight: 1.6,
    fontSize: '14px',
  },
  formWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '14px',
  },
  eyebrow: {
    alignSelf: 'flex-end',
    padding: '10px 14px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 700,
    backdropFilter: 'blur(16px)',
  },
  formCard: {
    background: 'rgba(255,255,255,0.96)',
    color: '#0f172a',
    borderRadius: '28px',
    padding: '34px',
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.26)',
    border: '1px solid rgba(255,255,255,0.6)',
  },
  footer: {
    color: 'rgba(229,238,247,0.92)',
    fontSize: '14px',
    textAlign: 'center',
  },
};

export default AuthShell;