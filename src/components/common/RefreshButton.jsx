import React from 'react';
import { Button } from 'react-bootstrap';

/**
 * Reusable RefreshButton Component
 * Can be used across all pages for standardized data refetching.
 *
 * @param {Function} onClick - Handler function when clicked
 * @param {boolean} loading - State of data fetching (spins icon and disables button)
 * @param {string} text - Default button text
 * @param {string} loadingText - Text displayed during loading
 * @param {string} variant - Bootstrap variant (default: 'light')
 * @param {string} className - Additional custom classes
 */
const RefreshButton = ({
  onClick,
  loading = false,
  text = 'تحديث البيانات',
  loadingText = 'جاري التحديث...',
  variant = 'light',
  size,
  className = '',
  icon = 'fa-solid fa-rotate-right',
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={`rounded-pill px-4 py-2.5 fw-bold text-primary shadow-lg hover-lift d-inline-flex align-items-center gap-2 border-0 ${className}`}
      onClick={onClick}
      disabled={loading}
      {...props}
    >
      <i className={`${icon} ${loading ? 'fa-spin text-primary' : ''}`}></i>
      <span>{loading ? loadingText : text}</span>
    </Button>
  );
};

export default RefreshButton;
