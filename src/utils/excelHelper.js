import {
  getExportCellValue,
  getExportFilename,
  withExportFeedback,
} from "./exportShared";

const isCurrencyColumn = (column) =>
  /amount|price|balance|revenue|sales|collected|outstanding|paid|due|مبلغ|إجمالي|المحصل|المتبقي|المستحق|السعر|الرصيد|عقد|تكلفة/i.test(
    `${column.key || ""} ${column.header || ""}`,
  );

const downloadWorkbook = async (workbook, filename) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const exportToExcel = (
  data,
  columns,
  filename = "export.xlsx",
) =>
  withExportFeedback(async () => {
    const exportData = await data;
    if (!Array.isArray(exportData) || exportData.length === 0) {
      throw new Error("No rows to export");
    }
    if (!Array.isArray(columns) || columns.length === 0) {
      throw new Error("No columns to export");
    }

    const { default: ExcelJS } = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("التقرير", {
      views: [{ state: "frozen", ySplit: 1, rightToLeft: true }],
    });
    worksheet.columns = columns.map((column) => {
      const requestedWidth = Number.parseFloat(column.width);
      const width = Number.isFinite(requestedWidth)
        ? requestedWidth
        : String(column.header || column.label || "").length + 4;
      return {
        header: column.header || column.label || "",
        key: column.key || column.header,
        width: Math.max(10, Math.min(width, 48)),
        style: {
          alignment: {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          },
        },
      };
    });

    exportData.forEach((item, rowIndex) => {
      const row = worksheet.addRow(
        columns.map((column) => getExportCellValue(item, column, rowIndex)),
      );
      row.eachCell((cell, columnIndex) => {
        const column = columns[columnIndex - 1];
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFD7DEE8" } },
          bottom: { style: "thin", color: { argb: "FFD7DEE8" } },
          left: { style: "thin", color: { argb: "FFD7DEE8" } },
          right: { style: "thin", color: { argb: "FFD7DEE8" } },
        };
        if (rowIndex % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF3F6FB" },
          };
        }
        if (typeof cell.value === "number" && Number.isFinite(cell.value)) {
          cell.numFmt = isCurrencyColumn(column)
            ? '#,##0.00 "ر.س"'
            : "#,##0.##";
        }
      });
    });

    const header = worksheet.getRow(1);
    header.height = 30;
    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD7DEE8" } },
        bottom: { style: "thin", color: { argb: "FFD7DEE8" } },
        left: { style: "thin", color: { argb: "FFD7DEE8" } },
        right: { style: "thin", color: { argb: "FFD7DEE8" } },
      };
    });
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: exportData.length + 1, column: columns.length },
    };

    await downloadWorkbook(workbook, getExportFilename(filename, "xlsx"));
  }, "تم تنزيل ملف Excel");
