import { useState } from "react";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import StatusAlert from "../components/StatusAlert";
import { loginUser, saveToken, saveUser } from "../services/authService";

const LoginPage = ({ goToRegister, onLoginSuccess }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required.";
    if (!form.password) errs.password = "Password is required.";
    return errs;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    setSuccess("");

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(form);
      saveToken(data.token);
      saveUser(data.user);
      setSuccess(`Welcome back, ${data.user.name}! Redirecting…`);
      setForm({ email: "", password: "" });
      
      // Update App state immediately
      if (onLoginSuccess) onLoginSuccess(data.user);
    } catch (error) {
      const apiErrors = error.response?.data?.errors || {};
      setErrors({
        email: apiErrors.email?.[0] || "",
        password: apiErrors.password?.[0] || "",
      });
      setServerError(error.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome Back 👋"
      subtitle="Sign in to your account to continue."
      footer={
        <>
          Don't have an account?{" "}
          <button className="auth-switch-btn" onClick={goToRegister}>
            Create one
          </button>
        </>
      }
    >
      <StatusAlert message={serverError} type="error" />
      <StatusAlert message={success} type="success" />

      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          id="login-email"
          type="email"
          label="Email Address"
          icon="email"
          value={form.email}
          onChange={handleChange("email")}
          placeholder="name@company.com"
          error={errors.email}
        />

        <FormInput
          id="login-password"
          type="password"
          label="Password"
          icon="lock"
          value={form.password}
          onChange={handleChange("password")}
          placeholder="Enter your password"
          error={errors.password}
        />

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </AuthCard>
  );
};

export default LoginPage;
