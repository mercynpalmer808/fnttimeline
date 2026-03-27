const fs = require('fs');
let code = fs.readFileSync('src/components/TimelineCreator.tsx', 'utf-8');

// The block to replace
const startMarker = "const addInfoRow = (label: string, value: any, isDate: boolean = false) => {";
const endMarker = "worksheet.addRow([]);\n\n    const headerRow = worksheet.addRow(['Due Date', 'Contingency #', 'Party', 'Task', 'Date Completed', 'Days', 'Direction', 'Base', 'Notes']);";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers.", startIndex, endIndex);
  process.exit(1);
}

const replacement = `let acceptanceCellRef = '$C$10';
    let closingCellRef = '$C$10';

    const addInfoRowTwoCols = (
      leftLabel: string, leftValue: any, leftIsDate: boolean,
      rightLabel: string | null, rightValue: any, rightIsDate: boolean
    ) => {
      const row = worksheet.addRow([]);
      
      row.getCell(1).value = leftLabel;
      worksheet.mergeCells(\`A\${row.number}:B\${row.number}\`);
      row.getCell(3).value = leftValue;
      worksheet.mergeCells(\`C\${row.number}:D\${row.number}\`);

      if (leftLabel === 'Acceptance Date') acceptanceCellRef = \`$C$\${row.number}\`;
      if (leftLabel === 'Closing Date') closingCellRef = \`$C$\${row.number}\`;
      
      const formatLabelCell = (col1: number, col2: number) => {
        const cell = row.getCell(col1);
        cell.font = { size: 9, bold: true, color: { argb: 'FF374151' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
        cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
        for (let c = col1; c <= col2; c++) {
          row.getCell(c).border = { top: { style: 'thin', color: { argb: 'FFE5E7EB' } }, bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }, left: { style: 'thin', color: { argb: 'FFE5E7EB' } }, right: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
        }
      };

      const formatValueCell = (col1: number, col2: number, isDate: boolean) => {
        const cell = row.getCell(col1);
        cell.font = { size: 9 };
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        if (isDate && cell.value !== 'TBD') cell.numFmt = 'mm/dd/yy';
        for (let c = col1; c <= col2; c++) {
          row.getCell(c).border = { top: { style: 'thin', color: { argb: 'FFE5E7EB' } }, bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }, left: { style: 'thin', color: { argb: 'FFE5E7EB' } }, right: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
        }
      };

      formatLabelCell(1, 2);
      formatValueCell(3, 4, leftIsDate);

      if (rightLabel !== null) {
        row.getCell(5).value = rightLabel;
        worksheet.mergeCells(\`E\${row.number}:F\${row.number}\`);
        row.getCell(7).value = rightValue;
        worksheet.mergeCells(\`G\${row.number}:I\${row.number}\`);

        if (rightLabel === 'Acceptance Date') acceptanceCellRef = \`$G$\${row.number}\`;
        if (rightLabel === 'Closing Date') closingCellRef = \`$G$\${row.number}\`;

        formatLabelCell(5, 6);
        formatValueCell(7, 9, rightIsDate);
      }
    };

    const excelAcceptanceDate = acceptanceDate ? new Date(parseISO(acceptanceDate).getTime() + parseISO(acceptanceDate).getTimezoneOffset() * 60000) : 'TBD';
    const excelClosingDate = closingDate ? new Date(parseISO(closingDate).getTime() + parseISO(closingDate).getTimezoneOffset() * 60000) : 'TBD';
    const excelContractDate = contractDate ? new Date(parseISO(contractDate).getTime() + parseISO(contractDate).getTimezoneOffset() * 60000) : 'TBD';

    addInfoRowTwoCols('Property Address', propertyAddress, false, 'Sales Price', salesPrice, false);
    addInfoRowTwoCols('Tenure', tenure, false, 'Listing Agent', listingAgent, false);
    addInfoRowTwoCols('Title Co / Escrow', titleEscrow, false, 'Buyer Agent', buyersAgent, false);
    addInfoRowTwoCols('Escrow #', escrowNumber, false, 'Lender Info', lenderInfo, false);
    addInfoRowTwoCols('Acceptance Date', excelAcceptanceDate, true, 'Seller/Buyer Info', sellerBuyerInfo, false);
    addInfoRowTwoCols('Closing Date', excelClosingDate, true, 'Financing', Object.entries(financing).filter(e => e[1]).map(e => e[0]).join(', '), false);
    addInfoRowTwoCols('Contract Date', excelContractDate, true, 'Other Info', otherInformation, false);
    addInfoRowTwoCols('HARPTA', harpta ? 'Yes' : 'No', false, 'FIRPTA', firpta ? 'Yes' : 'No', false);
    addInfoRowTwoCols('Land Court', landCourt ? 'Yes' : 'No', false, null, '', false);

    `;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

// Also need to replace the formula to use the dynamic cell refs.
// Wait, the formula has fixed variables: `const formulaStr = ...`
const formulaOriginal = "\`IF(H${rowNum}=\"Acceptance\",IF($B$10=\"TBD\",\"TBD\",IF(G${rowNum}=\"After\",$B$10+F${rowNum},$B$10-F${rowNum})),IF(H${rowNum}=\"Closing\",IF($B$11=\"TBD\",\"TBD\",IF(G${rowNum}=\"After\",$B$11+F${rowNum},$B$11-F${rowNum})),\"TBD\"))\`";
const formulaNew = "\`IF(H\${rowNum}=\"Acceptance\",IF(\${acceptanceCellRef}=\"TBD\",\"TBD\",IF(G\${rowNum}=\"After\",\${acceptanceCellRef}+F\${rowNum},\${acceptanceCellRef}-F\${rowNum})),IF(H\${rowNum}=\"Closing\",IF(\${closingCellRef}=\"TBD\",\"TBD\",IF(G\${rowNum}=\"After\",\${closingCellRef}+F\${rowNum},\${closingCellRef}-F\${rowNum})),\"TBD\"))\`";

code = code.replace(formulaOriginal, formulaNew);

fs.writeFileSync('src/components/TimelineCreator.tsx', code);
console.log("Done");
