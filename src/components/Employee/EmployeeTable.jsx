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
                <td>
                  <span className="phone-badge">{employee.phone}</span>
                </td>
                <td>{employee.position || "-"}</td>
                <td>
                  {formatPermissions(employee.permissions)}
                </td>
                <td className="text-center">
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
