import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const PERMISSION_GROUPS = [
  {
    module: "الطلبات",
    icon: "📋",
    permissions: [
      { id: "view_orders", label: "عرض فقط" },
      { id: "create_orders", label: "إنشاء" },
      { id: "edit_orders", label: "تعديل" },
      { id: "delete_orders", label: "حذف" },
    ],
  },
  {
    module: "العملاء",
    icon: "👤",
    permissions: [
      { id: "view_clients", label: "عرض فقط" },
      { id: "create_clients", label: "إنشاء" },
      { id: "edit_clients", label: "تعديل" },
      { id: "delete_clients", label: "حذف" },
    ],
  },
  {
    module: "أخرى",
    icon: "⚙️",
    permissions: [
      { id: "view_reports", label: "التقارير" },
      { id: "manage_employees", label: "الموظفين" },
    ],
  },
];


const EmployeeFormModal = ({
  show,
  onHide,
  onSubmit,
  initialData,
  loading,
  isEdit,
  error,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    username: "",
    password: "",
    position: "",
    office_name: "",
    permissions: [],
  });

  const [expandedGroups, setExpandedGroups] = useState(["الطلبات"]);
  const [validated, setValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        phone: initialData.phone || "",
        username: initialData.username || "",
        password: "",
        position: initialData.position || "",
        office_name: initialData.office_name || "",
        permissions: initialData.permissions || [],
      });
      // Expand modules that have active permissions
      const activeModules = PERMISSION_GROUPS.filter(g => 
        g.permissions.some(p => initialData.permissions?.includes(p.id))
      ).map(g => g.module);
      if (activeModules.length > 0) setExpandedGroups(activeModules);
    } else {
      setFormData({
        name: "",
        phone: "",
        username: "",
        password: "",
        position: "",
        office_name: "",
        permissions: [],
      });
      setExpandedGroups(["الطلبات"]);
    }
    setValidated(false);
    setFieldErrors({});
  }, [initialData, show]);

  useEffect(() => {
    if (error && error.errors) {
      setFieldErrors(error.errors);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePermissionChange = (permissionId) => {
    setFormData((prev) => {
      const permissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId];
      return { ...prev, permissions };
    });
  };

  const toggleGroup = (groupPermissions) => {
    const ids = groupPermissions.map((p) => p.id);
    const allSelected = ids.every((id) => formData.permissions.includes(id));

    setFormData((prev) => {
      let nextPermissions;
      if (allSelected) {
        // Deselect all in this group
        nextPermissions = prev.permissions.filter((id) => !ids.includes(id));
      } else {
        // Select all in this group (without duplicates)
        nextPermissions = [...new Set([...prev.permissions, ...ids])];
      }
      return { ...prev, permissions: nextPermissions };
    });
  };

  const toggleExpand = (moduleName) => {
    setExpandedGroups(prev =>
      prev.includes(moduleName)
        ? prev.filter(m => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    onSubmit(formData);
  };

  const getFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      return fieldErrors[fieldName][0];
    }
    return null;
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      dir="rtl"
      backdrop="static"
    >
      <Modal.Header closeButton className="border-0 pt-4 px-4">
        <Modal.Title className="fw-bold fs-5">
          {isEdit ? "✏️ تعديل بيانات الموظف" : "➕ إضافة موظف جديد"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} noValidate validated={validated}>
        <Modal.Body className="px-4">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  اسم الموظف <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="أدخل اسم الموظف"
                  isInvalid={!!getFieldError("name")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("name") || "يرجى إدخال اسم الموظف"}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  رقم الهاتف <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="رقم الهاتف"
                  isInvalid={!!getFieldError("phone")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("phone") || "يرجى إدخال رقم الهاتف"}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  اسم المستخدم <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="اسم المستخدم"
                  isInvalid={!!getFieldError("username")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("username") || "يرجى إدخال اسم المستخدم"}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  كلمة المرور {!isEdit && <span className="text-danger">*</span>}
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEdit}
                  placeholder={isEdit ? "اترك فارغاً لعدم التغيير" : "أدخل كلمة المرور"}
                  isInvalid={!!getFieldError("password")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("password") || "يرجى إدخال كلمة المرور"}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  المسمى الوظيفي
                </Form.Label>
                <Form.Control
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="مثال: مدير، محاسب، منسق"
                  isInvalid={!!getFieldError("position")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("position")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  المكتب التابع له
                </Form.Label>
                <Form.Control
                  type="text"
                  name="office_name"
                  value={formData.office_name}
                  onChange={handleChange}
                  placeholder="مثال: مكتب الرياض، السراج الرئيسي"
                  isInvalid={!!getFieldError("office_name")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("office_name")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary d-block mb-3">
              الصلاحيات والوصول
            </Form.Label>
            <div className="bg-light rounded-4 p-3 border border-light-subtle shadow-sm">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.module} className="mb-2 last-child-mb-0 border rounded-3 bg-white overflow-hidden shadow-sm">
                  <div 
                    className="d-flex align-items-center justify-content-between px-3 py-2 bg-white border-bottom"
                    style={{ cursor: "pointer", backgroundColor: expandedGroups.includes(group.module) ? "#f8f9fa" : "#fff" }}
                    onClick={() => toggleExpand(group.module)}
                  >
                    <div className="d-flex align-items-center">
                      <span className="me-2 fs-5">{group.icon}</span>
                      <h6 className="fw-bold mb-0 text-dark">{group.module}</h6>
                      <span className="badge bg-secondary-subtle text-secondary small ms-3 rounded-pill px-2 py-1" style={{ fontSize: "0.7rem" }}>
                        {group.permissions.filter(p => formData.permissions.includes(p.id)).length} / {group.permissions.length}
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-decoration-none p-0 text-primary small fw-semibold me-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGroup(group.permissions);
                        }}
                      >
                        {group.permissions.every((p) =>
                          formData.permissions.includes(p.id)
                        )
                          ? "إلغاء الكل"
                          : "تحديد الكل"}
                      </Button>
                      <i className={`fa-solid fa-chevron-${expandedGroups.includes(group.module) ? 'up' : 'down'} text-muted small`}></i>
                    </div>
                  </div>
                  
                  {expandedGroups.includes(group.module) && (
                    <div className="p-3 bg-white border-top border-light-subtle">
                      <div className="d-flex flex-wrap gap-2 gap-md-4">
                        {group.permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className={`d-flex align-items-center px-3 py-2 rounded-3 border transition-all ${
                              formData.permissions.includes(permission.id)
                                ? "bg-primary-subtle border-primary-subtle shadow-sm"
                                : "bg-light border-transparent opacity-75 hover-bg-white"
                            }`}
                            style={{ cursor: "pointer", minWidth: "110px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePermissionChange(permission.id);
                            }}
                          >
                            <Form.Check
                              type="checkbox"
                              id={permission.id}
                              label={permission.label}
                              checked={formData.permissions.includes(permission.id)}
                              onChange={() => {}} 
                              className="mb-0 custom-checkbox fw-medium small pointer-events-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

            </div>
            <style>{`
              .last-child-mb-0:last-child { margin-bottom: 0 !important; }
              .transition-all { transition: all 0.2s ease-in-out; }
              .pointer-events-none { pointer-events: none; }
              .custom-checkbox .form-check-input:checked { background-color: #0d6efd; border-color: #0d6efd; }
            `}</style>
          </Form.Group>

        </Modal.Body>

        <Modal.Footer className="border-0 pb-4 px-4">
          <Button variant="light" onClick={onHide} className="px-4 rounded-3">
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="dark"
            disabled={loading}
            className="px-4 rounded-3"
          >
            {loading
              ? "جاري الحفظ..."
              : isEdit
                ? "💾 حفظ التغييرات"
                : "➕ إضافة موظف"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EmployeeFormModal;
