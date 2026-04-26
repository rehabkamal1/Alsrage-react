import React, { useState, useEffect } from 'react';
import { getOrders, createOrder, deleteOrder, getClients, getSaudiOffices, getExternalOffices } from '../services/apiService';
import SearchableDropdown from '../components/SearchableDropdown';
import { showSuccess, showError, showConfirm } from '../utils/swalHelper';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [saudiOffices, setSaudiOffices] = useState([]);
  const [externalOffices, setExternalOffices] = useState([]);
  
  const [formData, setFormData] = useState({
    client_id: '',
    saudi_office_id: '',
    external_office_id: '',
    details: '',
    status: 'pending'
  });
  
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const displayedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchInitialData = async () => {
    try {
      const [ordersRes, clientsRes, saudiRes, externalRes] = await Promise.all([
        getOrders(),
        getClients(),
        getSaudiOffices(),
        getExternalOffices()
      ]);
      setOrders(ordersRes.data.data);
      setClients(clientsRes.data.data);
      setSaudiOffices(saudiRes.data.data);
      setExternalOffices(externalRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false || !formData.client_id) {
      e.stopPropagation();
      setValidated(true);
      if (!formData.client_id) {
        showError('تنبيه', 'يرجى اختيار العميل أولاً');
      }
      return;
    }

    setLoading(true);
    try {
      await createOrder(formData);
      showSuccess('تمت الإضافة!', 'تم إضافة الطلب بنجاح');
      setFormData({ client_id: '', saudi_office_id: '', external_office_id: '', status: 'pending' });
      setValidated(false);
      setCurrentPage(1);
      fetchInitialData();
    } catch (error) {
      showError('خطأ!', 'حدث خطأ أثناء إضافة الطلب.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('هل أنت متأكد؟', 'سيتم حذف الطلب نهائياً');
    if (result.isConfirmed) {
      try {
        await deleteOrder(id);
        showSuccess('تم الحذف');
        fetchInitialData();
      } catch (error) {
        showError('خطأ', 'حدث خطأ أثناء الحذف');
      }
    }
  };

  // Helper to find client info
  const selectedClient = clients.find(c => c.id === parseInt(formData.client_id));

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>إدارة الطلبات</h1>
        </div>
      </div>

      <div className="admin-grid-layout">
        <div className="form-side">
          <div className="card">
            <h3>إضافة طلب جديد</h3>
            <form onSubmit={handleSubmit} noValidate className={validated ? 'was-validated' : ''}>
              <div className="form-group">
                <label>اختر العميل</label>
                <SearchableDropdown
                  options={clients}
                  placeholder="ابحث عن عميل بالاسم..."
                  onSelect={(id) => setFormData({ ...formData, client_id: id })}
                  value={formData.client_id}
                />
                {selectedClient && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '8px 12px', 
                    background: 'var(--sidebar-active-bg)', 
                    borderRadius: '8px',
                    border: '1px solid var(--primary-light)',
                    fontSize: '0.85rem',
                    color: 'var(--primary-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.28-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    الهاتف: <strong>{selectedClient.phone}</strong>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>المكتب السعودي</label>
                <SearchableDropdown
                  options={saudiOffices}
                  placeholder="ابحث عن مكتب سعودي..."
                  onSelect={(id) => setFormData({ ...formData, saudi_office_id: id })}
                  value={formData.saudi_office_id}
                />
              </div>

              <div className="form-group">
                <label>المكتب الخارجي</label>
                <SearchableDropdown
                  options={externalOffices}
                  placeholder="ابحث عن مكتب خارجي..."
                  onSelect={(id) => setFormData({ ...formData, external_office_id: id })}
                  value={formData.external_office_id}
                />
              </div>

              <div className="form-group">
                <label>تفاصيل الطلب</label>
                <textarea
                  name="details"
                  className="form-control"
                  rows="2"
                  value={formData.details}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'جاري الإضافة...' : 'إضافة طلب'}
              </button>
            </form>
          </div>
        </div>

        <div className="table-side">
          <div className="card">
            <h3>قائمة الطلبات</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>العميل</th>
                    <th>رقم الهاتف</th>
                    <th>المكتب السعودي</th>
                    <th>المكتب الخارجي</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.client?.name}</td>
                      <td>{order.client?.phone}</td>
                      <td>{order.saudi_office?.name || '-'}</td>
                      <td>{order.external_office?.name || '-'}</td>
                      <td>
                        <span className={`badge badge-${order.status}`}>
                          {order.status === 'pending' ? 'قيد الانتظار' : order.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleDelete(order.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>لا يوجد طلبات مضافة بعد</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-btn" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </button>
                <span className="page-info">صفحة {currentPage} من {totalPages}</span>
                <button 
                  className="page-btn" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
