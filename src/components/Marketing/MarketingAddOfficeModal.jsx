import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const MarketingAddOfficeModal = ({ show, onHide, onSubmit, type, loading }) => {
  const [formData, setFormData] = useState({});
  const [validated, setValidated] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const getFields = () => {
    if (type === "saudi") {
      return (
        <>
          <Form.Group className="mb-3">
            <Form.Label>
              اسم المكتب <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              رقم الجوال <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="mobile"
              onChange={handleChange}
              required
            />
          </Form.Group>
        </>
      );
    } else if (type === "external") {
      return (
        <>
          <Form.Group className="mb-3">
            <Form.Label>
              اسم المكتب <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              رقم الهاتف <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="phone"
              onChange={handleChange}
              required
            />
          </Form.Group>
        </>
      );
    } else {
      return (
        <>
          <Form.Group className="mb-3">
            <Form.Label>
              اسم المكتب <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="office_name"
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              رقم الهاتف <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="phone"
              onChange={handleChange}
              required
            />
          </Form.Group>
        </>
      );
    }
  };

  const getTitle = () => {
    if (type === "saudi") return "إضافة مكتب سعودي جديد";
    if (type === "external") return "إضافة مكتب خارجي جديد";
    return "إضافة مكتب خدمات جديد";
  };

  return (
    <Modal show={show} onHide={onHide} centered dir="rtl" backdrop="static">
      <Modal.Header closeButton className="border-0 pt-4 px-4">
        <Modal.Title className="fw-bold fs-5">{getTitle()}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate validated={validated}>
        <Modal.Body className="px-4">{getFields()}</Modal.Body>
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
            {loading ? "جاري الإضافة..." : "إضافة"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MarketingAddOfficeModal;
