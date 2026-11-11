import React from "react";
import { Button } from "react-bootstrap";

const EmptyState = ({
  title = "لا توجد بيانات",
  suggestion = "جرّب تعديل الفلاتر أو أضف أول عنصر.",
  onAction,
  actionLabel = "أضف أول عنصر",
  icon = "fa-regular fa-folder-open",
}) => (
  <div className="empty-state" role="status">
    <i className={icon} aria-hidden="true" />
    <strong>{title}</strong>
    <span>{suggestion}</span>
    {onAction && (
      <Button variant="primary" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;
