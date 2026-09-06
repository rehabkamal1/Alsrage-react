import React from "react";
import { Badge, Button } from "react-bootstrap";
import SortableTable from "../common/SortableHeader";
import { defaultColumns } from "../../constants/employeeColumns";

const EmployeeTable = ({ employees, onEdit, onDelete }) => {
    const renderCell = (employee, columnId) => {
        switch (columnId) {
            case "index":
                return <td>{employees.indexOf(employee) + 1}</td>;
            case "name":
                return <td className="fw-semibold">{employee.name}</td>;
            case "username":
                return (
                    <td>
                        <Badge bg="light" text="dark">
                            {employee.username}
                        </Badge>
                    </td>
                );
            case "phone":
                return (
                    <td>
                        <span className="phone-badge">{employee.phone}</span>
                    </td>
                );
            case "position":
                return <td>{employee.position || "-"}</td>;
            case "permissions":
                return (
                    <td>
                        {employee.permissions?.length
                            ? `${employee.permissions.length} صلاحيات`
                            : "-"}
                    </td>
                );
            case "actions":
                return (
                    <td>
                        <div className="d-flex align-items-center justify-content-center gap-2">
                            <Button
                                variant="link"
                                className="table-action-btn edit-btn"
                                onClick={() => onEdit(employee)}
                                title="تعديل"
                            >
                                <i className="fa-solid fa-pen-to-square"></i>
                            </Button>
                            <Button
                                variant="link"
                                className="table-action-btn delete-btn"
                                onClick={() => onDelete(employee.id)}
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
            data={employees}
            columns={defaultColumns}
            storageKey="employee_columns_order"
            renderCell={renderCell}
            emptyMessage="لا يوجد موظفين مضافين بعد"
            tableClassName="text-center"
        />
    );
};

export default EmployeeTable;
