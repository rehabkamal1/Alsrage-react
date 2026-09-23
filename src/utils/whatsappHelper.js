export const DEFAULT_WHATSAPP_TEMPLATE =
  `*تحديث بخصوص الطلب*\n` +
  `رقم الطلب: {order_id}\n` +
  `------------------------------\n` +
  `*بيانات صاحب التأشيرة*\n` +
  `الاسم: {visa_holder}\n` +
  `رقم الجواز: {passport_number}\n` +
  `تاريخ الميلاد: {birth_date}\n` +
  `رقم التأشيرة: {visa_number}\n` +
  `------------------------------\n` +
  `*بيانات العميل والعقود*\n` +
  `العميل / المندوب: {delegate_name}\n` +
  `رقم عقد مساند: {contract_number}\n` +
  `رقم عقد التوثيق: {authentication_contract_number}\n` +
  `------------------------------\n` +
  `حالة الطلب: {status}`;

export const DEFAULT_WHATSAPP_TEMPLATES = {
  external: DEFAULT_WHATSAPP_TEMPLATE,
  client: DEFAULT_WHATSAPP_TEMPLATE,
  saudi: DEFAULT_WHATSAPP_TEMPLATE,
};

const API_URL =
  import.meta.env.VITE_API_URL || "https://alserage.alfanar-rec.com";

const normalizeWhatsAppPhone = (phone) => {
  let normalized = String(phone || "")
    .trim()
    .replace(/\D/g, "");

  if (normalized.startsWith("00")) {
    normalized = normalized.slice(2);
  }

  if (normalized.startsWith("0")) {
    if (normalized.length === 11 && /^01[0125]/.test(normalized)) {
      return `20${normalized.slice(1)}`;
    }
    if (normalized.length === 10 && /^05/.test(normalized)) {
      return `966${normalized.slice(1)}`;
    }
    normalized = normalized.slice(1);
  }

  return normalized;
};

export const getWhatsAppTemplate = (recipient = "saudi") => {
  const stored = localStorage.getItem("whatsapp_templates");
  if (stored) {
    try {
      const candidate = JSON.parse(stored)[recipient];
      const placeholderCount = (candidate?.match(/\{[^}]+\}/g) || []).length;
      if (candidate && candidate.includes("\n") && placeholderCount > 1) {
        return candidate;
      }
      return DEFAULT_WHATSAPP_TEMPLATES[recipient];
    } catch {
      return DEFAULT_WHATSAPP_TEMPLATES[recipient];
    }
  }
  const legacyTemplate = localStorage.getItem("whatsapp_template");
  const legacyPlaceholderCount = (legacyTemplate?.match(/\{[^}]+\}/g) || [])
    .length;
  return legacyTemplate &&
    legacyTemplate.includes("\n") &&
    legacyPlaceholderCount > 1
    ? legacyTemplate
    : DEFAULT_WHATSAPP_TEMPLATES[recipient];
};

export const normalizeWhatsAppMessage = (message) =>
  String(message || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const saveWhatsAppTemplate = (template, recipient = "saudi") => {
  const templates = { ...DEFAULT_WHATSAPP_TEMPLATES };
  try {
    Object.assign(
      templates,
      JSON.parse(localStorage.getItem("whatsapp_templates") || "{}"),
    );
  } catch {
    // Ignore invalid legacy local storage and overwrite it below.
  }
  templates[recipient] = template;
  localStorage.setItem("whatsapp_templates", JSON.stringify(templates));
};

/**
 * Open a SweetAlert dialog allowing the user to select who to send a WhatsApp notification to:
 * 1. صاحب المكتب السعودي (Saudi Office Owner) - رقم هاتف أو جروب
 * 2. المكتب الخارجي (External Office) - رقم هاتف أو جروب
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
    orderStatuses.find(
      (s) => String(s.key || s.id) === String(currentStatusKey),
    )?.label ||
    currentStatusKey ||
    "تحديث جديد";

  // Find Saudi Office
  const saudiOffice =
    order.saudi_office ||
    saudiOffices.find(
      (o) =>
        String(o.id) === String(order.saudi_office_id || order.supplier_id),
    );

  // Find External Office
  const externalOffice =
    order.external_office ||
    externalOffices.find(
      (o) => String(o.id) === String(order.external_office_id),
    );

  // Find Client
  const client =
    order.client ||
    clients.find((c) => String(c.id) === String(order.client_id));

  // Extract Phone Numbers
  const saudiPhone = saudiOffice?.mobile || saudiOffice?.phone || "";
  const saudiWhatsAppLink = saudiOffice?.whatsapp_link || "";

  let externalPhone = externalOffice?.phone || externalOffice?.mobile || "";
  if (
    !externalPhone &&
    externalOffice?.contacts &&
    externalOffice.contacts.length > 0
  ) {
    externalPhone = externalOffice.contacts[0]?.phone || "";
  }
  const externalWhatsAppLink = externalOffice?.whatsapp_link || "";

  const clientPhone = client?.phone || order.client_phone || "";

  const visaHolder =
    order.visa_holder_name || client?.employee?.name || "غير محدد";
  const delegateName = client?.name || "غير محدد";

  const replaceTemplate = (template) =>
    normalizeWhatsAppMessage(template)
      .replace(/\{order_id\}/g, order.id || "")
      .replace(/\{visa_holder\}/g, visaHolder)
      .replace(/\{delegate_name\}/g, delegateName)
      .replace(/\{visa_number\}/g, order.visa_number || "غير محدد")
      .replace(
        /\{contract_number\}/g,
        order.musaned_contract_number || "غير محدد",
      )
      .replace(
        /\{authentication_contract_number\}/g,
        order.authentication_contract_number || "غير محدد",
      )
      .replace(
        /\{auth_contract_number\}/g,
        order.authentication_contract_number || "غير محدد",
      )
      .replace(/\{passport_number\}/g, order.passport_number || "غير محدد")
      .replace(/\{birth_date\}/g, order.birth_date || "غير محدد")
      .replace(
        /\{image_url\}/g,
        order.visa_image
          ? order.visa_image.startsWith("http")
            ? order.visa_image
            : `${API_URL}/storage/${order.visa_image.replace(/^\/?storage\//, "")}`
          : "",
      )
      .replace(/\{status\}/g, statusLabel);

  const messages = {
    external: replaceTemplate(getWhatsAppTemplate("external")),
    client: replaceTemplate(getWhatsAppTemplate("client")),
    saudi: replaceTemplate(getWhatsAppTemplate("saudi")),
  };

  const openWhatsApp = (phone, recipient) => {
    if (!phone) return;
    const cleanPhone = normalizeWhatsAppPhone(phone);
    if (!cleanPhone) {
      Swal.fire({
        icon: "warning",
        title: "رقم الهاتف غير صالح",
        text: "يرجى مراجعة رقم الهاتف قبل فتح واتساب.",
        confirmButtonText: "حسنًا",
      });
      return;
    }
    const encodedMessage = encodeURIComponent(messages[recipient]);
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodedMessage}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const openWhatsAppGroup = (link) => {
    if (!link) return;
    window.open(link, "_blank");
  };

  const hasAnyPhone =
    saudiPhone ||
    externalPhone ||
    clientPhone ||
    saudiWhatsAppLink ||
    externalWhatsAppLink;

  if (!hasAnyPhone) {
    Swal.fire({
      icon: "info",
      title: "لا توجد أرقام هواتف",
      text: "لم يتم العثور على أرقام هواتف أو روابط جروبات مسجلة لـ (المكتب السعودي، المكتب الخارجي، أو العميل) لهذا الطلب.",
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
      <div class="d-flex flex-column gap-3 text-start my-2">
        ${
          saudiPhone || saudiWhatsAppLink
            ? `
        <div class="border rounded-3 p-2">
          <div class="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
            <span class="fs-4">🇸🇦</span>
            <span>صاحب المكتب السعودي</span>
          </div>
          <div class="d-flex flex-column gap-1">
            ${
              saudiPhone
                ? `
            <button id="wa-saudi-btn" type="button" class="btn btn-outline-primary py-2 px-3 rounded-2 d-flex align-items-center justify-content-between w-100">
              <div class="d-flex align-items-center gap-2">
                <span>📱</span>
                <span class="small dir-ltr">${saudiPhone}</span>
              </div>
              <i class="fa-brands fa-whatsapp text-success fs-5"></i>
            </button>
            `
                : ""
            }
            ${
              saudiWhatsAppLink
                ? `
            <button id="wa-saudi-group-btn" type="button" class="btn btn-outline-success py-2 px-3 rounded-2 d-flex align-items-center justify-content-between w-100">
              <div class="d-flex align-items-center gap-2">
                <span>👥</span>
                <span class="small">جروب الواتساب</span>
              </div>
              <i class="fa-brands fa-whatsapp text-success fs-5"></i>
            </button>
            `
                : ""
            }
          </div>
        </div>
        `
            : ""
        }

        ${
          externalPhone || externalWhatsAppLink
            ? `
        <div class="border rounded-3 p-2">
          <div class="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
            <span class="fs-4">🌍</span>
            <span>المكتب الخارجي</span>
          </div>
          <div class="d-flex flex-column gap-1">
            ${
              externalPhone
                ? `
            <button id="wa-external-btn" type="button" class="btn btn-outline-primary py-2 px-3 rounded-2 d-flex align-items-center justify-content-between w-100">
              <div class="d-flex align-items-center gap-2">
                <span>📱</span>
                <span class="small dir-ltr">${externalPhone}</span>
              </div>
              <i class="fa-brands fa-whatsapp text-success fs-5"></i>
            </button>
            `
                : ""
            }
            ${
              externalWhatsAppLink
                ? `
            <button id="wa-external-group-btn" type="button" class="btn btn-outline-success py-2 px-3 rounded-2 d-flex align-items-center justify-content-between w-100">
              <div class="d-flex align-items-center gap-2">
                <span>👥</span>
                <span class="small">جروب الواتساب</span>
              </div>
              <i class="fa-brands fa-whatsapp text-success fs-5"></i>
            </button>
            `
                : ""
            }
          </div>
        </div>
        `
            : ""
        }

        ${
          clientPhone
            ? `
        <div class="border rounded-3 p-2">
          <div class="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
            <span class="fs-4">👤</span>
            <span>العميل / المندوب</span>
          </div>
          <button id="wa-client-btn" type="button" class="btn btn-outline-primary py-2 px-3 rounded-2 d-flex align-items-center justify-content-between w-100">
            <div class="d-flex align-items-center gap-2">
              <span>📱</span>
              <span class="small dir-ltr">${clientPhone}</span>
            </div>
            <i class="fa-brands fa-whatsapp text-success fs-5"></i>
          </button>
        </div>
        `
            : ""
        }
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
        document
          .getElementById("wa-saudi-btn")
          ?.addEventListener("click", () => {
            openWhatsApp(saudiPhone, "saudi");
            Swal.close();
          });
      }
      if (saudiWhatsAppLink) {
        document
          .getElementById("wa-saudi-group-btn")
          ?.addEventListener("click", () => {
            openWhatsAppGroup(saudiWhatsAppLink);
            Swal.close();
          });
      }
      if (externalPhone) {
        document
          .getElementById("wa-external-btn")
          ?.addEventListener("click", () => {
            openWhatsApp(externalPhone, "external");
            Swal.close();
          });
      }
      if (externalWhatsAppLink) {
        document
          .getElementById("wa-external-group-btn")
          ?.addEventListener("click", () => {
            openWhatsAppGroup(externalWhatsAppLink);
            Swal.close();
          });
      }
      if (clientPhone) {
        document
          .getElementById("wa-client-btn")
          ?.addEventListener("click", () => {
            openWhatsApp(clientPhone, "client");
            Swal.close();
          });
      }
    },
  });
};
