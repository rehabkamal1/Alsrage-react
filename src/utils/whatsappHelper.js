export const DEFAULT_WHATSAPP_TEMPLATE =
  `تحديث بخصوص الطلب رقم: #{order_id}\n` +
  `اسم صاحب التأشيرة: {visa_holder}\n` +
  `المندوب / العميل: {delegate_name}\n` +
  `رقم التأشيرة: {visa_number}\n` +
  `رقم عقد مساند: {contract_number}\n` +
  `حالة الطلب: {status}`;

export const getWhatsAppTemplate = () => {
  return localStorage.getItem("whatsapp_template") || DEFAULT_WHATSAPP_TEMPLATE;
};

export const saveWhatsAppTemplate = (template) => {
  localStorage.setItem("whatsapp_template", template);
};

/**
 * Open a SweetAlert dialog allowing the user to select who to send a WhatsApp notification to:
 * 1. صاحب المكتب السعودي (Saudi Office Owner)
 * 2. المكتب الخارجي (External Office)
 * 3. العميل / المندوب (Client / Representative)
 */
export const showWhatsAppNotificationModal = ({
  order,
  newStatus,
  orderStatuses = [],
  saudiOffices = [],
  externalOffices = [],
  clients = [],
}) => {
  if (!order) return;

  const currentStatusKey = newStatus || order.status;
  const statusLabel =
    orderStatuses.find((s) => String(s.key || s.id) === String(currentStatusKey))
      ?.label || currentStatusKey || "تحديث جديد";

  // Find Saudi Office
  const saudiOffice =
    order.saudi_office ||
    saudiOffices.find(
      (o) => String(o.id) === String(order.saudi_office_id || order.supplier_id)
    );

  // Find External Office
  const externalOffice =
    order.external_office ||
    externalOffices.find(
      (o) => String(o.id) === String(order.external_office_id)
    );

  // Find Client
  const client =
    order.client ||
    clients.find((c) => String(c.id) === String(order.client_id));

  // Extract Phone Numbers
  const saudiPhone = saudiOffice?.mobile || saudiOffice?.phone || "";
  
  let externalPhone = externalOffice?.phone || externalOffice?.mobile || "";
  if (!externalPhone && externalOffice?.contacts && externalOffice.contacts.length > 0) {
    externalPhone = externalOffice.contacts[0]?.phone || "";
  }

  const clientPhone = client?.phone || order.client_phone || "";

  const visaHolder =
    order.visa_holder_name ||
    client?.employee?.name ||
    "غير محدد";
  const delegateName = client?.name || "غير محدد";

  const template = getWhatsAppTemplate();
  const message = template
    .replace(/\{order_id\}/g, order.id || "")
    .replace(/\{visa_holder\}/g, visaHolder)
    .replace(/\{delegate_name\}/g, delegateName)
    .replace(/\{visa_number\}/g, order.visa_number || "غير محدد")
    .replace(/\{contract_number\}/g, order.musaned_contract_number || "غير محدد")
    .replace(/\{status\}/g, statusLabel);

  const encodedMessage = encodeURIComponent(message);

  const openWhatsApp = (phone) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");
  };

  const hasAnyPhone = saudiPhone || externalPhone || clientPhone;

  if (!hasAnyPhone) {
    Swal.fire({
      icon: "info",
      title: "لا توجد أرقام هواتف",
      text: "لم يتم العثور على أرقام هواتف مسجلة لـ (المكتب السعودي، المكتب الخارجي، أو العميل) لهذا الطلب.",
      confirmButtonText: "موافق",
      confirmButtonColor: "#4f46e5",
      customClass: {
        popup: "rounded-4 shadow-lg border-0",
      },
    });
    return;
  }

  Swal.fire({
    title: "إرسال إشعار عبر الواتساب 📱",
    html: `
      <div class="text-center mb-3">
        <p class="text-muted small mb-0">اختر جهة الاتصال التي ترغب في إرسال تفاصيل تحديث الطلب <strong>#${order.id}</strong> لها:</p>
      </div>
      <div class="d-flex flex-column gap-2 text-start my-2">
        <button id="wa-saudi-btn" type="button" class="btn btn-outline-primary py-2.5 px-3 rounded-3 d-flex align-items-center justify-content-between w-100 ${!saudiPhone ? 'disabled opacity-50' : ''}">
          <div class="d-flex align-items-center gap-3">
            <span class="fs-4">🇸🇦</span>
            <div class="text-end">
              <div class="fw-bold text-dark fs-6">صاحب المكتب السعودي</div>
              <div class="small text-muted dir-ltr">${saudiOffice?.name ? `${saudiOffice.name} • ` : ''}${saudiPhone || 'غير متوفر'}</div>
            </div>
          </div>
          <i class="fa-brands fa-whatsapp text-success fs-3"></i>
        </button>

        <button id="wa-external-btn" type="button" class="btn btn-outline-primary py-2.5 px-3 rounded-3 d-flex align-items-center justify-content-between w-100 ${!externalPhone ? 'disabled opacity-50' : ''}">
          <div class="d-flex align-items-center gap-3">
            <span class="fs-4">🌍</span>
            <div class="text-end">
              <div class="fw-bold text-dark fs-6">المكتب الخارجي</div>
              <div class="small text-muted dir-ltr">${externalOffice?.name ? `${externalOffice.name} • ` : ''}${externalPhone || 'غير متوفر'}</div>
            </div>
          </div>
          <i class="fa-brands fa-whatsapp text-success fs-3"></i>
        </button>

        <button id="wa-client-btn" type="button" class="btn btn-outline-primary py-2.5 px-3 rounded-3 d-flex align-items-center justify-content-between w-100 ${!clientPhone ? 'disabled opacity-50' : ''}">
          <div class="d-flex align-items-center gap-3">
            <span class="fs-4">👤</span>
            <div class="text-end">
              <div class="fw-bold text-dark fs-6">العميل / المندوب</div>
              <div class="small text-muted dir-ltr">${delegateName !== 'غير محدد' ? `${delegateName} • ` : ''}${clientPhone || 'غير متوفر'}</div>
            </div>
          </div>
          <i class="fa-brands fa-whatsapp text-success fs-3"></i>
        </button>
      </div>
    `,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: "إلغاء",
    cancelButtonColor: "#64748b",
    customClass: {
      popup: "rounded-4 shadow-lg border-0",
    },
    didOpen: () => {
      if (saudiPhone) {
        document.getElementById("wa-saudi-btn")?.addEventListener("click", () => {
          openWhatsApp(saudiPhone);
          Swal.close();
        });
      }
      if (externalPhone) {
        document.getElementById("wa-external-btn")?.addEventListener("click", () => {
          openWhatsApp(externalPhone);
          Swal.close();
        });
      }
      if (clientPhone) {
        document.getElementById("wa-client-btn")?.addEventListener("click", () => {
          openWhatsApp(clientPhone);
          Swal.close();
        });
      }
    },
  });
};
