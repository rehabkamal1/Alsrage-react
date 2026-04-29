import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import "../../styles/FormModal.css";

const ExternalOfficeFormModal = ({
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
    country: "",
    contacts: [{ name: "", phone: "" }],
  });

  const [validated, setValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        country: initialData.country || "",
        contacts:
          initialData.contacts && initialData.contacts.length > 0
            ? [...initialData.contacts]
            : [{ name: "", phone: "" }],
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        name: "",
        country: "",
        contacts: [{ name: "", phone: "" }],
        notes: "",
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

  const handleContactChange = (index, e) => {
    const { name, value } = e.target;
    const newContacts = [...formData.contacts];
    newContacts[index][name] = value;
    setFormData((prev) => ({ ...prev, contacts: newContacts }));
  };

  const addContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { name: "", phone: "" }],
    }));
  };

  const removeContact = (index) => {
    const newContacts = formData.contacts.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, contacts: newContacts }));
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

  const getFieldError = (fieldName, index = null) => {
    if (index !== null) {
      if (fieldErrors[`contacts.${index}.${fieldName}`]) {
        return fieldErrors[`contacts.${index}.${fieldName}`][0];
      }
      return null;
    }
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
          {isEdit ? "✏️ تعديل المكتب الخارجي" : "➕ إضافة مكتب خارجي جديد"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} noValidate validated={validated}>
        <Modal.Body className="px-4">
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  الدولة <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  isInvalid={!!getFieldError("country")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("country") || "يرجى إدخال الدولة"}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  اسم المكتب <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  isInvalid={!!getFieldError("name")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("name") || "يرجى إدخال اسم المكتب"}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              الموظفون وأرقام التواصل
            </Form.Label>
            {formData.contacts.map((contact, index) => (
              <div key={index} className="p-3 mb-3 bg-light rounded-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">الموظف #{index + 1}</h6>
                  {formData.contacts.length > 1 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0"
                      onClick={() => removeContact(index)}
                    >
                      حذف
                    </Button>
                  )}
                </div>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="small text-secondary">
                        اسم الموظف <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, e)}
                        required
                        isInvalid={!!getFieldError("name", index)}
                        className="rounded-3"
                      />
                      <Form.Control.Feedback type="invalid">
                        {getFieldError("name", index) ||
                          "يرجى إدخال اسم الموظف"}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="small text-secondary">
                        رقم الهاتف <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, e)}
                        required
                        isInvalid={!!getFieldError("phone", index)}
                        className="rounded-3"
                      />
                      <Form.Control.Feedback type="invalid">
                        {getFieldError("phone", index) ||
                          "يرجى إدخال رقم الهاتف"}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            ))}
            <Button
              variant="outline-primary"
              size="sm"
              onClick={addContact}
              className="w-100 rounded-3"
            >
              + إضافة موظف آخر
            </Button>
          </div>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  ملاحظات
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("notes")}
                  className="rounded-3"
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("notes")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
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
                : "➕ إضافة مكتب"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ExternalOfficeFormModal;
