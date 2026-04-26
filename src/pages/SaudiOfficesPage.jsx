import React, { useState, useEffect } from 'react';
import { getSaudiOffices, createSaudiOffice, deleteSaudiOffice } from '../services/apiService';
import { showSuccess, showError, showConfirm } from '../utils/swalHelper';

const SaudiOfficesPage = () => {
  const [offices, setOffices] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    responsible_employee: '',
    mobile: '',
    phone: '',
    address: '',
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

  const fetchOffices = async () => {
    try {
      const response = await getSaudiOffices();
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
      await createSaudiOffice(formData);
      showSuccess('تمت الإضافة!', 'تم إضافة المكتب السعودي بنجاح');
      setFormData({ name: '', responsible_employee: '', mobile: '', destination: '', address: '', phone: '' });
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
    const result = await showConfirm('هل أنت متأكد؟', 'سيتم حذف المكتب السعودي نهائياً');
    if (result.isConfirmed) {
      try {
        await deleteSaudiOffice(id);
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
          <h1>إدارة المكاتب السعودية</h1>
        </div>
      </div>

      <div className="admin-grid-layout">
        <div className="form-side">
          <div className="card">
            <h3>إضافة مكتب جديد</h3>
            <form onSubmit={handleSubmit}>
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
                <label>الموظف المسؤول</label>
                <input
                  type="text"
                  name="responsible_employee"
                  className="form-control"
                  value={formData.responsible_employee}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">يرجى إدخال اسم الموظف المسؤول</div>
              </div>
              <div className="form-group">
                <label>رقم الجوال</label>
                <input
                  type="text"
                  name="mobile"
                  className="form-control"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">يرجى إدخال رقم الجوال</div>
              </div>
              <div className="form-group">
                <label>جهة الوصول</label>
                <input
                  type="text"
                  name="destination"
                  className="form-control"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">يرجى إدخال جهة الوصول</div>
              </div>
              <div className="form-group">
                <label>رقم الهاتف</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
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
                {loading ? 'جاري الإضافة...' : 'إضافة مكتب'}
              </button>
            </form>
          </div>
        </div>

        <div className="table-side">
          <div className="card">
            <h3>قائمة المكاتب السعودية</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الموظف المسؤول</th>
                    <th>رقم الجوال</th>
                    <th>جهة الوصول</th>
                    <th>العنوان</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOffices.map((office) => (
                    <tr key={office.id}>
                      <td>{office.name}</td>
                      <td>{office.responsible_employee}</td>
                      <td>{office.mobile}</td>
                      <td>{office.destination}</td>
                      <td>{office.address}</td>
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
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>لا يوجد مكاتب مضافة بعد</td>
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

export default SaudiOfficesPage;
