import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./styles/auth.css";
import "bootstrap/dist/css/bootstrap.min.css";
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
  if (!(form instanceof HTMLFormElement) || form.checkValidity()) return;

  event.preventDefault();
  event.stopPropagation();
  const invalidFields = [...form.querySelectorAll(":invalid")].map(
    getFieldLabel,
  );
  showRequiredFields(invalidFields);
};

document.addEventListener("submit", blockInvalidFormSubmit, true);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
