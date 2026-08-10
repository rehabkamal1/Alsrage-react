import React from "react";
import { Table, Button } from "react-bootstrap";

const ClientTable = ({ clients, onEdit, onDelete }) => {
  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th className="rounded-end">التصنيف</th>
            <th>رقم هاتف المندوب</th>
            <th>المندوب</th>
            <th>اسم صاحب التأشيرة</th>
            <th>هاتف إضافي</th>
            <th>المدينة</th>
            <th>العنوان</th>
            <th className="rounded-start text-center">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <tr key={client.id}>
              <td>
                <span
                  className={client.client_type === "office" ? "badge-pill-office" : "badge-pill-individual"}
                >
                  {client.client_type === "office"
                    ? "🏢 مكتب خدمات"
                    : "👤 عميل فردي"}
                </span>
              </td>
              <td>
                <span className="phone-badge">
                  <i className="fa-solid fa-phone fs-7 opacity-75"></i>
                  {client.phone}
                </span>
              </td>
              <td className="fw-bold text-dark">{client.name || "-"}</td>
              <td>{client.employee?.name || "-"}</td>
              <td>
                {client.additional_phone ? (
                  <span className="phone-badge">
                    {client.additional_phone}
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td>
                <span className="badge bg-light text-dark border px-3 py-1.5 rounded-pill fw-medium">
                  {client.city || "-"}
                </span>
              </td>
              <td className="text-muted small">{client.address || "-"}</td>
              <td className="text-center">
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <Button
                    variant="link"
                    className="table-action-btn edit-btn"
                    onClick={() => onEdit(client)}
                    title="تعديل"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </Button>
                  <Button
                    variant="link"
                    className="table-action-btn delete-btn"
                    onClick={() => onDelete(client.id)}
                    title="حذف"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </Button>
                </div>
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
