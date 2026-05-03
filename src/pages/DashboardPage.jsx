import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Table, Badge, Button } from 'react-bootstrap';
import { getClients, getOrders, getEmployees, getSaudiOffices, getExternalOffices } from '../services/apiService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardPage = () => {
  const [stats, setStats] = useState({
    clients: 0,
    orders: 0,
    employees: 0,
    offices: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [clientsRes, ordersRes, employeesRes, saudiRes, externalRes] = await Promise.all([
          getClients(),
          getOrders(),
          getEmployees(),
          getSaudiOffices(),
          getExternalOffices()
        ]);
        
        setStats({
          clients: clientsRes.data.meta?.total || clientsRes.data.total || clientsRes.data.data?.length || 0,
          orders: ordersRes.data.meta?.total || ordersRes.data.total || ordersRes.data.data?.length || 0,
          employees: employeesRes.data.total || employeesRes.data.data?.length || 0,
          offices: (saudiRes.data.meta?.total || saudiRes.data.total || saudiRes.data.data?.length || 0) + 
                   (externalRes.data.meta?.total || externalRes.data.total || externalRes.data.data?.length || 0)
        });
        
        setRecentOrders(ordersRes.data.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { label: 'قيد الانتظار', bg: 'warning' },
      'processing': { label: 'تحت المعالجة', bg: 'info' },
      'completed': { label: 'مكتمل', bg: 'success' },
      'cancelled': { label: 'ملغي', bg: 'danger' },
      'musaned_paid': { label: 'تم سداد مساند', bg: 'primary' },
    };
    const config = statusMap[status] || { label: status, bg: 'secondary' };
    return (
      <Badge bg={config.bg} className="rounded-pill px-3 py-2 fw-semibold shadow-sm" style={{ fontSize: '0.75rem' }}>
        {config.label}
      </Badge>
    );
  };

  // Chart Data
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'الطلبات',
        data: [12, 19, 3, 5, 2, 3],
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: '#6366f1',
        tension: 0.4,
      },
    ],
  };

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'العملاء الجدد',
        data: [5, 10, 8, 15, 12, 20],
        backgroundColor: '#4f46e5',
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        titleFont: { size: 16 },
        bodyFont: { size: 14 },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 14, weight: '600' }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 14, weight: '600' }
        }
      },
    },
  };

  return (
    <div className="page-container" style={{ animation: 'none' }}>
      <div className="page-header">
        <div className="page-title">
          <h1>لوحة التحكم</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-info">
            <span className="stat-label">إجمالي العملاء</span>
            <span className="stat-value">{stats.clients}</span>
          </div>
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-info">
            <span className="stat-label">الطلبات النشطة</span>
            <span className="stat-value">{stats.orders}</span>
          </div>
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-info">
            <span className="stat-label">الموظفين</span>
            <span className="stat-value">{stats.employees}</span>
          </div>
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-info">
            <span className="stat-label">المكاتب المسجلة</span>
            <span className="stat-value">{stats.offices}</span>
          </div>
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="card chart-card">
          <div className="card-header">
            <h3>تحليل الطلبات الشهري</h3>
          </div>
          <div className="chart-wrapper">
            <Line data={lineData} options={options} />
          </div>
        </div>
        
        <div className="card chart-card">
          <div className="card-header">
            <h3>معدل نمو العملاء</h3>
          </div>
          <div className="chart-wrapper">
            <Bar data={barData} options={options} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
          <h3 className="h5 fw-bold mb-0 text-dark">آخر الطلبات المضافة</h3>
          <Button variant="link" className="text-decoration-none text-primary fw-semibold p-0">عرض الكل</Button>
        </div>
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="border-0 px-4 py-3 text-muted small fw-bold">العميل</th>
                <th className="border-0 px-4 py-3 text-muted small fw-bold">المكتب السعودي</th>
                <th className="border-0 px-4 py-3 text-muted small fw-bold text-center">الحالة</th>
                <th className="border-0 px-4 py-3 text-muted small fw-bold text-center">التاريخ</th>
                <th className="border-0 px-4 py-3 text-muted small fw-bold text-end">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="transition-all hover-bg-light">
                  <td className="px-4 py-3 border-light">
                    <div className="fw-bold text-dark">{order.client?.name || '-'}</div>
                    <div className="text-muted small">{order.client?.phone || ''}</div>
                  </td>
                  <td className="px-4 py-3 border-light fw-medium text-secondary">
                    {order.saudi_office?.name || '-'}
                  </td>
                  <td className="px-4 py-3 border-light text-center">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-4 py-3 border-light text-center small text-muted">
                    {new Date(order.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3 border-light text-end">
                    <Button 
                      variant="light" 
                      size="sm" 
                      className="rounded-circle shadow-sm border"
                      style={{ width: '32px', height: '32px', padding: 0 }}
                      title="عرض التفاصيل"
                    >
                      <i className="fa-solid fa-eye text-primary small"></i>
                    </Button>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">لا يوجد طلبات حديثة</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
