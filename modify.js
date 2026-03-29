const fs = require('fs');
let content = fs.readFileSync('src/components/TimelineCreator.tsx', 'utf8');

content = content.replace(/  party\?: 'Seller' \| 'Buyer' \| 'Both' \| 'Other' \| '';\n/, '');

content = content.replace(
  /worksheet\.columns = \[\n      \{ width: 11 \}, \{ width: 13 \}, \{ width: 11 \}, \{ width: 25 \}, \{ width: 12 \},\n      \{ width: 6 \}, \{ width: 10 \}, \{ width: 10 \}, \{ width: 15 \}\n    \];/,
  `worksheet.columns = [\n      { width: 11 }, { width: 13 }, { width: 25 }, { width: 12 },\n      { width: 6 }, { width: 10 }, { width: 10 }, { width: 15 }\n    ];`
);

content = content.replace(/worksheet\.mergeCells\('D1:I3'\);/, "worksheet.mergeCells('D1:H3');");

content = content.replace(/worksheet\.mergeCells\(\`G\$\{row\.number\}:I\$\{row\.number\}\`\);/, 'worksheet.mergeCells(`G${row.number}:H${row.number}`);');

content = content.replace(/formatValueCell\(7, 9, rightIsDate\);/, 'formatValueCell(7, 8, rightIsDate);');

content = content.replace(/worksheet\.mergeCells\(\`C\$\{otherInfoRow\.number\}:I\$\{otherInfoRow\.number\}\`\);/, 'worksheet.mergeCells(`C${otherInfoRow.number}:H${otherInfoRow.number}`);');

content = content.replace(/for \(let c = 3; c <= 9; c\+\+\) \{/, 'for (let c = 3; c <= 8; c++) {');

content = content.replace(/const headerRow = worksheet\.addRow\(\['Due Date', 'Contingency #', 'Party', 'Task', 'Date Completed', 'Days', 'Direction', 'Base', 'Notes'\]\);/, "const headerRow = worksheet.addRow(['Due Date', 'Contingency #', 'Task', 'Date Completed', 'Days', 'Direction', 'Base', 'Notes']);");

content = content.replace(
`      const row = worksheet.addRow([
        dateCellValue,
        event.contingency || '',
        event.party || '',
        event.task,
        event.completedDate || '',
        event.direction === 'Custom Date' ? 'N/A' : event.days,
        event.direction,
        event.direction === 'Custom Date' ? 'N/A' : event.base,
        event.notes || ''
      ]);`,
`      const row = worksheet.addRow([
        dateCellValue,
        event.contingency || '',
        event.task,
        event.completedDate || '',
        event.direction === 'Custom Date' ? 'N/A' : event.days,
        event.direction,
        event.direction === 'Custom Date' ? 'N/A' : event.base,
        event.notes || ''
      ]);`
);

content = content.replace(/worksheet\.mergeCells\(\`A\$\{disclosureRow\.number\}:I\$\{disclosureRow\.number\}\`\);/, 'worksheet.mergeCells(`A${disclosureRow.number}:H${disclosureRow.number}`);');

content = content.replace(
`      return [
        event.completedDate || '',
        event.contingency || '',
        event.party || '',
        event.task,
        event.direction === 'Custom Date' ? 'N/A' : event.days.toString(),
        event.direction,
        event.direction === 'Custom Date' ? 'N/A' : event.base,
        dateStr,
        event.notes || ''
      ];`,
`      return [
        event.completedDate || '',
        event.contingency || '',
        event.task,
        event.direction === 'Custom Date' ? 'N/A' : event.days.toString(),
        event.direction,
        event.direction === 'Custom Date' ? 'N/A' : event.base,
        dateStr,
        event.notes || ''
      ];`
);

content = content.replace(
`    autoTable(doc, {
      startY,
      head: [['Date Completed', 'Cont.', 'Party', 'Task', 'Days', 'Dir.', 'Base Date', 'Due Date', 'Notes']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] }, // slate-900
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        3: { cellWidth: 45 }, // Task
        8: { cellWidth: 30 }  // Notes
      },`,
`    autoTable(doc, {
      startY,
      head: [['Date Completed', 'Cont.', 'Task', 'Days', 'Dir.', 'Base Date', 'Due Date', 'Notes']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] }, // slate-900
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        2: { cellWidth: 45 }, // Task
        7: { cellWidth: 30 }  // Notes
      },`
);

content = content.replace(/<th className="p-3 font-semibold w-24">Party<\/th>\n\s*/, '');

content = content.replace(
`                  </td>                  <td className="p-2">
                    <select
                      value={event.party || ''}
                      onChange={e => updateEvent(event.id, { party: e.target.value as any })}
                      className="w-full border-slate-200 rounded p-1 text-xs shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-transparent"
                    >
                      <option value="">None</option>
                      <option value="Seller">Seller</option>
                      <option value="Buyer">Buyer</option>
                      <option value="Both">Both</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"`,
`                  </td>
                  <td className="p-2">
                    <input
                      type="text"`
);

fs.writeFileSync('src/components/TimelineCreator.tsx', content);
console.log('done');
