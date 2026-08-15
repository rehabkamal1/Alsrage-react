import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const SaudiOfficeTable = ({ offices, onEdit, onDelete }) => {
  const getWhatsAppLink = (mobile) => {
    if (!mobile) return null;
    const cleanNumber = mobile.replace(/\D/g, "");
    return `https://wa.me/${cleanNumber}`;
  };

  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle text-center">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>اسم المكتب</th>
            <th>جهة الوصول</th>
            <th>المدينة</th>
            <th>الموظف المسؤول</th>
            <th>إجمالي التفويض</th>
            <th>السعر ع مساند</th>
            <th>رقم الجوال</th>
            <th>ملاحظات</th>
            <th>العنوان</th>
            <th>جروب الواتساب</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {offices &&
            offices.map((office, index) => (
              <tr key={office.id}>
                <td>{index + 1}</td>
                <td className="fw-semibold">{office.name}</td>
                <td>{office.destination || "-"}</td>
                <td>{office.city || "-"}</td>
                <td>{office.responsible_employee || "-"}</td>
                <td>
                  <Badge bg="info" text="dark">
                    {office.total_authorization || "0"}
                  </Badge>
                </td>
                <td>
                  <Badge bg="warning" text="dark">
                    {office.musaned_price || "0"}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex flex-column align-items-center">
                    <span dir="ltr">{office.mobile || "-"}</span>
                    {office.mobile && (
                      <a
                        href={getWhatsAppLink(office.mobile)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-success rounded-circle d-inline-flex align-items-center justify-content-center mt-1"
                        style={{ width: "32px", height: "32px" }}
                        title="تواصل عبر واتساب"
                      >
                        <i className="fa-brands fa-whatsapp fs-5"></i>
                      </a>
                    )}
                  </div>
                </td>
                <td>{office.notes || "-"}</td>
                <td>{office.address || "-"}</td>
                <td>
                  {office.whatsapp_link ? (
                    <a
                      href={office.whatsapp_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-success rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ width: "32px", height: "32px" }}
                      title="الدخول للجروب"
                    >
                      <i className="fa-brands fa-whatsapp fs-5"></i>
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <Button
                      variant="link"
                      className="table-action-btn edit-btn"
                      onClick={() => onEdit(office)}
                      title="تعديل"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </Button>
                    <Button
                      variant="link"
                      className="table-action-btn delete-btn"
                      onClick={() => onDelete(office.id)}
                      title="حذف"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          {(!offices || offices.length === 0) && (
            <tr>
              <td colSpan="12" className="text-center py-5 text-muted">
                لا يوجد مكاتب سعودية مضافين بعد
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default SaudiOfficeTable;
