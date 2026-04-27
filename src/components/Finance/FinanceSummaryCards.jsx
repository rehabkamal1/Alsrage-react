import React from "react";
import { Row, Col, Card } from "react-bootstrap";

const FinanceSummaryCards = ({ summary }) => {
  return (
    <Row className="g-4 mb-4">
      <Col md={4}>
        <Card className="shadow-sm border-0 rounded-4 text-center p-3">
          <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mx-auto mb-3">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2e7d32"
              strokeWidth="2"
            >
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h6 className="text-muted small">إجمالي المقبوضات</h6>
          <h3 className="fw-bold text-success">
            {summary?.total_receipts?.toFixed(2) || 0} ر.س
          </h3>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="shadow-sm border-0 rounded-4 text-center p-3">
          <div className="bg-danger bg-opacity-10 rounded-circle p-3 d-inline-block mx-auto mb-3">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c62828"
              strokeWidth="2"
            >
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h6 className="text-muted small">إجمالي المصروفات</h6>
          <h3 className="fw-bold text-danger">
            {summary?.total_payments?.toFixed(2) || 0} ر.س
          </h3>
        </Card>
      </Col>
      <Col md={4}>
        <Card
          className={`shadow-sm border-0 rounded-4 text-center p-3 ${summary?.net_profit >= 0 ? "border-success" : "border-danger"}`}
        >
          <div
            className={`rounded-circle p-3 d-inline-block mx-auto mb-3 ${summary?.net_profit >= 0 ? "bg-success bg-opacity-10" : "bg-danger bg-opacity-10"}`}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke={summary?.net_profit >= 0 ? "#2e7d32" : "#c62828"}
              strokeWidth="2"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h6 className="text-muted small">صافي الربح</h6>
          <h3
            className={`fw-bold ${summary?.net_profit >= 0 ? "text-success" : "text-danger"}`}
          >
            {summary?.net_profit?.toFixed(2) || 0} ر.س
          </h3>
        </Card>
      </Col>
    </Row>
  );
};

export default FinanceSummaryCards;
