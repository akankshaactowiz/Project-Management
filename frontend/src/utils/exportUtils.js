// utils/exportUtils.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportData = (type, data, filename = "export") => {
  switch (type) {
    case "pdf":
      exportPDF(data, filename);
      break;
    case "excel":
      exportExcel(data, filename);
      break;
    case "csv":
      exportCSV(data, filename);
      break;
    case "json":
      exportJSON(data, filename);
      break;
    default:
      console.error("Unknown export type");
  }
};


const exportPDF = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data available for export");
    return;
  }

  const doc = new jsPDF();

  // Extract columns from data keys, formatted for header
  const columns = Object.keys(data[0]).map(col =>
    col.replace(/\./g, " ").replace(/\b\w/g, c => c.toUpperCase())
  );

  // Extract rows of data
  const rows = data.map(row =>
    Object.keys(data[0]).map(col => {
      const val = row[col];
      return val !== undefined && val !== null ? String(val) : "-";
    })
  );

  doc.setFontSize(12);
  doc.text(filename, 14, 15);

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 20,
    styles: {
      fontSize: 6,
      cellPadding: 3,
      valign: "middle",
      halign: "left",
      textColor: [33, 33, 33],
    },
    headStyles: {
      fillColor: [63, 81, 181],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    // margin: { left: 14, right: 14 },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.1,
  });

  doc.save(`${filename}.pdf`);
};

const exportExcel = (data, filename) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

const exportCSV = (data, filename) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
