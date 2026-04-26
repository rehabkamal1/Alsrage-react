import { useState } from "react";
import AuthLayout from "./components/AuthLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { getUser, logout } from "./services/authService";
import DashboardLayout from "./components/DashboardLayout";

const getInitialView = () => (window.location.hash === "#register" ? "register" : "login");

function App() {
  const [view, setView] = useState(getInitialView);
  const [user, setUser] = useState(getUser());

  const handleLogout = () => {
    logout();
    setUser(null);
    setView("login");
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const goToRegister = () => {
    window.location.hash = "#register";
    setView("register");
  };

  const goToLogin = () => {
    window.location.hash = "#login";
    setView("login");
  };

  if (user) {
    return <DashboardLayout user={user} onLogout={handleLogout} />;
  }

  return (
    <AuthLayout>
      {view === "register" ? (
        <RegisterPage goToLogin={goToLogin} />
      ) : (
        <LoginPage goToRegister={goToRegister} onLoginSuccess={handleLoginSuccess} />
      )}
    </AuthLayout>
  );
}

export default App;
