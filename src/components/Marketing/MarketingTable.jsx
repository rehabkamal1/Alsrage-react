import React from "react";
import { Button } from "react-bootstrap";
import SortableTable from "../common/SortableTable";
import { defaultColumns } from "../../constants/marketingColumns";

const MarketingTable = ({ leads, onEdit, onDelete }) => {
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const renderCell = (lead, columnId) => {
        switch (columnId) {
            case "id":
                return <td className="fw-semibold">#{lead.id}</td>;

            case "name":
                return <td>{lead.name || "-"}</td>;

            case "phone":
                return <td dir="ltr">{lead.phone || "-"}</td>;

            case "source":
                return <td>{lead.source_name || lead.source_id || "-"}</td>;

            case "contact_date":
                return <td>{formatDate(lead.contact_date)}</td>;

            case "next_followup_date":
                return <td>{formatDate(lead.next_followup_date)}</td>;

            case "notes":
                return (
                    <td
                        style={{
                            maxWidth: "150px",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                        }}
                    >
                        {lead.notes || "-"}
                    </td>
                );

            case "actions":
                return (
                    <td>
                        <div className="d-flex gap-2 justify-content-center">
                            <Button
                                variant="link"
                                className="text-primary p-0 rounded-circle"
                                onClick={() => onEdit(lead)}
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
                                onClick={() => onDelete(lead.id)}
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
                        </div>
                    </td>
                );

            default:
                return <td>-</td>;
        }
    };

    return (
        <SortableTable
            data={leads}
            columns={defaultColumns}
            storageKey="marketing_columns_order"
            renderCell={renderCell}
            emptyMessage="لا توجد بيانات تسويقية"
            tableClassName="text-center"
        />
    );
};

export default MarketingTable;
