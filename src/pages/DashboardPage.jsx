import React, { useState, useEffect, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Table,
  Badge,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  ProgressBar,
} from "react-bootstrap";
import RefreshButton from "../components/common/RefreshButton";
import DateFilterBar from "../components/common/DateFilterBar";
import useAutoRefresh from "../hooks/useAutoRefresh";
import {
  getClients,
  getOrders,
  getEmployees,
  getSaudiOffices,
  getExternalOffices,
} from "../services/apiService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const RECENT_LIMIT = 6;

const DashboardPage = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    clients: 0,
    orders: 0,
    employees: 0,
    offices: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");

  const [orderStatusCounts, setOrderStatusCounts] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    musaned_paid: 0,
  });
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [monthlyOrders, setMonthlyOrders] = useState({
    labels: [],
    data: [],
  });
  const [monthlyClients, setMonthlyClients] = useState({
    labels: [],
    data: [],
  });

  const [growth, setGrowth] = useState({
    clients: 0,
    orders: 0,
  });

  const fetchDashboardData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      try {
        const params = {};
        if (fromDate) params.from_date = fromDate;
        if (toDate) params.to_date = toDate;

        const [clientsRes, ordersRes, employeesRes, saudiRes, externalRes] =
          await Promise.all([
            getClients(params),
            getOrders(params),
            getEmployees(params),
            getSaudiOffices(params),
            getExternalOffices(params),
          ]);

        const clientList = clientsRes.data?.data || clientsRes.data || [];
        const orderList = ordersRes.data?.data || ordersRes.data || [];
        const employeeList = employeesRes.data?.data || employeesRes.data || [];
        const saudiList = saudiRes.data?.data || saudiRes.data || [];
        const externalList = externalRes.data?.data || externalRes.data || [];

        const totalClients =
          clientsRes.data?.meta?.total ??
          clientsRes.data?.total ??
          clientList.length;
        const totalOrders =
          ordersRes.data?.meta?.total ??
          ordersRes.data?.total ??
          orderList.length;

        setStats({
          clients: totalClients,
          orders: totalOrders,
          employees: employeesRes.data?.total ?? employeeList.length,
          offices:
            (saudiRes.data?.meta?.total ??
              saudiRes.data?.total ??
              saudiList.length) +
            (externalRes.data?.meta?.total ??
              externalRes.data?.total ??
              externalList.length),
        });

        setRecentOrders(orderList.slice(0, RECENT_LIMIT));
        setRecentClients(clientList.slice(0, RECENT_LIMIT));

        const statusCounts = {
          pending: 0,
          processing: 0,
          completed: 0,
          cancelled: 0,
          musaned_paid: 0,
        };
        orderList.forEach((order) => {
          if (order.status && statusCounts[order.status] !== undefined) {
            statusCounts[order.status]++;
          } else if (order.status === "canceled") {
            statusCounts.cancelled++;
          }
        });
        setOrderStatusCounts(statusCounts);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const last6 = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(currentYear, currentMonth - i, 1);
          last6.push({
            monthIndex: d.getMonth(),
            year: d.getFullYear(),
            label: `${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
          });
        }

        const orderCountsMap = {};
        last6.forEach((m) => {
          orderCountsMap[`${m.year}-${m.monthIndex}`] = 0;
        });
        orderList.forEach((order) => {
          if (order.created_at) {
            const d = new Date(order.created_at);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (orderCountsMap[key] !== undefined) orderCountsMap[key]++;
          }
        });

        const monthlyOrdersLabels = last6.map((m) => m.label);
        const monthlyOrdersData = last6.map(
          (m) => orderCountsMap[`${m.year}-${m.monthIndex}`],
        );

        setMonthlyOrders({
          labels: monthlyOrdersLabels,
          data: monthlyOrdersData,
        });

        const clientCountsMap = {};
        last6.forEach((m) => {
          clientCountsMap[`${m.year}-${m.monthIndex}`] = 0;
        });
        clientList.forEach((client) => {
          if (client.created_at) {
            const d = new Date(client.created_at);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (clientCountsMap[key] !== undefined) clientCountsMap[key]++;
          }
        });

        const monthlyClientsLabels = last6.map((m) => m.label);
        const monthlyClientsData = last6.map(
          (m) => clientCountsMap[`${m.year}-${m.monthIndex}`],
        );

        setMonthlyClients({
          labels: monthlyClientsLabels,
          data: monthlyClientsData,
        });

        const calcGrowth = (arr) => {
          if (!arr || arr.length < 2) return 0;
          const prev = arr[arr.length - 2] || 0;
          const curr = arr[arr.length - 1] || 0;
          if (prev === 0) return curr > 0 ? 100 : 0;
          return Math.round(((curr - prev) / prev) * 100);
        };

        setGrowth({
          clients: calcGrowth(monthlyClientsData),
          orders: calcGrowth(monthlyOrdersData),
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [fromDate, toDate],
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useAutoRefresh(fetchDashboardData, 12000);

  const handleDateFilterChange = ({ fromDate, toDate, preset }) => {
    setFromDate(fromDate);
    setToDate(toDate);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: "قيد الانتظار", pulse: "warning" },
      processing: { label: "تحت المعالجة", pulse: "info" },
      completed: { label: "مكتمل", pulse: "success" },
      cancelled: { label: "ملغي", pulse: "danger" },
      canceled: { label: "ملغي", pulse: "danger" },
      musaned_paid: { label: "تم سداد مساند", pulse: "primary" },
    };
    const config = statusMap[status] || {
      label: status,
      pulse: "secondary",
    };
    return (
      <div className="d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill border bg-light shadow-sm">
        <span className={`pulse-dot ${config.pulse}`}></span>
        <span className="fw-semibold small text-dark">{config.label}</span>
      </div>
    );
  };

  const lineData = {
    labels: monthlyOrders.labels,
    datasets: [
      {
        label: "الطلبات",
        data: monthlyOrders.data,
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        borderColor: "#6366f1",
        borderWidth: 3,
        pointBackgroundColor: "#4f46e5",
        pointBorderColor: "#fff",
        pointHoverRadius: 7,
        tension: 0.4,
      },
    ],
  };

  const barData = {
    labels: monthlyClients.labels,
    datasets: [
      {
        label: "العملاء الجدد",
        data: monthlyClients.data,
        backgroundColor: "rgba(16, 185, 129, 0.85)",
        hoverBackgroundColor: "#10b981",
        borderRadius: 10,
        barThickness: 22,
      },
    ],
  };

  const doughnutData = {
    labels: ["قيد الانتظار", "تحت المعالجة", "مكتمل", "سداد مساند", "ملغي"],
    datasets: [
      {
        data: [
          orderStatusCounts.pending,
          orderStatusCounts.processing,
          orderStatusCounts.completed,
          orderStatusCounts.musaned_paid,
          orderStatusCounts.cancelled,
        ],
        backgroundColor: [
          "#f59e0b",
          "#06b6d4",
          "#10b981",
          "#6366f1",
          "#ef4444",
        ],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 12,
        cornerRadius: 10,
        titleFont: { size: 14, family: "Cairo" },
        bodyFont: { size: 13, family: "Cairo" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(226, 232, 240, 0.6)" },
        ticks: {
          font: { size: 12, family: "Cairo", weight: "600" },
          color: "#64748b",
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 12, family: "Cairo", weight: "600" },
          color: "#64748b",
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 12,
        cornerRadius: 10,
        titleFont: { size: 14, family: "Cairo" },
        bodyFont: { size: 13, family: "Cairo" },
      },
    },
  };

  const doughnutLegend = doughnutData.labels.map((label, i) => ({
    label,
    color: doughnutData.datasets[0].backgroundColor[i],
  }));

  return (
    <div className="page-container pb-5">
      <div className="dash-hero-card p-4 p-md-5 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span
              className="badge rounded-pill px-3 py-1.5 small fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                backdropFilter: "blur(6px)",
                fontSize: "0.85rem",
              }}
            >
              <i className="fa-solid fa-sparkles text-warning me-1"></i> مرحباً
              بك مجدداً 👋
            </span>
            <span className="text-white-50 small">
              |{" "}
              {new Date().toLocaleDateString("ar-EG", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="display-6 fw-bold mb-2 text-white">
            مركز قيادة النظام والمعلومات
          </h1>
          <p
            className="mb-0 text-white-50"
            style={{ maxWidth: "640px", fontSize: "0.95rem" }}
          >
            رؤية بانورامية شاملة لكافة أنشطة المؤسسة والعمليات مع أدوات فلترة
            زمنية فورية ومتقدمة.
          </p>
        </div>

        <div className="d-flex align-items-center gap-3">
          <RefreshButton onClick={fetchDashboardData} loading={loading} />

          <Button
            variant="outline-light"
            className="rounded-pill px-3 py-2.5 fw-semibold border-white border-opacity-25 text-white"
            onClick={() => window.print()}
            title="طباعة التقرير"
          >
            <i className="fa-solid fa-print"></i>
          </Button>
        </div>
      </div>

      <DateFilterBar
        onFilterChange={handleDateFilterChange}
        initialFromDate={fromDate}
        initialToDate={toDate}
        initialPreset="all"
        size="md"
      />

      <Row className="g-4 mb-4">
        <Col xs={12} md={4}>
          <div className="dash-stat-box glow-ring-box">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="text-muted small fw-bold d-block mb-1">
                  إجمالي العملاء
                </span>
                <h2 className="display-6 fw-extrabold text-dark mb-0">
                  {stats.clients}
                </h2>
              </div>
              <div className="dash-stat-icon-wrapper primary">
                <i className="fa-solid fa-users"></i>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-between pt-2 border-top">
              <span
                className={`badge rounded-pill px-2.5 py-1 small fw-semibold ${
                  growth.clients >= 0
                    ? "bg-primary bg-opacity-10 text-primary"
                    : "bg-danger bg-opacity-10 text-danger"
                }`}
              >
                <i
                  className={`fa-solid ${
                    growth.clients >= 0
                      ? "fa-arrow-trend-up"
                      : "fa-arrow-trend-down"
                  } me-1`}
                ></i>
                {growth.clients >= 0 ? "+" : ""}
                {growth.clients}% نمو
              </span>
              <span className="text-muted small">عملاء مسجلين</span>
            </div>
          </div>
        </Col>

        <Col xs={12} md={4}>
          <div className="dash-stat-box glow-ring-box">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="text-muted small fw-bold d-block mb-1">
                  الطلبات النشطة
                </span>
                <h2 className="display-6 fw-extrabold text-dark mb-0">
                  {stats.orders}
                </h2>
              </div>
              <div className="dash-stat-icon-wrapper success">
                <i className="fa-solid fa-file-invoice"></i>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-between pt-2 border-top">
              <span
                className={`badge rounded-pill px-2.5 py-1 small fw-semibold ${
                  growth.orders >= 0
                    ? "bg-success bg-opacity-10 text-success"
                    : "bg-danger bg-opacity-10 text-danger"
                }`}
              >
                <i
                  className={`fa-solid ${
                    growth.orders >= 0
                      ? "fa-arrow-trend-up"
                      : "fa-arrow-trend-down"
                  } me-1`}
                ></i>
                {growth.orders >= 0 ? "+" : ""}
                {growth.orders}% تغير
              </span>
              <span className="text-muted small">طلبات جارية</span>
            </div>
          </div>
        </Col>

        <Col xs={12} md={4}>
          <div className="dash-stat-box glow-ring-box">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="text-muted small fw-bold d-block mb-1">
                  المكاتب المسجلة
                </span>
                <h2 className="display-6 fw-extrabold text-dark mb-0">
                  {stats.offices}
                </h2>
              </div>
              <div className="dash-stat-icon-wrapper danger">
                <i className="fa-solid fa-building"></i>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-between pt-2 border-top">
              <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2.5 py-1 small fw-semibold">
                <i className="fa-solid fa-earth-americas me-1"></i> شبكة المكاتب
              </span>
              <span className="text-muted small">داخل وخارج السعودية</span>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col xs={12} lg={4}>
          <div className="dash-glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-1">حركة الطلبات الشهرية</h6>
                <span className="text-muted small">
                  تتبع الإنشاء على مدى آخر 6 أشهر
                </span>
              </div>
              <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 small">
                {monthlyOrders.data.reduce((a, b) => a + b, 0)} طلب
              </span>
            </div>
            <div style={{ height: "230px" }}>
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>
        </Col>

        <Col xs={12} lg={4}>
          <div className="dash-glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-1">نمو قاعدة العملاء</h6>
                <span className="text-muted small">معدل الانضمام الشهري</span>
              </div>
              <span className="badge bg-success-subtle text-success rounded-pill px-2.5 py-1 small">
                {monthlyClients.data.reduce((a, b) => a + b, 0)} عميل
              </span>
            </div>
            <div style={{ height: "230px" }}>
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </Col>

        <Col xs={12} lg={4}>
          <div className="dash-glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-1">نسب توزيع الحالات</h6>
                <span className="text-muted small">
                  توزيع الطلبات حسب الحالة
                </span>
              </div>
              <span className="badge bg-info-subtle text-info rounded-pill px-2.5 py-1 small">
                {stats.orders} إجمالي
              </span>
            </div>
            <div style={{ height: "180px" }} className="position-relative">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="position-absolute top-50 start-50 translate-middle text-center pointer-events-none">
                <span className="d-block display-7 fw-bold text-dark">
                  {stats.orders}
                </span>
                <span
                  className="text-muted small"
                  style={{ fontSize: "0.75rem" }}
                >
                  طلب
                </span>
              </div>
            </div>
            <div className="d-flex flex-wrap justify-content-center gap-2 mt-3 pt-2 border-top">
              {doughnutLegend.map((st, i) => (
                <span
                  key={i}
                  className="badge bg-light text-dark border rounded-pill px-2.5 py-1 small d-flex align-items-center gap-1"
                >
                  <span
                    className="rounded-circle"
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: st.color,
                    }}
                  ></span>
                  {st.label}
                </span>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      <div className="dash-glass-card overflow-hidden">
        <div className="p-4 bg-white border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2 bg-light p-1 rounded-3 border">
            <button
              className={`activity-tab-btn ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <i className="fa-solid fa-file-lines me-1.5"></i> أحدث الطلبات (
              {recentOrders.length})
            </button>
            <button
              className={`activity-tab-btn ${activeTab === "clients" ? "active" : ""}`}
              onClick={() => setActiveTab("clients")}
            >
              <i className="fa-solid fa-users me-1.5"></i> أحدث العملاء (
              {recentClients.length})
            </button>
          </div>

          <span className="text-muted small fw-semibold">
            {activeTab === "orders"
              ? `أحدث ${recentOrders.length} طلبات مسجلة`
              : `أحدث ${recentClients.length} عملاء مسجلين`}
          </span>
        </div>

        {activeTab === "orders" && (
          <div className="table-responsive">
            <Table hover className="dash-table align-middle mb-0">
              <thead>
                <tr>
                  <th>اسم العميل</th>
                  <th>المكتب السعودي</th>
                  <th className="text-center">حالة الطلب</th>
                  <th className="text-center">تاريخ الإضافة</th>
                  <th className="text-end">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center shadow-sm"
                          style={{
                            width: "42px",
                            height: "42px",
                            fontSize: "1rem",
                          }}
                        >
                          {order.client?.name
                            ? order.client.name.charAt(0)
                            : "ع"}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">
                            {order.client?.name || "غير محدد"}
                          </div>
                          <div className="text-muted small dir-ltr text-end">
                            {order.client?.phone || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="fw-medium text-secondary">
                        <i className="fa-regular fa-building me-1 text-muted"></i>
                        {order.saudi_office?.name || "-"}
                      </span>
                    </td>
                    <td className="text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-secondary border px-3 py-1.5 rounded-pill font-monospace small">
                        {new Date(order.created_at).toLocaleDateString(
                          "ar-EG",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </span>
                    </td>
                    <td className="text-end">
                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle shadow-sm border text-primary hover-bg-primary hover-text-white transition-all"
                        style={{ width: "36px", height: "36px" }}
                        onClick={() => onNavigate?.("orders")}
                        title="عرض التفاصيل"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <div className="py-4">
                        <i className="fa-regular fa-folder-open display-4 text-muted opacity-50 mb-3 d-block"></i>
                        <p className="fw-bold mb-1">
                          لا توجد طلبات حديثة في هذه الفترة الزمنية
                        </p>
                        <span className="small text-muted">
                          جرّب اختيار نطاق زمني أكبر من شريط الفلترة أعلاه.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}

        {activeTab === "clients" && (
          <div className="table-responsive">
            <Table hover className="dash-table align-middle mb-0">
              <thead>
                <tr>
                  <th>نوع العميل</th>
                  <th>رقم هاتف المندوب</th>
                  <th>المندوب</th>
                  <th>اسم صاحب التأشيرة</th>
                  <th className="text-center">تاريخ التسجيل</th>
                  <th className="text-end">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {recentClients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <Badge
                        bg={
                          client.client_type === "office" ? "info" : "secondary"
                        }
                        className="rounded-pill px-3 py-1.5"
                      >
                        {client.client_type === "office" ? "مكتب" : "فرد"}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-muted font-monospace dir-ltr">
                        {client.phone}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle bg-success bg-opacity-10 text-success fw-bold d-flex align-items-center justify-content-center shadow-sm"
                          style={{
                            width: "32px",
                            height: "32px",
                            fontSize: "0.85rem",
                          }}
                        >
                          {client.name ? client.name.charAt(0) : "م"}
                        </div>
                        <span className="fw-semibold text-dark">
                          {client.name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="fw-bold text-dark">
                      {client.employee?.name || "-"}
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-secondary border px-3 py-1.5 rounded-pill font-monospace small">
                        {new Date(client.created_at).toLocaleDateString(
                          "ar-EG",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </span>
                    </td>
                    <td className="text-end">
                      <a
                        href={`tel:${client.phone}`}
                        className="btn btn-light btn-sm rounded-circle shadow-sm border text-success hover-bg-success hover-text-white transition-all me-1"
                        style={{
                          width: "36px",
                          height: "36px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="اتصال بالمندوب"
                      >
                        <i className="fa-solid fa-phone"></i>
                      </a>
                    </td>
                  </tr>
                ))}
                {recentClients.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <div className="py-4">
                        <i className="fa-regular fa-user display-4 text-muted opacity-50 mb-3 d-block"></i>
                        <p className="fw-bold mb-1">
                          لا يوجد عملاء مسجلين في هذه الفترة
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
