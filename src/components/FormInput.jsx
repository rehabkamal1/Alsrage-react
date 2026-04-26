/* ── Generic field used in Login & Register ──
   Props:
     id, label, type ("text"|"email"|"password"|"select"), icon (SVG path d),
     value, onChange, placeholder, error, options (for select only)
*/
const ICONS = {
  user: "M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z",
  email:
    "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  lock: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z",
  phone:
    "M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z",
  role: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
};

const SvgIcon = ({ path }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="17"
    height="17"
    fill="currentColor"
    style={{ display: "block" }}
  >
    <path d={path} />
  </svg>
);

const FormInput = ({
  id,
  label,
  type = "text",
  icon = "user",
  value,
  onChange,
  placeholder,
  error,
  options, // [{ value, label }] — for select type
}) => {
  const iconPath = ICONS[icon] || ICONS.user;
  const isSelect = type === "select";

  return (
    <div className="auth-field">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="auth-input-wrap">
        {isSelect ? (
          <select
            id={id}
            className={`auth-input${error ? " is-invalid" : ""}`}
            data-type="select"
            value={value}
            onChange={onChange}
            style={{ paddingLeft: "40px" }}
          >
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={type}
            className={`auth-input${error ? " is-invalid" : ""}`}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={
              type === "password" ? "current-password" : "off"
            }
          />
        )}
        <span className="auth-input-icon">
          <SvgIcon path={iconPath} />
        </span>
      </div>
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
};

export default FormInput;
