import html2pdf from "html2pdf.js";
import cairoRegularUrl from "../assets/fonts/Cairo-Regular.ttf?url";
import cairoBoldUrl from "../assets/fonts/Cairo-Bold.ttf?url";
import {
  formatExportValueForPDF,
  getExportCellValue,
  getExportFilename,
  withExportFeedback,
} from "./exportShared";

// A4 landscape = 297mm، ناقص هوامش 8mm من كل جنب ≈ 1062px عند 96dpi
const PAGE_WIDTH_PX = 1050;

const getReportTitle = (filename) =>
  filename
    .replace(/\.(pdf|xlsx|doc)$/i, "")
    .replace(/_\d{4}-\d{2}-\d{2}$/, "")
    .replace(/_/g, " ");

const isNumericColumn = (column) =>
  /count|total|rate|amount|price|balance|revenue|sales|collected|outstanding|paid|due|days|duration|cost|مبلغ|إجمالي|المحصل|المتبقي|المستحق|السعر|الرصيد|عقد|تكلفة|عدد|نسبة/i.test(
    `${column.key || ""} ${column.header || ""}`,
  );

const absoluteUrl = (url) => new URL(url, window.location.href).href;

// بيحوّل _ لمسافة عشان الكلمات العربي تتفصل صح، وبيشيل المسافات الزيادة
const cleanCellText = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  return String(value).replace(/_/g, " ").replace(/\s+/g, " ").trim() || "-";
};

const el = (tag, styles = {}, text) => {
  const node = document.createElement(tag);
  Object.assign(node.style, styles);
  if (text !== undefined) node.textContent = text;
  return node;
};

const buildReport = ({ title, dateStr, columns, rows }) => {
  const fontSize = columns.length > 12 ? 9 : columns.length > 9 ? 10 : 12;
  const cellWidth = `${100 / columns.length}%`;

  const root = el("div", {
    width: `${PAGE_WIDTH_PX}px`,
    boxSizing: "border-box",
    direction: "rtl",
    padding: "8px",
    backgroundColor: "#ffffff",
    color: "#1e293b",
    letterSpacing: "0",
  });
  root.className = "pdf-root";

  const style = document.createElement("style");
  style.textContent = `
    @font-face {
      font-family: "CairoPDF";
      src: url("${absoluteUrl(cairoRegularUrl)}") format("truetype");
      font-weight: 400;
    }
    @font-face {
      font-family: "CairoPDF";
      src: url("${absoluteUrl(cairoBoldUrl)}") format("truetype");
      font-weight: 700;
    }
    .pdf-root, .pdf-root * {
      font-family: "CairoPDF", sans-serif !important;
      letter-spacing: 0 !important;
      box-sizing: border-box;
    }
  `;
  root.appendChild(style);

  // --- Header ---
  const header = el("div", {
    textAlign: "center",
    marginBottom: "20px",
    padding: "16px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
    border: "1px solid #e2e8f0",
  });

  const logo = document.createElement("img");
  logo.id = "pdf-logo";
  logo.crossOrigin = "anonymous";
  logo.src = absoluteUrl("/logo4.png");
  Object.assign(logo.style, {
    height: "70px",
    display: "block",
    margin: "0 auto 10px auto",
  });
  header.appendChild(logo);

  header.appendChild(
    el(
      "h1",
      { fontSize: "24px", margin: "0 0 6px 0", color: "#0f172a", fontWeight: "700" },
      title,
    ),
  );
  header.appendChild(
    el(
      "p",
      { fontSize: "12px", color: "#64748b", margin: "0" },
      `تاريخ الاستخراج: ${dateStr}`,
    ),
  );
  root.appendChild(header);

  // --- Table (Flexbox بدل <table>) ---
  const table = el("div", {
    width: "100%",
    fontSize: `${fontSize}px`,
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #cbd5e1",
    display: "flex",
    flexDirection: "column",
  });

  const headerRow = el("div", {
    display: "flex",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    fontWeight: "700",
  });
  columns.forEach((col) => {
    headerRow.appendChild(
      el(
        "div",
        {
          width: cellWidth,
          minWidth: "0",
          padding: "12px 4px",
          textAlign: "center",
          lineHeight: "1.5",
          overflowWrap: "break-word",
          wordBreak: "normal",
          borderLeft: "1px solid rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        cleanCellText(col.header || col.label || ""),
      ),
    );
  });
  table.appendChild(headerRow);

  rows.forEach((row, index) => {
    const rowEl = el("div", {
      display: "flex",
      backgroundColor: index % 2 === 1 ? "#f3f6fb" : "#ffffff",
      borderBottom: "1px solid #e2e8f0",
    });
    rowEl.className = "pdf-row";

    row.forEach((value, i) => {
      const td = el("div", {
        width: cellWidth,
        minWidth: "0",
        padding: "9px 4px",
        textAlign: "center",
        color: "#334155",
        lineHeight: "1.4",
        overflowWrap: "break-word",
        wordBreak: "normal",
        borderLeft: "1px solid #eef2f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });
      const text = el(
        "span",
        isNumericColumn(columns[i])
          ? { direction: "ltr", unicodeBidi: "isolate" }
          : { unicodeBidi: "isolate" },
        cleanCellText(value),
      );
      td.appendChild(text);
      rowEl.appendChild(td);
    });
    table.appendChild(rowEl);
  });
  root.appendChild(table);

  // --- Footer ---
  const footer = el("div", {
    marginTop: "24px",
    borderTop: "2px solid #f1f5f9",
    paddingTop: "14px",
    textAlign: "center",
    fontSize: "11px",
    color: "#94a3b8",
  });
  footer.appendChild(
    el(
      "p",
      { margin: "0 0 4px 0", fontWeight: "600" },
      "تم الاستخراج بواسطة نظام السراج لإدارة المكاتب الخارجية",
    ),
  );
  footer.appendChild(
    el(
      "p",
      { margin: "0", fontSize: "10px" },
      `© ${new Date().getFullYear()} جميع الحقوق محفوظة لمنصة السراج`,
    ),
  );
  root.appendChild(footer);

  return root;
};

export const exportToPDF = (data, columns, filename = "export.pdf") =>
  withExportFeedback(async () => {
    const exportData = await data;
    if (!Array.isArray(exportData) || exportData.length === 0) {
      throw new Error("No rows to export");
    }
    if (!Array.isArray(columns) || columns.length === 0) {
      throw new Error("No columns to export");
    }

    const rows = exportData.map((item, rowIndex) =>
      columns.map((col) =>
        formatExportValueForPDF(getExportCellValue(item, col, rowIndex), col),
      ),
    );

    const dateStr = new Date().toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const root = buildReport({
      title: getReportTitle(filename),
      dateStr,
      columns,
      rows,
    });

    // لازم العنصر يتحط في الـ DOM بعرض حقيقي، وإلا الصفحة ممكن تطلع فاضية
    const holder = el("div", {
      position: "fixed",
      top: "0",
      left: "-10000px",
      width: `${PAGE_WIDTH_PX}px`,
      pointerEvents: "none",
    });
    holder.appendChild(root);
    document.body.appendChild(holder);

    try {
      // نستنى الخطوط واللوجو يتحملوا قبل التصوير
      await document.fonts.load('400 12px "CairoPDF"');
      await document.fonts.load('700 12px "CairoPDF"');
      await document.fonts.ready;

      const logo = root.querySelector("#pdf-logo");
      if (logo && !logo.complete) {
        await new Promise((resolve) => {
          logo.onload = resolve;
          logo.onerror = resolve;
        });
      }

      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename: getExportFilename(filename, "pdf"),
          image: { type: "jpeg", quality: 0.98 },
          pagebreak: { mode: ["css", "legacy"], avoid: ".pdf-row" },
          html2canvas: {
            scale: 3,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
            scrollX: 0,
            scrollY: 0,
            windowWidth: PAGE_WIDTH_PX,
            width: PAGE_WIDTH_PX,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
        .from(root)
        .save();
    } finally {
      holder.remove();
    }
  }, "تم تنزيل ملف PDF");