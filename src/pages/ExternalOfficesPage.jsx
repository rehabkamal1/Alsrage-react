import React, { useState, useEffect } from 'react';
import { getExternalOffices, createExternalOffice, deleteExternalOffice } from '../services/apiService';
import { showSuccess, showError, showConfirm } from '../utils/swalHelper';

const ExternalOfficesPage = () => {
  const [offices, setOffices] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    contacts: [{ name: '', phone: '' }],
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
      setCurrentPage(1);
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
                          onClick={() => handleDelete(office.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          حذف
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
    </div>
  );
};

export default ExternalOfficesPage;
