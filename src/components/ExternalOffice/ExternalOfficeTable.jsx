import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const ExternalOfficeTable = ({ offices, onEdit, onDelete }) => {
  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle text-center">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>الدولة</th>
            <th>اسم المكتب</th>
            <th>اسم الموظف</th>
            <th>رقم الهاتف</th>
            <th>جروب الواتساب</th>
            <th>ملاحظات</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {offices &&
            offices.map((office, index) => (
              <tr key={office.id}>
                <td>{index + 1}</td>
                <td className="fw-bold text-primary">
                  {office.country || "-"}
                </td>
                <td className="fw-semibold text-dark">{office.name}</td>
                <td>
                  {office.contacts && office.contacts.length > 0
                    ? office.contacts.map((contact, idx) => (
                        <div key={idx} className="mb-2">
                          <div className="fw-semibold">
                            {contact.name || "-"}
                          </div>
                          {contact.phone && (
                            <div className="small text-muted" dir="ltr">
                              {contact.phone} 📞
                            </div>
                          )}
                          {contact.commission && (
                            <div className="text-success small fw-bold">
                              💰 العمولة: {contact.commission}
                            </div>
                          )}
                        </div>
                      ))
                    : "-"}
                </td>
                <td>
                  <div className="d-flex flex-column align-items-center">
                    {office.phone && (
                      <div className="fw-bold mb-1" dir="ltr">
                        {office.phone}
                      </div>
                    )}
                    {office.phone && (
                      <a
                        href={`https://wa.me/${office.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-success rounded-circle d-inline-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px" }}
                        title="تواصل عبر واتساب"
                      >
                        <i className="fa-brands fa-whatsapp fs-5"></i>
                      </a>
                    )}
                    {!office.phone && "-"}
                  </div>
                </td>
                <td>
                  <div className="d-flex justify-content-center">
                    {office.whatsapp_link ? (
                      <a
                        href={office.whatsapp_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-success rounded-circle d-inline-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px" }}
                        title="جروب الواتساب"
                      >
                        <i className="fa-brands fa-whatsapp fs-5"></i>
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </td>
                <td>{office.notes || "-"}</td>
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
              <td colSpan="8" className="text-center py-5 text-muted">
                لا يوجد مكاتب خارجية مضافين بعد
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ExternalOfficeTable;
