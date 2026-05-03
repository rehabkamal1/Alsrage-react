import { Table, Button, Form } from "react-bootstrap";

const OrderTable = ({ orders, onEdit, onDelete, onStatusChange, statusOptions = [] }) => {
  const renderStatusDropdown = (order) => {
    const currentStatus = statusOptions.find(s => String(s.key || s.id) === String(order.status));
    
    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={order.status}
          onChange={(e) => onStatusChange(order, e.target.value)}
          className="rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 status-select"
          style={{
            backgroundColor: currentStatus?.color || '#6c757d',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.85rem',
            width: 'fit-content',
            minWidth: '130px',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          title="اضغط لتغيير الحالة"
        >
          {statusOptions.map((status) => (
            <option 
              key={status.key || status.id} 
              value={status.key || status.id}
              style={{ backgroundColor: '#fff', color: '#000', fontWeight: 'normal' }}
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



  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>المكتب السعودي</th>
            <th>المندوب</th>
            <th>صاحب التأشيرة</th>
            <th>رقم التأشيرة</th>
            <th>رقم عقد مساند</th>
            <th>إجمالي السعر</th>
            <th>سداد مساند</th>
            <th>الرصيد المتبقي</th>
            <th>حالة سداد مساند</th>
            <th>التاريخ</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {orders &&
            orders.map((order) => (
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
                <td>
                  {order.visa_holder_name ||
                    order.client?.visa_holder_name ||
                    "-"}
                </td>
                <td>{order.visa_number || "-"}</td>
                <td>{order.musaned_contract_number || "-"}</td>
                <td>{order.total_price != null ? `${Number(order.total_price).toFixed(2)} ر.س` : "-"}</td>
                <td>{order.musaned_paid != null ? `${Number(order.musaned_paid).toFixed(2)} ر.س` : "-"}</td>
                <td
                  className={
                    order.price_difference >= 0 ? "text-success fw-semibold" : "text-danger fw-semibold"
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
                <td>
                  <Button
                    variant="link"
                    className="text-primary p-0 me-2 rounded-circle"
                    onClick={() => onEdit(order)}
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
                    onClick={() => onDelete(order.id)}
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
          {(!orders || orders.length === 0) && (
            <tr>
              <td colSpan="12" className="text-center py-5 text-muted">
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
