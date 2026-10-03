import React from "react";
import { Button, Form } from "react-bootstrap";
import SortableTable from "../common/SortableTable";
import { defaultColumns } from "../../constants/orderColumns";

const OrderTable = ({
  orders = [],
  onEdit,
  onDelete,
  onStatusChange,
  onOrderStatusChange,
  onServiceTypeChange,
  onWhatsApp,
  statusOptions = [],
  orderStatusOptions = [],
  serviceTypeOptions = [],
  canEdit = true,
  canDelete = true,
}) => {
  const getStatusColor = (value, options) => {
    const found = options.find((s) => String(s.key || s.id) === String(value));
    return found?.color || "#6c757d";
  };

  const getRowColor = (order) => {
    if (order.order_status) {
      return getStatusColor(order.order_status, orderStatusOptions);
    }
    if (order.status) {
      return getStatusColor(order.status, statusOptions);
    }
    return "#6c757d";
  };

  const renderStatusDropdown = (order, field, options, onChange) => {
    const currentStatus = options.find(
      (s) => String(s.key || s.id) === String(order[field]),
    );

    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={order[field] || ""}
          onChange={(e) => onChange(order, e.target.value)}
          disabled={!canEdit || options.length === 0}
          className="rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 status-select"
          style={{
            backgroundColor: currentStatus?.color || "#6c757d",
            color: "#fff",
            cursor: canEdit ? "pointer" : "default",
            fontSize: "0.85rem",
            width: "fit-content",
            minWidth: "130px",
          }}
          title={canEdit ? "اضغط لتغيير الحالة" : "الحالة الحالية"}
        >
          <option value="" style={{ backgroundColor: "#fff", color: "#000" }}>
            -- اختر الحالة --
          </option>
          {options.map((status) => (
            <option
              key={status.key || status.id}
              value={status.key || status.id}
              style={{
                backgroundColor: "#fff",
                color: "#000",
                fontWeight: "normal",
              }}
            >
              {status.label}
            </option>
          ))}
        </Form.Select>
      </div>
    );
  };

  const renderServiceTypeDropdown = (order) => {
    if (
      !serviceTypeOptions ||
      serviceTypeOptions.length === 0 ||
      !onServiceTypeChange
    ) {
      const matched = serviceTypeOptions.find(
        (s) => String(s.key || s.label) === String(order.service_type),
      );
      if (matched) {
        return (
          <span
            className="badge rounded-pill px-3 py-1 fw-bold"
            style={{
              backgroundColor: matched.color || "#6c757d",
              color: "#fff",
            }}
          >
            {matched.label}
          </span>
        );
      }
      return order.service_type || "-";
    }

    const currentType = serviceTypeOptions.find(
      (s) => String(s.key || s.label) === String(order.service_type),
    );

    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={order.service_type || ""}
          onChange={(e) => onServiceTypeChange(order, e.target.value)}
          disabled={!canEdit}
          className="rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 status-select"
          style={{
            backgroundColor: currentType?.color || "#6c757d",
            color: "#fff",
            cursor: canEdit ? "pointer" : "default",
            fontSize: "0.85rem",
            width: "fit-content",
            minWidth: "120px",
          }}
          title={canEdit ? "اضغط لتغيير نوع الخدمة" : "نوع الخدمة"}
        >
          <option value="" style={{ backgroundColor: "#fff", color: "#000" }}>
            -- اختر الخدمة --
          </option>
          {serviceTypeOptions.map((st) => (
            <option
              key={st.key || st.id || st.label}
              value={st.key || st.label}
              style={{
                backgroundColor: "#fff",
                color: "#000",
                fontWeight: "normal",
              }}
            >
              {st.label}
            </option>
          ))}
        </Form.Select>
      </div>
    );
  };

  const renderCell = (order, columnId) => {
    switch (columnId) {
      case "strip":
        return (
          <td
            className="order-status-strip"
            style={{
              padding: 0,
              width: "5px",
              minWidth: "5px",
              backgroundColor: getRowColor(order),
              border: "none",
            }}
          ></td>
        );

      case "id":
        return <td className="fw-semibold">#{order.id}</td>;

      case "saudi_office":
        return (
          <td className="fw-semibold text-primary">
            {order.saudi_office?.name || "-"}
          </td>
        );

      case "client":
        return (
          <td>
            {order.client?.name || "-"}
            {order.client?.phone && (
              <div className="text-muted small">{order.client.phone}</div>
            )}
          </td>
        );

      case "employee":
        return (
          <td>
            {order.employee?.name ? (
              <span className="fw-semibold text-dark">
                {order.employee.name}
              </span>
            ) : (
              <span className="text-muted">-</span>
            )}
          </td>
        );

      case "visa_holder_name":
        return <td>{order.visa_holder_name || "-"}</td>;

      case "visa_holder_phone":
        return <td>{order.visa_holder_phone || "-"}</td>;

      case "visa_number":
        return <td>{order.visa_number || "-"}</td>;

      case "service_type":
        return <td>{renderServiceTypeDropdown(order)}</td>;

      case "musaned_contract_number":
        return <td>{order.musaned_contract_number || "-"}</td>;

      case "total_price":
        return (
          <td>
            {order.total_price != null
              ? `${Number(order.total_price).toFixed(2)} ر.س`
              : "-"}
          </td>
        );

      case "musaned_paid":
        return (
          <td>
            {order.musaned_paid != null
              ? `${Number(order.musaned_paid).toFixed(2)} ر.س`
              : "-"}
          </td>
        );

      case "price_difference":
        return (
          <td
            className={
              order.price_difference >= 0
                ? "text-success fw-semibold"
                : "text-danger fw-semibold"
            }
          >
            {order.price_difference != null
              ? `${Number(order.price_difference).toFixed(2)} ر.س`
              : "-"}
          </td>
        );

      case "is_paid_by_office":
        return (
          <td>
            <span
              className={`badge rounded-pill px-3 py-2 fw-bold ${
                order.is_paid_by_office
                  ? "bg-warning text-dark"
                  : "bg-secondary"
              }`}
              style={{ fontSize: "0.75rem" }}
            >
              {order.is_paid_by_office ? "✅ نعم" : "❌ لا"}
            </span>
          </td>
        );

      case "status":
        return (
          <td>
            {renderStatusDropdown(
              order,
              "status",
              statusOptions,
              onStatusChange,
            )}
          </td>
        );

      case "order_status":
        return (
          <td>
            {renderStatusDropdown(
              order,
              "order_status",
              orderStatusOptions,
              onOrderStatusChange,
            )}
          </td>
        );

      case "created_at":
        return (
          <td>{new Date(order.created_at).toLocaleDateString("ar-SA")}</td>
        );

      case "actions":
        return (
          <td>
            <div className="d-flex align-items-center justify-content-center gap-2">
              {onWhatsApp && (
                <Button
                  variant="link"
                  className="table-action-btn whatsapp-btn"
                  onClick={() => onWhatsApp(order)}
                  title="إرسال إشعار واتساب"
                >
                  <i className="fa-brands fa-whatsapp fs-6"></i>
                </Button>
              )}
              {canEdit && (
                <Button
                  variant="link"
                  className="table-action-btn edit-btn"
                  onClick={() => onEdit(order)}
                  title="تعديل"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="link"
                  className="table-action-btn delete-btn"
                  onClick={() => onDelete(order.id)}
                  title="حذف"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </Button>
              )}
            </div>
          </td>
        );

      default:
        return <td>-</td>;
    }
  };

  const getRowProps = (order) => {
    const color = getRowColor(order);
    return {
      className: "order-row",
      style: {
        "--order-status-color": color,
      },
    };
  };

  return (
    <>
      <SortableTable
        data={orders}
        columns={defaultColumns}
        storageKey="order_columns_order"
        renderCell={renderCell}
        getRowProps={getRowProps}
        emptyMessage="لا يوجد طلبات"
        tableClassName="text-center order-table"
      />

      <style>{`
        .order-table tbody tr {
          transition: all 0.2s ease;
          background-color: color-mix(in srgb, var(--order-status-color, #6c757d) 8%, white);
        }

        .order-table tbody tr:hover {
          background-color: color-mix(in srgb, var(--order-status-color, #6c757d) 20%, white) !important;
          filter: brightness(0.98);
        }

        .order-table tbody tr .order-status-strip {
          transition: none !important;
        }

        .order-table tbody tr:hover .order-status-strip {
          filter: brightness(0.85);
        }

        .order-table .order-status-strip {
          border: none !important;
        }

        .order-table thead th:first-child {
          width: 5px !important;
          min-width: 5px !important;
          padding: 0 !important;
        }

        .status-select:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
          box-shadow: 0 4px 6px rgba(0,0,0,0.15) !important;
        }

        .status-select:focus {
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
          outline: 0;
        }
      `}</style>
    </>
  );
};

export default OrderTable;
