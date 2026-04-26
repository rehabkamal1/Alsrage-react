import React, { useState, useEffect } from 'react';
import { getEmployees, createEmployee, deleteEmployee } from '../services/apiService';
import { showSuccess, showError, showConfirm } from '../utils/swalHelper';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
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
      setCurrentPage(1);
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
                          onClick={() => handleDelete(employee.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          حذف
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
    </div>
  );
};

export default EmployeesPage;
