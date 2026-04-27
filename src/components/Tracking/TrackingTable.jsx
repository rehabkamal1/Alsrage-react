import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const TrackingTable = ({ tracking, onEdit, onDelete }) => {
  const getStatusBadge = (status, type) => {
    if (type === "external") {
      const map = {
        pending: { text: "في الانتظار", variant: "warning" },
        accepted: { text: "مقبول", variant: "success" },
        rejected: { text: "مرفوض", variant: "danger" },
      };
      const s = map[status] || { text: status, variant: "secondary" };
      return (
        <Badge bg={s.variant} className="rounded-pill px-3 py-2">
          {s.text}
        </Badge>
      );
    }
    if (type === "passport") {
      const map = {
        pending: { text: "في الانتظار", variant: "warning" },
        accepted: { text: "مرشح", variant: "success" },
        rejected: { text: "غير مرشح", variant: "danger" },
      };
      const s = map[status] || { text: status, variant: "secondary" };
      return (
        <Badge bg={s.variant} className="rounded-pill px-3 py-2">
          {s.text}
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th># الطلب</th>
            <th>العميل</th>
            <th>رقم التأشيرة</th>
            <th>التوثيق</th>
            <th>تاريخ التصديق</th>
            <th>رقم التوثيق</th>
            <th>إرسال للمكتب الخارجي</th>
            <th>حالة المكتب الخارجي</th>
            <th>ترشيح الجواز</th>
            <th>تم التوريد</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {tracking &&
            tracking.map((item) => (
              <tr key={item.id}>
                <td className="fw-semibold">#{item.order_id}</td>
                <td>{item.client_name || "-"}</td>
                <td>{item.visa_number || "-"}</td>
                <td>
                  {item.is_authenticated ? (
                    <Badge bg="success" className="rounded-pill px-3 py-2">
                      ✓ تم
                    </Badge>
                  ) : (
                    <Badge bg="secondary" className="rounded-pill px-3 py-2">
                      ✗ لم يتم
                    </Badge>
                  )}
                </td>
                <td>{item.authentication_date || "-"}</td>
                <td>{item.authentication_number || "-"}</td>
                <td>
                  {item.sent_to_external ? (
                    <Badge bg="success" className="rounded-pill px-3 py-2">
                      ✓ تم
                    </Badge>
                  ) : (
                    <Badge bg="secondary" className="rounded-pill px-3 py-2">
                      ✗ لم يتم
                    </Badge>
                  )}
                </td>
                <td>{getStatusBadge(item.external_status, "external")}</td>
                <td>{getStatusBadge(item.passport_filtered, "passport")}</td>
                <td>
                  {item.is_delivered ? (
                    <Badge bg="success" className="rounded-pill px-3 py-2">
                      ✓ تم
                    </Badge>
                  ) : (
                    <Badge bg="secondary" className="rounded-pill px-3 py-2">
                      ✗ لم يتم
                    </Badge>
                  )}
                </td>
                <td>
                  <Button
                    variant="link"
                    className="text-primary p-0 me-2 rounded-circle"
                    onClick={() => onEdit(item)}
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
                    onClick={() => onDelete(item.id)}
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
          {(!tracking || tracking.length === 0) && (
            <tr>
              <td colSpan="11" className="text-center py-5 text-muted">
                لا توجد متابعات
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default TrackingTable;
