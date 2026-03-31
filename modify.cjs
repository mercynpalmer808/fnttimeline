const fs = require('fs');

let content = fs.readFileSync('src/components/TimelineCreator.tsx', 'utf-8');

// 1. Update imports and add business days functions
content = content.replace(
  "import { addDays, subDays, format, parseISO, isValid } from 'date-fns';",
  "import { addDays, subDays, format, parseISO, isValid, isWeekend } from 'date-fns';\n\nconst addBusinessDays = (date, days) => {\n  let result = new Date(date);\n  let remainingDays = days;\n  while (remainingDays > 0) {\n    result = addDays(result, 1);\n    if (!isWeekend(result)) {\n      remainingDays--;\n    }\n  }\n  return result;\n};\n\nconst subBusinessDays = (date, days) => {\n  let result = new Date(date);\n  let remainingDays = days;\n  while (remainingDays > 0) {\n    result = subDays(result, 1);\n    if (!isWeekend(result)) {\n      remainingDays--;\n    }\n  }\n  return result;\n};"
);

// 2. Add isBusinessDays to interface
content = content.replace(
  "days: number;",
  "days: number;\n  isBusinessDays?: boolean;"
);

// 3. Update calculateDate
content = content.replace(
  /if \(event\.days === 0\) return baseDate;\n\n    return event\.direction === 'After' \n      \? addDays\(baseDate, event\.days\) \n      : subDays\(baseDate, event\.days\);/,
  "if (event.days === 0) return baseDate;\n\n    if (event.isBusinessDays) {\n      return event.direction === 'After'\n        ? addBusinessDays(baseDate, event.days)\n        : subBusinessDays(baseDate, event.days);\n    } else {\n      return event.direction === 'After' \n        ? addDays(baseDate, event.days) \n        : subDays(baseDate, event.days);\n    }"
);

// 4. Update INITIAL_EVENTS array
content = content.replace(
  /  \{ id: 'c4', contingency: 'C-4', task: "Seller's Compensation to Buyer's Brokerage Firm", days: 14, direction: 'After', base: 'Acceptance' \},\n/g,
  ""
);
content = content.replace(
  /  \{ id: 'h3', contingency: 'H-3', task: 'Financing Contingency Applies', days: 30, direction: 'After', base: 'Acceptance' \},\n/g,
  ""
);
content = content.replace(
  /  \{ id: 'm2', contingency: 'M-2', task: 'Delivery of Documents Format', days: 14, direction: 'After', base: 'Acceptance' \},\n/g,
  ""
);
content = content.replace(
  "  { id: 'f3', contingency: 'F-3(a)'",
  "  { id: 'f2', contingency: 'F-2', task: 'Scheduled Closing Date', days: 45, direction: 'After', base: 'Acceptance' },\n  { id: 'f3', contingency: 'F-3(a)'"
);

// 5. Update Excel headers and row columns
content = content.replace(
  "const headerRow = worksheet.addRow(['Due Date', 'Contingency #', 'Task', 'Date Completed', 'Days', 'Direction', 'Base', 'Notes']);",
  "const headerRow = worksheet.addRow(['Due Date', 'Contingency #', 'Task', 'Date Completed', 'Days', 'Bus. Days', 'Direction', 'Base', 'Notes']);"
);

// 6. Update Excel format settings columns
content = content.replace(
  "worksheet.columns = [\n      { width: 11 }, { width: 13 }, { width: 25 }, { width: 12 },\n      { width: 6 }, { width: 10 }, { width: 10 }, { width: 15 }\n    ];",
  "worksheet.columns = [\n      { width: 11 }, { width: 13 }, { width: 25 }, { width: 12 },\n      { width: 6 }, { width: 9 }, { width: 10 }, { width: 10 }, { width: 15 }\n    ];"
);

// 7. Update Excel row adding
content = content.replace(
  "        event.direction === 'Custom Date' ? 'N/A' : event.days,\n        event.direction,\n        event.direction === 'Custom Date' ? 'N/A' : event.base,\n        event.notes || ''",
  "        event.direction === 'Custom Date' ? 'N/A' : event.days,\n        event.direction === 'Custom Date' ? 'N/A' : (event.isBusinessDays ? 'Yes' : 'No'),\n        event.direction,\n        event.direction === 'Custom Date' ? 'N/A' : event.base,\n        event.notes || ''"
);

// 8. Update formula logic for Excel
const excelFormulaOld = `      let dateCellValue: any = calcDate ? new Date(calcDate.getTime() + calcDate.getTimezoneOffset() * 60000) : 'TBD';\n      if (event.direction !== 'Custom Date') {\n        const formulaStr = \`IF(H\${rowNum}="Acceptance",IF(\${acceptanceCellRef}="TBD","TBD",IF(G\${rowNum}="After",\${acceptanceCellRef}+F\${rowNum},\${acceptanceCellRef}-F\${rowNum})),IF(H\${rowNum}="Closing",IF(\${closingCellRef}="TBD","TBD",IF(G\${rowNum}="After",\${closingCellRef}+F\${rowNum},\${closingCellRef}-F\${rowNum})),"TBD"))\`;\n        dateCellValue = { formula: formulaStr, result: calcDate ? new Date(calcDate.getTime() + calcDate.getTimezoneOffset() * 60000) : 'TBD' };\n      }`;
const excelFormulaNew = `      let dateCellValue: any = calcDate ? new Date(calcDate.getTime() + calcDate.getTimezoneOffset() * 60000) : 'TBD';\n      if (event.direction !== 'Custom Date') {\n        const getMath = (base) => \`IF(E\${rowNum}=0,\${base},IF(G\${rowNum}="After",IF(F\${rowNum}="Yes",WORKDAY(\${base},E\${rowNum}),\${base}+E\${rowNum}),IF(F\${rowNum}="Yes",WORKDAY(\${base},-E\${rowNum}),\${base}-E\${rowNum})))\`;\n        const formulaStr = \`IF(H\${rowNum}="Acceptance",IF(\${acceptanceCellRef}="TBD","TBD",\${getMath(acceptanceCellRef)}),IF(H\${rowNum}="Closing",IF(\${closingCellRef}="TBD","TBD",\${getMath(closingCellRef)}),"TBD"))\`;\n        dateCellValue = { formula: formulaStr, result: calcDate ? new Date(calcDate.getTime() + calcDate.getTimezoneOffset() * 60000) : 'TBD' };\n      }`;
content = content.replace(excelFormulaOld, excelFormulaNew);

// 9. Update PDF export
content = content.replace(
  "        event.direction === 'Custom Date' ? 'N/A' : event.days.toString(),\n        event.direction,\n        event.direction === 'Custom Date' ? 'N/A' : event.base,\n        dateStr,\n        event.notes || ''",
  "        event.direction === 'Custom Date' ? 'N/A' : event.days.toString(),\n        event.direction === 'Custom Date' ? 'N/A' : (event.isBusinessDays ? 'Yes' : 'No'),\n        event.direction,\n        event.direction === 'Custom Date' ? 'N/A' : event.base,\n        dateStr,\n        event.notes || ''"
);

content = content.replace(
  "      head: [['Date Completed', 'Cont.', 'Task', 'Days', 'Dir.', 'Base Date', 'Due Date', 'Notes']],",
  "      head: [['Date Completed', 'Cont.', 'Task', 'Days', 'Bus.', 'Dir.', 'Base Date', 'Due Date', 'Notes']],"
);

// 10. Update UI headers
content = content.replace(
  "              <th className=\"p-3 font-semibold min-w-[300px] w-96\">Task</th>\n              <th className=\"p-3 font-semibold w-20\">Days</th>\n              <th className=\"p-3 font-semibold w-28\">Direction</th>",
  "              <th className=\"p-3 font-semibold min-w-[300px] w-96\">Task</th>\n              <th className=\"p-3 font-semibold w-20\">Days</th>\n              <th className=\"p-3 font-semibold w-24 text-center\">Bus. Days</th>\n              <th className=\"p-3 font-semibold w-28\">Direction</th>"
);

// 11. Update UI rows
const oldTableRow = `                  <td className="p-2">
                    {event.direction !== 'Custom Date' && (
                      <input 
                        type="number" 
                        value={event.days}
                        onChange={e => updateEvent(event.id, { days: parseInt(e.target.value) || 0 })}
                        className="w-full border-slate-200 rounded p-1 text-center shadow-sm focus:ring-blue-500 focus:border-blue-500 min-w-[3rem]"
                      />
                    )}
                  </td>
                  <td className="p-2">
                    <select `;

const newTableRow = `                  <td className="p-2">
                    {event.direction !== 'Custom Date' && (
                      <input 
                        type="number" 
                        value={event.days}
                        onChange={e => updateEvent(event.id, { days: parseInt(e.target.value) || 0 })}
                        className="w-full border-slate-200 rounded p-1 text-center shadow-sm focus:ring-blue-500 focus:border-blue-500 min-w-[3rem]"
                      />
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {event.direction !== 'Custom Date' && (
                      <input 
                        type="checkbox" 
                        checked={event.isBusinessDays || false}
                        onChange={e => updateEvent(event.id, { isBusinessDays: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                    )}
                  </td>
                  <td className="p-2">
                    <select `;

content = content.replace(oldTableRow, newTableRow);

fs.writeFileSync('src/components/TimelineCreator.tsx', content);
console.log("Changes applied successfully!");
