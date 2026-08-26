import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Table, Badge, Button, ProgressBar } from "react-bootstrap";
import { getEmployeesPerformanceReport } from "../../services/apiService";
import RefreshButton from "../../components/common/RefreshButton";
import TableSkeleton from "../../components/common/TableSkeleton";
import { exportToExcel } from "../../utils/excelHelper";
import { exportToPDF } from "../../utils/pdfHelper";

const EmployeesPerformanceReport = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ total_employees: 0, avg_orders_per_emp: 0 });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getEmployeesPerformanceReport();
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

  const handleExportExcel = () => {
    const columns = [
      { header: "اسم الموظف", key: "name" },
      { header: "المسمى الوظيفي", key: "position" },
      { header: "إجمالي الطلبات", key: "total_orders" },
      { header: "الطلبات المكتملة", key: "completed_orders" },
      { header: "الطلبات النشطة", key: "active_orders" },
      { header: "إجمالي المبيعات (ر.س)", key: "total_sales" },
      { header: "نسبة الإنجاز %", key: "completion_rate" },
    ];
    exportToExcel(employees, columns, "تقرير_أداء_الموظفين_والمسوقين.xlsx");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "اسم الموظف", key: "name" },
      { header: "المسمى الوظيفي", key: "position" },
      { header: "إجمالي الطلبات", key: "total_orders" },
      { header: "الطلبات المكتملة", key: "completed_orders" },
      { header: "الطلبات النشطة", key: "active_orders" },
      { header: "إجمالي المبيعات (ر.س)", key: "total_sales" },
      { header: "نسبة الإنجاز %", key: "completion_rate" },
    ];
    exportToPDF(employees, columns, "تقرير_أداء_الموظفين_والمسوقين.pdf");
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
              تحليل وتقييم إنتاجية ومبيعات ومعدلات إنجاز الموظفين ومسؤولي المتابعة
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
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">عدد الموظفين النشطين</div>
                  <h2 className="mb-0 fw-extrabold display-6">{kpis.total_employees || 0}</h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                  <i className="fa-solid fa-users-gear fs-3 text-white"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="border-0 shadow-sm rounded-4 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" }}>
              <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 fs-7 fw-semibold mb-1">متوسط الطلبات لكل موظف</div>
                  <h2 className="mb-0 fw-extrabold display-6">{kpis.avg_orders_per_emp || 0} <span className="fs-6 font-normal">طلب</span></h2>
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
              <div className="p-4"><TableSkeleton rows={5} columns={7} /></div>
            ) : (
              <div className="table-responsive">
                <Table hover align="middle" className="mb-0 text-center">
                  <thead className="bg-light text-secondary border-bottom">
                    <tr>
                      <th className="py-3">اسم الموظف</th>
                      <th className="py-3">المسمى الوظيفي</th>
                      <th className="py-3">إجمالي الطلبات المسندة</th>
                      <th className="py-3">الطلبات المكتملة</th>
                      <th className="py-3">الطلبات النشطة</th>
                      <th className="py-3" style={{ minWidth: "160px" }}>نسبة الإنجاز</th>
                      <th className="py-3">إجمالي قيمة المبيعات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, idx) => (
                      <tr key={emp.id || idx}>
                        <td className="fw-bold text-dark">{emp.name}</td>
                        <td><Badge bg="secondary" className="px-2 py-1">{emp.position}</Badge></td>
                        <td className="fw-semibold">{emp.total_orders}</td>
                        <td><Badge bg="success" className="px-2 py-1">{emp.completed_orders}</Badge></td>
                        <td><Badge bg="info" className="px-2 py-1 text-white">{emp.active_orders}</Badge></td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <ProgressBar now={emp.completion_rate} variant={emp.completion_rate >= 70 ? "success" : "primary"} style={{ flex: 1, height: "8px" }} className="rounded-pill" />
                            <span className="small fw-bold">{emp.completion_rate}%</span>
                          </div>
                        </td>
                        <td className="fw-bold text-success">{(emp.total_sales || 0).toLocaleString()} ر.س</td>
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

export default EmployeesPerformanceReport;
