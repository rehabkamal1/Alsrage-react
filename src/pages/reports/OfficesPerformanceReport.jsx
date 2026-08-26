import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Table, Badge, Button, ProgressBar, Tabs, Tab } from "react-bootstrap";
import { getOfficesPerformanceReport } from "../../services/apiService";
import RefreshButton from "../../components/common/RefreshButton";
import TableSkeleton from "../../components/common/TableSkeleton";
import { exportToExcel } from "../../utils/excelHelper";
import { exportToPDF } from "../../utils/pdfHelper";

const OfficesPerformanceReport = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ total_saudi_offices: 0, total_external_offices: 0 });
  const [saudiOffices, setSaudiOffices] = useState([]);
  const [externalOffices, setExternalOffices] = useState([]);
  const [key, setKey] = useState("saudi");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getOfficesPerformanceReport();
      if (res.data) {
        setKpis(res.data.kpis || {});
        setSaudiOffices(res.data.saudi_offices || []);
        setExternalOffices(res.data.external_offices || []);
      }
    } catch (err) {
      console.error("Error fetching offices performance report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const data = key === "saudi" ? saudiOffices : externalOffices;
    const columns = [
      { header: "اسم المكتب", key: "name" },
      { header: key === "saudi" ? "المدينة" : "الدولة", key: key === "saudi" ? "city" : "country" },
      { header: "إجمالي الطلبات", key: "total_orders" },
      { header: "الطلبات المكتملة", key: "completed_orders" },
      { header: "قيد التنفيذ", key: "in_progress_orders" },
      { header: "نسبة الإنجاز %", key: "completion_rate" },
      { header: "إجمالي المبالغ (ر.س)", key: "total_revenue" },
    ];
    exportToExcel(data, columns, `تقرير_أداء_المكاتب_${key}.xlsx`);
  };

  const handleExportPDF = () => {
    const data = key === "saudi" ? saudiOffices : externalOffices;
    const columns = [
      { header: "اسم المكتب", key: "name" },
      { header: key === "saudi" ? "المدينة" : "الدولة", key: key === "saudi" ? "city" : "country" },
      { header: "إجمالي الطلبات", key: "total_orders" },
      { header: "الطلبات المكتملة", key: "completed_orders" },
      { header: "قيد التنفيذ", key: "in_progress_orders" },
      { header: "نسبة الإنجاز %", key: "completion_rate" },
      { header: "إجمالي المبالغ (ر.س)", key: "total_revenue" },
    ];
    exportToPDF(data, columns, `تقرير_أداء_المكاتب_${key}.pdf`);
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "24px" }}>
      <Container fluid>
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
              <span>🏢</span> تقرير أداء المكاتب
            </h1>
            <p className="text-muted mb-0 small">
              تحليل وتقييم معدلات إنجاز وإيرادات المكاتب السعودية ومكاتب التمثيل الخارجي
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
          <Col xs={12} sm={6}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">إجمالي المكاتب السعودية</div>
                  <h2 className="mb-0 fw-extrabold display-6">{kpis.total_saudi_offices || 0}</h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-building-flag fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">إجمالي مكاتب التمثيل الخارجي</div>
                  <h2 className="mb-0 fw-extrabold display-6">{kpis.total_external_offices || 0}</h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-globe fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabs & Table */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Header className="bg-white border-bottom p-3">
            <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="border-0 custom-tabs">
              <Tab eventKey="saudi" title="🇸🇦 المكاتب السعودية" />
              <Tab eventKey="external" title="🌐 مكاتب التمثيل الخارجي" />
            </Tabs>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="p-4"><TableSkeleton rows={4} columns={7} /></div>
            ) : (
              <div className="table-responsive">
                <Table hover align="middle" className="mb-0 text-center">
                  <thead className="bg-light text-secondary border-bottom">
                    <tr>
                      <th className="py-3">اسم المكتب</th>
                      <th className="py-3">{key === "saudi" ? "المدينة" : "الدولة"}</th>
                      <th className="py-3">إجمالي الطلبات</th>
                      <th className="py-3">الطلبات المكتملة</th>
                      <th className="py-3">قيد التنفيذ</th>
                      <th className="py-3" style={{ minWidth: "160px" }}>نسبة الإنجاز</th>
                      <th className="py-3">إجمالي الإيرادات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(key === "saudi" ? saudiOffices : externalOffices).map((office, idx) => (
                      <tr key={office.id || idx}>
                        <td className="fw-bold text-dark">{office.name}</td>
                        <td className="text-muted">{key === "saudi" ? office.city : office.country}</td>
                        <td className="fw-semibold">{office.total_orders}</td>
                        <td><Badge bg="success" className="px-2 py-1">{office.completed_orders}</Badge></td>
                        <td><Badge bg="warning" text="dark" className="px-2 py-1">{office.in_progress_orders}</Badge></td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <ProgressBar now={office.completion_rate} variant={office.completion_rate >= 80 ? "success" : office.completion_rate >= 50 ? "info" : "danger"} style={{ flex: 1, height: "8px" }} className="rounded-pill" />
                            <span className="small fw-bold">{office.completion_rate}%</span>
                          </div>
                        </td>
                        <td className="fw-bold text-primary">{(office.total_revenue || 0).toLocaleString()} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default OfficesPerformanceReport;
