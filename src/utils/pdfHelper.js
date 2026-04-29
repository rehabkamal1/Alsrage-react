import html2pdf from "html2pdf.js";

/**
 * Exports an array of objects to a PDF file using html2pdf.js for proper Arabic/RTL support.
 *
 * @param {Array} data - The array of objects to export.
 * @param {Array} columns - Array of objects specifying the mapping: [{ header: "اسم العميل", key: "name" }, ...]
 * @param {string} filename - The name of the downloaded file.
 */
export const exportToPDF = (data, columns, filename = "export.pdf") => {
  // Create a temporary container for the table
  const container = document.createElement("div");
  container.style.direction = "rtl";
  container.style.fontFamily = "'Amiri', 'Roboto', 'Arial', sans-serif";
  container.style.padding = "20px";
  container.style.backgroundColor = "#fff";

  // Add a title
  const title = document.createElement("h2");
  title.innerText = filename.replace(".pdf", "").replace(/_/g, " ");
  title.style.textAlign = "center";
  title.style.marginBottom = "20px";
  title.style.color = "#333";
  container.appendChild(title);

  // Create the table
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.fontSize = "10px";

  // Create header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.style.backgroundColor = "#f8f9fa";
  
  columns.forEach((col) => {
    const th = document.createElement("th");
    th.innerText = col.header;
    th.style.border = "1px solid #dee2e6";
    th.style.padding = "8px";
    th.style.textAlign = "right";
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create body
  const tbody = document.createElement("tbody");
  data.forEach((item) => {
    const row = document.createElement("tr");
    columns.forEach((col) => {
      const td = document.createElement("td");
      if (col.format && typeof col.format === "function") {
        td.innerText = col.format(item);
      } else {
        td.innerText = item[col.key] || "-";
      }
      td.style.border = "1px solid #dee2e6";
      td.style.padding = "8px";
      td.style.textAlign = "right";
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  container.appendChild(table);

  // Options for html2pdf
  const opt = {
    margin: 10,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
  };

  // Generate PDF
  html2pdf().from(container).set(opt).save();
};
