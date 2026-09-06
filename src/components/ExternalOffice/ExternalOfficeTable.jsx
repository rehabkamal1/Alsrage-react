import React from "react";
import { Button } from "react-bootstrap";
import SortableTable from "../common/SortableTable";
import { defaultColumns } from "../../constants/externalColumns";

const ExternalOfficeTable = ({ offices, onEdit, onDelete }) => {
    const renderCell = (office, columnId, index) => {
        switch (columnId) {
            case "index":
                return <td>{index + 1}</td>;

            case "country":
                return (
                    <td className="fw-bold text-primary">
                        {office.country || "-"}
                    </td>
                );

            case "name":
                return <td className="fw-semibold text-dark">{office.name}</td>;

            case "contacts":
                return (
                    <td>
                        {office.contacts && office.contacts.length > 0
                            ? office.contacts.map((contact, idx) => (
                                  <div key={idx} className="mb-2">
                                      <div className="fw-semibold">
                                          {contact.name || "-"}
                                      </div>
                                      {contact.phone && (
                                          <div
                                              className="small text-muted"
                                              dir="ltr"
                                          >
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
                );

            case "phone":
                return (
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
                );

            case "whatsapp":
                return (
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
                );

            case "notes":
                return <td>{office.notes || "-"}</td>;

            case "actions":
                return (
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
                );

            default:
                return <td>-</td>;
        }
    };

    return (
        <SortableTable
            data={offices}
            columns={defaultColumns}
            storageKey="external_office_columns_order"
            renderCell={renderCell}
            emptyMessage="لا يوجد مكاتب خارجية مضافين بعد"
            tableClassName="text-center"
        />
    );
};

export default ExternalOfficeTable;
