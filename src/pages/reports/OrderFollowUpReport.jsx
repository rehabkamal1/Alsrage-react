import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Modal, Spinner } from "react-bootstrap";
import ReportFilters from "../../components/ReportFilters";
import RefreshButton from "../../components/common/RefreshButton";
import TableSkeleton from "../../components/common/TableSkeleton";
import SortableHeader from "../../components/common/SortableHeader";
import { useSortableData } from "../../hooks/useSortableData";
import { getOrderFollowUpReport, getOrder } from "../../services/apiService";
import { exportToExcel } from "../../utils/excelHelper";
import { exportToPDF } from "../../utils/pdfHelper";
import PaginationComponent from "../../components/common/Pagination";

const OrderFollowUpReport = () => {
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeCardFilter, setActiveCardFilter] = useState("all"); // 'all', 'late', 'without_followup', 'exceeded_sla', 'within_sla'
  const [reportData, setReportData] = useState({
    kpis: {
      total_orders: 0,
      total_late: 0,
      without_followup: 0,
      exceeded_sla: 0,
      within_sla: 0,
      avg_delay_days: 0,
    },
    orders: [],
  });
  const [error, setError] = useState(null);

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchReport = async (appliedFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOrderFollowUpReport(appliedFilters);
      setReportData(response.data || { kpis: {}, orders: [] });
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
    setActiveCardFilter("all");
    fetchReport(newFilters);
  };

  // Card filter handler (toggle if already clicked)
  const handleCardClick = (filterType) => {
    setActiveCardFilter((prev) => (prev === filterType ? "all" : filterType));
  };

  // Filter orders according to active card
  const filteredOrders = useMemo(() => {
    const list = reportData.orders || [];
    if (activeCardFilter === "late") {
      return list.filter((o) => Number(o.delay_days) > 0);
    }
    if (activeCardFilter === "without_followup") {
      return list.filter(
        (o) => o.is_without_followup || !o.last_update_date || o.last_update_date === "-"
      );
    }
    if (activeCardFilter === "exceeded_sla") {
      return list.filter((o) => Boolean(o.exceeded_sla));
    }
    if (activeCardFilter === "within_sla") {
      return list.filter((o) => !o.exceeded_sla && Number(o.delay_days || 0) <= 0);
    }
    return list;
  }, [reportData.orders, activeCardFilter]);

  const { items: sortedOrders, requestSort, sortConfig } = useSortableData(filteredOrders);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCardFilter, filters]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedOrders.slice(start, start + itemsPerPage);
  }, [sortedOrders, currentPage, itemsPerPage]);

  // View order details handler
  const handleViewOrderDetails = async (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
    setDetailsLoading(true);
    try {
      const res = await getOrder(order.id);
      if (res.data?.data || res.data) {
        setSelectedOrder((prev) => ({
          ...prev,
          ...(res.data?.data || res.data),
        }));
      }
    } catch (err) {
      console.warn("Could not fetch full order details, falling back to report row data:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Export handlers
  const handleExportExcel = () => {
    const columns = [
      { header: "رقم الطلب", key: "order_number" },
      { header: "رقم التأشيرة", key: "visa_number" },
      { header: "العميل", format: (o) => o.client?.name || o.client_name || "-" },
      { header: "المسوق / الموظف", format: (o) => o.employee?.name || o.employee_name || "-" },
      { header: "حالة الطلب", format: (o) => o.status?.name || o.status_name || o.status || "-" },
      { header: "المكتب الداخلي", key: "saudi_office" },
      { header: "المكتب الخارجي", key: "external_office" },
      { header: "تاريخ العقد", key: "contract_date" },
      { header: "آخر تحديث", key: "last_update_date" },
      { header: "أيام التأخير", key: "delay_days" },
      {
        header: "حالة SLA",
        format: (o) => (o.exceeded_sla ? "مخالف لـ SLA" : "ضمن المدة"),
      },
      {
        header: "المتابعة",
        format: (o) => (o.is_without_followup ? "بدون متابعة" : "تمت المتابعة"),
      },
    ];
    exportToExcel(sortedOrders, columns, "تقرير_متابعة_الطلبات_SLA.xlsx");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "رقم الطلب", key: "order_number" },
      { header: "العميل", format: (o) => o.client?.name || o.client_name || "-" },
      { header: "المسوق / الموظف", format: (o) => o.employee?.name || o.employee_name || "-" },
      { header: "حالة الطلب", format: (o) => o.status?.name || o.status_name || o.status || "-" },
      { header: "آخر تحديث", key: "last_update_date" },
      { header: "أيام التأخير", key: "delay_days" },
      {
        header: "حالة SLA",
        format: (o) => (o.exceeded_sla ? "مخالف لـ SLA" : "ضمن المدة"),
      },
    ];
    exportToPDF(sortedOrders, columns, "تقرير_متابعة_الطلبات_SLA.pdf");
  };

  const getFilterTitle = () => {
    switch (activeCardFilter) {
      case "late":
        return "طلبات متأخرة";
      case "without_followup":
        return "طلبات بدون متابعة";
      case "exceeded_sla":
        return "طلبات تجاوزت SLA";
      case "within_sla":
        return "طلبات ضمن المدة (ملتزمة)";
      default:
        return "جميع الطلبات";
    }
  };

  const totalOrdersCount = reportData.kpis.total_orders ?? (reportData.orders?.length || 0);
  const withinSlaCount =
    reportData.kpis.within_sla ??
    (reportData.orders ? reportData.orders.filter((o) => !o.exceeded_sla && Number(o.delay_days || 0) <= 0).length : 0);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "24px" }} dir="rtl">
      <Container fluid>
        {/* Header Title & Actions */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
              <span>⏱️</span> تقرير متابعة الطلبات (SLA)
            </h1>
            <p className="text-muted mb-0 small">
              متابعة مؤشرات أداء الطلبات النشطة والتأخير ومعدلات الالتزام باتفاقية مستوى الخدمة
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <RefreshButton
              onClick={() => fetchReport(filters)}
              loading={loading}
              className="border shadow-sm text-primary fw-semibold"
            />
            <Button
              variant="light"
              onClick={handleExportExcel}
              disabled={filteredOrders.length === 0}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold"
            >
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>إكسيل</span>
            </Button>
            <Button
              variant="light"
              onClick={handleExportPDF}
              disabled={filteredOrders.length === 0}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-danger fw-semibold"
            >
              <i className="fa-solid fa-file-pdf fs-5"></i>
              <span>بي دي اف</span>
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => window.print()}
              className="d-flex align-items-center gap-2 rounded-3 shadow-sm px-3 py-2 fw-semibold"
            >
              <i className="fa-solid fa-print fs-5"></i>
              <span>طباعة</span>
            </Button>
          </div>
        </div>

        {/* Report Filters */}
        <ReportFilters
          config={{
            showDateRange: true,
            showEmployee: true,
            employeeLabel: "المسوق / الموظف",
            showStatus: true,
            statusLabel: "حالة الطلب",
            showSaudiOffice: true,
            showExternalOffice: true,
          }}
          filters={filters}
          onChange={setFilters}
          onApply={handleApplyFilters}
        />

        {error && <Alert variant="danger">{error}</Alert>}

        {/* Interactive KPI Cards */}
        <Row className="mb-4 g-3">
          {/* Card: All Orders */}
          <Col xs={12} sm={6} lg>
            <Card
              onClick={() => handleCardClick("all")}
              className="border-0 shadow-sm rounded-4 h-100 position-relative transition-all"
              style={{
                cursor: "pointer",
                backgroundColor: activeCardFilter === "all" ? "#eff6ff" : "#ffffff",
                border: activeCardFilter === "all" ? "2px solid #2563eb" : "1px solid #e2e8f0",
                transform: activeCardFilter === "all" ? "translateY(-2px)" : "none",
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Card.Body className="p-3 text-center d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-2 py-1 small">
                    الكل
                  </span>
                  {activeCardFilter === "all" && (
                    <Badge bg="primary" className="rounded-pill">
                      مُحدد ✓
                    </Badge>
                  )}
                </div>
                <div>
                  <h6 className="text-muted mb-1 small fw-semibold">جميع الطلبات</h6>
                  <h3 className="text-primary fw-extrabold mb-0">{totalOrdersCount}</h3>
                </div>
                <div className="text-muted mt-2 fs-8 small">اضغط لعرض الكل</div>
              </Card.Body>
            </Card>
          </Col>

          {/* Card: Late Orders */}
          <Col xs={12} sm={6} lg>
            <Card
              onClick={() => handleCardClick("late")}
              className="border-0 shadow-sm rounded-4 h-100 position-relative transition-all"
              style={{
                cursor: "pointer",
                backgroundColor: activeCardFilter === "late" ? "#fef2f2" : "#fff5f5",
                border: activeCardFilter === "late" ? "2px solid #dc2626" : "1px solid #fee2e2",
                transform: activeCardFilter === "late" ? "translateY(-2px)" : "none",
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Card.Body className="p-3 text-center d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger px-2 py-1 small">
                    متأخرة
                  </span>
                  {activeCardFilter === "late" && (
                    <Badge bg="danger" className="rounded-pill">
                      مُحدد ✓
                    </Badge>
                  )}
                </div>
                <div>
                  <h6 className="text-muted mb-1 small fw-semibold">طلبات متأخرة</h6>
                  <h3 className="text-danger fw-extrabold mb-0">{reportData.kpis.total_late || 0}</h3>
                </div>
                <div className="text-danger mt-2 fs-8 small">تصفية الطلبات المتأخرة</div>
              </Card.Body>
            </Card>
          </Col>

          {/* Card: Without Follow-up */}
          <Col xs={12} sm={6} lg>
            <Card
              onClick={() => handleCardClick("without_followup")}
              className="border-0 shadow-sm rounded-4 h-100 position-relative transition-all"
              style={{
                cursor: "pointer",
                backgroundColor: activeCardFilter === "without_followup" ? "#fffbeb" : "#fff8e6",
                border: activeCardFilter === "without_followup" ? "2px solid #d97706" : "1px solid #fef3c7",
                transform: activeCardFilter === "without_followup" ? "translateY(-2px)" : "none",
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Card.Body className="p-3 text-center d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning px-2 py-1 small">
                    بدون إجراء
                  </span>
                  {activeCardFilter === "without_followup" && (
                    <Badge bg="warning" text="dark" className="rounded-pill">
                      مُحدد ✓
                    </Badge>
                  )}
                </div>
                <div>
                  <h6 className="text-muted mb-1 small fw-semibold">بدون متابعة</h6>
                  <h3 className="text-warning fw-extrabold mb-0">{reportData.kpis.without_followup || 0}</h3>
                </div>
                <div className="text-warning mt-2 fs-8 small">تصفية بدون متابعة</div>
              </Card.Body>
            </Card>
          </Col>

          {/* Card: Exceeded SLA */}
          <Col xs={12} sm={6} lg>
            <Card
              onClick={() => handleCardClick("exceeded_sla")}
              className="border-0 shadow-sm rounded-4 h-100 position-relative transition-all"
              style={{
                cursor: "pointer",
                backgroundColor: activeCardFilter === "exceeded_sla" ? "#fff1f2" : "#fdf3f4",
                border: activeCardFilter === "exceeded_sla" ? "2px solid #e11d48" : "1px solid #ffe4e6",
                transform: activeCardFilter === "exceeded_sla" ? "translateY(-2px)" : "none",
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Card.Body className="p-3 text-center d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger px-2 py-1 small">
                    تجاوز SLA
                  </span>
                  {activeCardFilter === "exceeded_sla" && (
                    <Badge bg="danger" className="rounded-pill">
                      مُحدد ✓
                    </Badge>
                  )}
                </div>
                <div>
                  <h6 className="text-muted mb-1 small fw-semibold">تجاوزت SLA</h6>
                  <h3 className="fw-extrabold mb-0" style={{ color: "#e11d48" }}>
                    {reportData.kpis.exceeded_sla || 0}
                  </h3>
                </div>
                <div className="mt-2 fs-8 small" style={{ color: "#e11d48" }}>
                  تصفية متجاوزة SLA
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Card: Within SLA */}
          <Col xs={12} sm={6} lg>
            <Card
              onClick={() => handleCardClick("within_sla")}
              className="border-0 shadow-sm rounded-4 h-100 position-relative transition-all"
              style={{
                cursor: "pointer",
                backgroundColor: activeCardFilter === "within_sla" ? "#f0fdf4" : "#f6fef9",
                border: activeCardFilter === "within_sla" ? "2px solid #16a34a" : "1px solid #dcfce7",
                transform: activeCardFilter === "within_sla" ? "translateY(-2px)" : "none",
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Card.Body className="p-3 text-center d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge rounded-pill bg-success bg-opacity-10 text-success px-2 py-1 small">
                    ملتزمة
                  </span>
                  {activeCardFilter === "within_sla" && (
                    <Badge bg="success" className="rounded-pill">
                      مُحدد ✓
                    </Badge>
                  )}
                </div>
                <div>
                  <h6 className="text-muted mb-1 small fw-semibold">ضمن المدة</h6>
                  <h3 className="text-success fw-extrabold mb-0">{withinSlaCount}</h3>
                </div>
                <div className="text-success mt-2 fs-8 small">تصفية ضمن المدة</div>
              </Card.Body>
            </Card>
          </Col>

          {/* Card: Average Delay Days */}
          <Col xs={12} sm={6} lg>
            <Card
              className="border-0 shadow-sm rounded-4 h-100 position-relative"
              style={{
                backgroundColor: "#f0f4f8",
                borderLeft: "4px solid #0284c7",
              }}
            >
              <Card.Body className="p-3 text-center d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge rounded-pill bg-info bg-opacity-10 text-info px-2 py-1 small">
                    متوسط
                  </span>
                </div>
                <div>
                  <h6 className="text-muted mb-1 small fw-semibold">متوسط التأخير</h6>
                  <h3 className="text-info fw-extrabold mb-0">
                    {reportData.kpis.avg_delay_days || 0} <span className="fs-6 font-normal">يوم</span>
                  </h3>
                </div>
                <div className="text-muted mt-2 fs-8 small">مؤشر التأخير العام</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Active Card Filter Banner */}
        {activeCardFilter !== "all" && (
          <div className="d-flex justify-content-between align-items-center bg-white border border-primary border-opacity-25 rounded-3 p-3 mb-3 shadow-sm">
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-filter text-primary"></i>
              <span>
                يتم الآن عرض: <strong className="text-primary">{getFilterTitle()}</strong> (
                <span className="fw-bold">{sortedOrders.length}</span> طلب من إجمالي {totalOrdersCount})
              </span>
            </div>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setActiveCardFilter("all")}
              className="rounded-pill px-3"
            >
              إلغاء التصفية (عرض الكل)
            </Button>
          </div>
        )}

        {/* Data Table */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <span>📋</span> تفاصيل الطلبات ({sortedOrders.length})
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="p-4">
                <TableSkeleton rows={6} columns={11} />
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle text-center">
                  <thead className="bg-light text-secondary border-bottom">
                    <tr>
                      <SortableHeader
                        title="رقم الطلب"
                        sortKey="order_number"
                        sortConfig={sortConfig}
                        onRequestSort={requestSort}
                        className="py-3"
                      />
                      <SortableHeader
                        title="العميل"
                        sortKey="client_name"
                        sortConfig={sortConfig}
                        onRequestSort={requestSort}
                        className="py-3"
                      />
                      <SortableHeader
                        title="رقم التأشيرة"
                        sortKey="visa_number"
                        sortConfig={sortConfig}
                        onRequestSort={requestSort}
                        className="py-3"
                      />
                      <SortableHeader
                        title="حالة الطلب"
                        sortKey="status"
                        sortConfig={sortConfig}
                        onRequestSort={requestSort}
                        className="py-3"
                      />
                      <SortableHeader
                        title="المسوق / الموظف"
                        sortKey="employee_name"
                        sortConfig={sortConfig}
                        onRequestSort={requestSort}
                        className="py-3"
                      />
                      <SortableHeader
                        title="المكتب الداخلي"
                        sortKey="saudi_office"
                        sortConfig={sortConfig}
                        onRequestSort={requestSort}
                        className="py-3"
                      />
                      <SortableHeader
                        title="المكتب الخارجي"
                        sortKey="external_office"
                        sortConfig={sortConfig}
                        onRequestSort={requestSort}
                        className="py-3"
                      />
                      <SortableHeader
                        title="آخر تحديث"
                        sortKey="last_update_date"
                        sortConfig={sortConfig}
                        onRequestSort={requestSort}
                        className="py-3"
                      />
                      <SortableHeader
                        title="أيام التأخير"
                        sortKey="delay_days"
                        sortConfig={sortConfig}
                        onRequestSort={requestSort}
                        className="py-3"
                      />
                      <SortableHeader
                        title="حالة SLA"
                        sortKey="exceeded_sla"
                        sortConfig={sortConfig}
                        onRequestSort={requestSort}
                        className="py-3"
                      />
                      <th className="py-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.length > 0 ? (
                      paginatedOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="fw-bold text-primary">#{order.order_number || order.id}</td>
                          <td className="fw-semibold text-dark">
                            {order.client?.name || order.client_name || "-"}
                          </td>
                          <td>
                            <Badge bg="light" text="dark" className="border px-2 py-1 font-monospace">
                              {order.visa_number || "-"}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="secondary" className="px-2 py-1">
                              {order.status?.name || order.status_name || order.status || "غير محدد"}
                            </Badge>
                          </td>
                          <td className="fw-semibold">
                            {order.employee?.name || order.employee_name || "-"}
                          </td>
                          <td className="text-muted">{order.saudi_office || "-"}</td>
                          <td className="text-muted">{order.external_office || "-"}</td>
                          <td>{order.last_update_date || "-"}</td>
                          <td>
                            {order.delay_days > 0 ? (
                              <Badge bg="danger" className="px-2 py-1 rounded-pill">
                                {order.delay_days} يوم تأخير
                              </Badge>
                            ) : (
                              <Badge bg="success" className="px-2 py-1 rounded-pill">
                                في الموعد (0)
                              </Badge>
                            )}
                          </td>
                          <td>
                            {order.exceeded_sla ? (
                              <Badge bg="danger" className="px-3 py-2 rounded-pill">
                                مخالف لـ SLA
                              </Badge>
                            ) : (
                              <Badge bg="success" className="px-3 py-2 rounded-pill">
                                ضمن المدة ✓
                              </Badge>
                            )}
                          </td>
                          <td className="text-center">
                            <Button
                              variant="light"
                              size="sm"
                              className="rounded-circle shadow-sm border text-primary d-inline-flex align-items-center justify-content-center"
                              style={{ width: "36px", height: "36px" }}
                              onClick={() => handleViewOrderDetails(order)}
                              title="عرض تفاصيل الطلب"
                            >
                              <i className="fa-solid fa-eye fs-6"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="text-center py-5 text-muted">
                          <i className="fa-solid fa-folder-open display-6 text-muted mb-3 d-block"></i>
                          <h6 className="fw-semibold">لا توجد طلبات تطابق الفلاتر المحددة.</h6>
                          {activeCardFilter !== "all" && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="mt-2"
                              onClick={() => setActiveCardFilter("all")}
                            >
                              عرض جميع الطلبات
                            </Button>
                          )}
                        </td>
                      </tr>
                    )}
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
        <Modal
          show={showDetailsModal}
          onHide={() => setShowDetailsModal(false)}
          size="lg"
          centered
          dir="rtl"
          scrollable
        >
          <Modal.Header closeButton className="border-bottom py-3 bg-light">
            <div className="d-flex align-items-center gap-2">
              <div
                className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px" }}
              >
                <i className="fa-solid fa-file-invoice fs-5"></i>
              </div>
              <div>
                <Modal.Title className="fw-bold fs-5 mb-0">
                  تفاصيل الطلب #{selectedOrder?.id || selectedOrder?.order_number}
                </Modal.Title>
                <span className="small text-muted">
                  {selectedOrder?.client?.name || selectedOrder?.client_name || "عميل غير محدد"}
                </span>
              </div>
            </div>
          </Modal.Header>

          <Modal.Body className="p-4">
            {detailsLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted small">جاري تحميل كامل بيانات الطلب...</p>
              </div>
            ) : selectedOrder ? (
              <div>
                {/* SLA & Status Overview */}
                <div className="row g-2 mb-4">
                  <div className="col-sm-3 col-6">
                    <div className="p-3 rounded-3 bg-light border text-center">
                      <span className="small text-muted d-block mb-1">حالة الطلب</span>
                      <Badge bg="secondary" className="px-2 py-1">
                        {selectedOrder?.status?.name || selectedOrder?.status_name || selectedOrder?.status || "غير محدد"}
                      </Badge>
                    </div>
                  </div>
                  <div className="col-sm-3 col-6">
                    <div className="p-3 rounded-3 bg-light border text-center">
                      <span className="small text-muted d-block mb-1">حالة SLA</span>
                      {selectedOrder?.exceeded_sla ? (
                        <Badge bg="danger" className="px-2 py-1">مخالف لـ SLA</Badge>
                      ) : (
                        <Badge bg="success" className="px-2 py-1">ضمن المدة ✓</Badge>
                      )}
                    </div>
                  </div>
                  <div className="col-sm-3 col-6">
                    <div className="p-3 rounded-3 bg-light border text-center">
                      <span className="small text-muted d-block mb-1">أيام التأخير</span>
                      <span
                        className={
                          Number(selectedOrder?.delay_days || 0) > 0
                            ? "text-danger fw-bold fs-5"
                            : "text-success fw-bold fs-5"
                        }
                      >
                        {selectedOrder?.delay_days || 0} يوم
                      </span>
                    </div>
                  </div>
                  <div className="col-sm-3 col-6">
                    <div className="p-3 rounded-3 bg-light border text-center">
                      <span className="small text-muted d-block mb-1">آخر تحديث</span>
                      <span className="fw-semibold small">
                        {selectedOrder?.last_update_date || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client & Visa Data */}
                <div className="card border mb-3 rounded-3 shadow-none">
                  <div className="card-header bg-white py-2 px-3 fw-bold small text-primary d-flex align-items-center gap-2">
                    <i className="fa-solid fa-user"></i>
                    <span>بيانات العميل وصاحب التأشيرة</span>
                  </div>
                  <div className="card-body p-3">
                    <div className="row g-3">
                      <div className="col-md-6 col-12">
                        <div className="small text-muted">اسم العميل:</div>
                        <div className="fw-semibold">
                          {selectedOrder?.client?.name || selectedOrder?.client_name || "-"}
                        </div>
                      </div>
                      <div className="col-md-6 col-12">
                        <div className="small text-muted">هاتف العميل:</div>
                        <div className="fw-semibold font-monospace">
                          {selectedOrder?.client?.phone || "-"}
                        </div>
                      </div>
                      <div className="col-md-6 col-12">
                        <div className="small text-muted">اسم صاحب التأشيرة:</div>
                        <div className="fw-semibold">{selectedOrder?.visa_holder_name || "-"}</div>
                      </div>
                      <div className="col-md-6 col-12">
                        <div className="small text-muted">رقم هاتف صاحب التأشيرة:</div>
                        <div className="fw-semibold font-monospace">
                          {selectedOrder?.visa_holder_phone || "-"}
                        </div>
                      </div>
                      <div className="col-md-4 col-6">
                        <div className="small text-muted">رقم التأشيرة:</div>
                        <div className="fw-semibold font-monospace">{selectedOrder?.visa_number || "-"}</div>
                      </div>
                      <div className="col-md-4 col-6">
                        <div className="small text-muted">رقم الهوية / الإقامة:</div>
                        <div className="fw-semibold font-monospace">{selectedOrder?.id_number || "-"}</div>
                      </div>
                      <div className="col-md-4 col-6">
                        <div className="small text-muted">المهنة:</div>
                        <div className="fw-semibold">{selectedOrder?.profession || "-"}</div>
                      </div>
                      <div className="col-md-4 col-6">
                        <div className="small text-muted">الجنسية:</div>
                        <div className="fw-semibold">{selectedOrder?.nationality || "-"}</div>
                      </div>
                      <div className="col-md-4 col-6">
                        <div className="small text-muted">رقم الجواز:</div>
                        <div className="fw-semibold font-monospace">{selectedOrder?.passport_number || "-"}</div>
                      </div>
                      <div className="col-md-4 col-6">
                        <div className="small text-muted">جهة القدوم:</div>
                        <div className="fw-semibold">{selectedOrder?.arrival_destination || "-"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Office & Marketer Details */}
                <div className="card border mb-3 rounded-3 shadow-none">
                  <div className="card-header bg-white py-2 px-3 fw-bold small text-primary d-flex align-items-center gap-2">
                    <i className="fa-solid fa-briefcase"></i>
                    <span>المكاتب والمسوق والعقود</span>
                  </div>
                  <div className="card-body p-3">
                    <div className="row g-3">
                      <div className="col-md-6 col-12">
                        <div className="small text-muted">المسوق / الموظف:</div>
                        <div className="fw-semibold">
                          {selectedOrder?.employee?.name || selectedOrder?.employee_name || "-"}
                        </div>
                      </div>
                      <div className="col-md-6 col-12">
                        <div className="small text-muted">نوع الخدمة:</div>
                        <div className="fw-semibold">{selectedOrder?.service_type || "-"}</div>
                      </div>
                      <div className="col-md-6 col-12">
                        <div className="small text-muted">المكتب الداخلي:</div>
                        <div className="fw-semibold">
                          {selectedOrder?.saudi_office?.name || selectedOrder?.saudi_office || "-"}
                        </div>
                      </div>
                      <div className="col-md-6 col-12">
                        <div className="small text-muted">المكتب الخارجي:</div>
                        <div className="fw-semibold">
                          {selectedOrder?.external_office?.name || selectedOrder?.external_office || "-"}
                        </div>
                      </div>
                      <div className="col-md-4 col-6">
                        <div className="small text-muted">تاريخ العقد:</div>
                        <div className="fw-semibold">{selectedOrder?.contract_date || "-"}</div>
                      </div>
                      <div className="col-md-4 col-6">
                        <div className="small text-muted">رقم عقد مساند:</div>
                        <div className="fw-semibold font-monospace">
                          {selectedOrder?.musaned_contract_number || "-"}
                        </div>
                      </div>
                      <div className="col-md-4 col-6">
                        <div className="small text-muted">رقم عقد التوثيق:</div>
                        <div className="fw-semibold font-monospace">
                          {selectedOrder?.authentication_contract_number || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financials */}
                <div className="card border rounded-3 shadow-none">
                  <div className="card-header bg-white py-2 px-3 fw-bold small text-primary d-flex align-items-center gap-2">
                    <i className="fa-solid fa-sack-dollar"></i>
                    <span>البيانات المالية</span>
                  </div>
                  <div className="card-body p-3">
                    <div className="row g-3 text-center">
                      <div className="col-4">
                        <div className="small text-muted">إجمالي السعر</div>
                        <div className="fw-bold fs-6 text-dark">
                          {selectedOrder?.total_price != null
                            ? `${Number(selectedOrder.total_price).toLocaleString()} ر.س`
                            : "-"}
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="small text-muted">سداد مساند</div>
                        <div className="fw-bold fs-6 text-success">
                          {selectedOrder?.musaned_paid != null
                            ? `${Number(selectedOrder.musaned_paid).toLocaleString()} ر.س`
                            : "-"}
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="small text-muted">الرصيد المتبقي</div>
                        <div className="fw-bold fs-6 text-danger">
                          {selectedOrder?.price_difference != null
                            ? `${Number(selectedOrder.price_difference).toLocaleString()} ر.س`
                            : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder?.notes && (
                  <div className="alert alert-light border mt-3 mb-0 p-3">
                    <strong className="d-block small text-muted mb-1">ملاحظات:</strong>
                    <span>{selectedOrder.notes}</span>
                  </div>
                )}
              </div>
            ) : null}
          </Modal.Body>

          <Modal.Footer className="border-top py-2 bg-light">
            <Button variant="secondary" size="sm" onClick={() => setShowDetailsModal(false)}>
              إغلاق
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default OrderFollowUpReport;
