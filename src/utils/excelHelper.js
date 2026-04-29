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
      // Handle nested or computed values by checking if the col object provides a render or format function
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

  // Make worksheet RTL
  if (!worksheet["!views"]) {
    worksheet["!views"] = [];
  }
  worksheet["!views"].push({ rightToLeft: true });

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Write the file
  XLSX.writeFile(workbook, filename);
};
