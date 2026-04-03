import { useState } from 'react';
import ExcelJS from 'exceljs';
import pkg from 'file-saver';
const { saveAs } = pkg;
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addDays, subDays, format, parseISO, isValid, isWeekend } from 'date-fns';

const addBusinessDays = (date: Date, days: number): Date => {
  let result = new Date(date);
  let remainingDays = days;
  while (remainingDays > 0) {
    result = addDays(result, 1);
    if (!isWeekend(result)) {
      remainingDays--;
    }
  }
  return result;
};

const subBusinessDays = (date: Date, days: number): Date => {
  let result = new Date(date);
  let remainingDays = days;
  while (remainingDays > 0) {
    result = subDays(result, 1);
    if (!isWeekend(result)) {
      remainingDays--;
    }
  }
  return result;
};
import { Plus, Trash2, Download, FileText, ChevronUp, ChevronDown, HelpCircle, X } from 'lucide-react';

type FinancingType = 'Cash' | 'Loan' | '1031 Exchange';

interface TimelineEvent {
  id: string;
  contingency?: string;
  task: string;
  days: number;
  isBusinessDays?: boolean;
  direction: 'After' | 'Before' | 'Custom Date';
  base: 'Acceptance' | 'Closing' | 'Custom';
  customDate?: string;
  manualDate?: string;
  completedDate?: string;
  notes?: string;
  na?: boolean;
}

const INITIAL_EVENTS: TimelineEvent[] = [
  { id: '1a', contingency: 'B-1', task: 'Initial Deposit', days: 3, direction: 'After', base: 'Acceptance' },
  { id: '1b', contingency: 'C-2', task: 'Additional Deposit', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'c3', contingency: 'C-3', task: 'Concessions', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'e3', contingency: 'E-3(a)', task: 'Inventory of Furnishings Attached', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'e3c', contingency: 'E-3(c)', task: 'Approval of Furnishings', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'e5a', contingency: 'E-5(a)', task: 'Inclusion of PV', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'e5b', contingency: 'E-5(b)', task: 'Inclusion of PV Docs, etc.', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'e5c', contingency: 'E-5(c)', task: 'Buyer approve PV Docs', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'f2', contingency: 'F-2', task: 'Scheduled Closing Date', days: 45, direction: 'After', base: 'Acceptance' },
  { id: 'f3', contingency: 'F-3(a)', task: 'Change to the Closing Date Unilateral Right to Extend', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'f7a', contingency: 'F-7(a)', task: "Buyer's Principal Residence", days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'g1', contingency: 'G-1', task: 'Prelim Report Delivered to Buyer', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'g2b', contingency: 'G-2(b)', task: 'Prelim Report Review & Approval', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'g2c', contingency: 'G-2(c)', task: 'Title Defect(s)', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'g3', contingency: 'G-3', task: 'Vesting & Tenancy', days: 14, direction: 'Before', base: 'Closing' },
  { id: 'h1', contingency: 'H-1(a)', task: 'Evidence of Cash funds Attached', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'h1b2', contingency: 'H-1(b) ii', task: 'Seller Elects to Cancel', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'h2', contingency: 'H-2', task: 'Cont. of Cash Funds (Type)', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'h2a', contingency: 'H-2(a)', task: 'Contingency of Obtaining Cash Funds', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'h4a', contingency: 'H-4(a)', task: 'Prequal letter Attached', days: 7, direction: 'After', base: 'Acceptance' },
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
  { id: 'm1e', contingency: 'M-1(e)', task: 'Documentation Approval by Buyer', days: 10, direction: 'After', base: 'Acceptance' },
  { id: 'm1f', contingency: 'M-1(f)', task: 'Return Condo/HOA Docs if terminating', days: 10, direction: 'After', base: 'Acceptance' },
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
  const [showInstructions, setShowInstructions] = useState(false);
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
  const [sellerInfo, setSellerInfo] = useState('');
  const [buyerInfo, setBuyerInfo] = useState('');
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
      setSellerInfo('');
      setBuyerInfo('');
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

    if (event.isBusinessDays) {
      return event.direction === 'After'
        ? addBusinessDays(baseDate, event.days)
        : subBusinessDays(baseDate, event.days);
    } else {
      return event.direction === 'After' 
        ? addDays(baseDate, event.days) 
        : subDays(baseDate, event.days);
    }
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
          sellerInfo,
          buyerInfo,
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
            setSellerInfo(loadedData.sellerInfo || '');
            setBuyerInfo(loadedData.buyerInfo || '');
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

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Timeline');

    // Format to print on 8.5 x 11 paper (Letter), Portrait, fit to 1 page wide
    worksheet.pageSetup.paperSize = 1 as any;
    worksheet.pageSetup.orientation = 'portrait';
    worksheet.pageSetup.fitToPage = true;
    worksheet.pageSetup.fitToWidth = 1;
    worksheet.pageSetup.fitToHeight = 0;
    worksheet.pageSetup.margins = {
      left: 0.2, right: 0.2,
      top: 0.25, bottom: 0.25,
      header: 0.2, footer: 0.2
    };

    // Columns adjusted for portrait layout
    worksheet.columns = [
      { width: 11 }, { width: 13 }, { width: 25 }, { width: 12 },
      { width: 6 }, { width: 9 }, { width: 10 }, { width: 10 }, { width: 15 }
    ];

    // Unlock columns to allow user to edit data when sheet is protected
    for (let i = 1; i <= 20; i++) {
      worksheet.getColumn(i).protection = { locked: false };
    }

    // Add empty rows for header spacing
    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    // Merge cells for the title to sit to the right of the logo
    worksheet.mergeCells('D1:H3');
    const titleCell = worksheet.getCell('D1');
    titleCell.value = 'Purchase Contract Timeline';
    titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FF1E3A8A' } };
    titleCell.alignment = { horizontal: 'right', vertical: 'middle' };

    try {
      const response = await fetch('/fidelity-logo.png');
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const imageId = workbook.addImage({
        buffer: arrayBuffer,
        extension: 'png',
      });
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 180, height: 40 }
      });
    } catch (e) {
      console.error("Could not load logo for Excel", e);
    }

    worksheet.addRow([]);

    let acceptanceCellRef = '$C$10';
    let closingCellRef = '$C$11';

    const addInfoRowTwoCols = (
      leftLabel: string, leftValue: any, leftIsDate: boolean,
      rightLabel: string | null, rightValue: any, rightIsDate: boolean
    ) => {
      const row = worksheet.addRow([]);
      
      row.getCell(1).value = leftLabel;
      worksheet.mergeCells(`A${row.number}:B${row.number}`);
      row.getCell(3).value = leftValue;
      worksheet.mergeCells(`C${row.number}:D${row.number}`);

      if (leftLabel === 'Acceptance Date') acceptanceCellRef = `$C$${row.number}`;
      if (leftLabel === 'Closing Date') closingCellRef = `$C$${row.number}`;
      
      const formatLabelCell = (col1: number, col2: number) => {
        const cell = row.getCell(col1);
        cell.font = { size: 10, bold: true, color: { argb: 'FF111827' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
        cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
        for (let c = col1; c <= col2; c++) {
          row.getCell(c).border = { top: { style: 'thin', color: { argb: 'FFE5E7EB' } }, bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }, left: { style: 'thin', color: { argb: 'FFE5E7EB' } }, right: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
        }
      };

      const formatValueCell = (col1: number, col2: number, isDate: boolean) => {
        const cell = row.getCell(col1);
        cell.font = { size: 10 };
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
        worksheet.mergeCells(`E${row.number}:F${row.number}`);
        row.getCell(7).value = rightValue;
        worksheet.mergeCells(`G${row.number}:H${row.number}`);

        if (rightLabel === 'Acceptance Date') acceptanceCellRef = `$G$${row.number}`;
        if (rightLabel === 'Closing Date') closingCellRef = `$G$${row.number}`;

        formatLabelCell(5, 6);
        formatValueCell(7, 8, rightIsDate);
      }
    };

    const excelAcceptanceDate = acceptanceDate ? new Date(parseISO(acceptanceDate).getTime() + parseISO(acceptanceDate).getTimezoneOffset() * 60000) : 'TBD';
    const excelClosingDate = closingDate ? new Date(parseISO(closingDate).getTime() + parseISO(closingDate).getTimezoneOffset() * 60000) : 'TBD';
    const excelContractDate = contractDate ? new Date(parseISO(contractDate).getTime() + parseISO(contractDate).getTimezoneOffset() * 60000) : 'TBD';

    addInfoRowTwoCols('Property Address', propertyAddress, false, 'Sales Price', salesPrice, false);
    addInfoRowTwoCols('Title Co & Escrow Officer', titleEscrow, false, 'Escrow #', escrowNumber, false);
    addInfoRowTwoCols('Listing Agent', listingAgent, false, 'Seller Info', sellerInfo, false);
    addInfoRowTwoCols('Buyers Agent', buyersAgent, false, 'Buyer Info', buyerInfo, false);
    addInfoRowTwoCols('Financing', Object.entries(financing).filter(e => e[1]).map(e => e[0]).join(', ') || 'None', false, 'Lender Info', lenderInfo, false);
    addInfoRowTwoCols('Tenure', tenure, false, 'Tax Withholding', [harpta ? 'HARPTA' : '', firpta ? 'FIRPTA' : ''].filter(Boolean).join(', ') || 'None', false);
    addInfoRowTwoCols('Recording', landCourt ? 'Land Court' : 'None', false, null, null, false);
    addInfoRowTwoCols('Acceptance Date', excelAcceptanceDate, true, 'Closing Date', excelClosingDate, true);
    addInfoRowTwoCols('Contract Date', excelContractDate, true, null, null, false);

    const otherInfoRow = worksheet.addRow([]);
    otherInfoRow.getCell(1).value = 'Other\nInformation';
    worksheet.mergeCells(`A${otherInfoRow.number}:B${otherInfoRow.number}`);
    otherInfoRow.getCell(3).value = otherInformation || '';
    worksheet.mergeCells(`C${otherInfoRow.number}:H${otherInfoRow.number}`);

    const otherLabelCell = otherInfoRow.getCell(1);
    otherLabelCell.font = { size: 10, bold: true, color: { argb: 'FF111827' } };
    otherLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    otherLabelCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    for (let c = 1; c <= 2; c++) {
      otherInfoRow.getCell(c).border = { top: { style: 'thin', color: { argb: 'FFE5E7EB' } }, bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }, left: { style: 'thin', color: { argb: 'FFE5E7EB' } }, right: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
    }

    const otherValueCell = otherInfoRow.getCell(3);
    otherValueCell.font = { size: 10 };
    otherValueCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
    for (let c = 3; c <= 8; c++) {
      otherInfoRow.getCell(c).border = { top: { style: 'thin', color: { argb: 'FFE5E7EB' } }, bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }, left: { style: 'thin', color: { argb: 'FFE5E7EB' } }, right: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
    }
    otherInfoRow.height = 40;

    worksheet.addRow([]);

    const headerRow = worksheet.addRow(['Due Date', 'Contingency #', 'Task', 'Date Completed', 'Days', 'Bus. Days', 'Direction', 'Base', 'Notes']);
    headerRow.eachCell(cell => {
      cell.font = { size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = { top: { style: 'thin', color: { argb: 'FFD1D5DB' } }, bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } }, left: { style: 'thin', color: { argb: 'FFD1D5DB' } }, right: { style: 'thin', color: { argb: 'FFD1D5DB' } } };
    });

    getSortedEvents().filter(e => !e.na).forEach((event, index) => {
      const calcDate = calculateDate(event);
      const rowNum = headerRow.number + 1 + index;
      
      let dateCellValue: any = calcDate ? new Date(calcDate.getTime() + calcDate.getTimezoneOffset() * 60000) : 'TBD';

      if (event.direction !== 'Custom Date' && event.days !== undefined) {
        let baseCell = '';
        if (event.base === 'Acceptance' && acceptanceCellRef) baseCell = acceptanceCellRef;
        else if (event.base === 'Closing' && closingCellRef) baseCell = closingCellRef;

        if (baseCell) {
          const daysCell = `E${rowNum}`;
          const busDaysCell = `F${rowNum}`;
          const dirCell = `G${rowNum}`;
          
          const formula = `IF(${busDaysCell}="Yes", WORKDAY(${baseCell}, IF(${dirCell}="After", ${daysCell}, -${daysCell})), IF(${dirCell}="After", ${baseCell} + ${daysCell}, ${baseCell} - ${daysCell}))`;
          
          dateCellValue = {
            formula: `IF(ISNUMBER(${baseCell}), ${formula}, "TBD")`,
            result: calcDate ? new Date(calcDate.getTime() + calcDate.getTimezoneOffset() * 60000) : undefined
          };
        }
      }

      const row = worksheet.addRow([
        dateCellValue,
        event.contingency || '',
        event.task,
        event.completedDate || '',
        event.direction === 'Custom Date' ? 'N/A' : event.days,
        event.direction === 'Custom Date' ? 'N/A' : (event.isBusinessDays ? 'Yes' : 'No'),
        event.direction,
        event.direction === 'Custom Date' ? 'N/A' : event.base,
        event.notes || ''
      ]);

      const isEven = index % 2 === 0;
      row.eachCell((cell, colNumber) => {
        cell.font = { size: 10 };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = { top: { style: 'thin', color: { argb: 'FFE5E7EB' } }, bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }, left: { style: 'thin', color: { argb: 'FFE5E7EB' } }, right: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF9FAFB' } };
        if (colNumber === 1 && calcDate) {
          cell.numFmt = 'mm/dd/yy';
        }
      });
    });

    worksheet.addRow([]);
    worksheet.addRow([]);
    const disclosureRow = worksheet.addRow([
      "Disclosure: This timeline is based on the Hawai'i Association of REALTORS(R) Purchase Contract, Revision 2/25. Dates shown are calculated using information provided and standard contract timeframes. This timeline is provided as a general reference only and is not intended to replace the purchase contract, addenda, or legal advice. All dates, deadlines, and obligations should be independently verified against the fully executed contract and confirmed with the appropriate parties."
    ]);
    worksheet.mergeCells(`A${disclosureRow.number}:H${disclosureRow.number}`);
    disclosureRow.getCell(1).font = { italic: true, size: 10, color: { argb: 'FF374151' } };
    disclosureRow.getCell(1).alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
    disclosureRow.height = 80;

    // --- SECOND TAB: DATE CALCULATOR ---
    const calcSheet = workbook.addWorksheet('Date Calculator');
    calcSheet.columns = [
      { width: 30 },
      { width: 25 }
    ];

    calcSheet.mergeCells('A1:B1');
    const calcHeader = calcSheet.getCell('A1');
    calcHeader.value = 'Date Calculator';
    calcHeader.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    calcHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    calcHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    calcSheet.getRow(1).height = 30;

    const labels = [
      { row: 3, text: 'Starting Date' },
      { row: 4, text: 'Number of Days' },
      { row: 5, text: 'Direction (Before/After)' },
      { row: 7, text: 'Due Date (Calendar Days)' },
      { row: 8, text: 'Due Date (Business Days)' }
    ];

    labels.forEach(({ row, text }) => {
      const cell = calcSheet.getCell(`A${row}`);
      cell.value = text;
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle' };
    });

    const startDateCell = calcSheet.getCell('B3');
    startDateCell.value = new Date();
    startDateCell.numFmt = 'mm/dd/yyyy';

    const daysCell = calcSheet.getCell('B4');
    daysCell.value = 10;

    const directionCell = calcSheet.getCell('B5');
    directionCell.value = 'After';
    directionCell.dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"Before,After"']
    };

    ['B3', 'B4', 'B5'].forEach(ref => {
      const cell = calcSheet.getCell(ref);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    const calResult = calcSheet.getCell('B7');
    calResult.value = { formula: 'IF(B5="Before", B3-B4, B3+B4)' };
    calResult.numFmt = 'mm/dd/yyyy';
    calResult.font = { bold: true, color: { argb: 'FF059669' } };
    calResult.alignment = { horizontal: 'center', vertical: 'middle' };

    const busResult = calcSheet.getCell('B8');
    busResult.value = { formula: 'IF(B5="Before", WORKDAY(B3, -B4), WORKDAY(B3, B4))' };
    busResult.numFmt = 'mm/dd/yyyy';
    busResult.font = { bold: true, color: { argb: 'FF059669' } };
    busResult.alignment = { horizontal: 'center', vertical: 'middle' };

    // Protect the sheet to lock objects (the logo) but allow other interactions
    await worksheet.protect(Math.random().toString(36).slice(-10), {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: true,
      formatColumns: true,
      formatRows: true,
      insertColumns: true,
      insertRows: true,
      insertHyperlinks: true,
      deleteColumns: true,
      deleteRows: true,
      sort: true,
      autoFilter: true,
      pivotTables: true,
      objects: false // protects objects from being edited/deleted
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, "Purchase_Contract_Timeline.xlsx");
  };

  const handlePdfExport = async () => {
    // Initialize jsPDF with encryption to restrict editing (locking the logo and content)
    const doc = new jsPDF({
      orientation: 'portrait',
      encryption: {
        userPermissions: ['print', 'copy']
      }
    });
    
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

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // slate-900 (darker)
    
    let currentY = 35;
    const lineHeight = 5;

    const financingStr = (Object.keys(financing) as FinancingType[]).filter(k => financing[k]).join(', ');
    const taxWithholdingStr = [harpta ? 'HARPTA' : '', firpta ? 'FIRPTA' : ''].filter(Boolean).join(', ') || 'None';
    const recordingStr = landCourt ? 'Land Court' : 'None';

    const contractDetailsFields = [
      [{ label: 'Property Address:', value: propertyAddress, x: 14, nextX: 105 }, { label: 'Sales Price:', value: salesPrice, x: 105, nextX: 196 }],
      [{ label: 'Title Co & Escrow Officer:', value: titleEscrow, x: 14, nextX: 105 }, { label: 'Escrow #:', value: escrowNumber, x: 105, nextX: 196 }],
      [{ label: 'Listing Agent:', value: listingAgent, x: 14, nextX: 105 }, { label: 'Seller Info:', value: sellerInfo, x: 105, nextX: 196 }],
      [{ label: 'Buyers Agent:', value: buyersAgent, x: 14, nextX: 105 }, { label: 'Buyer Info:', value: buyerInfo, x: 105, nextX: 196 }],
      [{ label: 'Financing:', value: financingStr || 'None', x: 14, nextX: 105 }, { label: 'Lender Info:', value: lenderInfo, x: 105, nextX: 196 }],
      [{ label: 'Tenure:', value: tenure, x: 14, nextX: 75 }, { label: 'Tax Withholding:', value: taxWithholdingStr, x: 75, nextX: 135 }, { label: 'Recording:', value: recordingStr, x: 135, nextX: 196 }],
      [{ label: 'Acceptance Date:', value: acceptanceDate ? format(parseISO(acceptanceDate), 'MM/dd/yy') : 'TBD', x: 14, nextX: 75 }, { label: 'Closing Date:', value: closingDate ? format(parseISO(closingDate), 'MM/dd/yy') : 'TBD', x: 75, nextX: 135 }, { label: 'Contract Date:', value: contractDate ? format(parseISO(contractDate), 'MM/dd/yy') : 'TBD', x: 135, nextX: 196 }]
    ];

    if (otherInformation) {
      contractDetailsFields.push([{ label: 'Other Info:', value: otherInformation, x: 14, nextX: 196 }]);
    }

    let totalHeight = 0;
    const rowFieldDataList = contractDetailsFields.map(fields => {
      let maxLines = 1;
      const fieldData = fields.map(field => {
        doc.setFont('helvetica', 'bold');
        const labelWidth = doc.getTextWidth(field.label + ' ');
        doc.setFont('helvetica', 'normal');
        
        let textValue = field.value || '';
        let lines: string[] | string = [textValue];
        
        if (field.nextX) {
          const maxWidth = field.nextX - field.x - labelWidth - 2; // 2mm padding
          if (maxWidth > 0) {
            lines = doc.splitTextToSize(textValue, maxWidth);
          }
        }
        
        if (Array.isArray(lines) && lines.length > maxLines) {
          maxLines = lines.length;
        } else if (!Array.isArray(lines) && 1 > maxLines) {
          maxLines = 1;
        }
        
        return { ...field, labelWidth, lines };
      });
      const rHeight = (maxLines * lineHeight) + 2;
      totalHeight += rHeight;
      return { fieldData, rHeight };
    });

    // Draw background for Contract Details (slate-50 with slate-200 border)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    // Centered width of 190 (from x=10 to x=200) to balance on 210mm page width
    doc.roundedRect(10, currentY - 5, 190, totalHeight + 4, 2, 2, 'FD');

    rowFieldDataList.forEach(({ fieldData, rHeight }) => {
      fieldData.forEach(field => {
        doc.setFont('helvetica', 'bold');
        doc.text(field.label, field.x, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(field.lines, field.x + field.labelWidth, currentY);
      });
      currentY += rHeight;
    });

    let startY = currentY + 3;
    const tableData = getSortedEvents().filter(e => !e.na).map(event => {
      const calcDate = calculateDate(event);
      let dateStr = '';
      if (event.direction === 'Custom Date') {
        dateStr = event.manualDate && isValid(parseISO(event.manualDate)) 
          ? format(parseISO(event.manualDate), 'MM/dd/yy') 
          : 'N/A';
      } else if (calcDate) {
        dateStr = format(calcDate, 'MM/dd/yy');
      }
        
      return [
        event.completedDate || '',
        event.contingency || '',
        event.task,
        event.direction === 'Custom Date' ? 'N/A' : event.days.toString(),
        event.direction === 'Custom Date' ? 'N/A' : (event.isBusinessDays ? 'Yes' : 'No'),
        dateStr,
        event.notes || ''
      ];
    });

    autoTable(doc, {
      startY,
      head: [['Date Completed', 'Cont.', 'Task', 'Days', 'Bus.', 'Due Date', 'Notes']],
      body: tableData,
      theme: 'striped',
      headStyles: { halign: 'center', fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 10 }, // slate-900, larger header, white text
      styles: { halign: 'center', fontSize: 9, cellPadding: 1.5, textColor: [15, 23, 42] }, // larger, darker body text (slate-900)
      columnStyles: {
        2: { cellWidth: 50 }, // Task
        6: { cellWidth: 35 }  // Notes
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full md:w-auto ml-auto shrink-0">
          <button 
            onClick={handleNewTimeline}
            className="flex justify-center items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full whitespace-nowrap"
          >
            New Timeline
          </button>
          <button 
            onClick={handleSaveTemplate}
            className="flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full whitespace-nowrap"
          >
            Save Timeline
          </button>
          <button 
            onClick={handleLoadTemplate}
            className="flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full whitespace-nowrap"
          >
            Load Timeline
          </button>
          <button 
            onClick={() => setShowInstructions(true)}
            className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full whitespace-nowrap"
          >
            <HelpCircle size={18} /> INSTRUCTIONS
          </button>
          <button 
            onClick={handlePdfExport}
            className="flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full whitespace-nowrap"
          >
            <FileText size={18} /> Convert to PDF
          </button>
          <button 
            onClick={handleExport}
            className="flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full whitespace-nowrap"
          >
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg mb-8 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Contract Details</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Property Address</label>
              <input type="text" value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} placeholder="123 Main St..." className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sales Price</label>
              <input type="text" value={salesPrice} onChange={e => setSalesPrice(e.target.value)} placeholder="$..." className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title Company & Escrow Officer</label>
              <input type="text" value={titleEscrow} onChange={e => setTitleEscrow(e.target.value)} placeholder="Title Co, Officer Name..." className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Escrow #</label>
              <input type="text" value={escrowNumber} onChange={e => setEscrowNumber(e.target.value)} placeholder="12345678" className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Listing Agent</label>
              <input type="text" value={listingAgent} onChange={e => setListingAgent(e.target.value)} placeholder="Name, Brokerage, Contact..." className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Seller Info</label>
              <input type="text" value={sellerInfo} onChange={e => setSellerInfo(e.target.value)} placeholder="Names, Contact Info..." className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Buyers Agent</label>
              <input type="text" value={buyersAgent} onChange={e => setBuyersAgent(e.target.value)} placeholder="Name, Brokerage, Contact..." className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Buyer Info</label>
              <input type="text" value={buyerInfo} onChange={e => setBuyerInfo(e.target.value)} placeholder="Names, Contact Info..." className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="block text-sm font-medium text-slate-700 mb-2">Financing Type</span>
              <div className="flex flex-wrap gap-4">
                {(Object.keys(financing) as FinancingType[]).map(type => (
                  <label key={type} className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={financing[type]} onChange={() => handleFinancingChange(type)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lender Info</label>
              <input type="text" value={lenderInfo} onChange={e => setLenderInfo(e.target.value)} placeholder="Name, Company, Contact..." className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tenure</label>
              <select value={tenure} onChange={e => setTenure(e.target.value as "" | "Fee Simple" | "Leasehold")} className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="">Select...</option>
                <option value="Fee Simple">Fee Simple</option>
                <option value="Leasehold">Leasehold</option>
              </select>
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-700 mb-2">Tax Withholdings</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={harpta} onChange={e => setHarpta(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> HARPTA
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={firpta} onChange={e => setFirpta(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> FIRPTA
                </label>
              </div>
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-700 mb-2">Recording</span>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={landCourt} onChange={e => setLandCourt(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> Land Court
              </label>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <h3 className="text-md font-semibold text-slate-800 mb-4">Contract Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acceptance Date</label>
                <input
                  type="date"
                  value={acceptanceDate}
                  onChange={e => setAcceptanceDate(e.target.value)}
                  className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Closing Date</label>
                <input
                  type="date"
                  value={closingDate}
                  onChange={e => setClosingDate(e.target.value)}
                  className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contract Date</label>
                <input
                  type="date"
                  value={contractDate}
                  onChange={e => setContractDate(e.target.value)}
                  className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Other Information</label>
            <textarea value={otherInformation} onChange={e => setOtherInformation(e.target.value)} placeholder="Any other important details..." className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[80px]" />
          </div>
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
              <th className="p-3 font-semibold w-24 text-center">Date Completed</th>
              <th className="p-3 font-semibold w-16 text-center">N/A</th>
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
              <th className="p-3 font-semibold min-w-[300px] w-96">Task</th>
              <th className="p-3 font-semibold w-20">Days</th>
              <th className="p-3 font-semibold w-24 text-center">Bus. Days</th>
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
                <tr key={event.id} className={`border-b border-slate-100 hover:bg-slate-50 group ${event.completedDate ? 'opacity-60 bg-slate-50/50' : ''}`}>
                  <td className="p-2 text-center">
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
                        className={`w-full bg-transparent border-slate-200 rounded p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-0 ${event.completedDate ? 'line-through text-slate-500' : ''}`}
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
                        className={`w-full bg-transparent border-slate-200 rounded p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-0 ${event.completedDate ? 'line-through text-slate-500' : ''}`}
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
                        className={`w-full bg-transparent border-slate-200 rounded p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-0 ${event.completedDate ? 'line-through text-slate-500' : ''}`}
                      >
                        <option value="F-3(a)">F-3(a)</option>
                        <option value="F-3(b)">F-3(b)</option>
                      </select>
                    ) : event.id === 'f7a' ? (
                      <select
                        value={event.contingency}
                        onChange={e => {
                          const isF7A = e.target.value === 'F-7(a)';
                          updateEvent(event.id, { 
                            contingency: isF7A ? 'F-7(a)' : 'F-7(b)', 
                            task: isF7A ? "Buyer's Principal Residence" : "NOT Buyer's Principal Residence" 
                          });
                        }}
                        className={`w-full bg-transparent border-slate-200 rounded p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-0 ${event.completedDate ? 'line-through text-slate-500' : ''}`}
                      >
                        <option value="F-7(a)">F-7(a)</option>
                        <option value="F-7(b)">F-7(b)</option>
                      </select>
                    ) : event.id === 'e3' ? (
                      <select
                        value={event.contingency}
                        onChange={e => {
                          const isE3A = e.target.value === 'E-3(a)';
                          updateEvent(event.id, {
                            contingency: isE3A ? 'E-3(a)' : 'E-3(b)',
                            task: isE3A ? 'Inventory of Furnishings Attached' : 'Inventory of Furnishings to be provided by'
                          });
                        }}
                        className={`w-full bg-transparent border-slate-200 rounded p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-0 ${event.completedDate ? 'line-through text-slate-500' : ''}`}
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
                        className={`w-full bg-transparent border-slate-200 rounded p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-0 ${event.completedDate ? 'line-through text-slate-500' : ''}`}
                      >
                        <option value="H-1(a)">H-1(a)</option>
                        <option value="H-1(b)">H-1(b)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={event.contingency || ''}
                        onChange={e => updateEvent(event.id, { contingency: e.target.value })}
                        className={`w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 px-2 py-1 ${event.completedDate ? 'line-through text-slate-500' : ''}`}
                        placeholder="e.g. J-1"
                      />
                    )}
                  </td>
                  <td className="p-2">
                    {event.id === 'h4a' ? (
                      <select
                        value={event.task}
                        onChange={e => {
                          updateEvent(event.id, {
                            task: e.target.value
                          });
                        }}
                        className={`w-full bg-transparent border-slate-200 rounded p-1 text-xs shadow-sm focus:border-blue-500 focus:ring-0 ${event.completedDate ? 'line-through text-slate-500' : ''}`}
                      >
                        <option value="Prequal letter Attached">Prequal letter Attached</option>
                        <option value="Prequal letter to be provided by">Prequal letter to be provided by</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={event.task}
                        onChange={e => updateEvent(event.id, { task: e.target.value })}
                        className={`w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 px-2 py-1 text-xs ${event.completedDate ? 'line-through text-slate-500' : ''}`}
                        placeholder="Task description"
                      />
                    )}
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
                        {format(calcDate, 'MM/dd/yy')}
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
                      className={`w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 px-2 py-1 ${event.completedDate ? 'line-through text-slate-500' : ''}`}
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

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <HelpCircle className="text-blue-600" />
                How to Use the Timeline Creator
              </h2>
              <button 
                onClick={() => setShowInstructions(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-left">
              <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">1. Entering Contract Details</h3>
                <p className="mb-2">Fill in the property and transaction details in the top section. This information will appear in the header of your exported documents.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Contract Dates:</strong> Be sure to fill in the <em>Acceptance Date</em>, <em>Closing Date</em>, and <em>Contract Date</em>. The Acceptance and Closing dates are essential as they serve as the base dates to calculate the timeline deadlines.</li>
                  <li><strong>Financing & Other Options:</strong> Select your financing type, tenure, tax withholdings (HARPTA/FIRPTA), and whether it is a Land Court property.</li>
                </ul>
              </section>
              
              <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">2. Managing Timeline Events</h3>
                <p className="mb-2">The table below the details contains all timeline contingencies based on the standard purchase contract.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Date Completed:</strong> Enter a date once a contingency has been fulfilled to strike it out and mark it as done.</li>
                  <li><strong>N/A:</strong> Check this box if a contingency doesn't apply to your transaction.</li>
                  <li><strong>Modifying Rows:</strong> You can edit the <em>Task</em> description, the number of <em>Days</em>, and the <em>Direction</em> (After/Before). Some contingencies offer dropdown choices.</li>
                  <li><strong>Sorting:</strong> Click the "Sort by Contingency #" or "Sort by Due Date" buttons to reorder your timeline automatically.</li>
                  <li><strong>Adding / Deleting:</strong> Use the "Add Event" button to add custom contingencies, or click the trash can icon to remove an event. You can also reorder manually using the up/down arrows.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">3. Saving and Loading</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Save Timeline:</strong> Save your current progress as a template to your browser's local storage.</li>
                  <li><strong>Load Timeline:</strong> Reload a previously saved template.</li>
                  <li><strong>New Timeline:</strong> Reset the form back to the default contract contingencies.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">4. Exporting via PDF or Excel</h3>
                <p className="mb-2">Once your timeline is complete, you can download it to share with clients or keep for your records:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Convert to PDF:</strong> Click the red <span className="inline-flex items-center gap-1 font-semibold text-red-600 px-1"><FileText size={16} /> Convert to PDF</span> button. This generates a clean, formatted PDF document containing the contract details and the timeline table, ready for printing.</li>
                  <li><strong>Export Excel:</strong> Click the green <span className="inline-flex items-center gap-1 font-semibold text-green-600 px-1"><Download size={16} /> Export Excel</span> button. This downloads an `.xlsx` spreadsheet with styled cells, which you can further edit in Microsoft Excel or Google Sheets.</li>
                </ul>
              </section>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setShowInstructions(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
