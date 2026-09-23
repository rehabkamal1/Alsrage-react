/* global Swal */
export const showAlert = (title, text, icon = "info") => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "حسناً",
    confirmButtonColor: "#4f46e5",
    customClass: {
      popup: "swal-custom-popup",
    },
  });
};

export const showSuccess = (title, text = "") => {
  return Swal.fire({
    title,
    text,
    icon: "success",
    confirmButtonText: "ممتاز",
    confirmButtonColor: "#10b981",
    timer: 2000,
  });
};

export const showError = (title, text = "حدث خطأ ما، يرجى المحاولة لاحقاً") => {
  return Swal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "إغلاق",
    confirmButtonColor: "#ef4444",
  });
};

const validationFieldLabels = {
  name: "الاسم",
  email: "البريد الإلكتروني",
  phone: "رقم الهاتف",
  password: "كلمة المرور",
  client_id: "العميل / المندوب",
  employee_id: "الموظف",
  visa_holder_name: "اسم صاحب التأشيرة",
  saudi_office_id: "المكتب السعودي",
  external_office_id: "المكتب الخارجي",
  visa_number: "رقم التأشيرة",
  nationality: "الجنسية",
  arrival_destination: "جهة الوصول",
  id_number: "رقم الهوية",
  passport_number: "رقم جواز السفر",
  amount: "المبلغ",
  type: "نوع المعاملة",
  order_id: "الطلب",
  country: "الدولة",
  title: "العنوان",
  source_id: "المصدر",
  source_type: "نوع المصدر",
};

const getValidationFieldLabel = (field) => {
  const baseField = field.split(".").pop();
  return validationFieldLabels[baseField] || baseField.replaceAll("_", " ");
};

export const showValidationErrors = (errors = {}) => {
  const entries = Object.entries(errors).filter(
    ([, messages]) => messages?.length,
  );
  if (!entries.length) return;

  const list = entries
    .map(
      ([field, messages]) => `
      <li class="validation-error-item">
        <strong>${getValidationFieldLabel(field)}</strong>
        <span>${messages.join("، ")}</span>
      </li>
    `,
    )
    .join("");

  return Swal.fire({
    icon: "error",
    title: "يرجى استكمال الحقول المطلوبة",
    html: `<ul class="validation-error-list">${list}</ul>`,
    confirmButtonText: "مراجعة البيانات",
    confirmButtonColor: "#dc3545",
    width: "min(620px, 92vw)",
    customClass: { popup: "swal-validation-popup" },
  });
};

export const showRequiredFields = (fields = []) => {
  const uniqueFields = [...new Set(fields.filter(Boolean))];
  if (!uniqueFields.length) return;

  return showValidationErrors(
    Object.fromEntries(
      uniqueFields.map((field) => [field, ["هذا الحقل مطلوب"]]),
    ),
  );
};

export const showConfirm = (
  title,
  text,
  confirmText = "نعم، احذف",
  cancelText = "إلغاء",
) => {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });
};
