import React, { useState, useEffect } from 'react';
import { getExternalOffices, createExternalOffice, updateExternalOffice, deleteExternalOffice } from '../services/apiService';
import { showSuccess, showError, showConfirm } from '../utils/swalHelper';

const ExternalOfficesPage = () => {
  const [offices, setOffices] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    contacts: [{ name: '', phone: '' }],
  });
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    country: '',
    contacts: [{ name: '', phone: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchOffices();
  }, []);

  const totalPages = Math.ceil(offices.length / itemsPerPage);
  const displayedOffices = offices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleContactChange = (index, e) => {
    const newContacts = [...formData.contacts];
    newContacts[index][e.target.name] = e.target.value;
    setFormData({ ...formData, contacts: newContacts });
  };

  const addContact = () => {
    setFormData({ ...formData, contacts: [...formData.contacts, { name: '', phone: '' }] });
  };

  const removeContact = (index) => {
    const newContacts = formData.contacts.filter((_, i) => i !== index);
    setFormData({ ...formData, contacts: newContacts });
  };

  const fetchOffices = async () => {
    try {
      const response = await getExternalOffices();
      setOffices(response.data.data);
    } catch (error) {
      console.error('Error fetching offices:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (office) => {
    setEditingId(office.id);
    setEditFormData({
      name: office.name,
      country: office.country,
      contacts: office.contacts && office.contacts.length > 0 ? [...office.contacts] : [{ name: '', phone: '' }]
    });
    setShowEditModal(true);
    setValidated(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowEditModal(false);
    setEditFormData({ name: '', country: '', contacts: [{ name: '', phone: '' }] });
    setValidated(false);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditContactChange = (index, e) => {
    const newContacts = [...editFormData.contacts];
    newContacts[index][e.target.name] = e.target.value;
    setEditFormData({ ...editFormData, contacts: newContacts });
  };

  const addEditContact = () => {
    setEditFormData({ ...editFormData, contacts: [...editFormData.contacts, { name: '', phone: '' }] });
  };

  const removeEditContact = (index) => {
    const newContacts = editFormData.contacts.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, contacts: newContacts });
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
      await updateExternalOffice(editingId, editFormData);
      showSuccess('تم التحديث!', 'تم تحديث بيانات المكتب بنجاح');
      handleCancelEdit();
      fetchOffices();
    } catch (error) {
      showError('خطأ!', 'حدث خطأ أثناء تحديث البيانات.');
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
      await createExternalOffice(formData);
      showSuccess('تمت الإضافة!', 'تم إضافة المكتب الخارجي بنجاح');
      setFormData({ name: '', country: '', contacts: [{ name: '', phone: '' }] });
      setValidated(false);
      fetchOffices();
    } catch (error) {
      showError('خطأ!', 'حدث خطأ أثناء إضافة المكتب.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('هل أنت متأكد؟', 'سيتم حذف المكتب الخارجي نهائياً');
    if (result.isConfirmed) {
      try {
        await deleteExternalOffice(id);
        showSuccess('تم الحذف');
        fetchOffices();
      } catch (error) {
        showError('خطأ', 'حدث خطأ أثناء الحذف');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>إدارة المكاتب الخارجية</h1>
        </div>
      </div>

      <div className="admin-grid-layout">
        <div className="form-side">
          <div className="card">
            <h3>إضافة مكتب خارجي جديد</h3>
            <form onSubmit={handleSubmit} noValidate className={validated ? 'was-validated' : ''}>
              <div className="form-group">
                <label>اسم المكتب</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">يرجى إدخال اسم المكتب</div>
              </div>
              <div className="form-group">
                <label>الدولة</label>
                <input
                  type="text"
                  name="country"
                  className="form-control"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">يرجى إدخال الدولة</div>
              </div>

              <div className="contacts-section">
                <h4 style={{ marginBottom: '16px', fontSize: '0.95rem' }}>الموظفون وأرقام التواصل</h4>
                {formData.contacts.map((contact, index) => (
                  <div key={index} className="contact-item">
                    <h5>الموظف #{index + 1}</h5>
                    <div className="form-group">
                      <label>اسم الموظف</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, e)}
                        required
                      />
                      <div className="invalid-feedback">يرجى إدخال اسم الموظف</div>
                    </div>
                    <div className="form-group">
                      <label>رقم الهاتف</label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, e)}
                        required
                      />
                      <div className="invalid-feedback">يرجى إدخال رقم الهاتف</div>
                    </div>
                    {formData.contacts.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeContact(index)}
                        className="text-danger-btn"
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', cursor: 'pointer', padding: '0', marginTop: '8px' }}
                      >
                        حذف هذا الموظف
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addContact}
                  className="btn-secondary"
                  style={{ width: '100%', marginBottom: '24px', padding: '10px', background: 'var(--sidebar-active-bg)', border: '1px dashed var(--primary)', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer' }}
                >
                  + إضافة موظف آخر
                </button>
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'جاري الإضافة...' : 'إضافة مكتب خارجي'}
              </button>
            </form>
          </div>
        </div>

        <div className="table-side">
          <div className="card">
            <h3>قائمة المكاتب الخارجية</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>اسم المكتب</th>
                    <th>الدولة</th>
                    <th>الموظفون والأرقام</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOffices.map((office) => (
                    <tr key={office.id}>
                      <td>{office.name}</td>
                      <td>{office.country}</td>
                      <td>
                        {office.contacts && office.contacts.map((c, i) => (
                          <div key={i} style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                            <strong>{c.name}:</strong> {c.phone}
                          </div>
                        ))}
                      </td>
                      <td>
                        <button 
                          onClick={() => handleEdit(office)}
                          style={{ background: 'rgba(99, 102, 241, 0.1)', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '8px', borderRadius: '8px', marginLeft: '8px' }}
                          title="تعديل"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(office.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
                          title="حذف"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {offices.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>لا يوجد مكاتب مضافة بعد</td>
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
              <h3>تعديل بيانات المكتب الخارجي</h3>
              <button className="modal-close" onClick={handleCancelEdit}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} noValidate className={validated ? 'was-validated' : ''}>
              <div className="form-group">
                <label>اسم المكتب</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>الدولة</label>
                <input
                  type="text"
                  name="country"
                  className="form-control"
                  value={editFormData.country}
                  onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                  required
                />
              </div>

              <div className="contacts-section">
                <h4 style={{ marginBottom: '16px', fontSize: '0.95rem' }}>الموظفون وأرقام التواصل</h4>
                {editFormData.contacts.map((contact, index) => (
                  <div key={index} className="contact-item">
                    <h5>الموظف #{index + 1}</h5>
                    <div className="form-group">
                      <label>اسم الموظف</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={contact.name}
                        onChange={(e) => handleEditContactChange(index, e)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>رقم الهاتف</label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        value={contact.phone}
                        onChange={(e) => handleEditContactChange(index, e)}
                        required
                      />
                    </div>
                    {editFormData.contacts.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeEditContact(index)}
                        className="text-danger-btn"
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', cursor: 'pointer', padding: '0', marginTop: '8px' }}
                      >
                        حذف هذا الموظف
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEditContact}
                  className="btn-secondary"
                  style={{ width: '100%', marginBottom: '24px', padding: '10px', background: 'var(--sidebar-active-bg)', border: '1px dashed var(--primary)', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer' }}
                >
                  + إضافة موظف آخر
                </button>
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

export default ExternalOfficesPage;
