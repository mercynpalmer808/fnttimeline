const ExcelJS = require('exceljs');
async function test() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Timeline');
  worksheet.getCell('C10').value = 'TBD';
  const row = worksheet.addRow([]);
  row.getCell(1).value = {
    formula: `IF(ISNUMBER($C$10), $C$10+10, "TBD")`,
    result: undefined
  };
  await workbook.xlsx.writeFile('test_output2.xlsx');
  console.log('done2');
}
test();
