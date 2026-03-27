import { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addDays, subDays, format, parseISO, isValid } from 'date-fns';
import { Plus, Trash2, Download, FileText, ChevronUp, ChevronDown } from 'lucide-react';

type FinancingType = 'Cash' | 'Loan' | '1031 Exchange';

interface TimelineEvent {
  id: string;
  party?: 'Seller' | 'Buyer' | 'Both' | 'Other' | '';
  contingency?: string;
  task: string;
  days: number;
  direction: 'After' | 'Before' | 'Custom Date';
  base: 'Acceptance' | 'Closing' | 'Custom';
  customDate?: string;
  manualDate?: string;
  completed?: boolean;
  notes?: string;
}

const INITIAL_EVENTS: TimelineEvent[] = [
  { id: '1a', contingency: 'B-1', task: 'Initial Deposit', days: 3, direction: 'After', base: 'Acceptance' },
  { id: '1b', contingency: 'C-2', task: 'Additional Deposit', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'c3', contingency: 'C-3', task: 'Concessions', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'c4', contingency: 'C-4', task: "Seller's Compensation to Buyer's Brokerage Firm", days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'e3', contingency: 'E-3', task: 'Inclusions of Furnishings', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'e5a', contingency: 'E-5(a)', task: 'Inclusion of PV', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'e5b', contingency: 'E-5(b)', task: 'Inclusion of PV Docs, etc.', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'e5c', contingency: 'E-5(c)', task: 'Inclusion of PV Documents to rescind and terminate Purchase Contract', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'f3', contingency: 'F-3(a)', task: 'Change to the Closing Date Unilateral Right to Extend', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'f7a', contingency: 'F-7(a)', task: 'Conveyance Tax Declaration', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'g2b', contingency: 'G-2(b)', task: "Buyer's Review of Prelim Report", days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'g2c', contingency: 'G-2(c)', task: 'Title Defect(s)', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'g3', contingency: 'G-3', task: 'Vesting & Tenancy', days: 14, direction: 'Before', base: 'Closing' },
  { id: 'h1a', contingency: 'H-1(a)', task: 'No Contingency on Cash Funds', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'h1b1', contingency: 'H-1(b) i', task: 'No Contingency of Cash Funds', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'h1b2', contingency: 'H-1(b) ii', task: 'No Contingency of Cash Funds', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'h2', contingency: 'H-2', task: 'Cont. of Cash Funds (Type)', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'h2a', contingency: 'H-2(a)', task: 'Contingency of Obtaining Cash Funds', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'h3', contingency: 'H-3', task: 'Financing Contingency Applies', days: 30, direction: 'After', base: 'Acceptance' },
  { id: 'h4a', contingency: 'H-4(a)', task: "Buyer's Obligation (a) Prequal letter", days: 7, direction: 'After', base: 'Acceptance' },
  { id: 'h4b', contingency: 'H-4(b)', task: "Buyer's Obligation (b) Conditional Loan Approval", days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'h4c', contingency: 'H-4(c)', task: "Buyer's (c) Satisfaction of Loan Conditions", days: 21, direction: 'After', base: 'Acceptance' },
  { id: 'i1b', contingency: 'I-1(b)', task: 'Sellers Disclosure to Buyer (b)', days: 7, direction: 'After', base: 'Acceptance' },
  { id: 'i2', contingency: 'I-2', task: 'Amended Disclosure Statement', days: 10, direction: 'After', base: 'Acceptance' },
  { id: 'i3a', contingency: 'I-3(a)', task: 'Buyer Acknowledgment of Disclosure', days: 10, direction: 'After', base: 'Acceptance' },
  { id: 'i3b', contingency: 'I-3(b)', task: 'Buyer Review/Rescission Period', days: 10, direction: 'After', base: 'Acceptance' },
  { id: '4', contingency: 'J-1', task: 'Property Inspection Period', days: 14, direction: 'After', base: 'Acceptance' },
  { id: '9', contingency: 'J-3', task: 'Final Walkthrough', days: 5, direction: 'Before', base: 'Closing' },
  { id: 'j4', contingency: 'J-4', task: 'Withheld/Collected Funds for Repairs', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'j8', contingency: 'J-8', task: 'Removal of Items from Property', days: 5, direction: 'Before', base: 'Closing' },
  { id: 'j9_cleaning', contingency: 'J-9(a)', task: 'Cleaning before Closing', days: 5, direction: 'Before', base: 'Closing' },
  { id: 'j10', contingency: 'J-10', task: 'Animal Related Treatment', days: 5, direction: 'Before', base: 'Closing' },
  { id: 'k_staking_survey', contingency: 'K-1', task: 'Staking', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'k3a', contingency: 'K-3(a)', task: 'Boundary Encroachment(terminate)', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'k3b', contingency: 'K-3(b)', task: 'Boundary Encroachment(Remedied)', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'l2a', contingency: 'L-2(a)', task: 'Select Termite Company', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'l2b', contingency: 'L-2(b)', task: 'Termite Report Delivery', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'l2c', contingency: 'L-2(c)', task: 'Termite Report Cost/Seller or Buyer to Pay', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'm1d_1', contingency: 'M-1(d)', task: 'Condo/HOA Docs to Buyer', days: 10, direction: 'After', base: 'Acceptance' },
  { id: 'm1d_2', contingency: 'M-1(d)', task: 'Buyer Receipt of Condo/HOA Docs', days: 10, direction: 'After', base: 'Acceptance' },
  { id: 'm1e', contingency: 'M-1(e)', task: 'Buyer Review Docs', days: 10, direction: 'After', base: 'Acceptance' },
  { id: 'm1f', contingency: 'M-1(f)', task: 'Return Condo/HOA Docs if terminating', days: 10, direction: 'After', base: 'Acceptance' },
  { id: 'm2', contingency: 'M-2', task: 'Delivery of Documents Format', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'm3', contingency: 'M-3', task: 'Delivery of Addtl Documents', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'n2a', contingency: 'N-2(a)', task: 'Rental Documents Delivery', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'n2b', contingency: 'N-2(b)', task: 'Rental Document Review', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'o3', contingency: 'O-3', task: 'Termination after a Specified Contingency Time Period', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'q', contingency: 'Q', task: 'Special Terms', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'custom1', contingency: '', task: '', days: 0, direction: 'After', base: 'Acceptance' },
  { id: 'custom2', contingency: '', task: '', days: 0, direction: 'After', base: 'Acceptance' },
  { id: 'custom3', contingency: '', task: '', days: 0, direction: 'After', base: 'Acceptance' },
];

export default function TimelineCreator() {
  const [acceptanceDate, setAcceptanceDate] = useState<string>('');
  const [closingDate, setClosingDate] = useState<string>('');
  const [contractDate, setContractDate] = useState<string>('');
  const [salesPrice, setSalesPrice] = useState<string>('');

  const [propertyAddress, setPropertyAddress] = useState('');
  const [tenure, setTenure] = useState<'' | 'Fee Simple' | 'Leasehold'>('');
  const [titleEscrow, setTitleEscrow] = useState('');
  const [escrowNumber, setEscrowNumber] = useState('');

  const [listingAgent, setListingAgent] = useState('');
  const [buyersAgent, setBuyersAgent] = useState('');
  const [sellerBuyerInfo, setSellerBuyerInfo] = useState('');
  const [lenderInfo, setLenderInfo] = useState('');

  const [financing, setFinancing] = useState<Record<FinancingType, boolean>>({
    'Cash': false,
    'Loan': false,
    '1031 Exchange': false,
  });

  const [harpta, setHarpta] = useState(false);
  const [firpta, setFirpta] = useState(false);
  const [landCourt, setLandCourt] = useState(false);
  const [otherInformation, setOtherInformation] = useState('');

  const [events, setEvents] = useState<TimelineEvent[]>(INITIAL_EVENTS);

  const handleNewTimeline = () => {
    if (window.confirm('Are you sure you want to clear all inputs and start a new timeline?')) {
      setAcceptanceDate('');
      setClosingDate('');
      setContractDate('');
      setSalesPrice('');
      setPropertyAddress('');
      setTenure('');
      setTitleEscrow('');
      setEscrowNumber('');
      setListingAgent('');
      setBuyersAgent('');
      setSellerBuyerInfo('');
      setLenderInfo('');
      setFinancing({ 'Cash': false, 'Loan': false, '1031 Exchange': false });
      setHarpta(false);
      setFirpta(false);
      setLandCourt(false);
      setOtherInformation('');
      setEvents(INITIAL_EVENTS);
      setSortBy('default');
    }
  };

  const [sortBy, setSortBy] = useState<'default' | 'contingency' | 'dueDate'>('default');

  const handleFinancingChange = (type: FinancingType) => {
    setFinancing(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const calculateDate = (event: TimelineEvent): Date | null => {
    if (event.direction === 'Custom Date') {
      if (!event.manualDate) return null;
      const parsed = parseISO(event.manualDate);
      return isValid(parsed) ? parsed : null;
    }

    let baseDateStr = '';
    if (event.base === 'Acceptance') baseDateStr = acceptanceDate;
    else if (event.base === 'Closing') baseDateStr = closingDate;
    else if (event.base === 'Custom') baseDateStr = event.customDate || '';

    if (!baseDateStr) return null;
    const baseDate = parseISO(baseDateStr);
    if (!isValid(baseDate)) return null;

    if (event.days === 0) return baseDate;

    return event.direction === 'After' 
      ? addDays(baseDate, event.days) 
      : subDays(baseDate, event.days);
  };

  const getSortedEvents = () => {
    const sorted = [...events];
    if (sortBy === 'dueDate') {
      sorted.sort((a, b) => {
        const dateA = calculateDate(a);
        const dateB = calculateDate(b);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.getTime() - dateB.getTime();
      });
    } else if (sortBy === 'contingency') {
      sorted.sort((a, b) => (a.contingency || '').localeCompare(b.contingency || ''));
    }
    return sorted;
  };

  const handleAddEvent = () => {
    setEvents([
      ...events, 
      { id: Date.now().toString(), contingency: '', task: 'New Task', days: 0, direction: 'After', base: 'Acceptance' }
    ]);
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const moveEvent = (id: string, direction: 'up' | 'down') => {
    setSortBy('default'); // Switch to custom sort if moving manually
    const index = events.findIndex(e => e.id === id);
    if (index < 0) return;
    if (direction === 'up' && index > 0) {
      const newEvents = [...events];
      [newEvents[index - 1], newEvents[index]] = [newEvents[index], newEvents[index - 1]];
      setEvents(newEvents);
    } else if (direction === 'down' && index < events.length - 1) {
      const newEvents = [...events];
      [newEvents[index + 1], newEvents[index]] = [newEvents[index], newEvents[index + 1]];
      setEvents(newEvents);
    }
  };

  const updateEvent = (id: string, updates: Partial<TimelineEvent>) => {
    setEvents(events.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleSaveTemplate = () => {
    const templateName = window.prompt("Enter a name for this timeline format:", "My Custom Format");
    if (templateName) {
      try {
        const templatesStr = localStorage.getItem('timelineTemplates');
        const templates = templatesStr ? JSON.parse(templatesStr) : {};
        templates[templateName] = {
          events,
          acceptanceDate,
          closingDate,
          contractDate,
          salesPrice,
          propertyAddress,
          tenure,
          titleEscrow,
          escrowNumber,
          listingAgent,
          buyersAgent,
          sellerBuyerInfo,
          lenderInfo,
          financing,
          harpta,
          firpta,
          landCourt,
          otherInformation
        };
        localStorage.setItem('timelineTemplates', JSON.stringify(templates));
        alert('Timeline saved successfully!');
      } catch (err) {
        console.error('Error saving template:', err);
        alert('Failed to save timeline.');
      }
    }
  };

  const handleDeleteTemplate = () => {
    try {
      const templatesStr = localStorage.getItem('timelineTemplates');
      const templates = templatesStr ? JSON.parse(templatesStr) : {};
      const names = Object.keys(templates);
      
      if (names.length === 0) {
        alert("No saved timelines found.");
        return;
      }

      let promptText = "Enter the number of the timeline to DELETE:\n";
      names.forEach((name, i) => {
        promptText += `${i + 1}: ${name}\n`;
      });
      
      const selection = window.prompt(promptText);
      if (!selection) return;

      const index = parseInt(selection) - 1;
      if (!isNaN(index) && index >= 0 && index < names.length) {
        if (window.confirm(`Are you sure you want to PERMANENTLY DELETE "${names[index]}"?`)) {
          delete templates[names[index]];
          localStorage.setItem('timelineTemplates', JSON.stringify(templates));
          alert(`Timeline "${names[index]}" deleted.`);
        }
      } else {
        alert("Invalid selection.");
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      alert('Failed to delete timeline.');
    }
  };

  const handleLoadTemplate = () => {
    try {
      const templatesStr = localStorage.getItem('timelineTemplates');
      const templates = templatesStr ? JSON.parse(templatesStr) : {};
      const names = Object.keys(templates);
      
      if (names.length === 0) {
        alert("No saved timelines found. Save one first!");
        return;
      }

      let promptText = "Enter the number of the timeline to load:\n";
      names.forEach((name, i) => {
        promptText += `${i + 1}: ${name}\n`;
      });
      
      const selection = window.prompt(promptText);
      if (!selection) return;

      const index = parseInt(selection) - 1;
      if (!isNaN(index) && index >= 0 && index < names.length) {
        if (window.confirm(`Are you sure you want to load "${names[index]}"? This will replace your current data.`)) {
          const loadedData = templates[names[index]];
          if (Array.isArray(loadedData)) {
            // Backward compatibility for just events
            setEvents(loadedData);
          } else {
            setEvents(loadedData.events || INITIAL_EVENTS);
            setAcceptanceDate(loadedData.acceptanceDate || '');
            setClosingDate(loadedData.closingDate || '');
            setContractDate(loadedData.contractDate || '');
            setSalesPrice(loadedData.salesPrice || '');
            setPropertyAddress(loadedData.propertyAddress || '');
            setTenure(loadedData.tenure || '');
            setTitleEscrow(loadedData.titleEscrow || '');
            setEscrowNumber(loadedData.escrowNumber || '');
            setListingAgent(loadedData.listingAgent || '');
            setBuyersAgent(loadedData.buyersAgent || '');
            setSellerBuyerInfo(loadedData.sellerBuyerInfo || '');
            setLenderInfo(loadedData.lenderInfo || '');
            setFinancing(loadedData.financing || { 'Cash': false, 'Loan': false, '1031 Exchange': false });
            setHarpta(loadedData.harpta || false);
            setFirpta(loadedData.firpta || false);
            setLandCourt(loadedData.landCourt || false);
            setOtherInformation(loadedData.otherInformation || '');
          }
        }
      } else {
        alert("Invalid selection.");
      }
    } catch (err) {
      console.error('Error loading template:', err);
      alert('Failed to load timelines.');
    }
  };

  const handleExport = () => {
    const excelAcceptanceDate = acceptanceDate ? parseISO(acceptanceDate) : 'TBD';
    const excelClosingDate = closingDate ? parseISO(closingDate) : 'TBD';
    const excelContractDate = contractDate ? parseISO(contractDate) : 'TBD';

    const wsData = [
      ['Property Address', propertyAddress],
      ['Tenure', tenure],
      ['Title Company & Escrow Officer', titleEscrow],
      ['Escrow #', escrowNumber],
      ['Acceptance Date', excelAcceptanceDate],
      ['Closing Date', excelClosingDate],
      ['Contract Date', excelContractDate],
      ['Sales Price', salesPrice],
      ['Listing Agent', listingAgent],
      ['Buyer Agent', buyersAgent],
      ['Lender Info', lenderInfo],
      ['Seller/Buyer Info', sellerBuyerInfo],
      ['Financing', Object.entries(financing).filter(e => e[1]).map(e => e[0]).join(', ')],
      ['HARPTA', harpta ? 'Yes' : 'No'],
      ['FIRPTA', firpta ? 'Yes' : 'No'],
      ['Land Court', landCourt ? 'Yes' : 'No'],
      ['Other Information', otherInformation],
      [],
      ['Due Date', 'Contingency #', 'Party', 'Task', 'Done', 'Days', 'Direction', 'Base', 'Notes'],
      ...getSortedEvents().map((event, index) => {
        const rowNum = 16 + index;
        const calcDate = calculateDate(event);
        
        let dateCell: any = calcDate || 'TBD';
        if (event.direction !== 'Custom Date') {
          const formulaStr = `IF(H${rowNum}="Acceptance",IF($B$4="TBD","TBD",IF(G${rowNum}="After",$B$4+F${rowNum},$B$4-F${rowNum})),IF(H${rowNum}="Closing",IF($B$5="TBD","TBD",IF(G${rowNum}="After",$B$5+F${rowNum},$B$5-F${rowNum})),"TBD"))`;
          dateCell = { f: formulaStr, v: calcDate || 'TBD', z: 'mm/dd/yyyy' };
        }

        return [
          dateCell,
          event.contingency || '',
          event.party || '',
          event.task,
          event.completed ? 'Yes' : 'No',
          event.direction === 'Custom Date' ? 'N/A' : event.days,
          event.direction,
          event.direction === 'Custom Date' ? 'N/A' : event.base,
          event.notes || ''
        ];
      })
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(wsData, { cellDates: true });
    
    if (worksheet['B4'] && worksheet['B4'].t === 'd') worksheet['B4'].z = 'mm/dd/yyyy';
    if (worksheet['B5'] && worksheet['B5'].t === 'd') worksheet['B5'].z = 'mm/dd/yyyy';

    const colWidths = [15, 15, 15, 40, 10, 10, 10, 12, 20]; // Minimum widths
    wsData.forEach(row => {
      row.forEach((cell, i) => {
        const length = cell && (cell as any).v ? String((cell as any).v).length : (cell ? String(cell).length : 0);
        if (length > (colWidths[i] || 0)) {
          colWidths[i] = length;
        }
      });
    });
    worksheet['!cols'] = colWidths.map(w => ({ wch: Math.min(Math.max(w + 2, 10), 60) }));
    
    // Format to print on 8.5 x 11 paper (paperSize 1 is Letter), Landscape, fit to 1 page wide
    worksheet['!pageSetup'] = { paperSize: 1, orientation: 'landscape', fitToWidth: 1, fitToHeight: 0 };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timeline");
    XLSX.writeFile(workbook, "Purchase_Contract_Timeline.xlsx");
  };

  const handlePdfExport = async () => {
    const doc = new jsPDF('portrait');
    
    // Add Fidelity Logo
    const imgUrl = '/fidelity-logo.png';
    try {
      const response = await fetch(imgUrl);
      if (response.ok) {
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        doc.addImage(base64, 'PNG', 14, 10, 45, 9);
      }
    } catch (e) {
      console.error("Could not load logo", e);
    }

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("Purchase Contract Timeline", 196, 21, { align: 'right' });

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600
    
    const drawField = (label: string, value: string, x: number, y: number) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, x, y);
      const labelWidth = doc.getTextWidth(label + ' ');
      doc.setFont('helvetica', 'normal');
      doc.text(value, x + labelWidth, y);
    };

    drawField('Property Address:', propertyAddress, 14, 35);
    drawField('Tenure:', tenure, 14, 41);
    drawField('Title & Escrow:', titleEscrow, 14, 47);
    drawField('Escrow #:', escrowNumber, 14, 53);

    drawField('Acceptance Date:', acceptanceDate ? format(parseISO(acceptanceDate), 'MMM d, yyyy') : 'TBD', 85, 35);
    drawField('Closing Date:', closingDate ? format(parseISO(closingDate), 'MMM d, yyyy') : 'TBD', 85, 41);
    drawField('Contract Date:', contractDate ? format(parseISO(contractDate), 'MMM d, yyyy') : 'TBD', 85, 47);
    drawField('Sales Price:', salesPrice, 85, 53);

    drawField('Listing Agent:', listingAgent, 150, 35);
    drawField('Buyers Agent:', buyersAgent, 150, 41);
    drawField('Lender Info:', lenderInfo, 150, 47);
    drawField('Seller/Buyer Info:', sellerBuyerInfo, 150, 53);

    const financingStr = (Object.keys(financing) as FinancingType[]).filter(k => financing[k]).join(', ');
    drawField('Financing:', financingStr || 'None', 14, 59);
    drawField('Tax Withholdings:', [harpta ? 'HARPTA' : '', firpta ? 'FIRPTA' : ''].filter(Boolean).join(', ') || 'None', 85, 59);
    drawField('Recording:', landCourt ? 'Land Court' : 'Regular', 150, 59);

    let startY = 68;
    if (otherInformation) {
      drawField('Other Info:', otherInformation, 14, 65);
      startY = 74;
    }
    const tableData = getSortedEvents().map(event => {
      const calcDate = calculateDate(event);
      let dateStr = 'Needs base date';
      if (event.direction === 'Custom Date') {
        dateStr = event.manualDate && isValid(parseISO(event.manualDate)) 
          ? format(parseISO(event.manualDate), 'MMM d, yyyy') 
          : 'N/A';
      } else if (calcDate) {
        dateStr = format(calcDate, 'MMM d, yyyy');
      }
        
      return [
        event.completed ? 'Yes' : 'No',
        event.contingency || '',
        event.party || '',
        event.task,
        event.direction === 'Custom Date' ? 'N/A' : event.days.toString(),
        event.direction,
        event.direction === 'Custom Date' ? 'N/A' : event.base,
        dateStr,
        event.notes || ''
      ];
    });

    autoTable(doc, {
      startY,
      head: [['Done', 'Cont.', 'Party', 'Task', 'Days', 'Dir.', 'Base Date', 'Due Date', 'Notes']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] }, // slate-900
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        3: { cellWidth: 45 }, // Task
        8: { cellWidth: 30 }  // Notes
      },
      alternateRowStyles: { fillColor: [248, 250, 252] } // slate-50
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 280;
    
    // Add disclosure text
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139); // slate-500
    const disclosureText = "Disclosure: This timeline is based on the Hawai'i Association of REALTORS(R) Purchase Contract, Revision 2/25. Dates shown are calculated using information provided and standard contract timeframes. This timeline is provided as a general reference only and is not intended to replace the purchase contract, addenda, or legal advice. All dates, deadlines, and obligations should be independently verified against the fully executed contract and confirmed with the appropriate parties.";
    
    // Split text to fit width (14 to 196 = 182 width)
    const splitText = doc.splitTextToSize(disclosureText, 182);
    
    // If the text would run off the page, add a new page
    if (finalY + 10 + (splitText.length * 3) > doc.internal.pageSize.getHeight()) {
      doc.addPage();
      doc.text(splitText, 14, 20);
    } else {
      doc.text(splitText, 14, finalY + 10);
    }

    doc.save('Purchase_Contract_Timeline.pdf');
  };

  return (
    <div id="timeline-container" className="w-full max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b pb-4">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="h-12 object-contain" />
          <h1 className="text-3xl font-bold text-slate-900">Purchase Contract Timeline</h1>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleNewTimeline}
              className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              New Timeline
            </button>
            <button 
              onClick={handleSaveTemplate}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Save Timeline
            </button>
            <button 
              onClick={handleLoadTemplate}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Load Timeline
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handlePdfExport}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <FileText size={18} /> Convert to PDF
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Download size={18} /> Export Excel
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg mb-8 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Property & Escrow Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Property Address</label>
            <input
              type="text"
              value={propertyAddress}
              onChange={e => setPropertyAddress(e.target.value)}
              placeholder="123 Main St..."
              className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tenure</label>
            <select
              value={tenure}
              onChange={e => setTenure(e.target.value as '' | 'Fee Simple' | 'Leasehold')}
              className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Select...</option>
              <option value="Fee Simple">Fee Simple</option>
              <option value="Leasehold">Leasehold</option>
            </select>
          </div>          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title Company & Escrow Officer</label>
            <input 
              type="text" 
              value={titleEscrow} 
              onChange={e => setTitleEscrow(e.target.value)}
              placeholder="Title Co, Officer Name..."
              className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Escrow #</label>
            <input 
              type="text" 
              value={escrowNumber} 
              onChange={e => setEscrowNumber(e.target.value)}
              placeholder="12345678"
              className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Contract Dates</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Acceptance Date</label>
            <input
              type="date"
              value={acceptanceDate}
              onChange={e => setAcceptanceDate(e.target.value)}
              className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Closing Date</label>
            <input
              type="date"
              value={closingDate}
              onChange={e => setClosingDate(e.target.value)}
              className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contract Date</label>
            <input
              type="date"
              value={contractDate}
              onChange={e => setContractDate(e.target.value)}
              className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sales Price</label>
            <input
              type="text"
              value={salesPrice}
              onChange={e => setSalesPrice(e.target.value)}
              placeholder="$..."
              className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Parties & Info</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Listing Agent Info</label>
            <input 
              type="text" 
              value={listingAgent} 
              onChange={e => setListingAgent(e.target.value)}
              placeholder="Name, Brokerage, Contact..."
              className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Buyers Agent Info</label>
            <input 
              type="text" 
              value={buyersAgent} 
              onChange={e => setBuyersAgent(e.target.value)}
              placeholder="Name, Brokerage, Contact..."
              className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lender Info</label>
            <input
              type="text"
              value={lenderInfo}
              onChange={e => setLenderInfo(e.target.value)}
              placeholder="Name, Company, Contact..."
              className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Seller/Buyer Info</label>
            <input
              type="text"
              value={sellerBuyerInfo}
              onChange={e => setSellerBuyerInfo(e.target.value)}
              placeholder="Names, Contact Info..."
              className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            />
          </div>        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg mb-8 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Transaction Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-2">Financing Type</span>
            <div className="space-y-2">
              {(Object.keys(financing) as FinancingType[]).map(type => (
                <label key={type} className="flex items-center gap-2 text-sm text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={financing[type]} 
                    onChange={() => handleFinancingChange(type)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-2">Tax Withholdings</span>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input 
                  type="checkbox" 
                  checked={harpta} 
                  onChange={e => setHarpta(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                HARPTA
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input 
                  type="checkbox" 
                  checked={firpta} 
                  onChange={e => setFirpta(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                FIRPTA
              </label>
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700 mb-2">Recording</span>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input 
                  type="checkbox" 
                  checked={landCourt} 
                  onChange={e => setLandCourt(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Land Court
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Other Information</label>
          <textarea
            value={otherInformation}
            onChange={e => setOtherInformation(e.target.value)}
            placeholder="Any other important details..."
            className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[80px]"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Timeline Events</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setSortBy(prev => prev === 'contingency' ? 'default' : 'contingency')}
            className={`text-sm px-3 py-1.5 rounded-md transition-colors border ${sortBy === 'contingency' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
          >
            Sort by Contingency #
          </button>
          <button 
            onClick={() => setSortBy(prev => prev === 'dueDate' ? 'default' : 'dueDate')}
            className={`text-sm px-3 py-1.5 rounded-md transition-colors border ${sortBy === 'dueDate' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
          >
            Sort by Due Date
          </button>
          <button 
            onClick={handleDeleteTemplate}
            className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-md transition-colors border border-red-200 ml-2"
          >
            Delete Timeline
          </button>
          <button 
            onClick={handleAddEvent}
            className="flex items-center gap-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md transition-colors border border-blue-200 ml-2"
          >
            <Plus size={16} /> Add Event
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-sm">
              <th className="p-3 font-semibold w-12 text-center">Done</th>
              <th 
                className="p-3 font-semibold w-24 cursor-pointer hover:bg-slate-200 transition-colors group" 
                onClick={() => setSortBy(prev => prev === 'contingency' ? 'default' : 'contingency')}
              >
                <div className="flex items-center justify-between">
                  Contingency #
                  <span className="text-slate-400 group-hover:text-slate-600">
                    {sortBy === 'contingency' ? '↓' : '↕'}
                  </span>
                </div>
              </th>
              <th className="p-3 font-semibold w-24">Party</th>
              <th className="p-3 font-semibold min-w-[300px] w-96">Task</th>
              <th className="p-3 font-semibold w-20">Days</th>
              <th className="p-3 font-semibold w-28">Direction</th>
              <th className="p-3 font-semibold w-32">Base Date</th>
              <th 
                className="p-3 font-semibold w-32 cursor-pointer hover:bg-slate-200 transition-colors group"
                onClick={() => setSortBy(prev => prev === 'dueDate' ? 'default' : 'dueDate')}
              >
                <div className="flex items-center justify-between">
                  Due Date
                  <span className="text-slate-400 group-hover:text-slate-600">
                    {sortBy === 'dueDate' ? '↓' : '↕'}
                  </span>
                </div>
              </th>
              <th className="p-3 font-semibold w-48">Notes</th>
              <th className="p-3 font-semibold w-24 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedEvents().map((event) => {
              const calcDate = calculateDate(event);
              return (
                <tr key={event.id} className={`border-b border-slate-100 hover:bg-slate-50 group ${event.completed ? 'opacity-60 bg-slate-50/50' : ''}`}>
                  <td className="p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={!!event.completed}
                      onChange={e => updateEvent(event.id, { completed: e.target.checked })}
                      className="rounded border-slate-300 text-green-600 focus:ring-green-500 w-5 h-5 cursor-pointer"
                    />
                  </td>
                  <td className="p-2">
                    {event.id === 'k_staking_survey' ? (
                      <select
                        value={event.contingency}
                        onChange={e => {
                          const isK1 = e.target.value === 'K-1';
                          updateEvent(event.id, { 
                            contingency: isK1 ? 'K-1' : 'K-2', 
                            task: isK1 ? 'Staking' : 'Survey' 
                          });
                        }}
                        className={`w-full bg-transparent border-slate-200 rounded p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-0 ${event.completed ? 'line-through text-slate-500' : ''}`}
                      >
                        <option value="K-1">K-1</option>
                        <option value="K-2">K-2</option>
                      </select>
                    ) : event.id === 'j9_cleaning' ? (
                      <select
                        value={event.contingency}
                        onChange={e => {
                          const isJ9A = e.target.value === 'J-9(a)';
                          updateEvent(event.id, { 
                            contingency: isJ9A ? 'J-9(a)' : 'J-9(b)', 
                            task: isJ9A ? 'Cleaning before Closing' : 'Cleaning Credit' 
                          });
                        }}
                        className={`w-full bg-transparent border-slate-200 rounded p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-0 ${event.completed ? 'line-through text-slate-500' : ''}`}
                      >
                        <option value="J-9(a)">J-9(a)</option>
                        <option value="J-9(b)">J-9(b)</option>
                      </select>
                    ) : event.id === 'f3' ? (
                      <select
                        value={event.contingency}
                        onChange={e => {
                          const isF3A = e.target.value === 'F-3(a)';
                          updateEvent(event.id, { 
                            contingency: isF3A ? 'F-3(a)' : 'F-3(b)', 
                            task: isF3A ? 'Change to the Closing Date Unilateral Right to Extend' : 'Change to the Closing Date - Time is of the Essence' 
                          });
                        }}
                        className={`w-full bg-transparent border-slate-200 rounded p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-0 ${event.completed ? 'line-through text-slate-500' : ''}`}
                      >
                        <option value="F-3(a)">F-3(a)</option>
                        <option value="F-3(b)">F-3(b)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={event.contingency || ''}
                        onChange={e => updateEvent(event.id, { contingency: e.target.value })}
                        className={`w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 px-2 py-1 ${event.completed ? 'line-through text-slate-500' : ''}`}
                        placeholder="e.g. J-1"
                      />
                    )}
                  </td>                  <td className="p-2">
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
                      type="text"
                      value={event.task}
                      onChange={e => updateEvent(event.id, { task: e.target.value })}
                      className={`w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 px-2 py-1 text-xs ${event.completed ? 'line-through text-slate-500' : ''}`}
                      placeholder="Task description"
                    />
                  </td>                  <td className="p-2">
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
                    <select 
                      value={event.direction}
                      onChange={e => updateEvent(event.id, { direction: e.target.value as 'After' | 'Before' | 'Custom Date' })}
                      className="w-full border-slate-200 rounded p-1 text-xs shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="After">After</option>
                      <option value="Before">Before</option>
                      <option value="Custom Date">Custom</option>
                    </select>
                  </td>
                  <td className="p-2">
                    {event.direction !== 'Custom Date' && (
                      <>
                        <select 
                          value={event.base}
                          onChange={e => updateEvent(event.id, { base: e.target.value as 'Acceptance' | 'Closing' | 'Custom' })}
                          className="w-full border-slate-200 rounded p-1 text-xs shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-1"
                        >
                          <option value="Acceptance">Acceptance</option>
                          <option value="Closing">Closing</option>
                          <option value="Custom">Custom</option>
                        </select>
                        {event.base === 'Custom' && (
                          <input 
                            type="date" 
                            value={event.customDate || ''}
                            onChange={e => updateEvent(event.id, { customDate: e.target.value })}
                            className="w-full border-slate-200 rounded p-1 text-xs shadow-sm"
                          />
                        )}
                      </>
                    )}
                  </td>
                  <td className="p-2 text-sm font-medium">
                    {event.direction === 'Custom Date' ? (
                      <input 
                        type="date"
                        value={event.manualDate || ''}
                        onChange={e => updateEvent(event.id, { manualDate: e.target.value })}
                        className="w-full border-slate-200 rounded p-1 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : calcDate ? (
                      <span className="text-slate-800 bg-slate-100 px-2 py-1 rounded">
                        {format(calcDate, 'MMM d, yyyy')}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Needs base date</span>
                    )}
                  </td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={event.notes || ''}
                      onChange={e => updateEvent(event.id, { notes: e.target.value })}
                      className={`w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 px-2 py-1 ${event.completed ? 'line-through text-slate-500' : ''}`}
                      placeholder="Notes..."
                    />
                  </td>
                  <td className="p-2 text-center whitespace-nowrap">
                    <button 
                      onClick={() => moveEvent(event.id, 'up')}
                      className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                      title="Move Up"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button 
                      onClick={() => moveEvent(event.id, 'down')}
                      className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                      title="Move Down"
                    >
                      <ChevronDown size={18} />
                    </button>
                    <button 
                      onClick={() => handleRemoveEvent(event.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1 ml-1"
                      title="Delete Event"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {events.length === 0 && (
        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300 mt-4">
          No events in timeline. Click "Add Event" to get started.
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed text-center">
        <strong>Disclosure:</strong><br />
        This timeline is based on the Hawaiʻi Association of REALTORS® Purchase Contract, Revision 2/25. Dates shown are calculated using information provided and standard contract timeframes. This timeline is provided as a general reference only and is not intended to replace the purchase contract, addenda, or legal advice. All dates, deadlines, and obligations should be independently verified against the fully executed contract and confirmed with the appropriate parties.
      </div>
    </div>
  );
}
