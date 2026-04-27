import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Tab,
  Tabs,
  Image,
} from "react-bootstrap";
import "../../styles/FormModal.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const ClientFormModal = ({
  show,
  onHide,
  onSubmit,
  initialData,
  loading,
  isEdit,
}) => {
  const [formData, setFormData] = useState({
    category: "Individual Client",
    name: "",
    visa_holder_name: "",
    passport_number: "",
    national_id: "",
    office_name: "",
    phone: "",
    additional_phone: "",
    address: "",
    passport_image: null,
    visa_image: null,
    id_image: null,
  });

  const [previewImages, setPreviewImages] = useState({
    passport_image: null,
    visa_image: null,
    id_image: null,
  });

  const [validated, setValidated] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || "Individual Client",
        name: initialData.name || "",
        visa_holder_name: initialData.name || "",
        passport_number: initialData.passport_number || "",
        national_id: initialData.national_id || "",
        office_name: initialData.office_name || "",
        phone: initialData.phone || "",
        additional_phone: initialData.additional_phone || "",
        address: initialData.address || "",
        passport_image: null,
        visa_image: null,
        id_image: null,
      });
      setPreviewImages({
        passport_image: initialData.passport_image || null,
        visa_image: initialData.visa_image || null,
        id_image: initialData.id_image || null,
      });
    } else {
      setFormData({
        category: "Individual Client",
        name: "",
        visa_holder_name: "",
        passport_number: "",
        national_id: "",
        office_name: "",
        phone: "",
        additional_phone: "",
        address: "",
        passport_image: null,
        visa_image: null,
        id_image: null,
      });
      setPreviewImages({
        passport_image: null,
        visa_image: null,
        id_image: null,
      });
    }
    setValidated(false);
    setActiveTab("basic");
  }, [initialData, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "name") {
        newData.visa_holder_name = value;
      }
      return newData;
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [name]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages((prev) => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (imageName) => {
    setFormData((prev) => ({ ...prev, [imageName]: null }));
    setPreviewImages((prev) => ({ ...prev, [imageName]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("visa_holder_name", formData.visa_holder_name);
    submitData.append("category", formData.category);
    submitData.append("office_name", formData.office_name || "");
    submitData.append("phone", formData.phone);
    submitData.append("additional_phone", formData.additional_phone || "");
    submitData.append("address", formData.address || "");
    submitData.append("passport_number", formData.passport_number || "");
    submitData.append("national_id", formData.national_id || "");

    if (formData.passport_image && formData.passport_image instanceof File) {
      submitData.append("passport_image", formData.passport_image);
    }
    if (formData.visa_image && formData.visa_image instanceof File) {
      submitData.append("visa_image", formData.visa_image);
    }
    if (formData.id_image && formData.id_image instanceof File) {
      submitData.append("id_image", formData.id_image);
    }

    onSubmit(submitData);
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("data:image")) return url;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/storage")) return `${API_URL}${url}`;
    return `${API_URL}/storage/${url.replace(/^\/?storage\//, "")}`;
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
          {isEdit ? "✏️ تعديل بيانات العميل" : "➕ إضافة عميل جديد"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} noValidate validated={validated}>
        <Modal.Body className="px-4">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4 custom-tabs"
            fill
          >
            <Tab eventKey="basic" title="المعلومات الأساسية">
              <div className="mt-3">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small text-secondary">
                        التصنيف <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="rounded-3"
                      >
                        <option value="Individual Client">👤 عميل فردي</option>
                        <option value="Service Office">🏢 مكتب خدمات</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small text-secondary">
                        الاسم بالكامل (صاحب التأشيرة){" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="أدخل الاسم الكامل (هو نفسه صاحب التأشيرة)"
                        className="rounded-3"
                      />
                      <Form.Control.Feedback type="invalid">
                        يرجى إدخال اسم العميل
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
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
                        placeholder="رقم الهاتف الأساسي"
                        className="rounded-3"
                      />
                      <Form.Control.Feedback type="invalid">
                        يرجى إدخال رقم الهاتف
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small text-secondary">
                        رقم هاتف إضافي
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="additional_phone"
                        value={formData.additional_phone}
                        onChange={handleChange}
                        placeholder="رقم هاتف إضافي"
                        className="rounded-3"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small text-secondary">
                        اسم المكتب
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="office_name"
                        value={formData.office_name}
                        onChange={handleChange}
                        placeholder="اسم المكتب"
                        className="rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small text-secondary">
                        العنوان
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="العنوان"
                        className="rounded-3"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Tab>

            <Tab eventKey="visa" title="معلومات التأشيرة">
              <div className="mt-3">
                <div className="bg-light p-3 rounded-3 mb-3">
                  <small className="text-muted">
                    ℹ️ المعلومات التالية مرتبطة بالعميل
                  </small>
                </div>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small text-secondary">
                        رقم الجواز
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="passport_number"
                        value={formData.passport_number}
                        onChange={handleChange}
                        placeholder="رقم الجواز"
                        className="rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small text-secondary">
                        رقم الهوية
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="national_id"
                        value={formData.national_id}
                        onChange={handleChange}
                        placeholder="رقم الهوية"
                        className="rounded-3"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Tab>

            <Tab eventKey="images" title="الصور والمرفقات">
              <div className="mt-3">
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small text-secondary">
                        صورة الجواز
                      </Form.Label>
                      <Form.Control
                        type="file"
                        name="passport_image"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleFileChange}
                        className="rounded-3"
                      />
                      {previewImages.passport_image && (
                        <div className="mt-2 text-center position-relative">
                          <Image
                            src={getImageUrl(previewImages.passport_image)}
                            thumbnail
                            style={{ maxHeight: "100px" }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 start-0"
                            onClick={() => handleRemoveImage("passport_image")}
                            style={{ borderRadius: "50%", padding: "2px 6px" }}
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small text-secondary">
                        صورة التأشيرة
                      </Form.Label>
                      <Form.Control
                        type="file"
                        name="visa_image"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleFileChange}
                        className="rounded-3"
                      />
                      {previewImages.visa_image && (
                        <div className="mt-2 text-center position-relative">
                          <Image
                            src={getImageUrl(previewImages.visa_image)}
                            thumbnail
                            style={{ maxHeight: "100px" }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 start-0"
                            onClick={() => handleRemoveImage("visa_image")}
                            style={{ borderRadius: "50%", padding: "2px 6px" }}
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small text-secondary">
                        صورة الهوية
                      </Form.Label>
                      <Form.Control
                        type="file"
                        name="id_image"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleFileChange}
                        className="rounded-3"
                      />
                      {previewImages.id_image && (
                        <div className="mt-2 text-center position-relative">
                          <Image
                            src={getImageUrl(previewImages.id_image)}
                            thumbnail
                            style={{ maxHeight: "100px" }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 start-0"
                            onClick={() => handleRemoveImage("id_image")}
                            style={{ borderRadius: "50%", padding: "2px 6px" }}
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>

        <Modal.Footer className="border-0 pb-4 px-4">
          <Button
            variant="light"
            onClick={onHide}
            className="px-4 rounded-3"
            style={{ border: "1px solid #dee2e6" }}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="dark"
            disabled={loading}
            className="px-4 rounded-3"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                جاري الحفظ...
              </>
            ) : isEdit ? (
              "💾 حفظ التغييرات"
            ) : (
              "➕ إضافة عميل"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ClientFormModal;
