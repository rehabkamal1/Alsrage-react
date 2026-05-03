import React from "react";
import { Table, Button, Form } from "react-bootstrap";

const MarketingTable = ({
  leads,
  onEdit,
  onDelete,
  onUpdateField,
  statuses,
  priorityLevels,
}) => {
  console.log("========== MarketingTable RENDER ==========");
  console.log("leads data:", leads);
  console.log("statuses:", statuses);
  console.log("priorityLevels:", priorityLevels);

  leads?.forEach((lead, index) => {
    console.log(`Lead ${index} (ID: ${lead.id}):`, {
      name: lead.name,
      phone: lead.phone,
      source_name: lead.source_name,
      source_id: lead.source_id,
      source_type: lead.source_type,
      status: lead.status,
      priority_level: lead.priority_level,
      contact_date: lead.contact_date,
      next_followup_date: lead.next_followup_date,
    });
  });

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

  const getStatusColor = (status) => {
    const found = statuses?.find((s) => s.key === status);
    return found?.color || "#6c757d";
  };

  const getStatusLabel = (status) => {
    const found = statuses?.find((s) => s.key === status);
    return found?.label || status || "-";
  };

  const getPriorityColor = (level) => {
    const found = priorityLevels?.find((p) => p.key === level);
    return found?.color || "#6c757d";
  };

  const getPriorityLabel = (level) => {
    const found = priorityLevels?.find((p) => p.key === level);
    return found?.label || level || "-";
  };

  const handleInlineUpdate = async (leadId, field, value) => {
    console.log(
      `handleInlineUpdate: leadId=${leadId}, field=${field}, value=${value}`,
    );
    if (onUpdateField) {
      await onUpdateField(leadId, field, value);
    }
  };

  const renderStatusDropdown = (lead) => {
    const currentColor = getStatusColor(lead.status);

    if (!statuses || statuses.length === 0) {
      return <span className="text-muted">{getStatusLabel(lead.status)}</span>;
    }

    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={lead.status || ""}
          onChange={(e) =>
            handleInlineUpdate(lead.id, "status", e.target.value)
          }
          className="rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 status-select"
          style={{
            backgroundColor: currentColor,
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.85rem",
            width: "fit-content",
            minWidth: "130px",
            transition: "all 0.2s ease-in-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          title="اضغط لتغيير الحالة"
        >
          <option value="">-- اختر --</option>
          {statuses.map((status) => (
            <option
              key={status.key}
              value={status.key}
              style={{ backgroundColor: status.color, color: "#fff" }}
            >
              {status.label}
            </option>
          ))}
        </Form.Select>
      </div>
    );
  };

  const renderPriorityDropdown = (lead) => {
    const currentColor = getPriorityColor(lead.priority_level);

    if (!priorityLevels || priorityLevels.length === 0) {
      return (
        <span className="text-muted">
          {getPriorityLabel(lead.priority_level)}
        </span>
      );
    }

    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={lead.priority_level || ""}
          onChange={(e) =>
            handleInlineUpdate(lead.id, "priority_level", e.target.value)
          }
          className="rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 priority-select"
          style={{
            backgroundColor: currentColor,
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.85rem",
            width: "fit-content",
            minWidth: "130px",
            transition: "all 0.2s ease-in-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          title="اضغط لتغيير درجة الأهمية"
        >
          <option value="">-- اختر --</option>
          {priorityLevels.map((priority) => (
            <option
              key={priority.key}
              value={priority.key}
              style={{ backgroundColor: priority.color, color: "#fff" }}
            >
              {priority.label}
            </option>
          ))}
        </Form.Select>
      </div>
    );
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
                <td>{lead.name || "-"}</td>
                <td dir="ltr">{lead.phone || "-"}</td>
                <td>
                  {lead.source_name || lead.source_id || "-"}
                </td>
                <td>{renderStatusDropdown(lead)}</td>
                <td>{renderPriorityDropdown(lead)}</td>
                <td>{formatDate(lead.contact_date)}</td>
                <td>{formatDate(lead.next_followup_date)}</td>
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
              <td colSpan="10" className="text-center py-5 text-muted">
                لا توجد بيانات تسويقية
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <style>{`
        .status-select:hover, .priority-select:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
          box-shadow: 0 4px 6px rgba(0,0,0,0.15) !important;
        }
        .status-select:focus, .priority-select:focus {
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
          outline: 0;
        }
      `}</style>
    </div>
  );
};

export default MarketingTable;
