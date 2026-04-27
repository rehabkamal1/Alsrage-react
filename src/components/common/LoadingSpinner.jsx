import React from "react";
import { Spinner } from "react-bootstrap";

const LoadingSpinner = ({ size = "md", text = "جاري التحميل..." }) => {
  const sizeMap = {
    sm: "1rem",
    md: "2rem",
    lg: "3rem",
  };

  return (
    <div className="text-center py-5">
      <Spinner
        animation="border"
        role="status"
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          color: "#0f172a",
        }}
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      {text && <p className="mt-3 text-muted">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
