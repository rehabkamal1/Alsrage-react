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
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <Button
                      variant="link"
                      className="table-action-btn edit-btn"
                      onClick={() => onEdit(transaction)}
                      title="تعديل"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </Button>
                    <Button
                      variant="link"
                      className="table-action-btn delete-btn"
                      onClick={() => onDelete(transaction.id)}
                      title="حذف"
                    >
                      <i className="fa-solid fa-trash-can"></i>
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
