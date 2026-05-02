import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const MarketingTable = ({
  leads,
  onEdit,
  onDelete,
  statuses,
  priorityLevels,
}) => {
  const getStatusBadge = (status) => {
    const found = statuses?.find((s) => s.key === status);
    if (found) {
      return (
        <Badge
          style={{ backgroundColor: found.color }}
          className="rounded-pill px-3 py-2"
        >
          {found.label}
        </Badge>
      );
    }
    return (
      <Badge bg="secondary" className="rounded-pill px-3 py-2">
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (level) => {
    const found = priorityLevels?.find((p) => p.key === level);
    if (found) {
      return (
        <Badge
          style={{ backgroundColor: found.color }}
          className="rounded-pill px-2 py-1"
        >
          {found.label}
        </Badge>
      );
    }
    return (
      <Badge bg="secondary" className="rounded-pill px-2 py-1">
        {level}
      </Badge>
    );
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "saudi_office":
        return "مكتب سعودي";
      case "external_office":
        return "مكتب خارجي";
      case "service_office":
        return "مكتب خدمات";
      default:
        return type;
    }
  };

  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>اسم العميل</th>
            <th>رقم الهاتف</th>
            <th>المصدر</th>
            <th>النوع</th>
            <th>الحالة</th>
            <th>درجة الأهمية</th>
            <th>تاريخ التواصل</th>
            <th>تاريخ المتابعة</th>
            <th>الملاحظات</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {leads &&
            leads.map((lead) => (
              <tr key={lead.id}>
                <td className="fw-semibold">#{lead.id}</td>
                <td>{lead.name}</td>
                <td dir="ltr">{lead.phone}</td>
                <td>{lead.source_name || "-"}</td>
                <td>{getTypeLabel(lead.type)}</td>
                <td>{getStatusBadge(lead.status)}</td>
                <td>{getPriorityBadge(lead.priority_level)}</td>
                <td>{lead.contact_date || "-"}</td>
                <td>{lead.next_followup_date || "-"}</td>
                <td
                  style={{
                    maxWidth: "150px",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  {lead.notes || "-"}
                </td>
                <td>
                  <div className="d-flex gap-2">
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
              </tr>
            ))}
          {(!leads || leads.length === 0) && (
            <tr>
              <td colSpan="11" className="text-center py-5 text-muted">
                لا توجد بيانات تسويقية
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default MarketingTable;
