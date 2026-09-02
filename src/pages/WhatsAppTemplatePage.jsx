import React, { useState, useRef } from "react";
import { Container, Card, Form, Button, Badge, Row, Col } from "react-bootstrap";
import {
  getWhatsAppTemplate,
  saveWhatsAppTemplate,
  DEFAULT_WHATSAPP_TEMPLATE,
} from "../utils/whatsappHelper";
import { showSuccess } from "../utils/swalHelper";

const WhatsAppTemplatePage = () => {
  const [template, setTemplate] = useState(getWhatsAppTemplate());
  const textareaRef = useRef(null);

  const placeholders = [
    { tag: "{order_id}", label: "رقم الطلب", icon: "fa-hashtag" },
    { tag: "{visa_holder}", label: "صاحب التأشيرة", icon: "fa-passport" },
    { tag: "{delegate_name}", label: "المندوب / العميل", icon: "fa-user" },
    { tag: "{visa_number}", label: "رقم التأشيرة", icon: "fa-id-card" },
    { tag: "{contract_number}", label: "رقم عقد مساند", icon: "fa-file-contract" },
    {
      tag: "{authentication_contract_number}",
      label: "رقم عقد التوثيق",
      icon: "fa-file-signature",
    },
    { tag: "{status}", label: "حالة الطلب", icon: "fa-circle-check" },
  ];

  const insertPlaceholder = (tag) => {
    if (!textareaRef.current) {
      setTemplate((prev) => prev + " " + tag);
      return;
    }
    const input = textareaRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    const newText = text.substring(0, start) + tag + text.substring(end);
    setTemplate(newText);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const handleSave = () => {
    saveWhatsAppTemplate(template);
    showSuccess("تم الحفظ!", "تم حفظ قالب رسالة الواتساب بنجاح");
  };

  const handleReset = () => {
    setTemplate(DEFAULT_WHATSAPP_TEMPLATE);
    saveWhatsAppTemplate(DEFAULT_WHATSAPP_TEMPLATE);
    showSuccess("تم الاسترجاع!", "تم إعادة قالب الواتساب إلى الوضع الافتراضي");
  };

  // Live preview message
  const previewText = template
    .replace(/\{order_id\}/g, "1024")
    .replace(/\{visa_holder\}/g, "عبدالله محمد السعيد")
    .replace(/\{delegate_name\}/g, "مكتب السرعة للخدمات")
    .replace(/\{visa_number\}/g, "2005489632")
    .replace(/\{contract_number\}/g, "MS-88942")
    .replace(/\{authentication_contract_number\}/g, "ATH-99320")
    .replace(/\{auth_contract_number\}/g, "ATH-99320")
    .replace(/\{status\}/g, "تم الصدور والربط 🟢");

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <Container fluid>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <i className="fa-brands fa-whatsapp text-success fs-2"></i>
              إعدادات قالب الواتساب
            </h1>
            <p className="text-muted mb-0">
              تخصيص الرسائل التلقائية التي يتم إرسالها لأصحاب المكاتب والعملاء عند تغيير حالة الطلبات
            </p>
          </div>
          <Button
            variant="success"
            onClick={handleSave}
            className="rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
          >
            <i className="fa-solid fa-floppy-disk"></i>
            حفظ التغييرات
          </Button>
        </div>

        <Row className="g-4">
          {/* Form Side */}
          <Col lg={7}>
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Header className="bg-white py-3 border-bottom rounded-top-4">
                <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="fa-solid fa-pen-to-square text-primary"></i>
                  محرر الرسالة
                </h5>
              </Card.Header>

              <Card.Body className="p-4">
                {/* Placeholders selection */}
                <div className="mb-4">
                  <label className="form-label text-muted small fw-semibold mb-2">
                    انقر على المتغير لإدراجه مباشرة في النص:
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {placeholders.map((p) => (
                      <Badge
                        key={p.tag}
                        bg="light"
                        text="dark"
                        className="border p-2 cursor-pointer shadow-2xs hover-elevate user-select-none d-flex align-items-center gap-1"
                        style={{ cursor: "pointer", fontSize: "0.85rem" }}
                        onClick={() => insertPlaceholder(p.tag)}
                        title={`إدراج ${p.label}`}
                      >
                        <i className={`fa-solid ${p.icon} text-primary me-1`}></i>
                        <code className="text-primary fw-bold">{p.tag}</code>
                        <span className="text-muted">({p.label})</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-dark">صياغة قالب الرسالة:</Form.Label>
                  <Form.Control
                    ref={textareaRef}
                    as="textarea"
                    rows={8}
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="rounded-3 shadow-none p-3 border-secondary-subtle"
                    style={{ fontSize: "0.95rem", lineHeight: "1.7" }}
                  />
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleReset}
                    className="rounded-pill px-3 py-2"
                  >
                    <i className="fa-solid fa-rotate-left me-1"></i> استعادة القالب الافتراضي
                  </Button>

                  <small className="text-muted">
                    عدد الأحرف: {template.length}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Preview Side */}
          <Col lg={5}>
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Header className="bg-white py-3 border-bottom rounded-top-4 d-flex align-items-center justify-content-between">
                <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="fa-solid fa-mobile-screen text-success"></i>
                  معاينة الرسالة الحية
                </h5>
                <Badge bg="success" className="bg-opacity-10 text-success px-2 py-1">
                  مثال حي
                </Badge>
              </Card.Header>

              <Card.Body
                className="p-4 d-flex flex-column justify-content-between"
                style={{
                  backgroundColor: "#efeae2", // WhatsApp Chat background feel
                  backgroundImage: "radial-gradient(#d1d7db 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                  borderRadius: "0 0 16px 16px",
                }}
              >
                {/* Chat Bubble */}
                <div
                  className="bg-white p-3 rounded-3 shadow-sm border position-relative my-2 ms-auto"
                  style={{
                    maxWidth: "92%",
                    borderRadius: "12px 12px 0px 12px",
                    borderLeft: "4px solid #25D366",
                  }}
                >
                  <div
                    className="text-dark"
                    style={{
                      whiteSpace: "pre-wrap",
                      fontSize: "0.93rem",
                      lineHeight: "1.6",
                    }}
                  >
                    {previewText}
                  </div>
                  <div className="text-end text-muted mt-2" style={{ fontSize: "0.72rem" }}>
                    10:30 ص <i className="fa-solid fa-check-double text-primary ms-1"></i>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white bg-opacity-75 rounded-3 border">
                  <div className="fw-bold text-dark mb-1 small">
                    <i className="fa-solid fa-circle-info text-info me-1"></i> ملاحظة توضيحية:
                  </div>
                  <div className="text-muted extra-small" style={{ fontSize: "0.82rem" }}>
                    سيقوم النظام تلقائياً بتبديل الأكواد مثل <code>{"{order_id}"}</code> ببيانات الطلب الحقيقية عند الضغط على زر الإرسال.
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default WhatsAppTemplatePage;
