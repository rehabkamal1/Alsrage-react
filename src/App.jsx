import { useState, useEffect } from "react";
import AuthLayout from "./components/AuthLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { getUser, getToken, logout } from "./services/authService";
import DashboardLayout from "./components/DashboardLayout";
import { getProfile } from "./services/apiService";

const SESSION_EXPIRED_MESSAGE =
  "انتهت الجلسة الحالية. الرجاء تسجيل الدخول مرة أخرى.";

const getInitialView = () => (window.location.hash === "#register" ? "register" : "login");

function App() {
  const [view, setView] = useState(getInitialView);
  const [sessionExpired, setSessionExpired] = useState(false);
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
    const handleSessionExpired = () => {
      setSessionExpired(true);
      setUser(null);
      setView("login");
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    const cachedUser = getUser();
    if (cachedUser) {
      setUser(cachedUser);
    }

    let isMounted = true;

    const loadProfile = async () => {
      try {
        const res = await getProfile();
        const profileUser = res.data?.user ?? res.data;

        if (!isMounted) return;

        setUser(profileUser);
        setSessionExpired(false);
        localStorage.setItem("auth_user", JSON.stringify(profileUser));
      } catch (err) {
        if (!isMounted) return;

        console.error("Failed to fetch profile, session expired:", err);
        logout();
        setUser(null);
        setSessionExpired(true);
        setView("login");
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    setSessionExpired(false);
    setUser(null);
    setView("login");
  };

  const handleLoginSuccess = (loggedInUser) => {
    setSessionExpired(false);
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
      {sessionExpired && (
        <div className="alert alert-warning text-center fw-bold mb-3" role="alert">
          {SESSION_EXPIRED_MESSAGE}{" "}
          <a
            href="#login"
            className="alert-link"
            onClick={(event) => {
              event.preventDefault();
              goToLogin();
            }}
          >
            تسجيل الدخول
          </a>
        </div>
      )}
      {view === "register" ? (
        <RegisterPage goToLogin={goToLogin} />
      ) : (
        <LoginPage goToRegister={goToRegister} onLoginSuccess={handleLoginSuccess} />
      )}
    </AuthLayout>
  );
}

export default App;
