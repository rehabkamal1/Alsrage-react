import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Form,
  InputGroup,
  ButtonGroup,
  Collapse,
  ProgressBar,
} from "react-bootstrap";
import {
  getFinancialCollectionsReport,
  getSaudiOffices,
  getEmployees,
  getClients,
} from "../../services/apiService";
import RefreshButton from "../../components/common/RefreshButton";
import TableSkeleton from "../../components/common/TableSkeleton";
import { exportToExcel } from "../../utils/excelHelper";
import { exportToPDF } from "../../utils/pdfHelper";
import PaginationComponent from "../../components/common/Pagination";
import OrderDetailsModal from "../../components/Order/OrderDetailsModal";
import { OrderStatusBadge } from "../../utils/statusHelper";

const FinancialCollectionsReport = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    total_contract_value: 0,
    total_collected: 0,
    total_outstanding: 0,
    collection_rate: 0,
    total_orders: 0,
    total_clients: 0,
    total_marketers: 0,
  });


  // Raw data from API
  const [orders, setOrders] = useState([]);
  const [clientsSummary, setClientsSummary] = useState([]);
  const [marketersSummary, setMarketersSummary] = useState([]);
  const [saudiOffices, setSaudiOffices] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);

  // Report Target & View Mode
  // target: 'client' (تقارير العملاء / المناديب) | 'marketer' (تقارير المسوقين / الموظفين)
  const [reportTarget, setReportTarget] = useState("client");
  // mode: 'detailed' (تفصيلي) | 'summary' (إجمالي)
  const [reportMode, setReportMode] = useState("detailed");

  // Filter States
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedSaudiOffice, setSelectedSaudiOffice] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [contractStatusFilter, setContractStatusFilter] = useState("musaned_paid");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Expandable state for Marketer Detailed view
  const [expandedMarketers, setExpandedMarketers] = useState({});

  // Modal State for Order Details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Statement Mode Detection (when filtering by client/delegate or marketer/employee)
  const isStatementMode = Boolean(selectedClient || selectedEmployee);
  const hideOrderStatus = isStatementMode;

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination on tab/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    reportTarget,
    reportMode,
    paymentStatusFilter,
    searchQuery,
    selectedSaudiOffice,
    selectedClient,
    selectedEmployee,
    contractStatusFilter,
  ]);

  useEffect(() => {
    fetchInitialOptions();
    fetchData();
  }, []);

  const fetchInitialOptions = async () => {
    try {
      const [saudiRes, empRes, clientRes] = await Promise.allSettled([
        getSaudiOffices({ all: 1, per_page: 500 }),
        getEmployees({ all: 1, per_page: 500 }),
        getClients({ all: 1, per_page: 500 }),
      ]);

      if (saudiRes.status === "fulfilled") {
        const data = saudiRes.value.data?.data || saudiRes.value.data || [];
        if (Array.isArray(data)) setSaudiOffices(data);
      }
      if (empRes.status === "fulfilled") {
        const data = empRes.value.data?.data || empRes.value.data || [];
        if (Array.isArray(data) && data.length > 0) setEmployeesList(data);
      }
      if (clientRes.status === "fulfilled") {
        const data = clientRes.value.data?.data || clientRes.value.data || [];
        if (Array.isArray(data) && data.length > 0) setClientsList(data);
      }
    } catch (err) {
      console.warn("Error fetching initial options:", err);
    }
  };

  const fetchData = async (overrideParams = null) => {
    setLoading(true);
    try {
      const params = {};
      const dFrom = overrideParams && "date_from" in overrideParams ? overrideParams.date_from : dateFrom;
      const dTo = overrideParams && "date_to" in overrideParams ? overrideParams.date_to : dateTo;
      const offId = overrideParams && "saudi_office_id" in overrideParams ? overrideParams.saudi_office_id : selectedSaudiOffice;
      const cId = overrideParams && "client_id" in overrideParams ? overrideParams.client_id : selectedClient;
      const eId = overrideParams && "employee_id" in overrideParams ? overrideParams.employee_id : selectedEmployee;
      const cStatus = overrideParams && "contract_status" in overrideParams ? overrideParams.contract_status : contractStatusFilter;

      if (dFrom) params.date_from = dFrom;
      if (dTo) params.date_to = dTo;
      if (offId) params.saudi_office_id = offId;
      if (cId) params.client_id = cId;
      if (eId) {
        params.employee_id = eId;
        params.marketer_id = eId;
      }
      if (cStatus) params.contract_status = cStatus;

      const res = await getFinancialCollectionsReport(params);
      if (res.data) {
        setKpis(res.data.kpis || {});
        setOrders(res.data.orders || []);
        setClientsSummary(res.data.clients_summary || []);
        setMarketersSummary(res.data.marketers_summary || []);

        // Robust merge of employees
        const incomingEmps = res.data.employees || [];
        const summaryEmps = (res.data.marketers_summary || [])
          .map((m) => ({ id: m.employee_id, name: m.employee_name }))
          .filter((m) => m.id);

        setEmployeesList((prev) => {
          const map = new Map();
          prev.forEach((e) => e && e.id && map.set(String(e.id), e));
          incomingEmps.forEach((e) => e && e.id && map.set(String(e.id), e));
          summaryEmps.forEach((e) => e && e.id && !map.has(String(e.id)) && map.set(String(e.id), e));
          return Array.from(map.values());
        });

        // Robust merge of clients
        const incomingClients = res.data.clients || [];
        const summaryClients = (res.data.clients_summary || [])
          .map((c) => ({ id: c.client_id, name: c.client_name, phone: c.client_phone }))
          .filter((c) => c.id);

        setClientsList((prev) => {
          const map = new Map();
          prev.forEach((c) => c && c.id && map.set(String(c.id), c));
          incomingClients.forEach((c) => c && c.id && map.set(String(c.id), c));
          summaryClients.forEach((c) => c && c.id && !map.has(String(c.id)) && map.set(String(c.id), c));
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.error("Error fetching financial collections report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    fetchData();
  };

  const handleResetFilter = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedSaudiOffice("");
    setSelectedClient("");
    setSelectedEmployee("");
    setContractStatusFilter("musaned_paid");
    setPaymentStatusFilter("all");
    setSearchQuery("");
    fetchData({
      date_from: "",
      date_to: "",
      saudi_office_id: "",
      client_id: "",
      employee_id: "",
      contract_status: "musaned_paid",
    });
  };

  const handleClientChange = (val) => {
    setSelectedClient(val);
    if (val) {
      setReportTarget("client");
    }
  };

  const handleEmployeeChange = (val) => {
    setSelectedEmployee(val);
    if (val) {
      setReportTarget("marketer");
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // Toggle single marketer expansion
  const toggleMarketer = (idOrKey) => {
    setExpandedMarketers((prev) => ({
      ...prev,
      [idOrKey]: !prev[idOrKey],
    }));
  };

  // Expand / Collapse all marketers in detailed view
  const toggleAllMarketers = (expand) => {
    if (!expand) {
      setExpandedMarketers({});
      return;
    }
    const newExpanded = {};
    filteredMarketers.forEach((m, idx) => {
      const key = m.employee_id ? `emp_${m.employee_id}` : `m_${idx}`;
      newExpanded[key] = true;
    });
    setExpandedMarketers(newExpanded);
  };

  // Helper for Payment Status Badges
  const renderPaymentBadge = (status) => {
    if (status === "محصل بالكامل") {
      return <Badge bg="success" className="px-3 py-2 rounded-pill">محصل بالكامل ✓</Badge>;
    }
    if (status === "محصل جزئياً") {
      return <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill">محصل جزئياً ⏳</Badge>;
    }
    return <Badge bg="danger" className="px-3 py-2 rounded-pill">غير محصل ✕</Badge>;
  };

  // Helper for Order Status Badges
  const renderOrderStatusBadge = (order) => {
    return (
      <OrderStatusBadge
        status={order.order_status || order.status}
        customColor={order.order_status_color}
      />
    );
  };

  // -------------------------------------------------------------
  // Filtered Datasets based on local search & payment status filter
  // -------------------------------------------------------------

  // 1. Detailed Client Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (paymentStatusFilter !== "all" && ord.payment_status !== paymentStatusFilter) {
        return false;
      }
      if (selectedSaudiOffice && String(ord.saudi_office_id) !== String(selectedSaudiOffice)) {
        return false;
      }
      if (selectedClient && String(ord.client_id) !== String(selectedClient)) {
        return false;
      }
      if (selectedEmployee && String(ord.employee_id) !== String(selectedEmployee)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesClient = (ord.client_name || "").toLowerCase().includes(q);
        const matchesVisa = (ord.visa_number || "").toLowerCase().includes(q);
        const matchesId = String(ord.id || "").includes(q);
        const matchesEmp = (ord.employee_name || "").toLowerCase().includes(q);
        const matchesOffice = (ord.saudi_office_name || "").toLowerCase().includes(q);
        const matchesNat = (ord.nationality || "").toLowerCase().includes(q);
        if (!matchesClient && !matchesVisa && !matchesId && !matchesEmp && !matchesOffice && !matchesNat) {
          return false;
        }
      }
      return true;
    });
  }, [orders, paymentStatusFilter, selectedSaudiOffice, selectedClient, selectedEmployee, searchQuery]);

  // 2. Client Summary List
  const filteredClients = useMemo(() => {
    return clientsSummary.filter((client) => {
      if (paymentStatusFilter !== "all" && client.payment_status !== paymentStatusFilter) {
        return false;
      }
      if (selectedClient && String(client.client_id) !== String(selectedClient)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (client.client_name || "").toLowerCase().includes(q);
        const matchesPhone = (client.client_phone || "").toLowerCase().includes(q);
        if (!matchesName && !matchesPhone) {
          return false;
        }
      }
      return true;
    });
  }, [clientsSummary, paymentStatusFilter, selectedClient, searchQuery]);

  // 3. Marketers (Summary & Detailed)
  const filteredMarketers = useMemo(() => {
    return marketersSummary.filter((m) => {
      if (paymentStatusFilter !== "all" && m.payment_status !== paymentStatusFilter) {
        return false;
      }
      if (selectedEmployee && String(m.employee_id) !== String(selectedEmployee)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (m.employee_name || "").toLowerCase().includes(q);
        const matchesOffice = (m.office_name || "").toLowerCase().includes(q);
        // Also check if any of their clients or orders match
        const matchesSubOrder = (m.orders || []).some(
          (o) =>
            (o.client_name || "").toLowerCase().includes(q) ||
            (o.visa_number || "").toLowerCase().includes(q)
        );
        if (!matchesName && !matchesOffice && !matchesSubOrder) {
          return false;
        }
      }
      return true;
    });
  }, [marketersSummary, paymentStatusFilter, selectedEmployee, searchQuery]);

  // Active dataset for pagination
  const currentDataset = useMemo(() => {
    if (reportTarget === "client") {
      return reportMode === "detailed" ? filteredOrders : filteredClients;
    } else {
      return filteredMarketers;
    }
  }, [reportTarget, reportMode, filteredOrders, filteredClients, filteredMarketers]);

  const totalPages = Math.ceil(currentDataset.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentDataset.slice(start, start + itemsPerPage);
  }, [currentDataset, currentPage, itemsPerPage]);

  // -------------------------------------------------------------
  // Export Handlers
  // -------------------------------------------------------------
  const handleExportExcel = () => {
    if (reportTarget === "client" && reportMode === "detailed") {
      const columns = [
        { header: "رقم الطلب", key: "id" },
        { header: "اسم العميل", key: "client_name" },
        { header: "المكتب السعودي", key: "saudi_office_name" },
        { header: "الجنسية", key: "nationality" },
        { header: "رقم التأشيرة", key: "visa_number" },
        ...(!hideOrderStatus ? [{ header: "حالة الطلب", key: "order_status" }] : []),
        { header: "إجمالي العقد (ر.س)", key: "total_price" },
        { header: "المبلغ المحصل (ر.س)", key: "paid_amount" },
        { header: "المبلغ المتبقي (ر.س)", key: "remaining_amount" },
        { header: "حالة التحصيل", key: "payment_status" },
        { header: "وقت إضافة الحوالة الجديدة", key: "latest_transaction_time" },
        { header: "التاريخ", key: "created_at" },
      ];
      exportToExcel(
        filteredOrders,
        columns,
        isStatementMode ? "كشف_حساب_تفصيلي_للعميل.xlsx" : "التقرير_المالي_التفصيلي_للعملاء.xlsx"
      );
    } else if (reportTarget === "client" && reportMode === "summary") {
      const columns = [
        { header: "اسم العميل", key: "client_name" },
        { header: "الهاتف", key: "client_phone" },
        { header: "عدد الطلبات", key: "orders_count" },
        { header: "إجمالي العقود (ر.س)", key: "total_contract_value" },
        { header: "المبلغ المحصل (ر.س)", key: "total_collected" },
        { header: "المبلغ المتبقي (ر.س)", key: "total_outstanding" },
        { header: "نسبة التحصيل %", key: "collection_rate" },
        { header: "حالة التحصيل", key: "payment_status" },
      ];
      exportToExcel(
        filteredClients,
        columns,
        isStatementMode ? "كشف_حساب_إجمالي_للعميل.xlsx" : "التقرير_المالي_الإجمالي_للعملاء.xlsx"
      );
    } else if (reportTarget === "marketer" && reportMode === "summary") {
      const columns = [
        { header: "اسم المسوق / الموظف", key: "employee_name" },
        { header: "المكتب التابع له", key: "office_name" },
        { header: "عدد الطلبات", key: "orders_count" },
        { header: "عدد العملاء", key: "clients_count" },
        { header: "إجمالي العقود (ر.س)", key: "total_contract_value" },
        { header: "المبلغ المحصل (ر.س)", key: "total_collected" },
        { header: "المبلغ المتبقي (ر.س)", key: "total_outstanding" },
        { header: "نسبة التحصيل %", key: "collection_rate" },
        { header: "حالة التحصيل", key: "payment_status" },
      ];
      exportToExcel(
        filteredMarketers,
        columns,
        isStatementMode ? "كشف_حساب_إجمالي_للمسوق.xlsx" : "التقرير_المالي_الإجمالي_للمسوقين.xlsx"
      );
    } else {
      // Marketer Detailed: flatten orders under each marketer
      const flatList = [];
      filteredMarketers.forEach((m) => {
        (m.orders || []).forEach((o) => {
          flatList.push({
            marketer_name: m.employee_name,
            id: o.id,
            client_name: o.client_name,
            saudi_office_name: o.saudi_office_name,
            nationality: o.nationality,
            visa_number: o.visa_number,
            order_status: o.order_status,
            total_price: o.total_price,
            paid_amount: o.paid_amount,
            remaining_amount: o.remaining_amount,
            payment_status: o.payment_status,
            latest_transaction_time: o.latest_transaction_time || "-",
            created_at: o.created_at,
          });
        });
      });
      const columns = [
        { header: "المسوق / الموظف", key: "marketer_name" },
        { header: "رقم الطلب", key: "id" },
        { header: "اسم العميل", key: "client_name" },
        { header: "المكتب السعودي", key: "saudi_office_name" },
        { header: "الجنسية", key: "nationality" },
        { header: "رقم التأشيرة", key: "visa_number" },
        ...(!hideOrderStatus ? [{ header: "حالة الطلب", key: "order_status" }] : []),
        { header: "إجمالي العقد (ر.س)", key: "total_price" },
        { header: "المحصل (ر.س)", key: "paid_amount" },
        { header: "المتبقي (ر.س)", key: "remaining_amount" },
        { header: "حالة التحصيل", key: "payment_status" },
        { header: "وقت إضافة الحوالة الجديدة", key: "latest_transaction_time" },
        { header: "التاريخ", key: "created_at" },
      ];
      exportToExcel(
        flatList,
        columns,
        isStatementMode ? "كشف_حساب_تفصيلي_للمسوق.xlsx" : "التقرير_المالي_التفصيلي_للمسوقين.xlsx"
      );
    }
  };

  const handleExportPDF = () => {
    if (reportTarget === "client" && reportMode === "detailed") {
      const columns = [
        { header: "رقم الطلب", key: "id" },
        { header: "اسم العميل", key: "client_name" },
        { header: "المكتب السعودي", key: "saudi_office_name" },
        { header: "الجنسية", key: "nationality" },
        { header: "رقم التأشيرة", key: "visa_number" },
        ...(!hideOrderStatus ? [{ header: "حالة الطلب", key: "order_status" }] : []),
        { header: "إجمالي العقد", key: "total_price" },
        { header: "المحصل", key: "paid_amount" },
        { header: "المتبقي", key: "remaining_amount" },
        { header: "حالة التحصيل", key: "payment_status" },
        { header: "وقت إضافة الحوالة", key: "latest_transaction_time" },
      ];
      exportToPDF(
        filteredOrders,
        columns,
        isStatementMode ? "كشف_حساب_تفصيلي_للعميل.pdf" : "التقرير_المالي_التفصيلي_للعملاء.pdf"
      );
    } else if (reportTarget === "client" && reportMode === "summary") {
      const columns = [
        { header: "اسم العميل", key: "client_name" },
        { header: "عدد الطلبات", key: "orders_count" },
        { header: "إجمالي العقود", key: "total_contract_value" },
        { header: "المحصل", key: "total_collected" },
        { header: "المتبقي", key: "total_outstanding" },
        { header: "حالة التحصيل", key: "payment_status" },
      ];
      exportToPDF(
        filteredClients,
        columns,
        isStatementMode ? "كشف_حساب_إجمالي_للعميل.pdf" : "التقرير_المالي_الإجمالي_للعملاء.pdf"
      );
    } else if (reportTarget === "marketer" && reportMode === "summary") {
      const columns = [
        { header: "المسوق", key: "employee_name" },
        { header: "المكتب", key: "office_name" },
        { header: "عدد الطلبات", key: "orders_count" },
        { header: "إجمالي العقود", key: "total_contract_value" },
        { header: "المحصل", key: "total_collected" },
        { header: "المتبقي", key: "total_outstanding" },
        { header: "حالة التحصيل", key: "payment_status" },
      ];
      exportToPDF(
        filteredMarketers,
        columns,
        isStatementMode ? "كشف_حساب_إجمالي_للمسوق.pdf" : "التقرير_المالي_الإجمالي_للمسوقين.pdf"
      );
    } else {
      const flatList = [];
      filteredMarketers.forEach((m) => {
        (m.orders || []).forEach((o) => {
          flatList.push({
            marketer_name: m.employee_name,
            id: o.id,
            client_name: o.client_name,
            saudi_office_name: o.saudi_office_name,
            nationality: o.nationality,
            visa_number: o.visa_number,
            order_status: o.order_status,
            total_price: o.total_price,
            paid_amount: o.paid_amount,
            remaining_amount: o.remaining_amount,
            payment_status: o.payment_status,
            latest_transaction_time: o.latest_transaction_time || "-",
          });
        });
      });
      const columns = [
        { header: "المسوق", key: "marketer_name" },
        { header: "الطلب", key: "id" },
        { header: "العميل", key: "client_name" },
        { header: "المكتب السعودي", key: "saudi_office_name" },
        { header: "الجنسية", key: "nationality" },
        { header: "التأشيرة", key: "visa_number" },
        ...(!hideOrderStatus ? [{ header: "الحالة", key: "order_status" }] : []),
        { header: "إجمالي العقد", key: "total_price" },
        { header: "المحصل", key: "paid_amount" },
        { header: "المتبقي", key: "remaining_amount" },
        { header: "وقت إضافة الحوالة", key: "latest_transaction_time" },
      ];
      exportToPDF(
        flatList,
        columns,
        isStatementMode ? "كشف_حساب_تفصيلي_للمسوق.pdf" : "التقرير_المالي_التفصيلي_للمسوقين.pdf"
      );
    }
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
              كشف تفصيلي وإجمالي بالمستحقات والمبالغ المحصلة والمتبقية للعملاء والمسوقين
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <RefreshButton
              onClick={fetchData}
              loading={loading}
              className="border shadow-sm text-primary fw-semibold"
            />
            <Button
              variant="light"
              onClick={handleExportExcel}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold"
            >
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>تصدير إكسيل</span>
            </Button>
            <Button
              variant="light"
              onClick={handleExportPDF}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-danger fw-semibold"
            >
              <i className="fa-solid fa-file-pdf fs-5"></i>
              <span>تصدير PDF</span>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <Card
              className="border-0 shadow-sm rounded-4 text-white overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}
            >
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">إجمالي قيمة العقود</div>
                  <h2 className="mb-0 fw-extrabold fs-2">
                    {(kpis.total_contract_value || 0).toLocaleString()}{" "}
                    <span className="fs-6 font-normal">ر.س</span>
                  </h2>
                  <div className="small text-white-50 mt-1">
                    {kpis.total_orders || orders.length} عقود مسجلة
                  </div>
                </div>
                <div
                  className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center"
                  style={{ width: "56px", height: "56px" }}
                >
                  <i className="fa-solid fa-file-invoice-dollar fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card
              className="border-0 shadow-sm rounded-4 text-white overflow-hidden"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #047857 100%)" }}
            >
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">المحصل الفعلي</div>
                  <h2 className="mb-0 fw-extrabold fs-2">
                    {(kpis.total_collected || 0).toLocaleString()}{" "}
                    <span className="fs-6 font-normal">ر.س</span>
                  </h2>
                  <div className="small text-white-50 mt-1">مبالغ دخلت الحساب</div>
                </div>
                <div
                  className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center"
                  style={{ width: "56px", height: "56px" }}
                >
                  <i className="fa-solid fa-vault fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card
              className="border-0 shadow-sm rounded-4 text-white overflow-hidden"
              style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" }}
            >
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">المستحقات المتبقية</div>
                  <h2 className="mb-0 fw-extrabold fs-2">
                    {(kpis.total_outstanding || 0).toLocaleString()}{" "}
                    <span className="fs-6 font-normal">ر.س</span>
                  </h2>
                  <div className="small text-white-50 mt-1">مبالغ تحت التحصيل</div>
                </div>
                <div
                  className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center"
                  style={{ width: "56px", height: "56px" }}
                >
                  <i className="fa-solid fa-hand-holding-dollar fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card
              className="border-0 shadow-sm rounded-4 text-white overflow-hidden"
              style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
            >
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">نسبة التحصيل العامة</div>
                  <h2 className="mb-0 fw-extrabold fs-2">{kpis.collection_rate || 0}%</h2>
                  <div className="small text-white-50 mt-1">
                    {kpis.total_clients || clientsSummary.length} عميل | {kpis.total_marketers || marketersSummary.length} مسوق
                  </div>
                </div>
                <div
                  className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center"
                  style={{ width: "56px", height: "56px" }}
                >
                  <i className="fa-solid fa-percent fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filter Section */}
        <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white">
          <Card.Body className="p-4">
            <Form onSubmit={handleApplyFilter}>
              <Row className="g-3 align-items-end">
                <Col xs={12} md={3}>
                  <Form.Label className="small fw-semibold text-secondary">
                    <i className="fa-regular fa-calendar me-1"></i> من تاريخ
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="rounded-3 shadow-none border"
                  />
                </Col>

                <Col xs={12} md={3}>
                  <Form.Label className="small fw-semibold text-secondary">
                    <i className="fa-regular fa-calendar me-1"></i> إلى تاريخ
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="rounded-3 shadow-none border"
                  />
                </Col>

                <Col xs={12} md={3}>
                  <Form.Label className="small fw-semibold text-secondary">
                    <i className="fa-solid fa-file-contract me-1"></i> حالة العقود والسداد 📋
                  </Form.Label>
                  <Form.Select
                    value={contractStatusFilter}
                    onChange={(e) => setContractStatusFilter(e.target.value)}
                    className="rounded-3 shadow-none border fw-semibold text-primary"
                  >
                    <option value="musaned_paid">تم السداد مساند (الافتراضي) ⭐</option>
                    <option value="all">جميع العقود (المنفذة، الملغية، والسارية)</option>
                    <option value="active">العقود السارية فقط</option>
                    <option value="completed">العقود المكتملة</option>
                    <option value="cancelled">العقود الملغية</option>
                    <option value="awaiting_transfer">تم انتظار حوالة مساند</option>
                    <option value="not_paid">لم يتم السداد</option>
                  </Form.Select>
                </Col>

                <Col xs={12} md={3}>
                  <Form.Label className="small fw-semibold text-secondary">
                    <i className="fa-solid fa-building me-1"></i> المكتب السعودي 🇸🇦
                  </Form.Label>
                  <Form.Select
                    value={selectedSaudiOffice}
                    onChange={(e) => setSelectedSaudiOffice(e.target.value)}
                    className="rounded-3 shadow-none border"
                  >
                    <option value="">جميع المكاتب السعودية</option>
                    {saudiOffices.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col xs={12} md={4}>
                  <Form.Label className="small fw-semibold text-secondary">
                    <i className="fa-solid fa-user-tag me-1"></i> المندوب / العميل 👤
                  </Form.Label>
                  <Form.Select
                    value={selectedClient}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="rounded-3 shadow-none border"
                  >
                    <option value="">جميع المناديب / العملاء</option>
                    {clientsList.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.phone ? `(${client.phone})` : ""}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col xs={12} md={4}>
                  <Form.Label className="small fw-semibold text-secondary">
                    <i className="fa-solid fa-user-tie me-1"></i> المسوق / الموظف 👥
                  </Form.Label>
                  <Form.Select
                    value={selectedEmployee}
                    onChange={(e) => handleEmployeeChange(e.target.value)}
                    className="rounded-3 shadow-none border"
                  >
                    <option value="">جميع المسوقين / الموظفين</option>
                    {employeesList.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name || emp.username || `موظف #${emp.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col xs={12} md={4}>
                  <Form.Label className="small fw-semibold text-secondary">
                    <i className="fa-solid fa-filter me-1"></i> حالة التحصيل
                  </Form.Label>
                  <Form.Select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="rounded-3 shadow-none border"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="محصل بالكامل">محصل بالكامل</option>
                    <option value="محصل جزئياً">محصل جزئياً</option>
                    <option value="غير محصل">غير محصل</option>
                  </Form.Select>
                </Col>

                <Col xs={12} md={8}>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0 text-muted">
                      <i className="fa-solid fa-magnifying-glass"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="بحث سريع برقم الطلب، اسم العميل، رقم التأشيرة، أو اسم المسوق..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-start-0 rounded-start shadow-none"
                    />
                  </InputGroup>
                </Col>

                <Col xs={12} md={4} className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-grow-1 rounded-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  >
                    <i className="fa-solid fa-filter"></i>
                    <span>تطبيق الفلترة</span>
                  </Button>
                  <Button
                    type="button"
                    variant="light"
                    onClick={handleResetFilter}
                    className="border rounded-3 py-2 text-secondary fw-semibold px-3"
                    title="إعادة التعيين"
                  >
                    <i className="fa-solid fa-rotate-left"></i>
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Statement Mode Card (Visible when filtering by Client/Delegate or Marketer/Employee) */}
        {isStatementMode && (
          <Card className="border-0 shadow-sm rounded-4 mb-4 bg-primary bg-opacity-10 border-start border-primary border-4">
            <Card.Body className="p-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                  style={{ width: "44px", height: "44px" }}
                >
                  <i className="fa-solid fa-file-invoice-dollar fs-5"></i>
                </div>
                <div>
                  <h6 className="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
                    <span>كشف حساب:</span>
                    <span className="badge bg-primary fs-7">
                      {selectedClient
                        ? `المندوب / العميل: ${clientsList.find((c) => String(c.id) === String(selectedClient))?.name || selectedClient}`
                        : `المسوق / الموظف: ${employeesList.find((e) => String(e.id) === String(selectedEmployee))?.name || selectedEmployee}`}
                    </span>
                  </h6>
                  <p className="mb-0 text-muted small">
                    اختر نوع كشف الحساب المطلوب (تم إخفاء عمود حالة الطلب تلقائياً لطباعة كشف الحساب)
                  </p>
                </div>
              </div>

              <ButtonGroup className="p-1 bg-white rounded-pill border shadow-sm">
                <Button
                  variant={reportMode === "summary" ? "primary" : "transparent"}
                  className={`rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-2 ${
                    reportMode === "summary" ? "shadow-sm text-white" : "text-dark"
                  }`}
                  onClick={() => setReportMode("summary")}
                >
                  <i className="fa-solid fa-chart-pie"></i>
                  <span>كشف حساب إجمالي</span>
                </Button>
                <Button
                  variant={reportMode === "detailed" ? "primary" : "transparent"}
                  className={`rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-2 ${
                    reportMode === "detailed" ? "shadow-sm text-white" : "text-dark"
                  }`}
                  onClick={() => setReportMode("detailed")}
                >
                  <i className="fa-solid fa-list-check"></i>
                  <span>كشف حساب تفصيلي</span>
                </Button>
              </ButtonGroup>
            </Card.Body>
          </Card>
        )}

        {/* View Selection & Tabs Bar */}
        <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white">
          <Card.Body className="p-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              {/* Target Selector: Client vs Marketer */}
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small fw-bold me-1">عرض التقرير حسب:</span>
                <ButtonGroup className="p-1 bg-light rounded-pill border">
                  <Button
                    variant={reportTarget === "client" ? "primary" : "transparent"}
                    className={`rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-2 ${
                      reportTarget === "client" ? "shadow-sm text-white" : "text-dark"
                    }`}
                    onClick={() => setReportTarget("client")}
                  >
                    <i className="fa-solid fa-user"></i>
                    <span>تقارير العملاء</span>
                    <Badge
                      bg={reportTarget === "client" ? "light" : "secondary"}
                      text={reportTarget === "client" ? "primary" : "white"}
                      className="rounded-pill ms-1"
                    >
                      {reportMode === "detailed" ? filteredOrders.length : filteredClients.length}
                    </Badge>
                  </Button>
                  <Button
                    variant={reportTarget === "marketer" ? "primary" : "transparent"}
                    className={`rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-2 ${
                      reportTarget === "marketer" ? "shadow-sm text-white" : "text-dark"
                    }`}
                    onClick={() => setReportTarget("marketer")}
                  >
                    <i className="fa-solid fa-users"></i>
                    <span>تقارير المسوقين</span>
                    <Badge
                      bg={reportTarget === "marketer" ? "light" : "secondary"}
                      text={reportTarget === "marketer" ? "primary" : "white"}
                      className="rounded-pill ms-1"
                    >
                      {filteredMarketers.length}
                    </Badge>
                  </Button>
                </ButtonGroup>
              </div>

              {/* Mode Selector: Detailed vs Summary */}
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small fw-bold me-1">نوع التقرير:</span>
                <ButtonGroup className="p-1 bg-light rounded-pill border">
                  <Button
                    variant={reportMode === "detailed" ? "dark" : "transparent"}
                    className={`rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-2 ${
                      reportMode === "detailed" ? "shadow-sm text-white" : "text-dark"
                    }`}
                    onClick={() => setReportMode("detailed")}
                  >
                    <i className="fa-solid fa-list-check"></i>
                    <span>تقرير تفصيلي</span>
                  </Button>
                  <Button
                    variant={reportMode === "summary" ? "dark" : "transparent"}
                    className={`rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-2 ${
                      reportMode === "summary" ? "shadow-sm text-white" : "text-dark"
                    }`}
                    onClick={() => setReportMode("summary")}
                  >
                    <i className="fa-solid fa-chart-pie"></i>
                    <span>تقرير إجمالي</span>
                  </Button>
                </ButtonGroup>

                {/* Marketer Detailed Expand / Collapse All shortcut */}
                {reportTarget === "marketer" && reportMode === "detailed" && (
                  <div className="d-flex gap-1 ms-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="rounded-pill px-2.5 py-1 text-nowrap"
                      onClick={() => toggleAllMarketers(true)}
                      title="فتح جميع تفاصيل المسوقين وعملائهم"
                    >
                      <i className="fa-solid fa-angles-down me-1"></i> توسيع الكل
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="rounded-pill px-2.5 py-1 text-nowrap"
                      onClick={() => toggleAllMarketers(false)}
                      title="طي جميع التفاصيل"
                    >
                      <i className="fa-solid fa-angles-up me-1"></i> طي الكل
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Active View Informational Banner */}
        <div className="d-flex align-items-center justify-content-between mb-3 px-1">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fs-7">
              {reportTarget === "client" ? "👤 تقارير العملاء" : "👥 تقارير المسوقين"}
              {" — "}
              {reportMode === "detailed" ? "📝 تفصيلي" : "📊 إجمالي"}
            </span>
            <span className="text-muted small">
              (إجمالي النتائج: {currentDataset.length})
            </span>
          </div>
        </div>

        {/* Content Table / Cards Container */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <Card.Body className="p-0">
            {loading ? (
              <div className="p-4">
                <TableSkeleton rows={6} columns={8} />
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="text-center py-5">
                <div className="text-muted fs-1 mb-2">🔍</div>
                <h5 className="fw-bold text-dark">لا توجد سجلات مطابقة للبحث أو الفلتر</h5>
                <p className="text-muted small mb-3">يرجى تعديل الفلاتر أو تاريخ البحث لإظهار النتائج</p>
                <Button variant="outline-primary" size="sm" onClick={handleResetFilter} className="rounded-pill px-3">
                  إعادة ضبط الفلاتر
                </Button>
              </div>
            ) : (
              <>
                {/* ======================================================== */}
                {/* 1. VIEW: CLIENT DETAILED REPORT                         */}
                {/* Columns: #, العميل, المكتب السعودي, الجنسية, رقم التأشيرة, */}
                {/*          حالة الطلب, إجمالي العقد, المحصل, المتبقي,      */}
                {/*          حالة التحصيل, التاريخ, التفاصيل                 */}
                {/* ======================================================== */}
                {reportTarget === "client" && reportMode === "detailed" && (
                  <div className="table-responsive">
                    <Table hover align="middle" className="mb-0 text-center">
                      <thead className="bg-light text-secondary border-bottom">
                        <tr>
                          <th className="py-3">#</th>
                          <th className="py-3">اسم العميل</th>
                          <th className="py-3">المكتب السعودي 🇸🇦</th>
                          <th className="py-3">الجنسية 🌍</th>
                          <th className="py-3">رقم التأشيرة 🎫</th>
                          {!hideOrderStatus && <th className="py-3">حالة الطلب 📌</th>}
                          <th className="py-3">إجمالي العقد</th>
                          <th className="py-3">المحصل</th>
                          <th className="py-3">المتبقي</th>
                          <th className="py-3">حالة التحصيل</th>
                          <th className="py-3">وقت إضافة الحوالة الجديدة ⏱️</th>
                          <th className="py-3">التاريخ</th>
                          <th className="py-3 text-center">التفاصيل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((order, idx) => (
                          <tr key={order.id || idx}>
                            <td className="fw-bold text-muted">{order.id}</td>
                            <td className="fw-semibold text-dark text-start px-3">
                              <div>{order.client_name}</div>
                              {order.client_phone && (
                                <div className="text-muted small dir-ltr text-end" style={{ fontSize: "0.8rem" }}>
                                  {order.client_phone}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border px-2.5 py-1.5 rounded-3">
                                {order.saudi_office_name || "-"}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-light text-secondary border px-2.5 py-1.5 rounded-3">
                                {order.nationality || "-"}
                              </span>
                            </td>
                            <td>
                              <Badge bg="secondary" className="px-2.5 py-1.5 font-monospace">
                                {order.visa_number || "-"}
                              </Badge>
                            </td>
                            {!hideOrderStatus && <td>{renderOrderStatusBadge(order)}</td>}
                            <td className="fw-bold text-dark">
                              {(order.total_price || 0).toLocaleString()} ر.س
                            </td>
                            <td className="fw-bold text-success">
                              {(order.paid_amount || 0).toLocaleString()} ر.س
                            </td>
                            <td className="fw-bold text-danger">
                              {(order.remaining_amount || 0).toLocaleString()} ر.س
                            </td>
                            <td>{renderPaymentBadge(order.payment_status)}</td>
                            <td>
                              <span className="badge bg-light text-dark border px-2.5 py-1.5 rounded-3 font-monospace small">
                                {order.latest_transaction_time || "-"}
                              </span>
                            </td>
                            <td className="text-muted small">{order.created_at}</td>
                            <td className="text-center">
                              <Button
                                variant="light"
                                size="sm"
                                className="rounded-circle shadow-sm border text-primary d-inline-flex align-items-center justify-content-center"
                                style={{ width: "36px", height: "36px" }}
                                onClick={() => handleViewOrderDetails(order)}
                                title="عرض تفاصيل الطلب والحساب الكامل"
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

                {/* ======================================================== */}
                {/* 2. VIEW: CLIENT SUMMARY REPORT                          */}
                {/* Existing summary columns: العميل, عدد الطلبات,             */}
                {/*   إجمالي العقد, المحصل, المتبقي, حالة التحصيل, نسبة...     */}
                {/* ======================================================== */}
                {reportTarget === "client" && reportMode === "summary" && (
                  <div className="table-responsive">
                    <Table hover align="middle" className="mb-0 text-center">
                      <thead className="bg-light text-secondary border-bottom">
                        <tr>
                          <th className="py-3">#</th>
                          <th className="py-3 text-start px-4">اسم العميل</th>
                          <th className="py-3">عدد الطلبات</th>
                          <th className="py-3">إجمالي العقود</th>
                          <th className="py-3">المحصل الفعلي</th>
                          <th className="py-3">المتبقي</th>
                          <th className="py-3">نسبة التحصيل</th>
                          <th className="py-3">حالة التحصيل</th>
                          <th className="py-3 text-center">التفاصيل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((client, idx) => (
                          <tr key={client.client_id || idx}>
                            <td className="text-muted fw-bold">
                              {(currentPage - 1) * itemsPerPage + idx + 1}
                            </td>
                            <td className="fw-semibold text-dark text-start px-4">
                              <div className="fs-6">{client.client_name}</div>
                              {client.client_phone && (
                                <div className="text-muted small dir-ltr text-end" style={{ fontSize: "0.8rem" }}>
                                  {client.client_phone}
                                </div>
                              )}
                            </td>
                            <td>
                              <Badge bg="primary" className="px-2.5 py-1.5 rounded-pill">
                                {client.orders_count} طلبات
                              </Badge>
                            </td>
                            <td className="fw-bold text-dark">
                              {(client.total_contract_value || 0).toLocaleString()} ر.س
                            </td>
                            <td className="fw-bold text-success">
                              {(client.total_collected || 0).toLocaleString()} ر.س
                            </td>
                            <td className="fw-bold text-danger">
                              {(client.total_outstanding || 0).toLocaleString()} ر.س
                            </td>
                            <td style={{ minWidth: "120px" }}>
                              <div className="d-flex align-items-center gap-2 justify-content-center">
                                <span className="small fw-bold">{client.collection_rate || 0}%</span>
                                <div className="flex-grow-1" style={{ maxWidth: "70px" }}>
                                  <ProgressBar
                                    now={client.collection_rate || 0}
                                    variant={
                                      (client.collection_rate || 0) >= 100
                                        ? "success"
                                        : (client.collection_rate || 0) > 0
                                        ? "warning"
                                        : "danger"
                                    }
                                    style={{ height: "6px" }}
                                    className="rounded-pill"
                                  />
                                </div>
                              </div>
                            </td>
                            <td>{renderPaymentBadge(client.payment_status)}</td>
                            <td className="text-center">
                              {client.orders && client.orders.length > 0 && (
                                <Button
                                  variant="light"
                                  size="sm"
                                  className="rounded-circle shadow-sm border text-primary d-inline-flex align-items-center justify-content-center"
                                  style={{ width: "36px", height: "36px" }}
                                  onClick={() => handleViewOrderDetails(client.orders[0])}
                                  title="عرض أول طلب للعميل"
                                >
                                  <i className="fa-solid fa-eye fs-6"></i>
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                {/* ======================================================== */}
                {/* 3. VIEW: MARKETER SUMMARY REPORT                        */}
                {/* Existing summary columns: اسم المسوق, المكتب, عدد العقود,   */}
                {/*   عدد العملاء, إجمالي العقود, المحصل, المتبقي, حالة...    */}
                {/* ======================================================== */}
                {reportTarget === "marketer" && reportMode === "summary" && (
                  <div className="table-responsive">
                    <Table hover align="middle" className="mb-0 text-center">
                      <thead className="bg-light text-secondary border-bottom">
                        <tr>
                          <th className="py-3">#</th>
                          <th className="py-3 text-start px-4">اسم المسوق / الموظف</th>
                          <th className="py-3">المكتب التابع له</th>
                          <th className="py-3">عدد الطلبات</th>
                          <th className="py-3">عدد العملاء</th>
                          <th className="py-3">إجمالي العقود</th>
                          <th className="py-3">المحصل الفعلي</th>
                          <th className="py-3">المتبقي</th>
                          <th className="py-3">نسبة التحصيل</th>
                          <th className="py-3">حالة التحصيل</th>
                          <th className="py-3 text-center">التفاصيل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((marketer, idx) => (
                          <tr key={marketer.employee_id || idx}>
                            <td className="text-muted fw-bold">
                              {(currentPage - 1) * itemsPerPage + idx + 1}
                            </td>
                            <td className="fw-semibold text-dark text-start px-4">
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
                                  style={{ width: "34px", height: "34px", fontSize: "0.85rem" }}
                                >
                                  {(marketer.employee_name || "م").substring(0, 1)}
                                </div>
                                <div>
                                  <div className="fw-bold">{marketer.employee_name}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border px-2.5 py-1.5 rounded-3">
                                {marketer.office_name || "الفرع الرئيسي"}
                              </span>
                            </td>
                            <td>
                              <Badge bg="primary" className="px-2.5 py-1.5 rounded-pill">
                                {marketer.orders_count} عقود
                              </Badge>
                            </td>
                            <td>
                              <Badge bg="secondary" className="px-2.5 py-1.5 rounded-pill">
                                {marketer.clients_count || 0} عملاء
                              </Badge>
                            </td>
                            <td className="fw-bold text-dark">
                              {(marketer.total_contract_value || 0).toLocaleString()} ر.س
                            </td>
                            <td className="fw-bold text-success">
                              {(marketer.total_collected || 0).toLocaleString()} ر.س
                            </td>
                            <td className="fw-bold text-danger">
                              {(marketer.total_outstanding || 0).toLocaleString()} ر.س
                            </td>
                            <td style={{ minWidth: "120px" }}>
                              <div className="d-flex align-items-center gap-2 justify-content-center">
                                <span className="small fw-bold">{marketer.collection_rate || 0}%</span>
                                <div className="flex-grow-1" style={{ maxWidth: "70px" }}>
                                  <ProgressBar
                                    now={marketer.collection_rate || 0}
                                    variant={
                                      (marketer.collection_rate || 0) >= 100
                                        ? "success"
                                        : (marketer.collection_rate || 0) > 0
                                        ? "warning"
                                        : "danger"
                                    }
                                    style={{ height: "6px" }}
                                    className="rounded-pill"
                                  />
                                </div>
                              </div>
                            </td>
                            <td>{renderPaymentBadge(marketer.payment_status)}</td>
                            <td className="text-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="rounded-pill px-3 py-1 fw-semibold small"
                                onClick={() => {
                                  setReportMode("detailed");
                                  const key = marketer.employee_id ? `emp_${marketer.employee_id}` : `m_${idx}`;
                                  setExpandedMarketers({ [key]: true });
                                }}
                                title="عرض العملاء والطلبات التفصيلية لهذا المسوق"
                              >
                                عرض التفاصيل
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                {/* ======================================================== */}
                {/* 4. VIEW: MARKETER DETAILED REPORT                       */}
                {/* "التقرير التفصيلي للمسوق هيجيب تحته العملاء مع الاعمدة بتاعته" */}
                {/* Marketer card/row with collapsible sub-table of clients   */}
                {/* and orders with the exact detailed columns                */}
                {/* ======================================================== */}
                {reportTarget === "marketer" && reportMode === "detailed" && (
                  <div className="p-3">
                    {paginatedData.map((marketer, idx) => {
                      const marketerKey = marketer.employee_id
                        ? `emp_${marketer.employee_id}`
                        : `m_${idx}`;
                      const isExpanded = !!expandedMarketers[marketerKey];
                      const marketerOrders = marketer.orders || [];

                      return (
                        <Card
                          key={marketerKey}
                          className="border rounded-4 mb-3 shadow-none overflow-hidden"
                          style={{
                            borderColor: isExpanded ? "#0d6efd" : "#e2e8f0",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {/* Marketer Header Row */}
                          <div
                            className={`p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 cursor-pointer ${
                              isExpanded ? "bg-primary bg-opacity-10 border-bottom" : "bg-light"
                            }`}
                            onClick={() => toggleMarketer(marketerKey)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                                  isExpanded ? "bg-primary text-white" : "bg-white text-primary border"
                                }`}
                                style={{ width: "42px", height: "42px" }}
                              >
                                <i className="fa-solid fa-user-tie fs-5"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                                  <span>{marketer.employee_name}</span>
                                  <Badge bg="secondary" className="px-2 py-1 fs-8 rounded-pill">
                                    {marketer.office_name || "الفرع الرئيسي"}
                                  </Badge>
                                </h6>
                                <div className="text-muted small mt-1">
                                  <span className="me-2">
                                    <i className="fa-solid fa-users me-1 text-primary"></i>
                                    {marketer.clients_count || 0} عملاء
                                  </span>
                                  <span>
                                    <i className="fa-solid fa-file-lines me-1 text-success"></i>
                                    {marketer.orders_count || marketerOrders.length} طلبات
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Marketer Totals Summary */}
                            <div className="d-flex flex-wrap align-items-center gap-3">
                              <div className="text-center px-3 py-1 bg-white rounded-3 border">
                                <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                                  إجمالي العقود
                                </div>
                                <div className="fw-bold text-dark">
                                  {(marketer.total_contract_value || 0).toLocaleString()} ر.س
                                </div>
                              </div>
                              <div className="text-center px-3 py-1 bg-white rounded-3 border">
                                <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                                  المحصل
                                </div>
                                <div className="fw-bold text-success">
                                  {(marketer.total_collected || 0).toLocaleString()} ر.س
                                </div>
                              </div>
                              <div className="text-center px-3 py-1 bg-white rounded-3 border">
                                <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                                  المتبقي
                                </div>
                                <div className="fw-bold text-danger">
                                  {(marketer.total_outstanding || 0).toLocaleString()} ر.س
                                </div>
                              </div>
                              <div className="text-center">
                                {renderPaymentBadge(marketer.payment_status)}
                              </div>
                              <Button
                                variant={isExpanded ? "primary" : "outline-primary"}
                                size="sm"
                                className="rounded-circle d-flex align-items-center justify-content-center ms-md-2"
                                style={{ width: "36px", height: "36px" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMarketer(marketerKey);
                                }}
                                title={isExpanded ? "طي قائمة العملاء" : "عرض قائمة العملاء والطلبات"}
                              >
                                <i className={`fa-solid ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                              </Button>
                            </div>
                          </div>

                          {/* Collapsible Sub-table of Marketer's Clients & Orders */}
                          <Collapse in={isExpanded}>
                            <div>
                              <div className="p-3 bg-white">
                                <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                                  <div className="small fw-bold text-secondary">
                                    <i className="fa-solid fa-list-ul me-1"></i> قائمة عملاء وطلبات المسوق (
                                    {marketerOrders.length} طلب)
                                  </div>
                                </div>

                                {marketerOrders.length === 0 ? (
                                  <div className="text-center py-4 text-muted small bg-light rounded-3">
                                    لا توجد طلبات مسجلة تحت هذا المسوق حالياً
                                  </div>
                                ) : (
                                  <div className="table-responsive border rounded-3 overflow-hidden">
                                    <Table hover align="middle" className="mb-0 text-center table-sm">
                                      <thead className="bg-light text-secondary border-bottom">
                                        <tr style={{ fontSize: "0.85rem" }}>
                                          <th className="py-2.5">#</th>
                                          <th className="py-2.5 text-start px-3">اسم العميل</th>
                                          <th className="py-2.5">المكتب السعودي 🇸🇦</th>
                                          <th className="py-2.5">الجنسية 🌍</th>
                                          <th className="py-2.5">رقم التأشيرة 🎫</th>
                                          {!hideOrderStatus && <th className="py-2.5">حالة الطلب 📌</th>}
                                          <th className="py-2.5">إجمالي العقد</th>
                                          <th className="py-2.5">المحصل</th>
                                          <th className="py-2.5">المتبقي</th>
                                          <th className="py-2.5">حالة التحصيل</th>
                                          <th className="py-2.5">وقت إضافة الحوالة الجديدة ⏱️</th>
                                          <th className="py-2.5">التاريخ</th>
                                          <th className="py-2.5 text-center">التفاصيل</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {marketerOrders.map((ord, oIdx) => (
                                          <tr key={ord.id || oIdx} style={{ fontSize: "0.88rem" }}>
                                            <td className="fw-bold text-muted">{ord.id}</td>
                                            <td className="fw-semibold text-dark text-start px-3">
                                              <div>{ord.client_name}</div>
                                              {ord.client_phone && (
                                                <div
                                                  className="text-muted small dir-ltr text-end"
                                                  style={{ fontSize: "0.75rem" }}
                                                >
                                                  {ord.client_phone}
                                                </div>
                                              )}
                                            </td>
                                            <td>
                                              <span className="badge bg-light text-dark border px-2 py-1 rounded">
                                                {ord.saudi_office_name || "-"}
                                              </span>
                                            </td>
                                            <td>
                                              <span className="badge bg-light text-secondary border px-2 py-1 rounded">
                                                {ord.nationality || "-"}
                                              </span>
                                            </td>
                                            <td>
                                              <Badge bg="secondary" className="px-2 py-1 font-monospace">
                                                {ord.visa_number || "-"}
                                              </Badge>
                                            </td>
                                            {!hideOrderStatus && <td>{renderOrderStatusBadge(ord)}</td>}
                                            <td className="fw-bold text-dark">
                                              {(ord.total_price || 0).toLocaleString()} ر.س
                                            </td>
                                            <td className="fw-bold text-success">
                                              {(ord.paid_amount || 0).toLocaleString()} ر.س
                                            </td>
                                            <td className="fw-bold text-danger">
                                              {(ord.remaining_amount || 0).toLocaleString()} ر.س
                                            </td>
                                            <td>{renderPaymentBadge(ord.payment_status)}</td>
                                            <td>
                                              <span className="badge bg-light text-dark border px-2 py-1 rounded font-monospace small">
                                                {ord.latest_transaction_time || "-"}
                                              </span>
                                            </td>
                                            <td className="text-muted small">{ord.created_at}</td>
                                            <td className="text-center">
                                              <Button
                                                variant="light"
                                                size="sm"
                                                className="rounded-circle shadow-sm border text-primary d-inline-flex align-items-center justify-content-center"
                                                style={{ width: "32px", height: "32px" }}
                                                onClick={() => handleViewOrderDetails(ord)}
                                                title="عرض تفاصيل الطلب والحساب الكامل"
                                              >
                                                <i className="fa-solid fa-eye fs-7"></i>
                                              </Button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </Table>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Collapse>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="p-3 border-top bg-light">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Order Details Modal with full information */}
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
