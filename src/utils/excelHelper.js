import * as XLSX from "xlsx";

/**
 * Exports an array of objects to an Excel file.
 *
 * @param {Array} data - The array of objects to export (e.g., filteredClients).
 * @param {Array} columns - Array of objects specifying the mapping: [{ header: "اسم العميل", key: "name" }, ...]
 * @param {string} filename - The name of the downloaded file.
 */
export const exportToExcel = (data, columns, filename = "export.xlsx") => {
  // Map data to the desired format based on columns
  const formattedData = data.map((item) => {
    const row = {};
    columns.forEach((col) => {
      if (col.format && typeof col.format === "function") {
        row[col.header] = col.format(item);
      } else {
        row[col.header] = item[col.key] || "-";
      }
    });
    return row;
  });

  // Create a new workbook and a worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();

  // --- Auto-calculate column widths ---
  const colWidths = columns.map((col) => {
    // Start with the header length
    let maxWidth = col.header.length;
    
    // Check all data rows for this column
    formattedData.forEach((row) => {
      const cellValue = String(row[col.header] || "");
      if (cellValue.length > maxWidth) {
        maxWidth = cellValue.length;
      }
    });
    
    // Add a bit of padding (average character width in Excel is roughly 1 unit)
    return { wch: maxWidth + 5 };
  });
  
  worksheet["!cols"] = colWidths;

  // Make worksheet RTL
  if (!worksheet["!views"]) {
    worksheet["!views"] = [];
  }
  worksheet["!views"].push({ rightToLeft: true });

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Write the file
  XLSX.writeFile(workbook, filename);
};
