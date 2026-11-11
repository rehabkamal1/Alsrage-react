import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./styles/auth.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/ux.css";
import App from "./App";
import { showRequiredFields } from "./utils/swalHelper";

const fieldLabels = {
  name: "الاسم",
  email: "البريد الإلكتروني",
  phone: "رقم الهاتف",
  password: "كلمة المرور",
  client_id: "العميل / المندوب",
  employee_id: "الموظف",
  visa_holder_name: "اسم صاحب التأشيرة",
  saudi_office_id: "المكتب السعودي",
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
};

const getFieldLabel = (field) => {
  const id = field.id || field.name || "";
  if (fieldLabels[id]) return fieldLabels[id];
  const label = id && document.querySelector(`label[for="${CSS.escape(id)}"]`);
  return label?.textContent?.replace("*", "").trim() || id || "حقل غير معروف";
};

const blockInvalidFormSubmit = (event) => {
  const form = event.target?.closest?.("form") || event.target;
  if (!(form instanceof HTMLFormElement)) return;

  const invalidControls = [...form.querySelectorAll("input, select, textarea")]
    .filter((control) => !control.disabled && !control.checkValidity());
  invalidControls.forEach(markControlValidity);
  if (invalidControls.length === 0) return;

  event.preventDefault();
  event.stopPropagation();
  const invalidFields = invalidControls.map(getFieldLabel);
  showRequiredFields(invalidFields);
};

const markControlValidity = (control) => {
  const valid = control.checkValidity();
  const value = control.value?.trim?.() ?? control.value;
  const status = valid ? (value ? "valid" : "") : "invalid";
  control.dataset.uxValidation = status;
  control.removeAttribute("aria-invalid");

  const wrapper = control.closest(".input-group") || control;
  let message = wrapper.parentElement?.querySelector(
    `:scope > .ux-field-error[data-for="${CSS.escape(control.name || control.id || "")}"]`,
  );
  if (!valid) {
    control.setAttribute("aria-invalid", "true");
    if (!message) {
      message = document.createElement("div");
      message.className = "ux-field-error";
      message.dataset.for = control.name || control.id || "";
      message.setAttribute("role", "alert");
      wrapper.insertAdjacentElement("afterend", message);
    }
    message.textContent = control.validity.valueMissing
      ? "هذا الحقل مطلوب."
      : control.validity.typeMismatch
        ? "يرجى إدخال قيمة بصيغة صحيحة."
        : "يرجى التحقق من القيمة المدخلة.";
  } else {
    message?.remove();
  }
};

const validateControlOnBlur = (event) => {
  const control = event.target;
  if (
    control instanceof HTMLInputElement ||
    control instanceof HTMLSelectElement ||
    control instanceof HTMLTextAreaElement
  ) {
    markControlValidity(control);
  }
};

document.addEventListener("focusout", validateControlOnBlur, true);
document.addEventListener("submit", blockInvalidFormSubmit, true);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
