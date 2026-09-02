import React, { useState, useRef } from "react";
import { Card, Form, Button, Badge } from "react-bootstrap";
import {
  getWhatsAppTemplate,
  saveWhatsAppTemplate,
  DEFAULT_WHATSAPP_TEMPLATE,
} from "../../utils/whatsappHelper";
import { showSuccess } from "../../utils/swalHelper";

const WhatsAppTemplateCard = () => {
  const [template, setTemplate] = useState(getWhatsAppTemplate());
  const textareaRef = useRef(null);

  const placeholders = [
    { tag: "{order_id}", label: "رقم الطلب" },
    { tag: "{visa_holder}", label: "صاحب التأشيرة" },
    { tag: "{delegate_name}", label: "المندوب / العميل" },
    { tag: "{visa_number}", label: "رقم التأشيرة" },
    { tag: "{contract_number}", label: "رقم عقد مساند" },
    {
      tag: "{authentication_contract_number}",
      label: "رقم عقد التوثيق",
    },
    { tag: "{status}", label: "حالة الطلب" },
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

  // Generate live preview text
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
    <Card className="shadow-sm border-0 rounded-4 mb-4">
      <Card.Header className="bg-white py-3 border-0 rounded-top-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success">
            <i className="fa-brands fa-whatsapp fs-4"></i>
          </div>
          <div>
            <h5 className="mb-0 fw-bold">إعدادات قالب رسائل الواتساب</h5>
            <small className="text-muted">
              تخصيص نص الرسالة التلقائية التي تصل عبر الواتساب عند تحديث الطلبات
            </small>
          </div>
        </div>
      </Card.Header>

      <Card.Body className="pt-2">
        {/* Placeholders bar */}
        <div className="mb-3">
          <label className="form-label text-muted small fw-semibold mb-2">
            انقر على المتغير لإدراجه في النص:
          </label>
          <div className="d-flex flex-wrap gap-2">
            {placeholders.map((p) => (
              <Badge
                key={p.tag}
                bg="light"
                text="dark"
                className="border p-2 cursor-pointer shadow-2xs hover-elevate user-select-none"
                style={{ cursor: "pointer", fontSize: "0.85rem" }}
                onClick={() => insertPlaceholder(p.tag)}
                title={`إدراج ${p.label}`}
              >
                <code className="text-primary me-1">{p.tag}</code> ({p.label})
              </Badge>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">نص الرسالة:</Form.Label>
          <Form.Control
            ref={textareaRef}
            as="textarea"
            rows={6}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="rounded-3 shadow-none p-3 border-secondary-subtle"
            style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
          />
        </Form.Group>

        {/* Live Preview Box */}
        <div className="mb-4 p-3 bg-light rounded-4 border">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="badge bg-success bg-opacity-10 text-success px-2 py-1">
              <i className="fa-solid fa-eye me-1"></i> معاينة حية للمشاهدة
            </span>
            <small className="text-muted">النتيجة كما تظهر لدى المستلم</small>
          </div>
          <div
            className="p-3 bg-white rounded-3 shadow-sm border border-success border-opacity-25"
            style={{ whiteSpace: "pre-wrap", fontSize: "0.92rem", lineHeight: "1.6" }}
          >
            {previewText}
          </div>
        </div>

        {/* Action buttons */}
        <div className="d-flex justify-content-between align-items-center">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleReset}
            className="rounded-pill px-3 py-2"
          >
            <i className="fa-solid fa-rotate-left me-1"></i> استعادة القالب الافتراضي
          </Button>

          <Button
            variant="success"
            onClick={handleSave}
            className="rounded-pill px-4 py-2 fw-bold shadow-sm"
          >
            <i className="fa-solid fa-floppy-disk me-1"></i> حفظ القالب
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WhatsAppTemplateCard;
