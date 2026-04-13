const ExcelJS = require('exceljs');

async function test() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');
  
  worksheet.addRow(['Data 1', 'Data 2']);
  worksheet.addRow(['Data 3', 'Data 4']);
  const disclosureRow = worksheet.addRow(['Disclosure']);
  
  // Unlock all cells by default
  worksheet.eachRow((row) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.protection = { locked: false };
    });
  });
  
  // Lock disclosure
  disclosureRow.getCell(1).protection = { locked: true };
  
  // Protect worksheet
  await worksheet.protect('password', {
    selectLockedCells: true,
    selectUnlockedCells: true,
  });
  
  await workbook.xlsx.writeFile('test_output.xlsx');
  console.log('Done');
}

test();