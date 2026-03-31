const ExcelJS = require('exceljs');
const fs = require('fs');

async function test() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Timeline');
  
  worksheet.getCell('C10').value = new Date('2025-05-01T00:00:00Z');
  
  const rowNum = 15;
  const daysCell = `E${rowNum}`;
  const dirCell = `G${rowNum}`;
  const baseCell = '$C$10';

  const row = worksheet.addRow([]);
  row.getCell(5).value = 10;
  row.getCell(7).value = 'After';
  
  let formula = `WORKDAY(${baseCell}, IF(${dirCell}="After", ${daysCell}, -${daysCell}))`;
  
  row.getCell(1).value = {
    formula: `IF(ISNUMBER(${baseCell}), ${formula}, "TBD")`,
    result: new Date('2025-05-15T00:00:00Z')
  };
  
  row.getCell(1).numFmt = 'mm/dd/yy';
  
  await workbook.xlsx.writeFile('test_output.xlsx');
  console.log('done');
}
test();
