import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const FinanceTable = ({
  transactions,
  onEdit,
  onDelete,
  paymentMethods,
  transferStatuses,
  priorityLevels,
}) => {
  const getStatusBadge = (status) => {
    const found = transferStatuses?.find((s) => s.value === status);
    if (found) {
      return (
        <Badge
          style={{ backgroundColor: found.color }}
          className="rounded-pill px-3 py-2"
        >
          {found.label}
        </Badge>
      );
    }
    return (
      <Badge bg="secondary" className="rounded-pill px-3 py-2">
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (level) => {
    const found = priorityLevels?.find((p) => p.value === level);
    if (found) {
      return (
        <Badge
          style={{ backgroundColor: found.color }}
          className="rounded-pill px-2 py-1"
        >
          {found.label}
        </Badge>
      );
    }
    return (
      <Badge bg="secondary" className="rounded-pill px-2 py-1">
        {level}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method) => {
    const found = paymentMethods?.find((p) => p.value === method);
    return found?.label || method;
  };

  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>النوع</th>
            <th>المبلغ</th>
            <th>رقم الطلب</th>
            <th>صاحب التأشيرة</th>
            <th>رقم الحوالة</th>
            <th>طريقة الدفع</th>
            <th>بنك المستفيد</th>
            <th>تاريخ الحوالة</th>
            <th>الحالة</th>
            <th>درجة الأهمية</th>
            <th>تاريخ الإنشاء</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {transactions &&
            transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="fw-semibold">#{transaction.id}</td>
                <td>
                  <span
                    className={
                      transaction.type === "receipt"
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    {transaction.type === "receipt"
                      ? "📥 مقبوضات"
                      : "📤 مصروفات"}
                  </span>
                </td>
                <td className="fw-semibold">
                  {Number(transaction.amount).toFixed(2)} ر.س
                </td>
                <td>#{transaction.order_number}</td>
                <td>{transaction.visa_holder_name || "-"}</td>
                <td>{transaction.transfer_number || "-"}</td>
                <td>{getPaymentMethodLabel(transaction.payment_method)}</td>
                <td>{transaction.bank_name || "-"}</td>
                <td>{transaction.transfer_date || "-"}</td>
                <td>{getStatusBadge(transaction.status)}</td>
                <td>{getPriorityBadge(transaction.priority_level)}</td>
                <td>
                  {new Date(transaction.created_at).toLocaleDateString("ar-SA")}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="link"
                      className="text-primary p-0 rounded-circle"
                      onClick={() => onEdit(transaction)}
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "rgba(13, 110, 253, 0.1)",
                        textDecoration: "none",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Button>
                    <Button
                      variant="link"
                      className="text-danger p-0 rounded-circle"
                      onClick={() => onDelete(transaction.id)}
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "rgba(220, 38, 38, 0.1)",
                        textDecoration: "none",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          {(!transactions || transactions.length === 0) && (
            <tr>
              <td colSpan="13" className="text-center py-5 text-muted">
                لا توجد حوالات
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default FinanceTable;
