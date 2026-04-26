const StatusAlert = ({ message, type = "error" }) => {
  if (!message) return null;
  return <div className={`auth-alert ${type}`}>{message}</div>;
};

export default StatusAlert;
