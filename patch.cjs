const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/TimelineCreator.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add na?: boolean; to TimelineEvent
content = content.replace(
  /notes\?: string;\n\}/,
  "notes?: string;\n  na?: boolean;\n}"
);

// 2. Modify INITIAL_EVENTS to merge e3a/e3b into e3, and h1a/h1b into h1
content = content.replace(
  /\{ id: 'e3a', contingency: 'E-3\(a\)', task: 'Inventory of Furnishings Attached', days: 14, direction: 'After', base: 'Acceptance' \},\n\s*\{ id: 'e3b', contingency: 'E-3\(b\)', task: 'Inventory of Furnishings to be provided by', days: 14, direction: 'After', base: 'Acceptance' \},/,
  "{ id: 'e3', contingency: 'E-3(a)', task: 'Inventory of Furnishings Attached', days: 14, direction: 'After', base: 'Acceptance' },"
);

content = content.replace(
  /\{ id: 'h1a', contingency: 'H-1\(a\)', task: 'Evidence of Cash funds Attached', days: 14, direction: 'After', base: 'Acceptance' \},\n\s*\{ id: 'h1b', contingency: 'H-1\(b\)', task: 'Evidence of Cash Funds to be provided by', days: 14, direction: 'After', base: 'Acceptance' \},/,
  "{ id: 'h1', contingency: 'H-1(a)', task: 'Evidence of Cash funds Attached', days: 14, direction: 'After', base: 'Acceptance' },"
);

// Also update h4a default task to match what's requested if needed, let's set it to "H-4(a) Prequal letter Attached"
content = content.replace(
  /\{ id: 'h4a', contingency: 'H-4\(a\)', task: "Buyer's Obligation \(a\) Prequal letter", days: 7, direction: 'After', base: 'Acceptance' \},/,
  "{ id: 'h4a', contingency: 'H-4(a)', task: 'H-4(a) Prequal letter Attached', days: 7, direction: 'After', base: 'Acceptance' },"
);

// 3. Filter out N/A events in export functions
content = content.replace(
  /getSortedEvents\(\)\.forEach\(\(event, index\) => \{/g,
  "getSortedEvents().filter(e => !e.na).forEach((event, index) => {"
);

content = content.replace(
  /const tableData = getSortedEvents\(\)\.map\(event => \{/g,
  "const tableData = getSortedEvents().filter(e => !e.na).map(event => {"
);

// 4. Leave due date blank on PDF instead of 'Needs base date'
content = content.replace(
  /let dateStr = 'Needs base date';/,
  "let dateStr = '';"
);
content = content.replace(
  /<span className="text-slate-400 italic">Needs base date<\/span>/,
  '<span className="text-slate-400 italic">Needs base date</span>' // keep UI same
);

// 5. Add N/A column to table
content = content.replace(
  /<th className="p-3 font-semibold w-24 text-center">Date Completed<\/th>/,
  '<th className="p-3 font-semibold w-24 text-center">Date Completed</th>\n              <th className="p-3 font-semibold w-16 text-center">N/A</th>'
);

content = content.replace(
  /<td className="p-2 text-center">\s*<input\s*type="text"\s*value=\{event\.completedDate \|\| ''\}\s*onChange=\{e => updateEvent\(event\.id, \{ completedDate: e\.target\.value \}\)\}\s*className="w-20 bg-transparent border-slate-300 rounded text-center text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"\s*placeholder="MM\/DD\/YY"\s*\/>\s*<\/td>/,
  `<td className="p-2 text-center">
                    <input
                      type="text"
                      value={event.completedDate || ''}
                      onChange={e => updateEvent(event.id, { completedDate: e.target.value })}
                      className="w-20 bg-transparent border-slate-300 rounded text-center text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="MM/DD/YY"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={event.na || false}
                      onChange={e => updateEvent(event.id, { na: e.target.checked })}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                  </td>`
);

// 6. Update contingency column to have dropdowns for e3 and h1
const newContingencyDropdowns = `) : event.id === 'e3' ? (
                      <select
                        value={event.contingency}
                        onChange={e => {
                          const isE3A = e.target.value === 'E-3(a)';
                          updateEvent(event.id, {
                            contingency: isE3A ? 'E-3(a)' : 'E-3(b)',
                            task: isE3A ? 'Inventory of Furnishings Attached' : 'Inventory of Furnishings to be provided by'
                          });
                        }}
                        className={\`w-full bg-transparent border-slate-200 rounded p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-0 \${event.completedDate ? 'line-through text-slate-500' : ''}\`}
                      >
                        <option value="E-3(a)">E-3(a)</option>
                        <option value="E-3(b)">E-3(b)</option>
                      </select>
                    ) : event.id === 'h1' ? (
                      <select
                        value={event.contingency}
                        onChange={e => {
                          const isH1A = e.target.value === 'H-1(a)';
                          updateEvent(event.id, {
                            contingency: isH1A ? 'H-1(a)' : 'H-1(b)',
                            task: isH1A ? 'Evidence of Cash funds Attached' : 'Evidence of Cash Funds to be provided by'
                          });
                        }}
                        className={\`w-full bg-transparent border-slate-200 rounded p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-0 \${event.completedDate ? 'line-through text-slate-500' : ''}\`}
                      >
                        <option value="H-1(a)">H-1(a)</option>
                        <option value="H-1(b)">H-1(b)</option>
                      </select>
                    ) :`;
content = content.replace(/\) : \(\s*<input\s*type="text"\s*value=\{event\.contingency \|\| ''\}/, newContingencyDropdowns + ` (\n                      <input\n                        type="text"\n                        value={event.contingency || ''}`);


// 7. Update task column to have a dropdown for h4a
const newTaskDropdown = `<td className="p-2">
                    {event.id === 'h4a' ? (
                      <select
                        value={event.task}
                        onChange={e => updateEvent(event.id, { task: e.target.value })}
                        className={\`w-full bg-transparent border-slate-200 rounded p-1 text-xs shadow-sm focus:border-blue-500 focus:ring-0 \${event.completedDate ? 'line-through text-slate-500' : ''}\`}
                      >
                        <option value="H-4(a) Prequal letter Attached">H-4(a) Prequal letter Attached</option>
                        <option value="H-4(a) Prequal letter to be provided by">H-4(a) Prequal letter to be provided by</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={event.task}
                        onChange={e => updateEvent(event.id, { task: e.target.value })}
                        className={\`w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 px-2 py-1 text-xs \${event.completedDate ? 'line-through text-slate-500' : ''}\`}
                        placeholder="Task description"
                      />
                    )}
                  </td>`;
content = content.replace(/<td className="p-2">\s*<input\s*type="text"\s*value=\{event\.task\}\s*onChange=\{e => updateEvent\(event\.id, \{ task: e\.target\.value \}\)\}\s*className=\{`w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 px-2 py-1 text-xs \$\{event\.completedDate \? 'line-through text-slate-500' : ''\}`\}\s*placeholder="Task description"\s*\/>\s*<\/td>/, newTaskDropdown);


fs.writeFileSync(filePath, content, 'utf8');
console.log("Patched successfully");
