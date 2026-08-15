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

  const template = getWhatsAppTemplate();
  const message = template
    .replace(/\{order_id\}/g, order.id || "")
    .replace(/\{visa_holder\}/g, visaHolder)
    .replace(/\{delegate_name\}/g, delegateName)
    .replace(/\{visa_number\}/g, order.visa_number || "غير محدد")
    .replace(
      /\{contract_number\}/g,
      order.musaned_contract_number || "غير محدد",
    )
    .replace(/\{status\}/g, statusLabel);

  const encodedMessage = encodeURIComponent(message);

  const openWhatsApp = (phone) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");
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
            openWhatsApp(saudiPhone);
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
            openWhatsApp(externalPhone);
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
            openWhatsApp(clientPhone);
            Swal.close();
          });
      }
    },
  });
};
