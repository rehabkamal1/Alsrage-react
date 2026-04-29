import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const EmployeeTable = ({ employees, onEdit, onDelete }) => {
  const formatPermissions = (permissions) => {
    if (!permissions || permissions.length === 0) {
      return "-";
    }
    // Show count of permissions
    return `${permissions.length} صلاحيات`;
  };

  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>الاسم</th>
            <th>اسم المستخدم</th>
            <th>رقم الهاتف</th>
            <th>المسمى الوظيفي</th>
            <th>الصلاحيات</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {employees &&
            employees.map((employee, index) => (
              <tr key={employee.id}>
                <td>{index + 1}</td>
                <td className="fw-semibold">{employee.name}</td>
                <td>
                  <Badge bg="light" text="dark">
                    {employee.username}
                  </Badge>
                </td>
                <td dir="ltr">{employee.phone}</td>
                <td>{employee.position || "-"}</td>
                <td>
                  {formatPermissions(employee.permissions)}
                </td>
                <td>
                  <Button
                    variant="link"
                    className="text-primary p-0 me-2 rounded-circle"
                    onClick={() => onEdit(employee)}
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
                    onClick={() => onDelete(employee.id)}
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
                </td>
              </tr>
            ))}
          {(!employees || employees.length === 0) && (
            <tr>
              <td colSpan="7" className="text-center py-5 text-muted">
                لا يوجد موظفين مضافين بعد
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default EmployeeTable;
