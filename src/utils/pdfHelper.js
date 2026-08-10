import html2pdf from "html2pdf.js";

export const exportToPDF = (data, columns, filename = "export.pdf") => {
  const container = document.createElement("div");
  container.style.direction = "rtl";
  container.style.fontFamily = "'Cairo', sans-serif";
  container.style.padding = "15mm";
  container.style.backgroundColor = "#fff";
  container.style.color = "#1e293b";

  // Force font on all children to avoid rendering issues
  const styleTag = document.createElement("style");
  styleTag.innerHTML = `
    * { font-family: 'Cairo', sans-serif !important; }
  `;
  container.appendChild(styleTag);

  // --- Header Section ---
  const header = document.createElement("div");
  header.style.textAlign = "center";
  header.style.marginBottom = "35px";
  header.style.padding = "25px";
  header.style.borderRadius = "12px";
  header.style.background = "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)";
  header.style.border = "1px solid #e2e8f0";

  // Logo
  const logo = document.createElement("img");
  logo.src = "/logo4.png";
  logo.style.height = "80px";
  logo.style.display = "block";
  logo.style.margin = "0 auto 15px auto";
  header.appendChild(logo);

  // Title
  const titleText = filename.replace(/\.(pdf|xlsx|doc)$/i, "").replace(/_/g, " ");
  const title = document.createElement("h1");
  title.innerText = titleText;
  title.style.fontSize = "26px";
  title.style.margin = "0 0 8px 0";
  title.style.color = "#0f172a";
  title.style.fontWeight = "800";
  header.appendChild(title);

  // Date
  const dateStr = new Date().toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  const dateLabel = document.createElement("p");
  dateLabel.innerText = `تاريخ الاستخراج: ${dateStr}`;
  dateLabel.style.fontSize = "13px";
  dateLabel.style.color = "#64748b";
  dateLabel.style.margin = "0";
  header.appendChild(dateLabel);

  container.appendChild(header);

  // --- Table Section (Using Flexbox to bypass html2canvas RTL bug) ---
  const table = document.createElement("div");
  table.style.width = "100%";
  table.style.fontSize = "10px";
  table.style.borderRadius = "8px";
  table.style.overflow = "hidden";
  table.style.border = "1px solid #cbd5e1";
  table.style.display = "flex";
  table.style.flexDirection = "column";

  // Calculate cell width percentage
  const cellWidth = `${100 / columns.length}%`;

  // Header Row
  const headerRow = document.createElement("div");
  headerRow.style.display = "flex";
  headerRow.style.backgroundColor = "#6366f1";
  headerRow.style.color = "#ffffff";
  headerRow.style.fontWeight = "700";
  headerRow.style.borderBottom = "2px solid #4f46e5";

  columns.forEach((col) => {
    const th = document.createElement("div");
    th.style.width = cellWidth;
    th.style.padding = "14px 8px";
    th.style.textAlign = "center";
    th.style.borderLeft = "1px solid rgba(255,255,255,0.1)";
    th.style.boxSizing = "border-box";
    th.innerText = col.header;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Body Rows
  data.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "pdf-row"; // For page-break avoidance
    row.style.display = "flex";
    row.style.backgroundColor = index % 2 === 1 ? "#f8fafc" : "#ffffff";
    row.style.borderBottom = "1px solid #e2e8f0";

    columns.forEach((col) => {
      const td = document.createElement("div");
      td.style.width = cellWidth;
      td.style.padding = "10px 8px";
      td.style.textAlign = "center";
      td.style.color = "#334155";
      td.style.borderLeft = "1px solid #f1f5f9";
      td.style.boxSizing = "border-box";
      td.style.display = "flex";
      td.style.alignItems = "center";
      td.style.justifyContent = "center";
      td.style.lineHeight = "1.4";
      td.style.wordBreak = "break-word";

      if (col.format && typeof col.format === "function") {
        td.innerText = col.format(item);
      } else {
        td.innerText =
          item[col.key] !== undefined &&
          item[col.key] !== null &&
          item[col.key] !== ""
            ? item[col.key]
            : "-";
      }
      row.appendChild(td);
    });
    table.appendChild(row);
  });
  container.appendChild(table);

  // --- Footer Section ---
  const footer = document.createElement("div");
  footer.style.marginTop = "40px";
  footer.style.borderTop = "2px solid #f1f5f9";
  footer.style.paddingTop = "20px";
  footer.style.textAlign = "center";
  footer.style.fontSize = "11px";
  footer.style.color = "#94a3b8";
  
  const footerText = document.createElement("p");
  footerText.innerText = "تم الاستخراج بواسطة نظام السراج لإدارة المكاتب الخارجية";
  footerText.style.margin = "0 0 5px 0";
  footerText.style.fontWeight = "600";
  footer.appendChild(footerText);

  const copyright = document.createElement("p");
  copyright.innerText = `© ${new Date().getFullYear()} جميع الحقوق محفوظة لمنصة السراج`;
  copyright.style.margin = "0";
  copyright.style.fontSize = "10px";
  footer.appendChild(copyright);

  container.appendChild(footer);

  const opt = {
    margin: [10, 5, 10, 5],
    filename: filename,
    image: { type: "jpeg", quality: 1.0 },
    pagebreak: { mode: ['css', 'legacy'], avoid: '.pdf-row' },
    html2canvas: { 
      scale: 3, 
      useCORS: true, 
      letterRendering: false,
      logging: false,
      allowTaint: true
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape", precision: 32 },
  };

  html2pdf().from(container).set(opt).save();
};
