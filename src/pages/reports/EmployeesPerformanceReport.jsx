import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Table, Badge, Button, ProgressBar, Form, Modal } from "react-bootstrap";
import { getEmployeesPerformanceReport, getSaudiOffices } from "../../services/apiService";
import RefreshButton from "../../components/common/RefreshButton";
import TableSkeleton from "../../components/common/TableSkeleton";
import SortableHeader from "../../components/common/SortableHeader";
import { useSortableData } from "../../hooks/useSortableData";
import { exportToExcel } from "../../utils/excelHelper";
import { exportToPDF } from "../../utils/pdfHelper";

const EmployeesPerformanceReport = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    total_employees: 0,
    active_employees: 0,
    total_period_orders: 0,
    total_period_sales: 0,
    avg_orders_per_emp: 0,
  });
  const [employees, setEmployees] = useState([]);
  const [saudiOffices, setSaudiOffices] = useState([]);

  // Modal State
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState(null);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  const { items: sortedEmployees, requestSort, sortConfig } = useSortableData(employees);
  const { items: sortedModalOrders, requestSort: requestModalSort, sortConfig: modalSortConfig } = useSortableData(selectedEmployeeForModal?.orders || []);

  // Filters state
  const [periodPreset, setPeriodPreset] = useState("all"); // 'all', 'today', 'this_week', 'this_month', 'this_year', 'custom'
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [saudiOfficeId, setSaudiOfficeId] = useState("");

  useEffect(() => {
    fetchSaudiOffices();
  }, []);

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo, saudiOfficeId]);

  const fetchSaudiOffices = async () => {
    try {
      const res = await getSaudiOffices();
      const officesData = res.data?.data || res.data || [];
      if (Array.isArray(officesData)) {
        setSaudiOffices(officesData);
      }
    } catch (err) {
      console.error("Error fetching Saudi offices:", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (saudiOfficeId) params.saudi_office_id = saudiOfficeId;

      const res = await getEmployeesPerformanceReport(params);
      if (res.data) {
        setKpis(res.data.kpis || {});
        setEmployees(res.data.employees || []);
      }
    } catch (err) {
      console.error("Error fetching employees performance report:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Preset Period Selection
  const handlePresetChange = (preset) => {
    setPeriodPreset(preset);
    const today = new Date();
    const formatDate = (d) => d.toISOString().split("T")[0];

    if (preset === "all") {
      setDateFrom("");
      setDateTo("");
    } else if (preset === "today") {
      const str = formatDate(today);
      setDateFrom(str);
      setDateTo(str);
    } else if (preset === "this_week") {
      const first = new Date(today);
      const day = first.getDay(); // 0 is Sun, 6 is Sat
      const diff = first.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday or Sunday
      const startOfWeek = new Date(first.setDate(diff));
      setDateFrom(formatDate(startOfWeek));
      setDateTo(formatDate(new Date()));
    } else if (preset === "this_month") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateFrom(formatDate(startOfMonth));
      setDateTo(formatDate(today));
    } else if (preset === "this_year") {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      setDateFrom(formatDate(startOfYear));
      setDateTo(formatDate(today));
    }
  };

  const handleOpenOrdersModal = (employee) => {
    setSelectedEmployeeForModal(employee);
    setShowOrdersModal(true);
  };

  const handleExportExcel = () => {
    const dataToExport = employees.map((emp) => ({
      name: emp.name,
      office_name: emp.office_name,
      position: emp.position,
      total_orders: emp.total_orders,
      orders_share: `${emp.orders_share_percentage}%`,
      completed_orders: emp.completed_orders,
      active_orders: emp.active_orders,
      total_sales: emp.total_sales,
      sales_share: `${emp.sales_share_percentage}%`,
      completion_rate: `${emp.completion_rate}%`,
    }));

    const columns = [
      { header: "اسم الموظف", key: "name" },
      { header: "المكتب التابع له", key: "office_name" },
      { header: "المسمى الوظيفي", key: "position" },
      { header: "عقود الفترة", key: "total_orders" },
      { header: "نسبة التغطية من العقود %", key: "orders_share" },
      { header: "العقود المكتملة", key: "completed_orders" },
      { header: "العقود النشطة", key: "active_orders" },
      { header: "إجمالي المبيعات (ر.س)", key: "total_sales" },
      { header: "نسبة المبيعات %", key: "sales_share" },
      { header: "نسبة الإنجاز %", key: "completion_rate" },
    ];
    exportToExcel(dataToExport, columns, "تقرير_أداء_الموظفين_والمسوقين.xlsx");
  };

  const handleExportPDF = () => {
    const dataToExport = employees.map((emp) => ({
      name: emp.name,
      office_name: emp.office_name,
      position: emp.position,
      total_orders: emp.total_orders,
      orders_share: `${emp.orders_share_percentage}%`,
      completed_orders: emp.completed_orders,
      active_orders: emp.active_orders,
      total_sales: `${(emp.total_sales || 0).toLocaleString()} ر.س`,
      completion_rate: `${emp.completion_rate}%`,
    }));

    const columns = [
      { header: "اسم الموظف", key: "name" },
      { header: "المكتب", key: "office_name" },
      { header: "الوظيفة", key: "position" },
      { header: "العقود", key: "total_orders" },
      { header: "المساهمة %", key: "orders_share" },
      { header: "المكتملة", key: "completed_orders" },
      { header: "النشطة", key: "active_orders" },
      { header: "المبيعات", key: "total_sales" },
      { header: "الإنجاز %", key: "completion_rate" },
    ];
    exportToPDF(dataToExport, columns, "تقرير_أداء_الموظفين_والمسوقين.pdf");
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "24px" }}>
      <Container fluid>
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
              <span>👥</span> تقرير أداء الموظفين والمسوقين
            </h1>
            <p className="text-muted mb-0 small">
              تحليل تفصيلي لإنتاجية ومبيعات ونسبة مساهمة الموظفين والمسوقين في عقود ومبيعات الفترة المحددة
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

        {/* Filter Section Card */}
        <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          <Card.Body className="p-4 bg-white">
            <div className="d-flex align-items-center gap-2 mb-3 text-dark fw-bold border-bottom pb-2">
              <i className="fa-solid fa-filter text-primary"></i>
              <span>فلاتر التصفية والمدد الزمنية</span>
            </div>
            
            <Row className="g-3 align-items-end">
              {/* Presets */}
              <Col xs={12} lg={5}>
                <Form.Label className="small fw-semibold text-secondary mb-2">الفترة الزمنية السريعة</Form.Label>
                <div className="d-flex flex-wrap gap-1 bg-light p-1 rounded-3 border">
                  {[
                    { id: "all", label: "الكل" },
                    { id: "today", label: "اليوم" },
                    { id: "this_week", label: "هذا الأسبوع" },
                    { id: "this_month", label: "هذا الشهر" },
                    { id: "this_year", label: "هذا العام" },
                    { id: "custom", label: "مخصص" },
                  ].map((preset) => (
                    <Button
                      key={preset.id}
                      variant={periodPreset === preset.id ? "primary" : "light"}
                      size="sm"
                      className={`flex-grow-1 border-0 rounded-2 fw-semibold ${periodPreset === preset.id ? "shadow-sm" : "bg-transparent text-secondary"}`}
                      onClick={() => handlePresetChange(preset.id)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </Col>

              {/* Date From */}
              <Col xs={12} sm={6} md={3} lg={2}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">من تاريخ</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPeriodPreset("custom");
                    }}
                    className="rounded-3 shadow-none border"
                  />
                </Form.Group>
              </Col>

              {/* Date To */}
              <Col xs={12} sm={6} md={3} lg={2}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">إلى تاريخ</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPeriodPreset("custom");
                    }}
                    className="rounded-3 shadow-none border"
                  />
                </Form.Group>
              </Col>

              {/* Office Filter */}
              <Col xs={12} sm={12} md={6} lg={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">المكتب السعودي</Form.Label>
                  <Form.Select
                    value={saudiOfficeId}
                    onChange={(e) => setSaudiOfficeId(e.target.value)}
                    className="rounded-3 shadow-none border"
                  >
                    <option value="">جميع المكاتب السعودية</option>
                    {saudiOffices.map((office) => (
                      <option key={office.id} value={office.id}>
                        {office.name} {office.city ? `(${office.city})` : ""}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* KPI Cards */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">إجمالي عقود الفترة</div>
                  <h2 className="mb-0 fw-extrabold display-6">{kpis.total_period_orders || 0} <span className="fs-6 font-normal">عقد</span></h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-file-contract fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">إجمالي مبيعات الفترة</div>
                  <h3 className="mb-0 fw-extrabold fs-4">{(kpis.total_period_sales || 0).toLocaleString()} <span className="fs-7 font-normal">ر.س</span></h3>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-sack-dollar fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">الموظفين المشاركين</div>
                  <h2 className="mb-0 fw-extrabold display-6">{kpis.active_employees || 0} <span className="fs-6 font-normal">/ {kpis.total_employees || 0}</span></h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-users-gear fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">متوسط العقود / موظف</div>
                  <h2 className="mb-0 fw-extrabold display-6">{kpis.avg_orders_per_emp || 0} <span className="fs-6 font-normal">عقد</span></h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-chart-user fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Body className="p-0">
            {loading ? (
              <div className="p-4"><TableSkeleton rows={5} columns={9} /></div>
            ) : (
              <div className="table-responsive">
                <Table hover align="middle" className="mb-0 text-center">
                  <thead className="bg-light text-secondary border-bottom">
                    <tr>
                      <SortableHeader title="اسم الموظف / المسوق" sortKey="name" sortConfig={sortConfig} onRequestSort={requestSort} className="py-3" />
                      <SortableHeader title="المكتب" sortKey="office_name" sortConfig={sortConfig} onRequestSort={requestSort} className="py-3" />
                      <SortableHeader title="المسمى الوظيفي" sortKey="position" sortConfig={sortConfig} onRequestSort={requestSort} className="py-3" />
                      <SortableHeader title="عقود الفترة" sortKey="total_orders" sortConfig={sortConfig} onRequestSort={requestSort} className="py-3" />
                      <SortableHeader title="نسبة المساهمة %" sortKey="orders_share_percentage" sortConfig={sortConfig} onRequestSort={requestSort} className="py-3" style={{ minWidth: "150px" }} />
                      <SortableHeader title="المكتملة" sortKey="completed_orders" sortConfig={sortConfig} onRequestSort={requestSort} className="py-3" />
                      <SortableHeader title="النشطة" sortKey="active_orders" sortConfig={sortConfig} onRequestSort={requestSort} className="py-3" />
                      <SortableHeader title="إجمالي المبيعات" sortKey="total_sales" sortConfig={sortConfig} onRequestSort={requestSort} className="py-3" />
                      <SortableHeader title="معدل الإنجاز %" sortKey="completion_rate" sortConfig={sortConfig} onRequestSort={requestSort} className="py-3" style={{ minWidth: "150px" }} />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-5 text-muted">
                          لا توجد بيانات موظفين مطابقة للفلاتر المحددة
                        </td>
                      </tr>
                    ) : (
                      sortedEmployees.map((emp, idx) => (
                        <tr key={emp.id || idx}>
                          <td className="fw-bold text-dark text-end ps-3">
                            <div className="d-flex align-items-center gap-2">
                              <div className="avatar-circle bg-primary-subtle text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px", fontSize: "0.9rem" }}>
                                {emp.name.charAt(0)}
                              </div>
                              <div>
                                <div>{emp.name}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="small text-muted">{emp.office_name}</span></td>
                          <td><Badge bg="secondary" className="px-2 py-1 bg-opacity-75">{emp.position}</Badge></td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="rounded-pill px-3 fw-bold"
                              onClick={() => handleOpenOrdersModal(emp)}
                            >
                              {emp.total_orders} عقود 🔍
                            </Button>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2 justify-content-center">
                              <ProgressBar now={emp.orders_share_percentage} variant="info" style={{ width: "60px", height: "6px" }} className="rounded-pill" />
                              <span className="small fw-bold">{emp.orders_share_percentage}%</span>
                            </div>
                          </td>
                          <td><Badge bg="success" className="px-2 py-1">{emp.completed_orders}</Badge></td>
                          <td><Badge bg="warning" text="dark" className="px-2 py-1">{emp.active_orders}</Badge></td>
                          <td className="fw-bold text-success">{(emp.total_sales || 0).toLocaleString()} ر.س</td>
                          <td>
                            <div className="d-flex align-items-center gap-2 justify-content-center">
                              <ProgressBar now={emp.completion_rate} variant={emp.completion_rate >= 80 ? "success" : emp.completion_rate >= 50 ? "warning" : "danger"} style={{ width: "60px", height: "6px" }} className="rounded-pill" />
                              <span className="small fw-bold">{emp.completion_rate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Orders Details Modal */}
        <Modal
          show={showOrdersModal}
          onHide={() => setShowOrdersModal(false)}
          size="xl"
          centered
          dir="rtl"
        >
          <Modal.Header closeButton className="border-0 pt-4 px-4 bg-light">
            <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center gap-2">
              <span>📜</span> تفاصيل عقود الموظف: {selectedEmployeeForModal?.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {selectedEmployeeForModal && (
              <>
                <div className="bg-light p-3 rounded-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-2 border">
                  <div>
                    <span className="text-muted ms-2">المسمى:</span>
                    <strong className="text-dark me-3">{selectedEmployeeForModal.position}</strong>
                    <span className="text-muted ms-2">المكتب:</span>
                    <strong className="text-dark">{selectedEmployeeForModal.office_name}</strong>
                  </div>
                  <div className="d-flex gap-3">
                    <Badge bg="primary" className="px-3 py-2 fs-7">
                      إجمالي العقود: {selectedEmployeeForModal.total_orders}
                    </Badge>
                    <Badge bg="success" className="px-3 py-2 fs-7">
                      إجمالي القيمة: {(selectedEmployeeForModal.total_sales || 0).toLocaleString()} ر.س
                    </Badge>
                  </div>
                </div>

                {sortedModalOrders.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    لا توجد عقود مسجلة لهذا الموظف في الفترة المحددة
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover align="middle" className="mb-0 text-center border">
                      <thead className="bg-light text-secondary">
                        <tr>
                          <SortableHeader title="# العقد" sortKey="id" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                          <SortableHeader title="اسم العميل / المستفيد" sortKey="client_name" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                          <SortableHeader title="رقم التأشيرة" sortKey="visa_number" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                          <SortableHeader title="تاريخ العقد" sortKey="contract_date" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                          <SortableHeader title="المكتب السعودي" sortKey="saudi_office" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                          <SortableHeader title="المكتب الخارجي" sortKey="external_office" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                          <SortableHeader title="نوع الخدمة" sortKey="service_type" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                          <SortableHeader title="الحالة" sortKey="status" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                          <SortableHeader title="القيمة (ر.س)" sortKey="total_price" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                        </tr>
                      </thead>
                      <tbody>
                        {sortedModalOrders.map((order, i) => (
                          <tr key={order.id || i}>
                            <td className="fw-bold">#{order.id}</td>
                            <td className="fw-semibold text-dark">{order.client_name}</td>
                            <td><code>{order.visa_number}</code></td>
                            <td className="small text-muted">{order.contract_date}</td>
                            <td className="small">{order.saudi_office}</td>
                            <td className="small">{order.external_office}</td>
                            <td className="small"><Badge bg="light" className="text-dark border">{order.service_type}</Badge></td>
                            <td>
                              <Badge bg={order.status === 'completed' || order.status === 'مكتمل' ? 'success' : order.status === 'cancelled' || order.status === 'ملغي' ? 'danger' : 'warning'} className="px-2 py-1">
                                {order.status}
                              </Badge>
                            </td>
                            <td className="fw-bold text-success">{(order.total_price || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="secondary" onClick={() => setShowOrdersModal(false)} className="rounded-3 px-4">
              إغلاق
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default EmployeesPerformanceReport;
