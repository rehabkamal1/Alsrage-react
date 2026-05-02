import html2pdf from "html2pdf.js";

export const exportToPDF = (data, columns, filename = "export.pdf") => {
  const container = document.createElement("div");
  container.style.direction = "rtl";
  container.style.fontFamily =
    "'Cairo', 'Amiri', 'Roboto', 'Arial', sans-serif";
  container.style.padding = "20px";
  container.style.backgroundColor = "#fff";

  const title = document.createElement("h2");
  title.innerText = filename.replace(".pdf", "").replace(/_/g, " ");
  title.style.textAlign = "center";
  title.style.marginBottom = "20px";
  title.style.color = "#333";
  container.appendChild(title);

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.fontSize = "10px";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.style.backgroundColor = "#f8f9fa";

  columns.forEach((col) => {
    const th = document.createElement("th");
    th.innerText = col.header;
    th.style.border = "1px solid #dee2e6";
    th.style.padding = "8px";
    th.style.textAlign = "center";
    th.style.fontWeight = "bold";
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  data.forEach((item) => {
    const row = document.createElement("tr");
    columns.forEach((col) => {
      const td = document.createElement("td");
      td.style.border = "1px solid #dee2e6";
      td.style.padding = "8px";
      td.style.textAlign = "right";
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
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  container.appendChild(table);

  const opt = {
    margin: [10, 5, 10, 5],
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
  };

  html2pdf().from(container).set(opt).save();
};
