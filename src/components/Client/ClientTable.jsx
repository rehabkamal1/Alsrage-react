// src/components/Client/ClientTable.jsx

import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const ClientTable = ({ clients, onEdit, onDelete, onViewOrders }) => {
  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle text-center">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>نوع العميل</th>
            <th>رقم هاتف المندوب</th>
            <th>المندوب</th>
            <th>رقم هاتف إضافي</th>
            <th>المدينة</th>
            <th>العنوان</th>
            <th>طلبات العميل</th>
            <th>تاريخ التسجيل</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {clients &&
            clients.map((client) => (
              <tr key={client.id}>
                <td className="fw-semibold">#{client.id}</td>
                <td>
                  <Badge
                    bg={client.client_type === "office" ? "info" : "secondary"}
                  >
                    {client.client_type === "office" ? "مكتب" : "فرد"}
                  </Badge>
                </td>
                <td>{client.phone}</td>
                <td>{client.name || "-"}</td>
                <td>{client.additional_phone || "-"}</td>
                <td>{client.city || "-"}</td>
                <td>{client.address || "-"}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onViewOrders(client)}
                    title="عرض طلبات العميل"
                    className="rounded-pill px-3 py-1"
                  >
                    <i className="fa-solid fa-file-invoice me-1"></i>
                    عرض الطلبات
                  </Button>
                </td>
                <td>
                  {new Date(client.created_at).toLocaleDateString("ar-SA")}
                </td>
                <td>
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
          {(!clients || clients.length === 0) && (
            <tr>
              <td colSpan="10" className="text-center py-5 text-muted">
                لا يوجد عملاء
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ClientTable;
