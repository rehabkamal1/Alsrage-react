import { showError, showSuccess } from "./swalHelper";

const DATE_KEY_PATTERN = /(^|_)(date|at|time|created|updated|completed)(_|$)/i;
const CURRENCY_PATTERN =
  /amount|price|balance|revenue|sales|collected|outstanding|paid|due|مبلغ|إجمالي|المحصل|المتبقي|المستحق|السعر|الرصيد|عقد|تكلفة/i;
const NUMBER_KEY_PATTERN =
  /count|total|rate|amount|price|balance|revenue|sales|collected|outstanding|paid|due|days|duration|cost|مبلغ|إجمالي|المحصل|المتبقي|المستحق|السعر|الرصيد|عقد|تكلفة|عدد|نسبة/i;

export const getExportCellValue = (item, column, rowIndex = 0) => {
  const rawValue =
    typeof column.format === "function"
      ? column.format(item, rowIndex)
      : typeof column.formatter === "function"
        ? column.formatter(item)
        : String(column.key || "")
            .split(".")
            .reduce((value, part) => value?.[part], item);

  if (rawValue === null || rawValue === undefined || rawValue === "") return "-";
  if (rawValue instanceof Date) return rawValue.toISOString().slice(0, 10);
  if (Array.isArray(rawValue)) {
    return rawValue
      .map((value) => value?.name || value?.label || value?.title || value)
      .filter(Boolean)
      .join("، ") || "-";
  }
  if (typeof rawValue === "object") {
    return rawValue.name || rawValue.label || rawValue.title || "-";
  }
  if (
    typeof rawValue === "string" &&
    DATE_KEY_PATTERN.test(String(column.key || "")) &&
    /^\d{4}-\d{2}-\d{2}(?:[T\s].*)?$/.test(rawValue)
  ) {
    return rawValue.slice(0, 10);
  }
  if (
    typeof rawValue === "string" &&
    NUMBER_KEY_PATTERN.test(`${column.key || ""} ${column.header || ""}`) &&
    /^-?\d+(?:\.\d+)?$/.test(rawValue.trim())
  ) {
    return Number(rawValue);
  }
  return rawValue;
};

export const formatExportValueForPDF = (value, column) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    const formatted = value.toLocaleString("en-US", {
      minimumFractionDigits: CURRENCY_PATTERN.test(String(column.key || ""))
        ? 2
        : 0,
      maximumFractionDigits: 2,
    });
    return CURRENCY_PATTERN.test(`${column.key || ""} ${column.header || ""}`)
      ? `${formatted} ر.س`
      : formatted;
  }
  return String(value);
};

export const getExportFilename = (filename, extension) => {
  const baseName = String(filename || "export")
    .replace(/\.(xlsx|pdf)$/i, "")
    .replace(/_\d{4}-\d{2}-\d{2}$/, "");
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  return `${baseName}_${date}.${extension}`;
};

export const withExportFeedback = async (operation, title) => {
  const button = document.activeElement?.closest?.("button");
  const wasDisabled = button?.disabled ?? false;
  if (button) {
    button.dataset.exporting = "true";
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
  }

  try {
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    await operation();
    showSuccess("تم التصدير بنجاح", title);
  } catch (error) {
    console.error("Export failed:", error);
    showError("تعذر التصدير", "حدث خطأ أثناء تجهيز الملف. يرجى المحاولة مرة أخرى.");
  } finally {
    if (button) {
      delete button.dataset.exporting;
      button.disabled = wasDisabled;
      button.removeAttribute("aria-busy");
    }
  }
};

export const orderColumnsForTable = (columns, storageKey) => {
  if (!storageKey) return columns;

  try {
    const savedColumns = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const savedOrder = new Map(savedColumns.map((column, index) => [column.id, index]));
    return [...columns].sort((a, b) => {
      const aIndex = savedOrder.get(a.key);
      const bIndex = savedOrder.get(b.key);
      if (aIndex === undefined && bIndex === undefined) return 0;
      if (aIndex === undefined) return 1;
      if (bIndex === undefined) return -1;
      return aIndex - bIndex;
    });
  } catch (error) {
    console.warn(`Unable to restore ${storageKey} export column order:`, error);
    return columns;
  }
};

export const createTableExportColumns = (
  tableColumns,
  storageKey,
  overrides = {},
  excludedIds = ["actions", "strip"],
) => {
  const mappedColumns = tableColumns
    .filter((column) => !excludedIds.includes(column.id))
    .map((column) => {
      const override = overrides[column.id];
      if (override === null) return null;
      return {
        header: column.label,
        key: override?.key || column.id,
        ...(typeof override === "function" ? { format: override } : {}),
        ...(typeof override?.format === "function"
          ? { format: override.format }
          : {}),
      };
    })
    .filter(Boolean);
  return orderColumnsForTable(mappedColumns, storageKey);
};
