import * as XLSX from 'xlsx-js-style';
import ExcelJS from 'exceljs';

async function test() {
  const wsData = [
    ['PURCHASE CONTRACT TIMELINE'],
    ['Property Address', '123 Main St']
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  worksheet['A1'].s = {
    font: { name: 'Arial', sz: 16, bold: true, color: { rgb: "1E3A8A" } },
    fill: { fgColor: { rgb: "F3F4F6" } }
  };
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Timeline");
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

  const excelWorkbook = new ExcelJS.Workbook();
  await excelWorkbook.xlsx.load(wbout);
  const ws = excelWorkbook.getWorksheet("Timeline");
  
  const cell = ws.getCell('A1');
  console.log('Font:', cell.font);
  console.log('Fill:', cell.fill);
}
test().catch(console.error);
