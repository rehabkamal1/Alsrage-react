import React, { useState, useEffect } from 'react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../services/apiService';
import { showSuccess, showError, showConfirm } from '../utils/swalHelper';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    position: '',
    office_name: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    position: '',
    office_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const displayedEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setEditFormData({
      name: employee.name,
      phone: employee.phone,
      position: employee.position || '',
      office_name: employee.office_name || ''
    });
    setShowEditModal(true);
    setValidated(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowEditModal(false);
    setEditFormData({ name: '', phone: '', position: '', office_name: '' });
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
      await updateEmployee(editingId, editFormData);
      showSuccess('تم التحديث!', 'تم تحديث بيانات الموظف بنجاح');
      handleCancelEdit();
      fetchEmployees();
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
      await createEmployee(formData);
      showSuccess('تمت الإضافة!', 'تم إضافة الموظف بنجاح');
      setFormData({ name: '', phone: '', position: '', office_name: '' });
      setValidated(false);
      fetchEmployees();
    } catch (error) {
      showError('خطأ!', 'حدث خطأ أثناء إضافة الموظف.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('هل أنت متأكد؟', 'لن تتمكن من التراجع عن حذف هذا الموظف');
    if (result.isConfirmed) {
      try {
        await deleteEmployee(id);
        showSuccess('تم الحذف', 'تم حذف الموظف بنجاح');
        fetchEmployees();
      } catch (error) {
        showError('خطأ', 'حدث خطأ أثناء الحذف');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>إدارة الموظفين</h1>
        </div>
      </div>

      <div className="admin-grid-layout">
        <div className="form-side">
          <div className="card">
            <h3>إضافة موظف جديد</h3>
            <form onSubmit={handleSubmit} noValidate className={validated ? 'was-validated' : ''}>
              <div className="form-group">
                <label>اسم الموظف</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
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
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">يرجى إدخال رقم الهاتف</div>
              </div>
              <div className="form-group">
                <label>المسمى الوظيفي</label>
                <input
                  type="text"
                  name="position"
                  className="form-control"
                  value={formData.position}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>المكتب التابع له</label>
                <input
                  type="text"
                  name="office_name"
                  className="form-control"
                  value={formData.office_name}
                  onChange={handleChange}
                  placeholder="مثال: مكتب الرياض، السراج الرئيسي"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'جاري الإضافة...' : 'إضافة موظف'}
              </button>
            </form>          </div>
        </div>

        <div className="table-side">
          <div className="card">
            <h3>قائمة الموظفين</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>رقم الهاتف</th>
                    <th>المسمى الوظيفي</th>
                    <th>المكتب</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.name}</td>
                      <td>{employee.phone}</td>
                      <td>{employee.position || '-'}</td>
                      <td>{employee.office_name || '-'}</td>
                      <td>
                        <button 
                          onClick={() => handleEdit(employee)}
                          style={{ background: 'rgba(99, 102, 241, 0.1)', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '8px', borderRadius: '8px', marginLeft: '8px' }}
                          title="تعديل"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(employee.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
                          title="حذف"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>لا يوجد موظفين مضافين بعد</td>
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
              <h3>تعديل بيانات الموظف</h3>
              <button className="modal-close" onClick={handleCancelEdit}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} noValidate className={validated ? 'was-validated' : ''}>
              <div className="form-group">
                <label>اسم الموظف</label>
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
                <label>المسمى الوظيفي</label>
                <input
                  type="text"
                  name="position"
                  className="form-control"
                  value={editFormData.position}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>المكتب التابع له</label>
                <input
                  type="text"
                  name="office_name"
                  className="form-control"
                  value={editFormData.office_name}
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

export default EmployeesPage;
