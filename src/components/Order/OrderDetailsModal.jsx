import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col, Badge, Card, Spinner, Table } from "react-bootstrap";
import { getOrder } from "../../services/apiService";

const OrderDetailsModal = ({ show, onHide, order }) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (show && order?.id) {
      fetchOrderDetails(order.id);
    } else if (!show) {
      setDetails(null);
    }
  }, [show, order?.id]);

  const fetchOrderDetails = async (id) => {
    setLoading(true);
    try {
      const res = await getOrder(id);
      const data = res.data?.data || res.data || {};
      setDetails(data);
    } catch (err) {
      console.warn("Could not fetch full order details, falling back to prop data:", err);
      setDetails(order);
    } finally {
      setLoading(false);
    }
  };

  const current = details || order || {};

  // Status badge styling helper
  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("مكتمل") || s === "completed") return <Badge bg="success" className="px-3 py-2 fs-7">مكتمل ✓</Badge>;
    if (s.includes("ملغي") || s === "cancelled") return <Badge bg="danger" className="px-3 py-2 fs-7">ملغي ✕</Badge>;
    if (s.includes("مرفوض") || s === "rejected") return <Badge bg="danger" className="px-3 py-2 fs-7">مرفوض</Badge>;
    if (s.includes("جديد") || s === "new") return <Badge bg="primary" className="px-3 py-2 fs-7">طلب جديد</Badge>;
    return <Badge bg="warning" text="dark" className="px-3 py-2 fs-7">{status || "قيد التنفيذ"}</Badge>;
  };

  const getSlaBadge = () => {
    if (current.exceeded_sla || current.within_sla === false || (current.delay_days && current.delay_days > 0)) {
      return (
        <Badge bg="danger" className="px-3 py-2 rounded-pill fs-7">
          متأخر عن SLA ({current.delay_days || 0} يوم تأخير)
        </Badge>
      );
    }
    return (
      <Badge bg="success" className="px-3 py-2 rounded-pill fs-7">
        ضمن اتفاقية مستوى الخدمة (SLA) ✓
      </Badge>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered dir="rtl" className="order-details-modal">
      <Modal.Header closeButton className="bg-light border-0 pt-4 px-4">
        <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center gap-2">
          <span className="p-2 bg-white rounded-3 border shadow-sm text-primary">📄</span>
          <span>تفاصيل الطلب: #{current.id || order?.id}</span>
          <span className="ms-2">{getStatusBadge(current.status_name || current.status)}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted fw-semibold">جاري تحميل كامل بيانات الطلب...</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {/* Quick SLA & KPI Notification Alert */}
            <div className="bg-white p-3 rounded-4 border shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                  <i className="fa-solid fa-clock-rotate-left fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark">مؤشر الإنجاز والمتابعة</h6>
                  <p className="text-muted mb-0 small">
                    آخر تحديث: {current.last_update_date || current.updated_at || "لا يوجد تحديث حديث"} | تاريخ الإنشاء: {current.created_at || current.contract_date || "-"}
                  </p>
                </div>
              </div>
              <div>{getSlaBadge()}</div>
            </div>

            <Row className="g-3">
              {/* Client & Visa Information */}
              <Col lg={6}>
                <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
                  <Card.Header className="bg-light border-0 py-3 fw-bold text-dark d-flex align-items-center gap-2">
                    <i className="fa-solid fa-user text-primary"></i>
                    <span>بيانات العميل والتأشيرة</span>
                  </Card.Header>
                  <Card.Body className="p-3">
                    <Table borderless className="mb-0 text-dark small align-middle">
                      <tbody>
                        <tr className="border-bottom">
                          <td className="text-muted py-2" style={{ width: "35%" }}>اسم العميل:</td>
                          <td className="fw-bold py-2">{current.client?.name || current.client_name || "-"}</td>
                        </tr>
                        <tr className="border-bottom">
                          <td className="text-muted py-2">رقم الجوال:</td>
                          <td className="fw-semibold py-2" dir="ltr">{current.client?.phone || current.client_phone || "-"}</td>
                        </tr>
                        <tr className="border-bottom">
                          <td className="text-muted py-2">رقم الهوية / الإقامة:</td>
                          <td className="py-2"><code>{current.client?.national_id || current.client_national_id || "-"}</code></td>
                        </tr>
                        <tr className="border-bottom">
                          <td className="text-muted py-2">رقم التأشيرة:</td>
                          <td className="py-2"><Badge bg="secondary" className="px-2 py-1 font-monospace">{current.visa_number || "-"}</Badge></td>
                        </tr>
                        <tr>
                          <td className="text-muted py-2">تاريخ التأشيرة:</td>
                          <td className="py-2">{current.visa_date || "-"}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              {/* Service & Offices Information */}
              <Col lg={6}>
                <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
                  <Card.Header className="bg-light border-0 py-3 fw-bold text-dark d-flex align-items-center gap-2">
                    <i className="fa-solid fa-building text-info"></i>
                    <span>تفاصيل الخدمة والمكاتب</span>
                  </Card.Header>
                  <Card.Body className="p-3">
                    <Table borderless className="mb-0 text-dark small align-middle">
                      <tbody>
                        <tr className="border-bottom">
                          <td className="text-muted py-2" style={{ width: "35%" }}>نوع الخدمة:</td>
                          <td className="fw-bold py-2"><Badge bg="info" className="bg-opacity-10 text-info px-2 py-1">{current.service_type || "-"}</Badge></td>
                        </tr>
                        <tr className="border-bottom">
                          <td className="text-muted py-2">المسوق / الموظف:</td>
                          <td className="fw-semibold py-2">{current.employee?.name || current.employee_name || "-"}</td>
                        </tr>
                        <tr className="border-bottom">
                          <td className="text-muted py-2">المكتب الداخلي (السعودي):</td>
                          <td className="py-2">{current.saudi_office?.name || current.saudi_office || "-"}</td>
                        </tr>
                        <tr className="border-bottom">
                          <td className="text-muted py-2">المكتب الخارجي:</td>
                          <td className="py-2">{current.external_office?.name || current.external_office || "-"}</td>
                        </tr>
                        <tr>
                          <td className="text-muted py-2">تاريخ العقد:</td>
                          <td className="py-2">{current.contract_date || current.created_at || "-"}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Financial Overview */}
            <Card className="border-0 shadow-sm rounded-4 bg-white">
              <Card.Header className="bg-light border-0 py-3 fw-bold text-dark d-flex align-items-center gap-2">
                <i className="fa-solid fa-coins text-warning"></i>
                <span>الحسابات المالية للطلب</span>
              </Card.Header>
              <Card.Body className="p-3">
                <Row className="g-3 text-center">
                  <Col md={3}>
                    <div className="p-3 bg-light rounded-3 border">
                      <span className="text-muted small d-block mb-1">إجمالي قيمة العقد</span>
                      <strong className="fs-5 text-dark">{(current.total_price || 0).toLocaleString()} ر.س</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25">
                      <span className="text-success small d-block mb-1">المبلغ المحصل</span>
                      <strong className="fs-5 text-success">{(current.paid_amount || 0).toLocaleString()} ر.س</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3 bg-danger bg-opacity-10 rounded-3 border border-danger border-opacity-25">
                      <span className="text-danger small d-block mb-1">المبلغ المتبقي</span>
                      <strong className="fs-5 text-danger">{(current.remaining_amount || 0).toLocaleString()} ر.س</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3 bg-light rounded-3 border">
                      <span className="text-muted small d-block mb-1">حالة السداد</span>
                      <strong className="fs-6 text-primary">
                        {current.payment_status || (current.remaining_amount === 0 ? "محصل بالكامل ✓" : "تحصيل جزئي / معلق")}
                      </strong>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Notes if available */}
            {current.notes && (
              <div className="bg-light p-3 rounded-4 border">
                <h6 className="fw-bold text-secondary mb-1">ملاحظات:</h6>
                <p className="mb-0 small text-dark">{current.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pb-4 px-4 bg-light">
        <Button variant="outline-dark" onClick={() => window.print()} className="rounded-3 px-3 fw-semibold">
          <i className="fa-solid fa-print me-1"></i> طباعة
        </Button>
        <Button variant="secondary" onClick={onHide} className="rounded-3 px-4 fw-semibold">
          إغلاق
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetailsModal;

