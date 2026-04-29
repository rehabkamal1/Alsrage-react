import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const OrderTable = ({ orders, onEdit, onDelete }) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: "قيد الانتظار", variant: "warning" },
      in_progress: { text: "قيد التنفيذ", variant: "info" },
      completed: { text: "مكتمل", variant: "success" },
      cancelled: { text: "ملغي", variant: "danger" },
    };
    const s = statusMap[status] || { text: status, variant: "secondary" };
    return (
      <Badge bg={s.variant} className="rounded-pill px-3 py-2">
        {s.text}
      </Badge>
    );
  };

  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>صاحب التأشيرة</th>
            <th>رقم التأشيرة</th>
            <th>رقم عقد مساند</th>
            <th>إجمالي السعر</th>
            <th>الرصيد المتبقي</th>
            <th>الحالة</th>
            <th>التاريخ</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {orders &&
            orders.map((order) => (
              <tr key={order.id}>
                <td className="fw-semibold">#{order.id}</td>
                <td>
                  {order.visa_holder_name ||
                    order.client?.visa_holder_name ||
                    "-"}
                </td>
                <td>{order.visa_number || "-"}</td>
                <td>{order.musaned_contract_number || "-"}</td>
                <td>{order.total_price ? `${order.total_price} ر.س` : "-"}</td>
                <td
                  className={
                    order.price_difference >= 0 ? "text-success" : "text-danger"
                  }
                >
                  {order.price_difference
                    ? `${order.price_difference} ر.س`
                    : "-"}
                </td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  {new Date(order.created_at).toLocaleDateString("ar-SA")}
                </td>
                <td>
                  <Button
                    variant="link"
                    className="text-primary p-0 me-2 rounded-circle"
                    onClick={() => onEdit(order)}
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
                    onClick={() => onDelete(order.id)}
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
                </td>
              </tr>
            ))}
          {(!orders || orders.length === 0) && (
            <tr>
              <td colSpan="9" className="text-center py-5 text-muted">
                لا يوجد طلبات
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default OrderTable;
