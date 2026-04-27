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
    additional_phone: '',
    address: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    category: 'Individual Client',
    name: '',
    office_name: '',
    phone: '',
    additional_phone: '',
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

  const handleEdit = (client) => {
    setEditingId(client.id);
    setEditFormData({
      category: client.category,
      name: client.name,
      office_name: client.office_name || '',
      phone: client.phone,
      additional_phone: client.additional_phone || '',
      address: client.address || ''
    });
    setShowEditModal(true);
    setValidated(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowEditModal(false);
    setEditFormData({
      category: 'Individual Client',
      name: '',
      office_name: '',
      phone: '',
      additional_phone: '',
      address: ''
    });
    setValidated(false);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    try {
      await updateClient(editingId, editFormData);
      showSuccess('تم التحديث!', 'تم تحديث بيانات العميل بنجاح');
      handleCancelEdit();
      fetchClients();
    } catch (error) {
      const data = error.response?.data;
      let errorMsg = 'حدث خطأ أثناء تحديث البيانات.';
      if (data?.errors) {
        errorMsg = Object.values(data.errors).flat().join('\n');
      } else if (data?.message) {
        errorMsg = data.message;
      }
      showError('خطأ!', errorMsg);
    } finally {
      setLoading(false);
    }
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
        additional_phone: '',
        address: ''
      });
      setValidated(false);
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
                  name="additional_phone"
                  className="form-control"
                  value={formData.additional_phone}
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
                          onClick={() => handleEdit(client)}
                          style={{ background: 'rgba(99, 102, 241, 0.1)', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '8px', borderRadius: '8px', marginLeft: '8px' }}
                          title="تعديل"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
                          title="حذف"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
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

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>تعديل بيانات العميل</h3>
              <button className="modal-close" onClick={handleCancelEdit}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} noValidate className={validated ? 'was-validated' : ''}>
              <div className="form-group">
                <label>التصنيف</label>
                <select
                  name="category"
                  className="form-control"
                  value={editFormData.category}
                  onChange={handleEditChange}
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
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>اسم المكتب (اختياري)</label>
                <input
                  type="text"
                  name="office_name"
                  className="form-control"
                  value={editFormData.office_name}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>رقم الهاتف</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>رقم هاتف إضافي</label>
                <input
                  type="text"
                  name="additional_phone"
                  className="form-control"
                  value={editFormData.additional_phone}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>العنوان</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={editFormData.address}
                  onChange={handleEditChange}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'جاري التحديث...' : 'حفظ التغييرات'}
                </button>
                <button type="button" className="page-btn" onClick={handleCancelEdit} style={{ flex: 1 }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
