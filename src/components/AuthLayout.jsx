const AuthLayout = ({ children }) => {
  return (
    <div className="auth-page">
      <main className="auth-content">{children}</main>
    </div>
  );
};

export default AuthLayout;
