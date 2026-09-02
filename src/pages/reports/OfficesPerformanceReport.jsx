import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Table, Badge, Button, ProgressBar, Tabs, Tab, Form, Modal, Dropdown } from "react-bootstrap";
import { getOfficesPerformanceReport } from "../../services/apiService";
import RefreshButton from "../../components/common/RefreshButton";
import TableSkeleton from "../../components/common/TableSkeleton";
import SortableHeader from "../../components/common/SortableHeader";
import { useSortableData } from "../../hooks/useSortableData";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import { exportToExcel } from "../../utils/excelHelper";
import { exportToPDF } from "../../utils/pdfHelper";

const OfficesPerformanceReport = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({});
  const [saudiOffices, setSaudiOffices] = useState([]);
  const [externalOffices, setExternalOffices] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [key, setKey] = useState("saudi");

  // Filters State (selectedStatuses is an array for multi-select)
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    country: "",
    city: "",
    saudi_office_id: "",
    external_office_id: "",
    statuses: [], // Array of selected status keys
  });

  // Modal State for Contract Details
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [modalSelectedStatuses, setModalSelectedStatuses] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const rawOfficesList = key === "saudi" ? saudiOffices : externalOffices;
  const { items: currentOfficesList, requestSort, sortConfig } = useSortableData(rawOfficesList);

  const filteredModalOrders = (selectedOffice?.orders_details || []).filter((ord) => {
    if (!modalSelectedStatuses || modalSelectedStatuses.length === 0) return true;
    return modalSelectedStatuses.includes(ord.status) || modalSelectedStatuses.includes(ord.status_raw);
  });

  const { items: modalOrdersDetails, requestSort: requestModalSort, sortConfig: modalSortConfig } = useSortableData(filteredModalOrders);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (currentFilters = filters, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const params = {};
      if (currentFilters.date_from) params.date_from = currentFilters.date_from;
      if (currentFilters.date_to) params.date_to = currentFilters.date_to;
      if (currentFilters.country) params.country = currentFilters.country;
      if (currentFilters.city) params.city = currentFilters.city;
      if (currentFilters.saudi_office_id) params.saudi_office_id = currentFilters.saudi_office_id;
      if (currentFilters.external_office_id) params.external_office_id = currentFilters.external_office_id;
      if (currentFilters.statuses && currentFilters.statuses.length > 0) {
        params.statuses = currentFilters.statuses.join(",");
      }

      const res = await getOfficesPerformanceReport(params);
      if (res.data) {
        setKpis(res.data.kpis || {});
        setSaudiOffices(res.data.saudi_offices || []);
        setExternalOffices(res.data.external_offices || []);
        setCountries(res.data.countries || []);
        setCities(res.data.cities || []);
        setStatuses(res.data.statuses || []);
      }
    } catch (err) {
      console.error("Error fetching offices performance report:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Silent auto refresh every 12 seconds and on window focus
  useAutoRefresh(fetchData, 12000);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle multi-status selection
  const handleToggleStatus = (statusKey) => {
    setFilters((prev) => {
      const current = prev.statuses || [];
      const updated = current.includes(statusKey)
        ? current.filter((s) => s !== statusKey)
        : [...current, statusKey];
      
      const newFilters = { ...prev, statuses: updated };
      fetchData(newFilters);
      return newFilters;
    });
  };

  const handleSelectAllStatuses = () => {
    const allKeys = statuses.map((s) => s.key);
    const updated = { ...filters, statuses: allKeys };
    setFilters(updated);
    fetchData(updated);
  };

  const handleClearAllStatuses = () => {
    const updated = { ...filters, statuses: [] };
    setFilters(updated);
    fetchData(updated);
  };

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    fetchData(filters);
  };

  const handleResetFilters = () => {
    const cleared = {
      date_from: "",
      date_to: "",
      country: "",
      city: "",
      saudi_office_id: "",
      external_office_id: "",
      statuses: [],
    };
    setFilters(cleared);
    fetchData(cleared);
  };

  const handleOpenDetails = (office) => {
    setSelectedOffice(office);
    setModalSelectedStatuses([]);
    setShowDetailsModal(true);
  };

  const handleToggleModalStatus = (statusLabel) => {
    setModalSelectedStatuses((prev) =>
      prev.includes(statusLabel)
        ? prev.filter((s) => s !== statusLabel)
        : [...prev, statusLabel]
    );
  };

  const handleExportExcel = () => {
    const data = (key === "saudi" ? saudiOffices : externalOffices).map((o) => ({
      name: o.name,
      location: key === "saudi" ? o.city : o.country,
      total_orders: o.total_orders,
      status_summary: (o.status_counts || []).map((s) => `${s.label}: ${s.count}`).join(" | "),
      completion_rate: `${o.completion_rate}%`,
      total_revenue: o.total_revenue,
    }));
    const columns = [
      { header: "اسم المكتب", key: "name" },
      { header: key === "saudi" ? "المدينة" : "الدولة", key: "location" },
      { header: "إجمالي الطلبات", key: "total_orders" },
      { header: "توزيع الحالات", key: "status_summary" },
      { header: "نسبة الإنجاز %", key: "completion_rate" },
      { header: "إجمالي المبالغ (ر.س)", key: "total_revenue" },
    ];
    exportToExcel(data, columns, `تقرير_أداء_المكاتب_${key}.xlsx`);
  };

  const handleExportPDF = () => {
    const data = (key === "saudi" ? saudiOffices : externalOffices).map((o) => ({
      name: o.name,
      location: key === "saudi" ? o.city : o.country,
      total_orders: o.total_orders,
      status_summary: (o.status_counts || []).map((s) => `${s.label}: ${s.count}`).join(" | "),
      completion_rate: `${o.completion_rate}%`,
      total_revenue: o.total_revenue,
    }));
    const columns = [
      { header: "اسم المكتب", key: "name" },
      { header: key === "saudi" ? "المدينة" : "الدولة", key: "location" },
      { header: "إجمالي الطلبات", key: "total_orders" },
      { header: "توزيع الحالات", key: "status_summary" },
      { header: "نسبة الإنجاز %", key: "completion_rate" },
      { header: "إجمالي المبالغ (ر.س)", key: "total_revenue" },
    ];
    exportToPDF(data, columns, `تقرير_أداء_المكاتب_${key}.pdf`);
  };

  const selectedCount = (filters.statuses || []).length;

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", padding: "28px 24px" }} dir="rtl">
      <Container fluid>
        {/* Header Title Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="fs-3 p-2 bg-white rounded-3 shadow-sm d-inline-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>🏢</span>
              <div>
                <h1 className="h3 mb-0 fw-bold text-dark tracking-tight">تقرير أداء المكاتب الاحترافي</h1>
                <span className="text-muted small">تحليل مالي وتشغيلي دقيق مع تحديد متعدد للحالات</span>
              </div>
            </div>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <RefreshButton onClick={() => fetchData(filters)} loading={loading} className="border shadow-sm text-primary fw-semibold bg-white rounded-3" />
            <Button variant="white" onClick={handleExportExcel} className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-bold bg-white hover-lift">
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>إكسيل</span>
            </Button>
            <Button variant="white" onClick={handleExportPDF} className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-danger fw-bold bg-white hover-lift">
              <i className="fa-solid fa-file-pdf fs-5"></i>
              <span>بي دي اف</span>
            </Button>
          </div>
        </div>

        {/* Multi-Status Selector & Filter Bar (تحديد متعدد الحالات) */}
        <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
          <div className="p-3 bg-light border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-filter text-primary fs-5"></i>
              <span className="fw-bold text-dark fs-6">تحديد أكثر من حالة للعقود (Multi-Select Status Filter):</span>
              {selectedCount > 0 && (
                <Badge bg="primary" className="rounded-pill px-3 py-1 fs-7">
                  تم تحديد {selectedCount} من {statuses.length} حالات
                </Badge>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                className="rounded-3 px-3 py-1 fw-semibold fs-7"
                onClick={handleSelectAllStatuses}
              >
                ✓ تحديد كافة الحالات
              </Button>
              {selectedCount > 0 && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="rounded-3 px-3 py-1 fw-semibold fs-7"
                  onClick={handleClearAllStatuses}
                >
                  ✕ إلغاء التحديد ({selectedCount})
                </Button>
              )}
            </div>
          </div>
          <Card.Body className="p-3">
            {statuses.length === 0 ? (
              <div className="text-muted small py-2">جاري تحميل حالات عقود النظام...</div>
            ) : (
              <div className="d-flex flex-wrap gap-2 align-items-center">
                {/* Chip for "Show All" */}
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-all ${
                    selectedCount === 0
                      ? "btn-primary shadow-sm"
                      : "btn-light border text-secondary"
                  }`}
                  onClick={handleClearAllStatuses}
                  style={{ transition: "all 0.2s ease" }}
                >
                  <span>📋 عرض جميع الحالات</span>
                  <span className={`badge rounded-circle ${selectedCount === 0 ? "bg-white text-primary" : "bg-secondary text-white"}`}>
                    {kpis.grand_total_orders || 0}
                  </span>
                </button>

                {/* Individual Multi-Select Status Chips */}
                {statuses.map((st, idx) => {
                  const isSelected = (filters.statuses || []).includes(st.key);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleStatus(st.key)}
                      className="btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm border-0 position-relative"
                      style={{
                        backgroundColor: isSelected ? st.color || "#3b82f6" : "#f8fafc",
                        color: isSelected ? "#ffffff" : "#334155",
                        border: isSelected ? `2px solid ${st.color || "#3b82f6"}` : "1px solid #cbd5e1",
                        boxShadow: isSelected ? `0 4px 12px ${st.color}40` : "none",
                        transform: isSelected ? "translateY(-1px)" : "none",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <span className="d-flex align-items-center gap-1">
                        {isSelected && <i className="fa-solid fa-check fs-8"></i>}
                        {st.label}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-pill fs-8 fw-bold"
                        style={{
                          backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                          color: isSelected ? "#ffffff" : "#475569",
                        }}
                      >
                        {st.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Detailed Filters Form */}
        <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white">
          <Card.Body className="p-3">
            <Form onSubmit={handleApplyFilters}>
              <Row className="g-3 align-items-end">
                <Col xs={12} sm={6} md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">من تاريخ 📅</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.date_from}
                      onChange={(e) => handleFilterChange("date_from", e.target.value)}
                      className="rounded-3 border-light-subtle"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">إلى تاريخ 📅</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.date_to}
                      onChange={(e) => handleFilterChange("date_to", e.target.value)}
                      className="rounded-3 border-light-subtle"
                    />
                  </Form.Group>
                </Col>

                {key === "external" ? (
                  <>
                    <Col xs={12} sm={6} md={3}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small text-secondary">فلترة حسب الدولة 🌍</Form.Label>
                        <Form.Select
                          value={filters.country}
                          onChange={(e) => handleFilterChange("country", e.target.value)}
                          className="rounded-3"
                        >
                          <option value="">جميع الدول</option>
                          {countries.map((c, idx) => (
                            <option key={idx} value={c}>
                              {c}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small text-secondary">اسم المكتب الخارجي 🏢</Form.Label>
                        <Form.Select
                          value={filters.external_office_id}
                          onChange={(e) => handleFilterChange("external_office_id", e.target.value)}
                          className="rounded-3"
                        >
                          <option value="">جميع المكاتب الخارجية</option>
                          {externalOffices.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.name} ({o.country})
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </>
                ) : (
                  <>
                    <Col xs={12} sm={6} md={3}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small text-secondary">فلترة حسب المدينة 🏙️</Form.Label>
                        <Form.Select
                          value={filters.city}
                          onChange={(e) => handleFilterChange("city", e.target.value)}
                          className="rounded-3"
                        >
                          <option value="">جميع المدن</option>
                          {cities.map((c, idx) => (
                            <option key={idx} value={c}>
                              {c}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small text-secondary">اسم المكتب السعودي 🇸🇦</Form.Label>
                        <Form.Select
                          value={filters.saudi_office_id}
                          onChange={(e) => handleFilterChange("saudi_office_id", e.target.value)}
                          className="rounded-3"
                        >
                          <option value="">جميع المكاتب السعودية</option>
                          {saudiOffices.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.name} ({o.city})
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </>
                )}

                <Col xs={12} className="d-flex justify-content-end gap-2 mt-3">
                  <Button variant="light" onClick={handleResetFilters} className="px-3 rounded-3 border text-secondary fw-semibold">
                    إعادة ضبط
                  </Button>
                  <Button variant="primary" type="submit" className="px-4 rounded-3 fw-bold shadow-sm">
                    تطبيق الفلاتر
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Dynamic Glassmorphic KPI Summary Cards */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)" }}>
              <Card.Body className="p-3.5 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">
                    {key === "saudi" ? "عدد المكاتب السعودية" : "مكاتب التمثيل الخارجي"}
                  </div>
                  <h2 className="mb-0 fw-bold tracking-tight">
                    {key === "saudi" ? kpis.total_saudi_offices || 0 : kpis.total_external_offices || 0}
                  </h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-4 p-3 d-flex align-items-center justify-content-center" style={{ width: "52px", height: "52px", backdropFilter: "blur(8px)" }}>
                  <i className={`fa-solid ${key === "saudi" ? "fa-building-flag" : "fa-globe"} fs-3 text-white`}></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)" }}>
              <Card.Body className="p-3.5 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">إجمالي عقود المكاتب</div>
                  <h2 className="mb-0 fw-bold tracking-tight">
                    {key === "saudi" ? kpis.total_saudi_orders || 0 : kpis.total_external_orders || 0}
                  </h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-4 p-3 d-flex align-items-center justify-content-center" style={{ width: "52px", height: "52px", backdropFilter: "blur(8px)" }}>
                  <i className="fa-solid fa-file-contract fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #581c87 0%, #7e22ce 50%, #a855f7 100%)" }}>
              <Card.Body className="p-3.5 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">إجمالي المبالغ المالية</div>
                  <h2 className="mb-0 fw-bold tracking-tight">
                    {((key === "saudi" ? kpis.total_saudi_revenue : kpis.total_external_revenue) || 0).toLocaleString()} <small className="fs-6">ر.س</small>
                  </h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-4 p-3 d-flex align-items-center justify-content-center" style={{ width: "52px", height: "52px", backdropFilter: "blur(8px)" }}>
                  <i className="fa-solid fa-money-bill-wave fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #78350f 0%, #b45309 50%, #f59e0b 100%)" }}>
              <Card.Body className="p-3.5 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">إجمالي العقود الكلي بالمصنع</div>
                  <h2 className="mb-0 fw-bold tracking-tight">{kpis.grand_total_orders || 0}</h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-4 p-3 d-flex align-items-center justify-content-center" style={{ width: "52px", height: "52px", backdropFilter: "blur(8px)" }}>
                  <i className="fa-solid fa-chart-line fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Office Table */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
          <Card.Header className="bg-white border-bottom p-3">
            <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="border-0 custom-tabs">
              <Tab eventKey="saudi" title="🇸🇦 المكاتب السعودية (حسب المدن والحالات)" />
              <Tab eventKey="external" title="🌐 مكاتب التمثيل الخارجي (حسب الدول والحالات)" />
            </Tabs>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="p-4"><TableSkeleton rows={5} columns={7} /></div>
            ) : (
              <div className="table-responsive">
                <Table hover align="middle" className="mb-0 text-center border-0">
                  <thead className="bg-slate-50 text-secondary border-bottom">
                    <tr>
                      <SortableHeader title="اسم المكتب" sortKey="name" sortConfig={sortConfig} onRequestSort={requestSort} className="py-3.5 text-dark fw-bold" />
                      <SortableHeader title={key === "saudi" ? "المدينة 🏙️" : "الدولة 🌍"} sortKey={key === "saudi" ? "city" : "country"} sortConfig={sortConfig} onRequestSort={requestSort} className="py-3.5" />
                      <SortableHeader title="إجمالي العقود" sortKey="total_orders" sortConfig={sortConfig} onRequestSort={requestSort} className="py-3.5" />
                      <th className="py-3.5" style={{ minWidth: "260px" }}>توزيع جميع الحالات المختارة وعددهم 📊</th>
                      <SortableHeader title="نسبة الإنجاز" sortKey="completion_rate" sortConfig={sortConfig} onRequestSort={requestSort} className="py-3.5" style={{ minWidth: "150px" }} />
                      <SortableHeader title="إجمالي الإيرادات" sortKey="total_revenue" sortConfig={sortConfig} onRequestSort={requestSort} className="py-3.5" />
                      <th className="py-3.5">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOfficesList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-5 text-center text-muted">
                          لا توجد مكاتب تطابق الفلاتر المحددة
                        </td>
                      </tr>
                    ) : (
                      currentOfficesList.map((office, idx) => (
                        <tr key={office.id || idx} className="hover-row">
                          <td className="fw-bold text-dark fs-6">{office.name}</td>
                          <td>
                            <Badge bg="light" text="dark" className="border px-3 py-1.5 rounded-pill fs-7 fw-semibold">
                              {key === "saudi" ? office.city : office.country}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="rounded-pill px-3 py-1 fw-bold fs-7"
                              onClick={() => handleOpenDetails(office)}
                            >
                              {office.total_orders} عقود 🔍
                            </Button>
                          </td>
                          <td>
                            {(!office.status_counts || office.status_counts.length === 0) ? (
                              <span className="text-muted small">لا توجد عقود</span>
                            ) : (
                              <div className="d-flex flex-wrap justify-content-center gap-1.5">
                                {office.status_counts.map((sc, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="badge rounded-pill px-2.5 py-1 fs-8 d-flex align-items-center gap-1 shadow-sm"
                                    style={{
                                      backgroundColor: sc.color || "#6c757d",
                                      color: "#ffffff",
                                      boxShadow: `0 2px 4px ${sc.color}30`,
                                    }}
                                  >
                                    <span>{sc.label}:</span>
                                    <strong className="bg-white bg-opacity-25 px-1.5 py-0.2 rounded-circle fs-8">{sc.count}</strong>
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2 justify-content-center" style={{ maxWidth: "160px", margin: "0 auto" }}>
                              <ProgressBar
                                now={office.completion_rate}
                                variant={office.completion_rate >= 80 ? "success" : office.completion_rate >= 50 ? "info" : "danger"}
                                style={{ flex: 1, height: "8px" }}
                                className="rounded-pill shadow-inner"
                              />
                              <span className="small fw-bold">{office.completion_rate}%</span>
                            </div>
                          </td>
                          <td className="fw-bold text-primary fs-6">{(office.total_revenue || 0).toLocaleString()} ر.س</td>
                          <td>
                            <Button
                              variant="light"
                              size="sm"
                              className="rounded-3 border text-primary fw-semibold hover-lift"
                              onClick={() => handleOpenDetails(office)}
                            >
                              عرض التفاصيل
                            </Button>
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

        {/* Contract Details Drill-down Modal with Multi-Status Support */}
        <Modal
          show={showDetailsModal}
          onHide={() => setShowDetailsModal(false)}
          size="xl"
          centered
          dir="rtl"
        >
          <Modal.Header closeButton className="border-0 pt-4 px-4 bg-light">
            <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center gap-2">
              <span className="p-2 bg-white rounded-3 border shadow-sm">📜</span>
              <span>تفاصيل عقود مكتب: {selectedOffice?.name} ({key === "saudi" ? selectedOffice?.city : selectedOffice?.country})</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {/* Modal Multi-Status Filter Bar */}
            {selectedOffice?.status_counts && selectedOffice.status_counts.length > 0 && (
              <div className="bg-white p-3 rounded-4 mb-4 border shadow-sm">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="fw-bold small text-secondary">فلترة الحالات داخل النافذة:</span>
                    <button
                      type="button"
                      className={`btn btn-xs rounded-pill px-3 py-1 fs-7 fw-bold border ${
                        modalSelectedStatuses.length === 0 ? "btn-dark text-white" : "btn-light text-dark"
                      }`}
                      onClick={() => setModalSelectedStatuses([])}
                    >
                      عرض الكل ({selectedOffice.total_orders})
                    </button>
                    {selectedOffice.status_counts.map((sc, idx) => {
                      const isModalSelected = modalSelectedStatuses.includes(sc.label) || modalSelectedStatuses.includes(sc.key);
                      return (
                        <button
                          key={idx}
                          type="button"
                          className="btn btn-xs rounded-pill px-3 py-1 fs-7 fw-semibold d-flex align-items-center gap-1 shadow-sm"
                          style={{
                            backgroundColor: isModalSelected ? sc.color || "#6c757d" : "#f1f5f9",
                            color: isModalSelected ? "#ffffff" : "#334155",
                            border: isModalSelected ? `2px solid ${sc.color}` : "1px solid #cbd5e1",
                          }}
                          onClick={() => handleToggleModalStatus(sc.label)}
                        >
                          {isModalSelected && <i className="fa-solid fa-check fs-8 me-1"></i>}
                          <span>{sc.label}:</span>
                          <strong>{sc.count}</strong>
                        </button>
                      );
                    })}
                  </div>
                  {modalSelectedStatuses.length > 0 && (
                    <Button variant="link" size="sm" className="p-0 text-danger text-decoration-none fw-semibold" onClick={() => setModalSelectedStatuses([])}>
                      إلغاء التحديد ✖
                    </Button>
                  )}
                </div>
              </div>
            )}

            {modalOrdersDetails.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="fa-solid fa-folder-open fs-1 text-secondary mb-2 d-block opacity-50"></i>
                لا توجد عقود مسجلة لهذا المكتب تطابق الحالات المحدد.
              </div>
            ) : (
              <div className="table-responsive rounded-3 border">
                <Table hover align="middle" className="text-center mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>#</th>
                      <SortableHeader title="رقم التأشيرة / العقد" sortKey="visa_number" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                      <SortableHeader title="اسم العميل" sortKey="client_name" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                      <SortableHeader title="المسوق / الموظف" sortKey="employee_name" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                      <SortableHeader title="نوع الخدمة" sortKey="service_type" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                      <SortableHeader title="تاريخ العقد" sortKey="contract_date" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                      <SortableHeader title="المبلغ" sortKey="total_price" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                      <SortableHeader title="الحالة" sortKey="status" sortConfig={modalSortConfig} onRequestSort={requestModalSort} />
                    </tr>
                  </thead>
                  <tbody>
                    {modalOrdersDetails.map((order, i) => (
                      <tr key={order.id || i}>
                        <td>{i + 1}</td>
                        <td className="fw-bold text-dark">{order.visa_number}</td>
                        <td>{order.client_name}</td>
                        <td>{order.employee_name}</td>
                        <td><Badge bg="light" text="dark" className="border px-2 py-1">{order.service_type}</Badge></td>
                        <td className="small text-muted">{order.contract_date}</td>
                        <td className="fw-bold text-success">{(order.total_price || 0).toLocaleString()} ر.س</td>
                        <td>
                          <span
                            className="badge rounded-pill px-3 py-1.5 fs-7 fw-semibold shadow-sm"
                            style={{ backgroundColor: order.status_color || "#6c757d", color: "#ffffff" }}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pb-4 px-4">
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)} className="rounded-3 px-4 fw-semibold">
              إغلاق
            </Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
};

export default OfficesPerformanceReport;
