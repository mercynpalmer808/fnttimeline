const ExcelJS = require('exceljs');

async function run() {
  const workbook = new ExcelJS.Workbook();
  const calcSheet = workbook.addWorksheet('Date Calculator');
  
  calcSheet.getCell('A3').value = 'Starting Date';
  calcSheet.getCell('B3').value = new Date();
  calcSheet.getCell('A4').value = 'Number of Days';
  calcSheet.getCell('B4').value = 10;
  calcSheet.getCell('A5').value = 'Direction';
  const dir = calcSheet.getCell('B5');
  dir.value = 'After';
  dir.dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['"Before,After"']
  };

  const calResult = calcSheet.getCell('B7');
  calResult.value = { formula: 'IF(B5="Before", B3-B4, B3+B4)' };

  const busResult = calcSheet.getCell('B8');
  busResult.value = { formula: 'IF(B5="Before", WORKDAY(B3, -B4), WORKDAY(B3, B4))' };

  await workbook.xlsx.writeFile('test_output.xlsx');
  console.log("Done");
}
run();
