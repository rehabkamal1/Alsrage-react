import React, { useState, useEffect, useMemo } from "react";
import { Container, Card, Row, Col, Table, Badge, Button } from "react-bootstrap";
import { getFinancialCollectionsReport } from "../../services/apiService";
import RefreshButton from "../../components/common/RefreshButton";
import TableSkeleton from "../../components/common/TableSkeleton";
import { exportToExcel } from "../../utils/excelHelper";
import { exportToPDF } from "../../utils/pdfHelper";
import PaginationComponent from "../../components/common/Pagination";
import OrderDetailsModal from "../../components/Order/OrderDetailsModal";

const FinancialCollectionsReport = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    total_contract_value: 0,
    total_collected: 0,
    total_outstanding: 0,
    collection_rate: 0,
  });
  const [orders, setOrders] = useState([]);

  // Modal State for Order Details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return orders.slice(start, start + itemsPerPage);
  }, [orders, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getFinancialCollectionsReport();
      if (res.data) {
        setKpis(res.data.kpis || {});
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching financial collections report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const columns = [
      { header: "رقم الطلب", key: "id" },
      { header: "رقم التأشيرة", key: "visa_number" },
      { header: "اسم العميل", key: "client_name" },
      { header: "إجمالي العقد (ر.س)", key: "total_price" },
      { header: "المبلغ المحصل (ر.س)", key: "paid_amount" },
      { header: "المبلغ المتبقي (ر.س)", key: "remaining_amount" },
      { header: "حالة التحصيل", key: "payment_status" },
      { header: "التاريخ", key: "created_at" },
    ];
    exportToExcel(orders, columns, "تقرير_التحصيلات_والمعاملات_المالية.xlsx");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "رقم الطلب", key: "id" },
      { header: "رقم التأشيرة", key: "visa_number" },
      { header: "اسم العميل", key: "client_name" },
      { header: "إجمالي العقد (ر.س)", key: "total_price" },
      { header: "المبلغ المحصل (ر.س)", key: "paid_amount" },
      { header: "المبلغ المتبقي (ر.س)", key: "remaining_amount" },
      { header: "حالة التحصيل", key: "payment_status" },
      { header: "التاريخ", key: "created_at" },
    ];
    exportToPDF(orders, columns, "تقرير_التحصيلات_والمعاملات_المالية.pdf");
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "24px" }}>
      <Container fluid>
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
              <span>💳</span> تقرير التحصيلات والمعاملات المالية
            </h1>
            <p className="text-muted mb-0 small">
              ملخص المبالغ المحصلة والمستحقات المتبقية ونسبة تحصيل الإيرادات العامة
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <RefreshButton onClick={fetchData} loading={loading} className="border shadow-sm text-primary fw-semibold" />
            <Button variant="light" onClick={handleExportExcel} className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold">
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>إكسيل</span>
            </Button>
            <Button variant="light" onClick={handleExportPDF} className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-danger fw-semibold">
              <i className="fa-solid fa-file-pdf fs-5"></i>
              <span>بي دي اف</span>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">إجمالي قيمة العقود</div>
                  <h2 className="mb-0 fw-extrabold fs-2">{(kpis.total_contract_value || 0).toLocaleString()} <span className="fs-6 font-normal">ر.س</span></h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-file-invoice-dollar fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #10b981 0%, #047857 100%)" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">المحصل الفعلي</div>
                  <h2 className="mb-0 fw-extrabold fs-2">{(kpis.total_collected || 0).toLocaleString()} <span className="fs-6 font-normal">ر.س</span></h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-vault fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">المستحقات المتبقية</div>
                  <h2 className="mb-0 fw-extrabold fs-2">{(kpis.total_outstanding || 0).toLocaleString()} <span className="fs-6 font-normal">ر.س</span></h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-hand-holding-dollar fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">نسبة التحصيل العامة</div>
                  <h2 className="mb-0 fw-extrabold display-6">{kpis.collection_rate || 0}%</h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-percent fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Body className="p-0">
            {loading ? (
              <div className="p-4"><TableSkeleton rows={5} columns={7} /></div>
            ) : (
              <div className="table-responsive">
                <Table hover align="middle" className="mb-0 text-center">
                  <thead className="bg-light text-secondary border-bottom">
                    <tr>
                      <th className="py-3">#</th>
                      <th className="py-3">رقم التأشيرة</th>
                      <th className="py-3">اسم العميل</th>
                      <th className="py-3">إجمالي العقد</th>
                      <th className="py-3">المحتصل</th>
                      <th className="py-3">المتبقي</th>
                      <th className="py-3">حالة التحصيل</th>
                      <th className="py-3">التاريخ</th>
                      <th className="py-3 text-center">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order, idx) => (
                      <tr key={order.id || idx}>
                        <td className="fw-bold">{order.id}</td>
                        <td><Badge bg="secondary" className="px-2 py-1">{order.visa_number}</Badge></td>
                        <td className="fw-semibold text-dark">{order.client_name}</td>
                        <td className="fw-bold text-dark">{(order.total_price || 0).toLocaleString()} ر.س</td>
                        <td className="fw-bold text-success">{(order.paid_amount || 0).toLocaleString()} ر.س</td>
                        <td className="fw-bold text-danger">{(order.remaining_amount || 0).toLocaleString()} ر.س</td>
                        <td>
                          {order.payment_status === "محصل بالكامل" ? (
                            <Badge bg="success" className="px-3 py-2 rounded-pill">محصل بالكامل ✓</Badge>
                          ) : order.payment_status === "محصل جزئياً" ? (
                            <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill">محصل جزئياً ⏳</Badge>
                          ) : (
                            <Badge bg="danger" className="px-3 py-2 rounded-pill">غير محصل ✕</Badge>
                          )}
                        </td>
                        <td className="text-muted">{order.created_at}</td>
                        <td className="text-center">
                          <Button
                            variant="light"
                            size="sm"
                            className="rounded-circle shadow-sm border text-primary d-inline-flex align-items-center justify-content-center"
                            style={{ width: "36px", height: "36px" }}
                            onClick={() => handleViewOrderDetails(order)}
                            title="عرض تفاصيل الطلب والحساب"
                          >
                            <i className="fa-solid fa-eye fs-6"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </Card.Body>
        </Card>

        {/* Order Details Modal */}
        <OrderDetailsModal
          show={showDetailsModal}
          onHide={() => setShowDetailsModal(false)}
          order={selectedOrder}
        />
      </Container>
    </div>
  );
};

export default FinancialCollectionsReport;
