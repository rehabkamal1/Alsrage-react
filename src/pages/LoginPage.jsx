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
    if (!form.email) errs.email = "اسم المستخدم أو البريد الإلكتروني مطلوب.";
    if (!form.password) errs.password = "كلمة المرور مطلوبة.";
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
      setSuccess(`مرحباً بك، ${data.user.name}! جاري التوجيه…`);
      setForm({ email: "", password: "" });
      
      // Update App state immediately
      if (onLoginSuccess) onLoginSuccess(data.user);
    } catch (error) {
      const apiErrors = error.response?.data?.errors || {};
      setErrors({
        email: apiErrors.email?.[0] || "",
        password: apiErrors.password?.[0] || "",
      });
      setServerError(error.response?.data?.message || "بيانات الدخول غير صحيحة.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="مرحباً بك 👋"
      subtitle="قم بتسجيل الدخول للحساب للمتابعة."
      footer={
        <>
          ليس لديك حساب؟{" "}
          <button className="auth-switch-btn" onClick={goToRegister}>
            إنشاء حساب جديد
          </button>
        </>
      }
    >
      <StatusAlert message={serverError} type="error" />
      <StatusAlert message={success} type="success" />

      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          id="login-email"
          type="text"
          label="اسم المستخدم / البريد الإلكتروني / رقم الهاتف"
          icon="email"
          value={form.email}
          onChange={handleChange("email")}
          placeholder="أدخل اسم المستخدم أو رقم الهاتف"
          error={errors.email}
        />

        <FormInput
          id="login-password"
          type="password"
          label="كلمة المرور"
          icon="lock"
          value={form.password}
          onChange={handleChange("password")}
          placeholder="أدخل كلمة المرور"
          error={errors.password}
        />

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "جاري الدخول…" : "تسجيل الدخول"}
        </button>
      </form>
    </AuthCard>
  );
};

export default LoginPage;
