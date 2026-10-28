import React, { useState, useEffect, useMemo } from "react";
import { Container, Card, Row, Col, Table, Badge, Button, Spinner } from "react-bootstrap";
import { getCompletedOrdersReport, getEmployees, getSaudiOffices, getExternalOffices, getClients } from "../../services/apiService";
import ReportFilters from "../../components/ReportFilters";
import RefreshButton from "../../components/common/RefreshButton";
import TableSkeleton from "../../components/common/TableSkeleton";
import SortableHeader from "../../components/common/SortableHeader";
import SortableTable from "../../components/common/SortableTable";
import { useSortableData } from "../../hooks/useSortableData";
import { exportToExcel } from "../../utils/excelHelper";
import { exportToPDF } from "../../utils/pdfHelper";
import PaginationComponent from "../../components/common/Pagination";
import OrderDetailsModal from "../../components/Order/OrderDetailsModal";

const CompletedOrdersReport = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    total_completed: 0,
    total_revenue: 0,
    avg_completion_days: 0,
    sla_compliance_rate: 100,
  });
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({});

  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [saudiOffices, setSaudiOffices] = useState([]);
  const [externalOffices, setExternalOffices] = useState([]);

  // Modal State for Order Details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const { items: sortedOrders, requestSort, sortConfig } = useSortableData(orders);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedOrders.slice(start, start + itemsPerPage);
  }, [sortedOrders, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchReportData(filters);
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const [empRes, clientRes, saudiRes, extRes] = await Promise.all([
        getEmployees({ per_page: 200 }),
        getClients({ per_page: 500 }),
        getSaudiOffices({ all: 1, per_page: 500 }),
        getExternalOffices({ all: 1, per_page: 500 }),
      ]);
      setEmployees(empRes.data?.data || empRes.data || []);
      setClients(clientRes.data?.data || clientRes.data || []);
      setSaudiOffices(Array.isArray(saudiRes.data?.data) ? saudiRes.data.data : Array.isArray(saudiRes.data) ? saudiRes.data : []);
      setExternalOffices(Array.isArray(extRes.data?.data) ? extRes.data.data : Array.isArray(extRes.data) ? extRes.data : []);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  const fetchReportData = async (filterParams = {}) => {
    setLoading(true);
    try {
      const res = await getCompletedOrdersReport(filterParams);
      if (res.data) {
        setKpis(res.data.kpis || {});
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch completed orders report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const columns = [
      { header: "رقم الطلب", key: "id" },
      { header: "رقم التأشيرة", key: "visa_number" },
      { header: "المندوب / العميل", key: "client_name" },
      { header: "المسوق / الموظف", key: "employee_name" },
      { header: "المكتب السعودي", key: "saudi_office" },
      { header: "المكتب الخارجي", key: "external_office" },
      { header: "نوع الخدمة", key: "service_type" },
      { header: "المبلغ (ر.س)", key: "total_price" },
      { header: "مدة الإنجاز (يوم)", key: "completion_days" },
      { header: "تاريخ الإكتمال", key: "completed_at" },
    ];
    exportToExcel(sortedOrders, columns, "تقرير_الطلبات_المكتملة.xlsx");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "رقم الطلب", key: "id" },
      { header: "رقم التأشيرة", key: "visa_number" },
      { header: "المندوب / العميل", key: "client_name" },
      { header: "المسوق / الموظف", key: "employee_name" },
      { header: "المكتب السعودي", key: "saudi_office" },
      { header: "المكتب الخارجي", key: "external_office" },
      { header: "نوع الخدمة", key: "service_type" },
      { header: "المبلغ (ر.س)", key: "total_price" },
      { header: "مدة الإنجاز (يوم)", key: "completion_days" },
      { header: "تاريخ الإكتمال", key: "completed_at" },
    ];
    exportToPDF(sortedOrders, columns, "تقرير_الطلبات_المكتملة.pdf");
  };

  const tableColumns = useMemo(
    () => [
      { id: "id", label: "#", width: "70px" },
      { id: "visa_number", label: "رقم التأشيرة", width: "130px" },
      { id: "client_name", label: "المندوب / العميل", width: "180px" },
      { id: "employee_name", label: "المسوق / الموظف", width: "160px" },
      { id: "saudi_office", label: "المكتب السعودي", width: "140px" },
      { id: "external_office", label: "المكتب الخارجي", width: "140px" },
      { id: "service_type", label: "نوع الخدمة", width: "130px" },
      { id: "total_price", label: "إجمالي المبلغ", width: "130px" },
      { id: "completion_days", label: "مدة الإنجاز", width: "110px" },
      { id: "completed_at", label: "تاريخ الإكتمال", width: "120px" },
      { id: "within_sla", label: "حالة SLA", width: "130px" },
      { id: "actions", label: "الإجراءات", width: "90px", sortable: false },
    ],
    []
  );

  const renderCell = (order, columnId) => {
    switch (columnId) {
      case "id":
        return <td className="fw-bold">{order.id}</td>;
      case "visa_number":
        return (
          <td>
            <Badge bg="secondary" className="px-2 py-1 font-monospace">
              {order.visa_number}
            </Badge>
          </td>
        );
      case "client_name":
        return <td className="fw-semibold text-dark">{order.client_name}</td>;
      case "employee_name":
        return <td className="text-secondary small">{order.employee_name}</td>;
      case "saudi_office":
        return <td className="text-muted">{order.saudi_office}</td>;
      case "external_office":
        return <td className="text-muted">{order.external_office}</td>;
      case "service_type":
        return (
          <td>
            <Badge bg="info" className="bg-opacity-10 text-info px-2 py-1">
              {order.service_type}
            </Badge>
          </td>
        );
      case "total_price":
        return (
          <td className="fw-bold text-success font-monospace">
            {(order.total_price || 0).toLocaleString()} ر.س
          </td>
        );
      case "completion_days":
        return <td className="fw-semibold">{order.completion_days} يوم</td>;
      case "completed_at":
        return <td className="text-muted">{order.completed_at}</td>;
      case "within_sla":
        return (
          <td>
            {order.within_sla ? (
              <Badge bg="success" className="px-3 py-2 rounded-pill">
                ضمن SLA ✓
              </Badge>
            ) : (
              <Badge bg="danger" className="px-3 py-2 rounded-pill">
                متأخر عن SLA ✕
              </Badge>
            )}
          </td>
        );
      case "actions":
        return (
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
        );
      default:
        return <td>-</td>;
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "24px" }} dir="rtl">
      <Container fluid>
        {/* Header Title & Actions */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
              <span>✅</span> تقرير الطلبات المكتملة
            </h1>
            <p className="text-muted mb-0 small">
              متابعة وتحليل الطلبات المنجزة بالكامل ومؤشرات أداء الإنجاز والالتزام بـ SLA
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <RefreshButton onClick={() => fetchReportData(filters)} loading={loading} className="border shadow-sm text-primary fw-semibold" />
            <Button
              variant="light"
              onClick={handleExportExcel}
              disabled={orders.length === 0}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold"
            >
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>إكسيل</span>
            </Button>
            <Button
              variant="light"
              onClick={handleExportPDF}
              disabled={orders.length === 0}
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

        {/* KPI Cards Section */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">إجمالي الطلبات المكتملة</div>
                  <h2 className="mb-0 fw-extrabold display-6">{kpis.total_completed || 0}</h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-circle-check fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#fff" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">إجمالي المبالغ المنجزة</div>
                  <h2 className="mb-0 fw-extrabold fs-2">{(kpis.total_revenue || 0).toLocaleString()} <span className="fs-6 font-normal">ر.س</span></h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-sack-dollar fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", color: "#fff" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">متوسط مدة الإنجاز</div>
                  <h2 className="mb-0 fw-extrabold display-6">{kpis.avg_completion_days || 0} <span className="fs-6">يوم</span></h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-clock-history fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", color: "#fff" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">نسبة الالتزام بـ SLA</div>
                  <h2 className="mb-0 fw-extrabold display-6">{kpis.sla_compliance_rate || 100}%</h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-chart-line fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters Component */}
        <ReportFilters
          config={{
            showDateRange: true,
            showSaudiOffice: true,
            showExternalOffice: true,
            showClient: true,
            clientLabel: "المندوب / العميل",
            showEmployee: true,
            employeeLabel: "المسوق / الموظف",
          }}
          filters={filters}
          onChange={setFilters}
          onApply={setFilters}
          onFilter={setFilters}
          clients={clients}
          employees={employees}
          saudiOffices={saudiOffices}
          externalOffices={externalOffices}
        />

        {/* Orders Table */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Body className="p-0">
            {loading ? (
              <div className="p-4">
                <TableSkeleton rows={5} columns={9} />
              </div>
            ) : sortedOrders.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa-solid fa-folder-open display-4 text-muted mb-3 d-block"></i>
                <h5 className="text-secondary fw-semibold">لا توجد طلبات مكتملة تطابق فلاتر البحث</h5>
              </div>
            ) : (
              <SortableTable
                data={paginatedOrders}
                columns={tableColumns}
                storageKey="completed_orders_report_columns"
                renderCell={renderCell}
                sortConfig={sortConfig}
                onRequestSort={requestSort}
                emptyMessage="لا توجد طلبات مكتملة تطابق فلاتر البحث"
                tableClassName="mb-0 text-center"
              />
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

export default CompletedOrdersReport;
