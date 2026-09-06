import React from "react";
import { Button, Badge } from "react-bootstrap";
import SortableTable from "../common/SortableTable";
import { defaultColumns } from "../../constants/saudiOfficeColumns";

const SaudiOfficeTable = ({ offices, onEdit, onDelete }) => {
    const getWhatsAppLink = (mobile) => {
        if (!mobile) return null;
        const cleanNumber = mobile.replace(/\D/g, "");
        return `https://wa.me/${cleanNumber}`;
    };

    const renderCell = (office, columnId, index) => {
        switch (columnId) {
            case "index":
                return <td>{index + 1}</td>;

            case "name":
                return <td className="fw-semibold">{office.name}</td>;

            case "destination":
                return <td>{office.destination || "-"}</td>;

            case "city":
                return <td>{office.city || "-"}</td>;

            case "responsible_employee":
                return <td>{office.responsible_employee || "-"}</td>;

            case "total_authorization":
                return (
                    <td>
                        <Badge bg="info" text="dark">
                            {office.total_authorization || "0"}
                        </Badge>
                    </td>
                );

            case "musaned_price":
                return (
                    <td>
                        <Badge bg="warning" text="dark">
                            {office.musaned_price || "0"}
                        </Badge>
                    </td>
                );

            case "mobile":
                return (
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
                );

            case "notes":
                return <td>{office.notes || "-"}</td>;

            case "address":
                return <td>{office.address || "-"}</td>;

            case "whatsapp_link":
                return (
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
                );

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
            storageKey="saudi_office_columns_order"
            renderCell={renderCell}
            emptyMessage="لا يوجد مكاتب سعودية مضافين بعد"
            tableClassName="text-center"
        />
    );
};

export default SaudiOfficeTable;
