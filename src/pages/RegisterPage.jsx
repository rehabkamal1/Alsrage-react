import { useState } from "react";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import StatusAlert from "../components/StatusAlert";
import { registerUser, saveToken, saveUser } from "../services/authService";

const ROLE_OPTIONS = [
  { value: "supplier", label: "Supplier" },
  { value: "client", label: "Client" },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  role: "supplier",
  password: "",
  password_confirmation: "",
};

const RegisterPage = ({ goToLogin }) => {
  const [form, setForm] = useState(initialForm);
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
    if (!form.name.trim()) errs.name = "Full name is required.";
    if (!form.email) errs.email = "Email is required.";
    if (!form.phone) errs.phone = "Phone number is required.";
    if (!form.role) errs.role = "Please select a role.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    if (form.password !== form.password_confirmation)
      errs.password_confirmation = "Passwords do not match.";
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
      await registerUser(form);
      setSuccess("Account created successfully! Redirecting to login...");
      setForm(initialForm);
      setTimeout(() => {
        goToLogin();
      }, 1500);
    } catch (error) {
      const apiErrors = error.response?.data?.errors || {};
      setErrors({
        name: apiErrors.name?.[0] || "",
        email: apiErrors.email?.[0] || "",
        phone: apiErrors.phone?.[0] || "",
        role: apiErrors.role?.[0] || "",
        password: apiErrors.password?.[0] || "",
        password_confirmation: apiErrors.password_confirmation?.[0] || "",
      });
      setServerError(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create Account ✨"
      subtitle="Join us as a Supplier or Client."
      footer={
        <>
          Already have an account?{" "}
          <button className="auth-switch-btn" onClick={goToLogin}>
            Sign in
          </button>
        </>
      }
    >
      <StatusAlert message={serverError} type="error" />
      <StatusAlert message={success} type="success" />

      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          id="register-name"
          label="Full Name"
          icon="user"
          value={form.name}
          onChange={handleChange("name")}
          placeholder="Your full name"
          error={errors.name}
        />

        <FormInput
          id="register-email"
          type="email"
          label="Email Address"
          icon="email"
          value={form.email}
          onChange={handleChange("email")}
          placeholder="name@company.com"
          error={errors.email}
        />

        <FormInput
          id="register-phone"
          label="Phone Number"
          icon="phone"
          value={form.phone}
          onChange={handleChange("phone")}
          placeholder="01000000000"
          error={errors.phone}
        />

        <FormInput
          id="register-role"
          type="select"
          label="Role"
          icon="role"
          value={form.role}
          onChange={handleChange("role")}
          options={ROLE_OPTIONS}
          error={errors.role}
        />

        <FormInput
          id="register-password"
          type="password"
          label="Password"
          icon="lock"
          value={form.password}
          onChange={handleChange("password")}
          placeholder="At least 8 characters"
          error={errors.password}
        />

        <FormInput
          id="register-confirm"
          type="password"
          label="Confirm Password"
          icon="lock"
          value={form.password_confirmation}
          onChange={handleChange("password_confirmation")}
          placeholder="Retype your password"
          error={errors.password_confirmation}
        />

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>
    </AuthCard>
  );
};

export default RegisterPage;
