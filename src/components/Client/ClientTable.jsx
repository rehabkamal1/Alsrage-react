import React from "react";
import { Badge, Button } from "react-bootstrap";
import SortableTable from "../common/SortableTable";
import { defaultColumns } from "../../constants/clientColumns";

const ClientTable = ({
    clients,
    onEdit,
    onDelete,
    onViewOrders,
    canEdit = true,
    canDelete = true,
    sortConfig,
    onSort,
}) => {
    const renderCell = (client, columnId) => {
        switch (columnId) {
            case "index":
                return <td className="fw-semibold">#{client.id}</td>;
            case "client_type":
                return (
                    <td>
                        <Badge
                            bg={
                                client.client_type === "office"
                                    ? "info"
                                    : "secondary"
                            }
                        >
                            {client.client_type === "office" ? "مكتب" : "فرد"}
                        </Badge>
                    </td>
                );
            case "phone":
                return <td>{client.phone}</td>;
            case "name":
                return <td>{client.name || "-"}</td>;
            case "additional_phone":
                return <td>{client.additional_phone || "-"}</td>;
            case "city":
                return <td>{client.city || "-"}</td>;
            case "address":
                return <td>{client.address || "-"}</td>;
            case "orders":
                return (
                    <td>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onViewOrders(client)}
                            className="rounded-pill px-3 py-1"
                        >
                            <i className="fa-solid fa-file-invoice me-1"></i>
                            عرض الطلبات
                        </Button>
                    </td>
                );
            case "created_at":
                return (
                    <td>
                        {new Date(client.created_at).toLocaleDateString(
                            "ar-SA",
                        )}
                    </td>
                );
            case "actions":
                return (
                    <td>
                        <div className="d-flex align-items-center justify-content-center gap-2">
                            {canEdit && (
                                <Button
                                    variant="link"
                                    className="table-action-btn edit-btn"
                                    onClick={() => onEdit(client)}
                                    title="تعديل"
                                >
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </Button>
                            )}
                            {canDelete && (
                                <Button
                                    variant="link"
                                    className="table-action-btn delete-btn"
                                    onClick={() => onDelete(client.id)}
                                    title="حذف"
                                >
                                    <i className="fa-solid fa-trash-can"></i>
                                </Button>
                            )}
                        </div>
                    </td>
                );
            default:
                return <td>-</td>;
        }
    };

    return (
        <SortableTable
            data={clients}
            columns={defaultColumns}
            storageKey="client_columns_order"
            renderCell={renderCell}
            emptyMessage="لا يوجد عملاء"
            tableClassName="text-center"
            sortConfig={sortConfig}
            onRequestSort={onSort}
        />
    );
};

export default ClientTable;
