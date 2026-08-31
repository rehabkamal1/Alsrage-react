import { useState, useEffect } from "react";
import AuthLayout from "./components/AuthLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { getUser, getToken, logout } from "./services/authService";
import DashboardLayout from "./components/DashboardLayout";
import { getProfile } from "./services/apiService";

const getInitialView = () => (window.location.hash === "#register" ? "register" : "login");

function App() {
  const [view, setView] = useState(getInitialView);
  const [user, setUser] = useState(() => {
    const token = getToken();
    const storedUser = getUser();
    if (!token || !storedUser) {
      logout();
      return null;
    }
    return storedUser;
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUser(null);
    } else {
      getProfile()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("auth_user", JSON.stringify(res.data));
        })
        .catch((err) => {
          console.error("Failed to fetch profile, logging out:", err);
          handleLogout();
        });
    }
  }, []);

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

  if (user && getToken()) {
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
