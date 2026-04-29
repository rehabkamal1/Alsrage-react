import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const AVAILABLE_PERMISSIONS = [
  { id: "view_orders", label: "عرض الطلبات" },
  { id: "create_orders", label: "إنشاء طلبات" },
  { id: "edit_orders", label: "تعديل الطلبات" },
  { id: "delete_orders", label: "حذف الطلبات" },
  { id: "view_clients", label: "عرض العملاء" },
  { id: "create_clients", label: "إنشاء عملاء" },
  { id: "edit_clients", label: "تعديل العملاء" },
  { id: "delete_clients", label: "حذف العملاء" },
  { id: "view_reports", label: "عرض التقارير" },
  { id: "manage_employees", label: "إدارة الموظفين" },
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
            <Form.Label className="fw-semibold small text-secondary d-block mb-2">
              الصلاحيات
            </Form.Label>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              <Row>
                {AVAILABLE_PERMISSIONS.map((permission) => (
                  <Col md={6} key={permission.id} className="mb-2">
                    <Form.Check
                      type="checkbox"
                      id={permission.id}
                      label={permission.label}
                      checked={formData.permissions.includes(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                    />
                  </Col>
                ))}
              </Row>
            </div>
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
