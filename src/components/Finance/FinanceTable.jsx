import React from "react";
import { Button, Form } from "react-bootstrap";
import SortableTable from "../common/SortableTable";
import { defaultColumns } from "../../constants/financeColumns";

const FinanceTable = ({
    transactions,
    onEdit,
    onDelete,
    onUpdateField,
    paymentMethods,
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

    const getPaymentMethodLabel = (paymentMethod) => {
        const found = paymentMethods?.find((p) => p.value === paymentMethod);
        return found?.label || paymentMethod || "-";
    };

    const getBankNameLabel = (bankName) => {
        const found = bankNames?.find((b) => b.value === bankName);
        return found?.label || bankName || "-";
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
                        onUpdateField(
                            transaction.id,
                            "payment_method",
                            e.target.value,
                        )
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
                            style={{
                                backgroundColor: method.color,
                                color: "#fff",
                            }}
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
                        onUpdateField(
                            transaction.id,
                            "bank_name",
                            e.target.value,
                        )
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
                            style={{
                                backgroundColor: bank.color,
                                color: "#fff",
                            }}
                        >
                            {bank.label}
                        </option>
                    ))}
                </Form.Select>
            </div>
        );
    };

    const renderReviewedCheckbox = (transaction) => {
        return (
            <div className="d-flex justify-content-center">
                <Form.Check
                    type="checkbox"
                    checked={transaction.is_reviewed || false}
                    onChange={(e) =>
                        onUpdateField(
                            transaction.id,
                            "is_reviewed",
                            e.target.checked ? 1 : 0,
                        )
                    }
                    className="form-check-lg"
                    style={{ cursor: "pointer" }}
                    title="اضغط لتغيير حالة المراجعة"
                />
            </div>
        );
    };

    const renderCell = (transaction, columnId) => {
        switch (columnId) {
            case "strip":
                return <td style={{ padding: "0", width: "5px", minWidth: "5px" }}></td>;

            case "id":
                return <td className="fw-semibold">#{transaction.id}</td>;

            case "employee":
                return <td>{transaction.employee_name || "-"}</td>;

            case "type":
                return (
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
                );

            case "client":
                return <td>{transaction.client_name || "-"}</td>;

            case "order":
                return (
                    <td>
                        #
                        {transaction.order_number ||
                            transaction.order_id ||
                            "-"}
                    </td>
                );

            case "amount":
                return (
                    <td className="fw-semibold">
                        {Number(transaction.amount).toFixed(2)} ر.س
                    </td>
                );

            case "visa_holder":
                return <td>{transaction.visa_holder_name || "-"}</td>;

            case "transfer_number":
                return <td>{transaction.transfer_number || "-"}</td>;

            case "payment_method":
                return <td>{renderPaymentMethodDropdown(transaction)}</td>;

            case "bank_name":
                return <td>{renderBankNameDropdown(transaction)}</td>;

            case "transfer_date":
                return <td>{formatDate(transaction.transfer_date)}</td>;

            case "is_reviewed":
                return <td>{renderReviewedCheckbox(transaction)}</td>;

            case "created_at":
                return (
                    <td>
                        {new Date(transaction.created_at).toLocaleDateString(
                            "ar-SA",
                        )}
                    </td>
                );

            case "actions":
                return (
                    <td>
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
                );

            default:
                return <td>-</td>;
        }
    };

    return (
        <SortableTable
            data={transactions}
            columns={defaultColumns}
            storageKey="finance_columns_order"
            renderCell={renderCell}
            emptyMessage="لا توجد حوالات"
            tableClassName="finance-table text-center"
            rowClassName="finance-row"
        />
    );
};

export default FinanceTable;
