import React from "react";
import { Table, Button, Form } from "react-bootstrap";

const FinanceTable = ({
  transactions,
  onEdit,
  onDelete,
  onUpdateField,
  paymentMethods,
  transferStatuses,
  priorityLevels,
  bankNames,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getPaymentMethodColor = (paymentMethod) => {
    const found = paymentMethods?.find((p) => p.value === paymentMethod);
    return found?.color || "#6c757d";
  };

  const getBankNameColor = (bankName) => {
    const found = bankNames?.find((b) => b.value === bankName);
    return found?.color || "#6c757d";
  };

  const getStatusColor = (status) => {
    const found = transferStatuses?.find((s) => s.value === status);
    return found?.color || "#6c757d";
  };

  const getPriorityColor = (level) => {
    const found = priorityLevels?.find((p) => p.value === level);
    return found?.color || "#6c757d";
  };

  const getPaymentMethodLabel = (paymentMethod) => {
    const found = paymentMethods?.find((p) => p.value === paymentMethod);
    return found?.label || paymentMethod || "-";
  };

  const getBankNameLabel = (bankName) => {
    const found = bankNames?.find((b) => b.value === bankName);
    return found?.label || bankName || "-";
  };

  const getStatusLabel = (status) => {
    const found = transferStatuses?.find((s) => s.value === status);
    return found?.label || status || "-";
  };

  const getPriorityLabel = (level) => {
    const found = priorityLevels?.find((p) => p.value === level);
    return found?.label || level || "-";
  };

  const renderPaymentMethodDropdown = (transaction) => {
    const currentColor = getPaymentMethodColor(transaction.payment_method);

    if (!paymentMethods || paymentMethods.length === 0) {
      return (
        <span className="text-muted">
          {getPaymentMethodLabel(transaction.payment_method)}
        </span>
      );
    }

    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={transaction.payment_method || ""}
          onChange={(e) =>
            onUpdateField(transaction.id, "payment_method", e.target.value)
          }
          className="rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 payment-select"
          style={{
            backgroundColor: currentColor,
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.85rem",
            width: "fit-content",
            minWidth: "130px",
            transition: "all 0.2s ease-in-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          title="اضغط لتغيير طريقة الدفع"
        >
          <option value="">-- اختر --</option>
          {paymentMethods.map((method) => (
            <option
              key={method.value}
              value={method.value}
              style={{ backgroundColor: method.color, color: "#fff" }}
            >
              {method.label}
            </option>
          ))}
        </Form.Select>
      </div>
    );
  };

  const renderBankNameDropdown = (transaction) => {
    const currentColor = getBankNameColor(transaction.bank_name);

    if (!bankNames || bankNames.length === 0) {
      return (
        <span className="text-muted">
          {getBankNameLabel(transaction.bank_name)}
        </span>
      );
    }

    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={transaction.bank_name || ""}
          onChange={(e) =>
            onUpdateField(transaction.id, "bank_name", e.target.value)
          }
          className="rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 bank-select"
          style={{
            backgroundColor: currentColor,
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.85rem",
            width: "fit-content",
            minWidth: "130px",
            transition: "all 0.2s ease-in-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          title="اضغط لتغيير بنك المستفيد"
        >
          <option value="">-- اختر --</option>
          {bankNames.map((bank) => (
            <option
              key={bank.value}
              value={bank.value}
              style={{ backgroundColor: bank.color, color: "#fff" }}
            >
              {bank.label}
            </option>
          ))}
        </Form.Select>
      </div>
    );
  };

  const renderStatusDropdown = (transaction) => {
    const currentColor = getStatusColor(transaction.status);

    if (!transferStatuses || transferStatuses.length === 0) {
      return (
        <span className="text-muted">{getStatusLabel(transaction.status)}</span>
      );
    }

    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={transaction.status || ""}
          onChange={(e) =>
            onUpdateField(transaction.id, "status", e.target.value)
          }
          className="rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 status-select"
          style={{
            backgroundColor: currentColor,
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.85rem",
            width: "fit-content",
            minWidth: "130px",
            transition: "all 0.2s ease-in-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          title="اضغط لتغيير حالة الحوالة"
        >
          <option value="">-- اختر --</option>
          {transferStatuses.map((status) => (
            <option
              key={status.value}
              value={status.value}
              style={{ backgroundColor: status.color, color: "#fff" }}
            >
              {status.label}
            </option>
          ))}
        </Form.Select>
      </div>
    );
  };

  const renderPriorityDropdown = (transaction) => {
    const currentColor = getPriorityColor(transaction.priority_level);

    if (!priorityLevels || priorityLevels.length === 0) {
      return (
        <span className="text-muted">
          {getPriorityLabel(transaction.priority_level)}
        </span>
      );
    }

    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={transaction.priority_level || ""}
          onChange={(e) =>
            onUpdateField(transaction.id, "priority_level", e.target.value)
          }
          className="rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 priority-select"
          style={{
            backgroundColor: currentColor,
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.85rem",
            width: "fit-content",
            minWidth: "130px",
            transition: "all 0.2s ease-in-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          title="اضغط لتغيير درجة الأهمية"
        >
          <option value="">-- اختر --</option>
          {priorityLevels.map((priority) => (
            <option
              key={priority.value}
              value={priority.value}
              style={{ backgroundColor: priority.color, color: "#fff" }}
            >
              {priority.label}
            </option>
          ))}
        </Form.Select>
      </div>
    );
  };

  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle finance-table">
        <thead className="table-light">
          <tr>
            <th style={{ minWidth: "5px", width: "5px", padding: "0" }}></th>
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
            transactions.map((transaction) => {
              const priorityColor = getPriorityColor(
                transaction.priority_level,
              );
              return (
                <tr
                  key={transaction.id}
                  className="finance-row"
                  style={{
                    "--priority-color": priorityColor,
                  }}
                >
                  <td
                    className="priority-strip"
                    style={{
                      padding: "0",
                      width: "5px",
                      minWidth: "5px",
                      backgroundColor: priorityColor,
                    }}
                  ></td>
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
                  <td>#{transaction.order_number || transaction.order_id}</td>
                  <td>{transaction.visa_holder_name || "-"}</td>
                  <td>{transaction.transfer_number || "-"}</td>
                  <td>{renderPaymentMethodDropdown(transaction)}</td>
                  <td>{renderBankNameDropdown(transaction)}</td>
                  <td>{formatDate(transaction.transfer_date)}</td>
                  <td>{renderStatusDropdown(transaction)}</td>
                  <td>{renderPriorityDropdown(transaction)}</td>
                  <td>
                    {new Date(transaction.created_at).toLocaleDateString(
                      "ar-SA",
                    )}
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
              );
            })}
          {(!transactions || transactions.length === 0) && (
            <tr>
              <td colSpan="14" className="text-center py-5 text-muted">
                لا توجد حوالات
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <style>{`
        .status-select:hover, .priority-select:hover, .payment-select:hover, .bank-select:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
          box-shadow: 0 4px 6px rgba(0,0,0,0.15) !important;
        }
        .status-select:focus, .priority-select:focus, .payment-select:focus, .bank-select:focus {
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
          outline: 0;
        }

        .finance-table tbody tr {
          transition: background-color 0.2s ease;
        }

        .finance-table tbody tr:hover {
          background-color: var(--priority-color, #6c757d) !important;
          background-color: color-mix(in srgb, var(--priority-color, #6c757d) 15%, white) !important;
        }

        .finance-table tbody tr .priority-strip {
          transition: none !important;
        }

        .finance-table tbody tr:hover .priority-strip {
          background-color: var(--priority-color, #6c757d) !important;
        }
      `}</style>
    </div>
  );
};

export default FinanceTable;
