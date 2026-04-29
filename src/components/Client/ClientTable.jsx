import React from "react";
import { Table, Button } from "react-bootstrap";

const ClientTable = ({ clients, onEdit, onDelete }) => {
  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th className="rounded-end">التصنيف</th>
            <th>الاسم</th>
            <th>اسم الموظف</th>
            <th>رقم الهاتف</th>
            <th>هاتف إضافي</th>
            <th>المدينة</th>
            <th>العنوان</th>
            <th className="rounded-start">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <tr key={client.id}>
              <td>
                <span
                  className={`badge ${client.client_type === "مكتب خدمات" ? "bg-warning rounded-pill px-3 py-2" : "bg-success rounded-pill px-3 py-2"}`}
                >
                  {client.client_type === "مكتب خدمات"
                    ? "مكتب خدمات"
                    : "عميل فردي"}
                </span>
              </td>
              <td className="fw-semibold">{client.name}</td>
              <td>{client.employee?.name || "-"}</td>
              <td>{client.phone}</td>
              <td>{client.additional_phone || "-"}</td>
              <td>{client.city || "-"}</td>
              <td>{client.address || "-"}</td>
              <td>
                <Button
                  variant="link"
                  className="text-primary p-0 me-2 rounded-circle"
                  onClick={() => onEdit(client)}
                  title="تعديل"
                  style={{
                    textDecoration: "none",
                    width: "32px",
                    height: "32px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "rgba(13, 110, 253, 0.1)",
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
                  onClick={() => onDelete(client.id)}
                  title="حذف"
                  style={{
                    textDecoration: "none",
                    width: "32px",
                    height: "32px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "rgba(220, 38, 38, 0.1)",
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
          {clients.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center py-5 text-muted">
                لا يوجد عملاء مضافين بعد
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ClientTable;
