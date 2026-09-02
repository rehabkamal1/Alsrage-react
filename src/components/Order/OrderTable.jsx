import { Table, Button, Form } from "react-bootstrap";
import SortableHeader from "../common/SortableHeader";
import { useSortableData } from "../../hooks/useSortableData";

const OrderTable = ({
  orders = [],
  onEdit,
  onDelete,
  onStatusChange,
  onServiceTypeChange,
  onWhatsApp,
  statusOptions = [],
  serviceTypeOptions = [],
  canEdit = true,
  canDelete = true,
}) => {
  const { items: sortedOrders, requestSort, sortConfig } = useSortableData(orders);

  const renderStatusDropdown = (order) => {
    const currentStatus = statusOptions.find(
      (s) => String(s.key || s.id) === String(order.status),
    );

    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={order.status}
          onChange={(e) => onStatusChange(order, e.target.value)}
          disabled={!canEdit}
          className="rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 status-select"
          style={{
            backgroundColor: currentStatus?.color || "#6c757d",
            color: "#fff",
            cursor: canEdit ? "pointer" : "default",
            fontSize: "0.85rem",
            width: "fit-content",
            minWidth: "130px",
            transition: "all 0.2s ease-in-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          title={canEdit ? "اضغط لتغيير الحالة" : "الحالة الحالية"}
        >
          {statusOptions.map((status) => (
            <option
              key={status.key || status.id}
              value={status.key || status.id}
              style={{
                backgroundColor: "#fff",
                color: "#000",
                fontWeight: "normal",
              }}
            >
              {status.label}
            </option>
          ))}
        </Form.Select>
        <style>{`
          .status-select {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
          }
          .status-select:hover {
            transform: translateY(-1px);
            filter: brightness(1.1);
            box-shadow: 0 4px 6px rgba(0,0,0,0.15) !important;
          }
          .status-select:focus {
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
            outline: 0;
          }
        `}</style>
      </div>
    );
  };

  const renderServiceTypeDropdown = (order) => {
    if (
      !serviceTypeOptions ||
      serviceTypeOptions.length === 0 ||
      !onServiceTypeChange
    ) {
      const matched = serviceTypeOptions.find(
        (s) => String(s.key || s.label) === String(order.service_type),
      );
      if (matched) {
        return (
          <span
            className="badge rounded-pill px-3 py-1 fw-bold"
            style={{
              backgroundColor: matched.color || "#6c757d",
              color: "#fff",
            }}
          >
            {matched.label}
          </span>
        );
      }
      return order.service_type || "-";
    }

    const currentType = serviceTypeOptions.find(
      (s) => String(s.key || s.label) === String(order.service_type),
    );

    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={order.service_type || ""}
          onChange={(e) => onServiceTypeChange(order, e.target.value)}
          disabled={!canEdit}
          className="rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 status-select"
          style={{
            backgroundColor: currentType?.color || "#6c757d",
            color: "#fff",
            cursor: canEdit ? "pointer" : "default",
            fontSize: "0.85rem",
            width: "fit-content",
            minWidth: "120px",
            transition: "all 0.2s ease-in-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          title={canEdit ? "اضغط لتغيير نوع الخدمة" : "نوع الخدمة"}
        >
          <option value="" style={{ backgroundColor: "#fff", color: "#000" }}>
            -- اختر الخدمة --
          </option>
          {serviceTypeOptions.map((st) => (
            <option
              key={st.key || st.id || st.label}
              value={st.key || st.label}
              style={{
                backgroundColor: "#fff",
                color: "#000",
                fontWeight: "normal",
              }}
            >
              {st.label}
            </option>
          ))}
        </Form.Select>
      </div>
    );
  };

  const showActionsColumn = canEdit || canDelete || !!onWhatsApp;

  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle text-center">
        <thead className="table-light">
          <tr>
            <SortableHeader title="#" sortKey="id" sortConfig={sortConfig} onRequestSort={requestSort} />
            <SortableHeader title="المكتب السعودي" sortKey="saudi_office_id" sortConfig={sortConfig} onRequestSort={requestSort} />
            <SortableHeader title="المندوب" sortKey="client_id" sortConfig={sortConfig} onRequestSort={requestSort} />
            <SortableHeader title="صاحب التأشيرة" sortKey="visa_holder_name" sortConfig={sortConfig} onRequestSort={requestSort} />
            <SortableHeader title="رقم صاحب التأشيرة" sortKey="visa_holder_phone" sortConfig={sortConfig} onRequestSort={requestSort} />
            <SortableHeader title="رقم التأشيرة" sortKey="visa_number" sortConfig={sortConfig} onRequestSort={requestSort} />
            <SortableHeader title="نوع الخدمة" sortKey="service_type" sortConfig={sortConfig} onRequestSort={requestSort} />
            <SortableHeader title="رقم عقد مساند" sortKey="musaned_contract_number" sortConfig={sortConfig} onRequestSort={requestSort} />
            <SortableHeader title="إجمالي السعر" sortKey="total_price" sortConfig={sortConfig} onRequestSort={requestSort} />
            <SortableHeader title="سداد مساند" sortKey="musaned_paid" sortConfig={sortConfig} onRequestSort={requestSort} />
            <SortableHeader title="الرصيد المتبقي" sortKey="price_difference" sortConfig={sortConfig} onRequestSort={requestSort} />
            <SortableHeader title="حالة سداد مساند" sortKey="status" sortConfig={sortConfig} onRequestSort={requestSort} />
            <SortableHeader title="التاريخ" sortKey="created_at" sortConfig={sortConfig} onRequestSort={requestSort} />
            {showActionsColumn && <th>الإجراءات</th>}
          </tr>
        </thead>
        <tbody>
          {sortedOrders &&
            sortedOrders.map((order) => (
              <tr key={order.id}>
                <td className="fw-semibold">#{order.id}</td>
                <td className="fw-semibold text-primary">
                  {order.saudi_office?.name || "-"}
                </td>
                <td>
                  {order.client?.name || "-"}
                  {order.client?.phone && (
                    <div className="text-muted small">{order.client.phone}</div>
                  )}
                </td>
                <td>{order.visa_holder_name || "-"}</td>
                <td>{order.visa_holder_phone || "-"}</td>
                <td>{order.visa_number || "-"}</td>
                <td>{renderServiceTypeDropdown(order)}</td>
                <td>{order.musaned_contract_number || "-"}</td>
                <td>
                  {order.total_price != null
                    ? `${Number(order.total_price).toFixed(2)} ر.س`
                    : "-"}
                </td>
                <td>
                  {order.musaned_paid != null
                    ? `${Number(order.musaned_paid).toFixed(2)} ر.س`
                    : "-"}
                </td>
                <td
                  className={
                    order.price_difference >= 0
                      ? "text-success fw-semibold"
                      : "text-danger fw-semibold"
                  }
                >
                  {order.price_difference != null
                    ? `${Number(order.price_difference).toFixed(2)} ر.س`
                    : "-"}
                </td>
                <td>{renderStatusDropdown(order)}</td>
                <td>
                  {new Date(order.created_at).toLocaleDateString("ar-SA")}
                </td>
                {showActionsColumn && (
                  <td>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      {onWhatsApp && (
                        <Button
                          variant="link"
                          className="table-action-btn whatsapp-btn"
                          onClick={() => onWhatsApp(order)}
                          title="إرسال إشعار واتساب"
                        >
                          <i className="fa-brands fa-whatsapp fs-6"></i>
                        </Button>
                      )}
                      {canEdit && (
                        <Button
                          variant="link"
                          className="table-action-btn edit-btn"
                          onClick={() => onEdit(order)}
                          title="تعديل"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="link"
                          className="table-action-btn delete-btn"
                          onClick={() => onDelete(order.id)}
                          title="حذف"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          {(!sortedOrders || sortedOrders.length === 0) && (
            <tr>
              <td colSpan={showActionsColumn ? "14" : "13"} className="text-center py-5 text-muted">
                لا يوجد طلبات
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default OrderTable;
