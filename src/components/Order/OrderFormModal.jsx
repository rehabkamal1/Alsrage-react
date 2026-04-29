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
  InputGroup,
} from "react-bootstrap";
import Select from "react-select";
import { showSuccess, showError } from "../../utils/swalHelper";
import "../../styles/FormModal.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const OrderFormModal = ({
  show,
  onHide,
  onSubmit,
  initialData,
  clients = [],
  saudiOffices = [],
  externalOffices = [],
  statusOptions = [],
  searchClients,
  quickCreateClient,
  loading,
  isEdit,
  error,
}) => {
  const [formData, setFormData] = useState({
    client_id: "",
    visa_holder_name: "",
    saudi_office_id: "",
    external_office_id: "",
    visa_number: "",
    id_number: "",
    musaned_contract_number: "",
    contract_date: "",
    total_price: "",
    musaned_paid: "",
    status: "",
    notes: "",
    visa_image: null,
    contract_image: null,
  });

  const [previewImages, setPreviewImages] = useState({
    visa_image: null,
    contract_image: null,
  });

  const [validated, setValidated] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientType, setNewClientType] = useState("individual");
  const [quickCreateLoading, setQuickCreateLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saudiOfficeSearch, setSaudiOfficeSearch] = useState("");
  const [externalOfficeSearch, setExternalOfficeSearch] = useState("");
  const [attachmentRows, setAttachmentRows] = useState([{ title: "", file: null }]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        client_id: initialData.client_id || "",
        visa_holder_name:
          initialData.visa_holder_name ||
          initialData.client?.visa_holder_name ||
          "",
        saudi_office_id: initialData.saudi_office_id || "",
        external_office_id: initialData.external_office_id || "",
        visa_number: initialData.visa_number || "",
        id_number: initialData.id_number || "",
        musaned_contract_number: initialData.musaned_contract_number || "",
        contract_date: initialData.contract_date || "",
        total_price: initialData.total_price || "",
        musaned_paid: initialData.musaned_paid || "",
        status: initialData.status || "",
        notes: initialData.notes || "",
      });
      setPreviewImages({});
      if (initialData.client) {
        setSearchQuery(
          `${initialData.client.name} (${initialData.client.phone})`,
        );
      }
      setSaudiOfficeSearch(initialData.saudiOffice?.name || initialData.saudi_office?.name || "");
      setExternalOfficeSearch(
        initialData.externalOffice?.name || initialData.external_office?.name || "",
      );
    } else {
      setFormData({
        client_id: "",
        visa_holder_name: "",
        saudi_office_id: "",
        external_office_id: "",
        visa_number: "",
        id_number: "",
        musaned_contract_number: "",
        contract_date: "",
        total_price: "",
        musaned_paid: "",
        status: "",
        notes: "",
      });
      setPreviewImages({});
      setSearchQuery("");
      setSaudiOfficeSearch("");
      setExternalOfficeSearch("");
    }
    setAttachmentRows([{ title: "", file: null }]);
    setValidated(false);
    setFieldErrors({});
    setActiveTab("basic");
  }, [initialData, show]);

  useEffect(() => {
    if (error) {
      if (error.errors) {
        setFieldErrors(error.errors);
      }
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
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

  const selectClient = (client) => {
    setFormData((prev) => ({
      ...prev,
      client_id: client.id,
      visa_holder_name: client.visa_holder_name || client.name,
    }));
    setSearchQuery(`${client.phone} (${client.name || "بدون اسم"})`);
    setShowSearchResults(false);
    if (fieldErrors.client_id) {
      setFieldErrors((prev) => ({ ...prev, client_id: undefined }));
    }
  };

  const handleClientSearch = async (value) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      setSearching(true);
      try {
        const response = await searchClients(value);
        setSearchResults(response.data?.data || []);
        setShowSearchResults(true);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleQuickCreate = async () => {
    if (!newClientName || !newClientPhone) {
      return;
    }
    setQuickCreateLoading(true);
    try {
      const response = await quickCreateClient({
        name: newClientName,
        phone: newClientPhone,
        client_type: newClientType,
      });
      const newClient = response.data.data;
      setFormData((prev) => ({
        ...prev,
        client_id: newClient.id,
        visa_holder_name: newClient.visa_holder_name || newClient.name,
      }));
      setSearchQuery(`${newClient.phone} (${newClient.name || "بدون اسم"})`);
      showSuccess("تمت الإضافة", "تم إضافة العميل بنجاح واختياره للطلب");
      setShowQuickCreate(false);
      setNewClientName("");
      setNewClientPhone("");
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        setFieldErrors(errorData.errors);
      }
    } finally {
      setQuickCreateLoading(false);
    }
  };

  const totalPrice = parseFloat(formData.total_price) || 0;
  const musanedPaid = parseFloat(formData.musaned_paid) || 0;
  const priceDifference = totalPrice - musanedPaid;

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (
        formData[key] !== null &&
        formData[key] !== undefined &&
        key !== "price_difference"
      ) {
        submitData.append(key, formData[key]);
      }
    });
    submitData.append("price_difference", priceDifference);
    attachmentRows.forEach((item, idx) => {
      if (item.file) {
        submitData.append(`attachment_files[${idx}]`, item.file);
        submitData.append(`attachment_titles[${idx}]`, item.title || `attachment-${idx + 1}`);
      }
    });

    onSubmit(submitData);
  };

  const updateAttachmentRow = (index, field, value) => {
    setAttachmentRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const addAttachmentRow = () => {
    setAttachmentRows((prev) => [...prev, { title: "", file: null }]);
  };

  const removeAttachmentRow = (index) => {
    setAttachmentRows((prev) => prev.filter((_, i) => i !== index));
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("data:image")) return url;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/storage")) return `${API_URL}${url}`;
    return `${API_URL}/storage/${url.replace(/^\/?storage\//, "")}`;
  };

  const getFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      return fieldErrors[fieldName][0];
    }
    return null;
  };

  return (
    <>
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
            {isEdit ? "✏️ تعديل الطلب" : "➕ إضافة طلب جديد"}
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
              <Tab eventKey="basic" title="معلومات الطلب">
                <div className="mt-3">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small text-secondary">
                      اسم صاحب التأشيرة <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="visa_holder_name"
                      value={formData.visa_holder_name}
                      onChange={handleChange}
                      required
                      placeholder="أدخل اسم صاحب التأشيرة"
                      isInvalid={!!getFieldError("visa_holder_name")}
                      className="rounded-3"
                    />
                    <Form.Control.Feedback type="invalid">
                      {getFieldError("visa_holder_name") ||
                        "يرجى إدخال اسم صاحب التأشيرة"}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small text-secondary">
                      المندوب
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        placeholder="ابحث عن المندوب برقم الهاتف فقط..."
                        value={searchQuery}
                        onChange={(e) => handleClientSearch(e.target.value)}
                        isInvalid={!!getFieldError("client_id")}
                        className="rounded-3"
                      />
                      {searching && (
                        <div className="position-absolute top-100 start-0 end-0 bg-white border rounded-3 mt-1 shadow-sm p-2 text-center text-muted small">
                          جاري البحث...
                        </div>
                      )}
                      {showSearchResults &&
                        searchResults.length > 0 &&
                        !searching && (
                          <div
                            className="position-absolute top-100 start-0 end-0 bg-white border rounded-3 mt-1 shadow-sm"
                            style={{
                              zIndex: 1000,
                              maxHeight: "200px",
                              overflowY: "auto",
                            }}
                          >
                            {searchResults.map((client) => (
                              <div
                                key={client.id}
                                className="px-3 py-2 border-bottom"
                                style={{ cursor: "pointer" }}
                                onClick={() => selectClient(client)}
                              >
                                <strong>{client.phone}</strong> - {client.name || "بدون اسم"}
                              </div>
                            ))}
                            <div
                              className="px-3 py-2 text-primary fw-semibold border-bottom"
                              style={{ cursor: "pointer" }}
                              onClick={() => setShowQuickCreate(true)}
                            >
                              + إضافة مندوب جديد
                            </div>
                          </div>
                        )}
                      {showSearchResults &&
                        searchResults.length === 0 &&
                        !searching &&
                        searchQuery.length >= 2 && (
                          <div className="position-absolute top-100 start-0 end-0 bg-white border rounded-3 mt-1 shadow-sm p-3 text-center">
                            <div className="text-muted mb-2">لا توجد نتائج</div>
                            <Button
                              variant="link"
                              className="p-0"
                              onClick={() => setShowQuickCreate(true)}
                            >
                              + إضافة مندوب جديد
                            </Button>
                          </div>
                        )}
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {getFieldError("client_id")}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                          رقم الهوية / رقم التأشيرة
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="text"
                            name="id_number"
                            placeholder="رقم الهوية"
                            value={formData.id_number}
                            onChange={handleChange}
                            isInvalid={!!getFieldError("id_number")}
                            className="rounded-start-3"
                          />
                          <Form.Control
                            type="text"
                            name="visa_number"
                            placeholder="رقم التأشيرة"
                            value={formData.visa_number}
                            onChange={handleChange}
                            isInvalid={!!getFieldError("visa_number")}
                            className="rounded-end-3"
                          />
                        </InputGroup>
                        {(getFieldError("id_number") || getFieldError("visa_number")) && (
                          <div className="text-danger small mt-1">
                            {getFieldError("id_number") || getFieldError("visa_number")}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                          اسم صاحب التأشيرة
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="visa_holder_name"
                          value={formData.visa_holder_name}
                          onChange={handleChange}
                          isInvalid={!!getFieldError("visa_holder_name")}
                          placeholder="أدخل اسم صاحب التأشيرة"
                          className="rounded-3"
                        />
                        <Form.Control.Feedback type="invalid">
                          {getFieldError("visa_holder_name")}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                          رقم عقد مساند
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="musaned_contract_number"
                          value={formData.musaned_contract_number}
                          onChange={handleChange}
                          isInvalid={!!getFieldError("musaned_contract_number")}
                          className="rounded-3"
                        />
                        <Form.Control.Feedback type="invalid">
                          {getFieldError("musaned_contract_number")}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                          المكتب السعودي
                        </Form.Label>
                        <Select
                          className="react-select-container"
                          classNamePrefix="react-select"
                          options={saudiOffices.map(office => ({ value: office.id, label: office.name }))}
                          value={saudiOffices.find(o => o.id === formData.saudi_office_id) ? { value: formData.saudi_office_id, label: saudiOffices.find(o => o.id === formData.saudi_office_id).name } : null}
                          onChange={(option) => {
                            setFormData(prev => ({ ...prev, saudi_office_id: option ? option.value : "" }));
                          }}
                          placeholder="اختر المكتب السعودي..."
                          isClearable
                          isRtl
                        />
                        {getFieldError("saudi_office_id") && (
                          <div className="text-danger small mt-1">{getFieldError("saudi_office_id")}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                          المكتب الخارجي
                        </Form.Label>
                        <Select
                          className="react-select-container"
                          classNamePrefix="react-select"
                          options={externalOffices.map(office => ({ value: office.id, label: office.name }))}
                          value={externalOffices.find(o => o.id === formData.external_office_id) ? { value: formData.external_office_id, label: externalOffices.find(o => o.id === formData.external_office_id).name } : null}
                          onChange={(option) => {
                            setFormData(prev => ({ ...prev, external_office_id: option ? option.value : "" }));
                          }}
                          placeholder="اختر المكتب الخارجي..."
                          isClearable
                          isRtl
                        />
                        {getFieldError("external_office_id") && (
                          <div className="text-danger small mt-1">{getFieldError("external_office_id")}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                          تاريخ العقد
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="contract_date"
                          value={formData.contract_date}
                          onChange={handleChange}
                          isInvalid={!!getFieldError("contract_date")}
                          className="rounded-3"
                        />
                        <Form.Control.Feedback type="invalid">
                          {getFieldError("contract_date")}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                          حالة سداد مساند
                        </Form.Label>
                        <Select
                          className="react-select-container"
                          classNamePrefix="react-select"
                          options={statusOptions.map(status => ({ value: status.key || status.id, label: status.label }))}
                          value={statusOptions.find(s => (s.key || s.id) === formData.status) ? { value: formData.status, label: statusOptions.find(s => (s.key || s.id) === formData.status).label } : null}
                          onChange={(option) => {
                            setFormData(prev => ({ ...prev, status: option ? option.value : "" }));
                          }}
                          placeholder="اختر الحالة..."
                          isClearable
                          isRtl
                        />
                        {getFieldError("status") && (
                          <div className="text-danger small mt-1">{getFieldError("status")}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small text-secondary">
                      الملاحظات
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
                </div>
              </Tab>

              <Tab eventKey="prices" title="الأسعار">
                <div className="mt-3">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                          إجمالي السعر (ر.س)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="total_price"
                          value={formData.total_price}
                          onChange={handleChange}
                          isInvalid={!!getFieldError("total_price")}
                          className="rounded-3"
                        />
                        <Form.Control.Feedback type="invalid">
                          {getFieldError("total_price")}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                          سداد مساند (ر.س)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="musaned_paid"
                          value={formData.musaned_paid}
                          onChange={handleChange}
                          isInvalid={!!getFieldError("musaned_paid")}
                          className="rounded-3"
                        />
                        <Form.Control.Feedback type="invalid">
                          {getFieldError("musaned_paid")}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  {(totalPrice > 0 || musanedPaid > 0) && (
                    <div
                      className={`p-3 rounded-3 mt-3 ${priceDifference >= 0 ? "bg-success bg-opacity-10" : "bg-danger bg-opacity-10"}`}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">الرصيد المتبقي:</span>
                        <span
                          className={`fs-4 fw-bold ${priceDifference >= 0 ? "text-success" : "text-danger"}`}
                        >
                          {priceDifference.toFixed(2)} ر.س
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Tab>

              <Tab eventKey="images" title="الصور والمرفقات">
                <div className="mt-3">
                  <div className="alert alert-info border-0 rounded-3 small">
                    💡 يمكنك إضافة عدة مرفقات وتسميتها (مثال: صورة الجواز، صورة الهوية، إلخ...)
                  </div>

                  {attachmentRows.map((row, index) => (
                    <div
                      key={`attachment-${index}`}
                      className="attachment-row p-4 mb-3 border rounded-4 bg-white shadow-sm border-light position-relative overflow-hidden"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-primary', 'bg-light');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('border-primary', 'bg-light');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-primary', 'bg-light');
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          updateAttachmentRow(index, "file", file);
                        }
                      }}
                    >
                      <div className="position-absolute top-0 start-0 w-100 h-1 bg-primary bg-opacity-25" style={{ height: '4px' }}></div>
                      <Row className="align-items-end g-3">
                        <Col md={5}>
                          <Form.Group>
                            <Form.Label className="fw-bold small text-dark mb-2">🏷️ عنوان المرفق</Form.Label>
                            <Form.Control
                              type="text"
                              value={row.title}
                              onChange={(e) => updateAttachmentRow(index, "title", e.target.value)}
                              placeholder="مثال: صورة الجواز، صورة الهوية..."
                              className="rounded-3 border-light-subtle shadow-none"
                              style={{ backgroundColor: '#fcfcfc' }}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={5}>
                          <Form.Group>
                            <Form.Label className="fw-bold small text-dark mb-2">📁 اختيار الملف</Form.Label>
                            <div className="custom-file-upload">
                              <Form.Control
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => updateAttachmentRow(index, "file", e.target.files?.[0] || null)}
                                className="rounded-3 border-light-subtle shadow-none"
                                style={{ backgroundColor: '#fcfcfc' }}
                              />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={2}>
                          <Button
                            variant="link"
                            className="w-100 text-danger text-decoration-none fw-semibold"
                            disabled={attachmentRows.length === 1 && !row.file && !row.title}
                            onClick={() => removeAttachmentRow(index)}
                          >
                            🗑️ إزالة
                          </Button>
                        </Col>
                      </Row>
                      {row.file && (
                        <div className="mt-3 p-2 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-10 d-flex align-items-center gap-2">
                          <span className="text-success small fw-bold">✅ تم اختيار: {row.file.name}</span>
                          <span className="text-muted extra-small">({(row.file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline-dark"
                    onClick={addAttachmentRow}
                    className="w-100 py-2 border-dashed rounded-3"
                    style={{ borderStyle: "dashed" }}
                  >
                    + إضافة مرفق جديد
                  </Button>
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
                "➕ إضافة طلب"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showQuickCreate}
        onHide={() => setShowQuickCreate(false)}
        centered
        size="sm"
        dir="rtl"
      >
        <Modal.Header closeButton className="border-0 pt-4 px-4">
          <Modal.Title className="fw-bold fs-5">إضافة مندوب جديد</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              اسم المندوب
            </Form.Label>
            <Form.Control
              type="text"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="أدخل اسم العميل"
              className="rounded-3"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              نوع العميل
            </Form.Label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio"
                label="فردي"
                name="clientType"
                checked={newClientType === "individual"}
                onChange={() => setNewClientType("individual")}
              />
              <Form.Check
                type="radio"
                label="مكتب خدمات"
                name="clientType"
                checked={newClientType === "office"}
                onChange={() => setNewClientType("office")}
              />
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              رقم الهاتف <span className="text-danger small">(يجب أن يكون فريداً)</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={newClientPhone}
              onChange={(e) => setNewClientPhone(e.target.value)}
              placeholder="أدخل رقم الهاتف"
              isInvalid={!!getFieldError("phone")}
              className="rounded-3"
            />
            <Form.Control.Feedback type="invalid">
              {getFieldError("phone")}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pb-4 px-4">
          <Button
            variant="light"
            onClick={() => setShowQuickCreate(false)}
            className="px-3 rounded-3"
          >
            إلغاء
          </Button>
          <Button
            variant="dark"
            onClick={handleQuickCreate}
            disabled={quickCreateLoading}
            className="px-3 rounded-3"
          >
            {quickCreateLoading ? "جاري الإضافة..." : "حفظ المندوب"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderFormModal;
