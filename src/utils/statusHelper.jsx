import React from "react";
import { Badge } from "react-bootstrap";

/**
 * Normalizes and returns styling parameters for any order status.
 */
export const getOrderStatusConfig = (status, customColor = null) => {
  const s = String(status || "").trim().toLowerCase();

  // 1. Completed
  if (s.includes("مكتمل") || s === "completed" || s.includes("منجز") || s.includes("ناجح")) {
    return {
      label: typeof status === "string" && status.includes("مكتمل") ? status : "مكتمل ✓",
      bg: "#dcfce7",
      color: "#15803d",
      border: "#86efac",
      solidBg: "#10b981",
      icon: "fa-solid fa-circle-check",
    };
  }

  // 2. Cancelled
  if (s.includes("ملغي") || s.includes("الغاء") || s === "cancelled" || s === "canceled") {
    return {
      label: typeof status === "string" && status.includes("ملغي") ? status : "ملغي ✕",
      bg: "#fee2e2",
      color: "#b91c1c",
      border: "#fca5a5",
      solidBg: "#ef4444",
      icon: "fa-solid fa-circle-xmark",
    };
  }

  // 3. Rejected
  if (s.includes("مرفوض") || s.includes("رفض") || s === "rejected") {
    return {
      label: typeof status === "string" && status.includes("مرفوض") ? status : "مرفوض ✕",
      bg: "#ffe4e6",
      color: "#be123c",
      border: "#fda4af",
      solidBg: "#f43f5e",
      icon: "fa-solid fa-ban",
    };
  }

  // 4. Processing / In Progress
  if (
    s.includes("تنفيذ") ||
    s.includes("معالجة") ||
    s.includes("جاري") ||
    s === "processing" ||
    s === "in_progress"
  ) {
    return {
      label: typeof status === "string" && status ? status : "قيد التنفيذ ⏳",
      bg: "#e0f2fe",
      color: "#0369a1",
      border: "#7dd3fc",
      solidBg: "#0284c7",
      icon: "fa-solid fa-arrows-rotate",
    };
  }

  // 5. Pending / Waiting
  if (s.includes("انتظار") || s === "pending" || s.includes("معلق")) {
    return {
      label: typeof status === "string" && status ? status : "قيد الانتظار 🕒",
      bg: "#fef3c7",
      color: "#b45309",
      border: "#fcd34d",
      solidBg: "#f59e0b",
      icon: "fa-solid fa-clock",
    };
  }

  // 6. New
  if (s.includes("جديد") || s === "new") {
    return {
      label: typeof status === "string" && status ? status : "طلب جديد ✨",
      bg: "#ede9fe",
      color: "#6d28d9",
      border: "#c4b5fd",
      solidBg: "#8b5cf6",
      icon: "fa-solid fa-sparkles",
    };
  }

  // 7. Musaned Paid
  if (s.includes("مساند") || s.includes("سداد") || s === "musaned_paid") {
    return {
      label: typeof status === "string" && status ? status : "مسدد مساند 💳",
      bg: "#ccfbf1",
      color: "#0f766e",
      border: "#5eead4",
      solidBg: "#0d9488",
      icon: "fa-solid fa-credit-card",
    };
  }

  // 8. Authorized / Approved
  if (s.includes("تفويض") || s.includes("معتمد") || s === "approved" || s === "authorized") {
    return {
      label: typeof status === "string" && status ? status : "تم التفويض 🛡️",
      bg: "#dbeafe",
      color: "#1d4ed8",
      border: "#93c5fd",
      solidBg: "#2563eb",
      icon: "fa-solid fa-shield-halved",
    };
  }

  // 9. Ready / Visa Issued
  if (s.includes("تأشيرة") || s.includes("سفر") || s === "ready" || s === "visa_issued") {
    return {
      label: typeof status === "string" && status ? status : "تأشيرة صادرة ✈️",
      bg: "#ecfdf5",
      color: "#047857",
      border: "#6ee7b7",
      solidBg: "#059669",
      icon: "fa-solid fa-plane-departure",
    };
  }

  // Custom color fallback
  if (customColor && customColor.startsWith("#")) {
    return {
      label: status || "غير محدد",
      bg: `${customColor}18`,
      color: customColor,
      border: `${customColor}50`,
      solidBg: customColor,
      icon: "fa-solid fa-circle",
    };
  }

  // Generic fallback
  return {
    label: status || "غير محدد",
    bg: "#f1f5f9",
    color: "#475569",
    border: "#cbd5e1",
    solidBg: "#64748b",
    icon: "fa-solid fa-circle-dot",
  };
};

/**
 * Reusable, styled Order Status Badge component
 */
export const OrderStatusBadge = ({
  status,
  customColor = null,
  showIcon = true,
  size = "md",
  className = "",
  style = {},
}) => {
  const config = getOrderStatusConfig(status, customColor);

  const paddingClass =
    size === "sm"
      ? "px-2.5 py-1 fs-8"
      : size === "lg"
      ? "px-3.5 py-2 fs-6"
      : "px-3 py-1.5 fs-7";

  return (
    <span
      className={`badge rounded-pill fw-semibold shadow-none d-inline-flex align-items-center gap-1.5 ${paddingClass} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        letterSpacing: "0.2px",
        ...style,
      }}
    >
      {showIcon && <i className={`${config.icon} small`} style={{ opacity: 0.85 }}></i>}
      <span>{config.label}</span>
    </span>
  );
};

export default OrderStatusBadge;
