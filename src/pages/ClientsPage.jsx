import React, { useState, useEffect } from 'react';
import { getClients, createClient, deleteClient } from '../services/apiService';
import { showSuccess, showError, showConfirm } from '../utils/swalHelper';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    category: 'Individual Client',
    name: '',
    office_name: '',
    phone: '',
    extra_phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchClients();
  }, []);

  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const displayedClients = clients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchClients = async () => {
    try {
      const response = await getClients();
      setClients(response.data.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    try {
      await createClient(formData);
      showSuccess('تمت الإضافة!', 'تم إضافة العميل بنجاح');
      setFormData({ 
        category: 'Individual Client', 
        name: '', 
        office_name: '', 
        phone: '', 
        extra_phone: '', 
        address: '' 
      });
      setValidated(false);
      setCurrentPage(1);
      fetchClients();
    } catch (error) {
      showError('خطأ!', 'حدث خطأ أثناء إضافة العميل.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('هل أنت متأكد؟', 'سيتم حذف العميل نهائياً');
    if (result.isConfirmed) {
      try {
        await deleteClient(id);
        showSuccess('تم الحذف');
        fetchClients();
      } catch (error) {
        showError('خطأ', 'حدث خطأ أثناء الحذف');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>إدارة العملاء</h1>
        </div>
      </div>

      <div className="admin-grid-layout">
        <div className="form-side">
          <div className="card">
            <h3>إضافة عميل جديد</h3>
            <form onSubmit={handleSubmit} noValidate className={validated ? 'was-validated' : ''}>
              <div className="form-group">
                <label>التصنيف</label>
                <select
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="Individual Client">عميل فردي</option>
                  <option value="Service Office">مكتب خدمات</option>
                </select>
              </div>
              <div className="form-group">
                <label>الاسم بالكامل</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">يرجى إدخال اسم العميل</div>
              </div>
              <div className="form-group">
                <label>اسم المكتب (اختياري)</label>
                <input
                  type="text"
                  name="office_name"
                  className="form-control"
                  value={formData.office_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>رقم الهاتف</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">يرجى إدخال رقم الهاتف</div>
              </div>
              <div className="form-group">
                <label>رقم هاتف إضافي</label>
                <input
                  type="text"
                  name="extra_phone"
                  className="form-control"
                  value={formData.extra_phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>العنوان</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'جاري الإضافة...' : 'إضافة عميل'}
              </button>
            </form>          </div>
        </div>

        <div className="table-side">
          <div className="card">
            <h3>قائمة العملاء</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>التصنيف</th>
                    <th>الاسم</th>
                    <th>اسم المكتب</th>
                    <th>رقم الهاتف</th>
                    <th>العنوان</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedClients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <span className={`badge ${client.category === 'Service Office' ? 'badge-pending' : 'badge-done'}`}>
                          {client.category === 'Service Office' ? 'مكتب خدمات' : 'عميل فردي'}
                        </span>
                      </td>
                      <td>{client.name}</td>
                      <td>{client.office_name}</td>
                      <td>{client.phone}</td>
                      <td>{client.address}</td>
                      <td>
                        <button 
                          onClick={() => handleDelete(client.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>لا يوجد عملاء مضافين بعد</td>
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

export default ClientsPage;
