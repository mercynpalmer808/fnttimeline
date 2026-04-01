const ExcelJS = require('exceljs');

async function test() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');
  
  // Create some columns
  worksheet.columns = [
    { header: 'Id', key: 'id', width: 10 },
    { header: 'Name', key: 'name', width: 32 }
  ];
  
  // Set all columns to unlocked by default
  worksheet.columns.forEach(col => {
    col.protection = { locked: false };
  });

  worksheet.addRow({id: 1, name: 'John Doe'});
  const disclosureRow = worksheet.addRow({id: '', name: 'Disclosure: Do not edit'});
  
  // Lock the specific cell
  disclosureRow.getCell(2).protection = { locked: true };
  
  await worksheet.protect('password', {
    selectLockedCells: true,
    selectUnlockedCells: true,
  });
  
  await workbook.xlsx.writeFile('test-excel-col.xlsx');
  console.log('Done');
}

test();