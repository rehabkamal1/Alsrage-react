const AuthCard = ({ title, subtitle, children, footer }) => {
  return (
    <div className="auth-split-card">
      {/* ── Left: Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-logo">
          <img src="/logo4.png" alt="AlSrage Logo" style={{ maxHeight: '100px', width: 'auto' }} />
        </div>
        <h1 className="auth-title">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>

        {children}

        {footer && <div className="auth-footer">{footer}</div>}
      </div>

      {/* ── Right: Visual Panel ── */}
      <div className="auth-visual-panel">
        <div className="auth-visual-tagline">
          <h2>Manage Orders Seamlessly</h2>
          <p>Connect suppliers and clients on one smart platform.</p>
        </div>

        <div className="auth-visual-blob" />

        <div className="auth-visual-img-wrap">
          <img src="/auth-panel.png" alt="Platform illustration" />
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
