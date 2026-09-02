import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert } from "react-bootstrap";
import ReportFilters from "../../components/ReportFilters";
import SortableHeader from "../../components/common/SortableHeader";
import { useSortableData } from "../../hooks/useSortableData";
import { getOrderFollowUpReport } from "../../services/apiService";

const OrderFollowUpReport = () => {
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    kpis: {
      total_late: 0,
      without_followup: 0,
      exceeded_sla: 0,
      avg_delay_days: 0,
    },
    orders: [],
  });
  const [error, setError] = useState(null);

  const { items: sortedOrders, requestSort, sortConfig } = useSortableData(reportData.orders || []);

  const fetchReport = async (appliedFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOrderFollowUpReport(appliedFilters);
      setReportData(response.data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
      setError("حدث خطأ أثناء جلب بيانات التقرير.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(filters);
  }, []); // Initial load

  const handleApplyFilters = (newFilters) => {
    fetchReport(newFilters);
  };

  return (
    <Container fluid className="py-4" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold mb-0">تقرير متابعة الطلبات (SLA)</h2>
      </div>

      <ReportFilters 
        config={{
          showDateRange: true,
          showMarketer: false,
          showEmployee: true,
          showSaudiOffice: true,
          showExternalOffice: true,
        }}
        filters={filters}
        onChange={setFilters}
        onApply={handleApplyFilters}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {/* KPIs Section */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100 text-center" style={{ backgroundColor: '#fff5f5', borderLeft: '4px solid #dc3545' }}>
            <Card.Body>
              <h6 className="text-muted mb-2">طلبات متأخرة</h6>
              <h3 className="text-danger fw-bold mb-0">{reportData.kpis.total_late}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100 text-center" style={{ backgroundColor: '#fff8e6', borderLeft: '4px solid #ffc107' }}>
            <Card.Body>
              <h6 className="text-muted mb-2">بدون متابعة</h6>
              <h3 className="text-warning fw-bold mb-0">{reportData.kpis.without_followup}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100 text-center" style={{ backgroundColor: '#fdf3f4', borderLeft: '4px solid #e83e8c' }}>
            <Card.Body>
              <h6 className="text-muted mb-2">تجاوزت SLA</h6>
              <h3 className="fw-bold mb-0" style={{ color: '#e83e8c' }}>{reportData.kpis.exceeded_sla}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100 text-center" style={{ backgroundColor: '#f0f4f8', borderLeft: '4px solid #17a2b8' }}>
            <Card.Body>
              <h6 className="text-muted mb-2">متوسط التأخير (أيام)</h6>
              <h3 className="text-info fw-bold mb-0">{reportData.kpis.avg_delay_days}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Data Table */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-0 py-3">
          <h5 className="mb-0 fw-bold">تفاصيل الطلبات</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle text-center">
                <thead className="bg-light">
                  <tr>
                    <SortableHeader title="رقم الطلب" sortKey="order_number" sortConfig={sortConfig} onRequestSort={requestSort} />
                    <SortableHeader title="العميل" sortKey="client_name" sortConfig={sortConfig} onRequestSort={requestSort} />
                    <SortableHeader title="حالة الطلب" sortKey="status" sortConfig={sortConfig} onRequestSort={requestSort} />
                    <SortableHeader title="آخر تحديث" sortKey="last_update_date" sortConfig={sortConfig} onRequestSort={requestSort} />
                    <SortableHeader title="أيام التأخير" sortKey="delay_days" sortConfig={sortConfig} onRequestSort={requestSort} />
                    <SortableHeader title="حالة SLA" sortKey="exceeded_sla" sortConfig={sortConfig} onRequestSort={requestSort} />
                    <SortableHeader title="المندوب" sortKey="employee_name" sortConfig={sortConfig} onRequestSort={requestSort} />
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.length > 0 ? (
                    sortedOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="fw-bold text-primary">#{order.order_number}</td>
                        <td>{order.client?.name || order.client_name || "-"}</td>
                        <td>
                          <Badge bg="secondary" className="px-2 py-1">
                            {order.status?.name || order.status || "غير محدد"}
                          </Badge>
                        </td>
                        <td>{order.last_update_date || "-"}</td>
                        <td>
                          <span className={order.delay_days > 0 ? "text-danger fw-bold" : "text-success"}>
                            {order.delay_days}
                          </span>
                        </td>
                        <td>
                          {order.exceeded_sla ? (
                            <Badge bg="danger">مخالف</Badge>
                          ) : (
                            <Badge bg="success">ضمن المدة</Badge>
                          )}
                        </td>
                        <td>{order.employee?.name || order.employee_name || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        لا توجد طلبات تطابق الفلاتر المحددة.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderFollowUpReport;
