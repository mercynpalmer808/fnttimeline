const INITIAL_EVENTS = [
  { id: '1a', contingency: 'B-1', task: 'Initial Deposit', days: 3, direction: 'After', base: 'Acceptance' },
  { id: '1b', contingency: 'C-2', task: 'Additional Deposit', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'c3', contingency: 'C-3', task: 'Concessions', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'c4', contingency: 'C-4', task: "Seller's Compensation to Buyer's Brokerage Firm", days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'e3', contingency: 'E-3', task: 'Inclusions of Furnishings', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'e5a', contingency: 'E-5(a)', task: 'Inclusion of PV', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'e5b', contingency: 'E-5(b)', task: 'Inclusion of PV Docs, etc.', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'e5c', contingency: 'E-5(c)', task: 'Inclusion of PV Documents to rescind and terminate Purchase Contract', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'f3', contingency: 'F-3', task: 'Change to Closing Date to choose (A) Unilateral Right to Extend or (B) Time is of the Essence', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'f7', contingency: 'F-7', task: 'Conveyance Tax', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'f7a', contingency: 'F-7(a)', task: 'Conveyance Tax Declaration', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'g2b', contingency: 'G-2(b)', task: "Buyer's Review of Prelim Report", days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'g2c', contingency: 'G-2(c)', task: 'Title Defect(s)', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'g3', contingency: 'G-3', task: 'Vesting & Tenancy', days: 14, direction: 'Before', base: 'Closing' },
  { id: 'h1', contingency: 'H-1', task: 'No Cont. on Cash Funds', days: 14, direction: 'After', base: 'Acceptance' },
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
  { id: 'j9a', contingency: 'J-9(a)', task: 'Cleaning before Closing', days: 5, direction: 'Before', base: 'Closing' },
  { id: 'j9b', contingency: 'J-9(b)', task: 'Cleaning Credit', days: 5, direction: 'Before', base: 'Closing' },
  { id: 'j10', contingency: 'J-10', task: 'Animal Related Treatment', days: 5, direction: 'Before', base: 'Closing' },
  { id: 'k1', contingency: 'K-1', task: 'Staking', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'k2', contingency: 'K-2', task: 'Survey', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'k3a', contingency: 'K-3(a)', task: 'Boundary Encroachment(terminate)', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'k3b', contingency: 'K-3(b)', task: 'Boundary Encroachment(Remedied)', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'l2a', contingency: 'L-2(a)', task: 'Select Termite Company', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'l2b', contingency: 'L-2(b)', task: 'Termite Report Delivery', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'l2c', contingency: 'L-2(c)', task: 'Termite Report Cost/Seller or Buyer to Pay', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'm1d_1', contingency: 'M-1(d)', task: 'Condo/HOA Docs to Buyer', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'm1d_2', contingency: 'M-1(d)', task: 'Buyer Receipt of Condo/HOA Docs', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'm1e', contingency: 'M-1(e)', task: 'Buyer Review Docs', days: 14, direction: 'After', base: 'Acceptance' },
  { id: 'm1f', contingency: 'M-1(f)', task: 'Return Condo/HOA Docs if terminating', days: 14, direction: 'After', base: 'Acceptance' },
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

const fs = require('fs');
const content = fs.readFileSync('src/components/TimelineCreator.tsx', 'utf-8');

const regex = /const INITIAL_EVENTS: TimelineEvent\[\] = \[([\s\S]*?)\];/;
const replacement = `const INITIAL_EVENTS: TimelineEvent[] = [\n${INITIAL_EVENTS.map(e => `  { id: '${e.id}', contingency: '${e.contingency}', task: '${e.task.replace(/'/g, "\\'")}', days: ${e.days}, direction: '${e.direction}', base: '${e.base}' },`).join('\n')}\n];`;

const newContent = content.replace(regex, replacement);
fs.writeFileSync('src/components/TimelineCreator.tsx', newContent);
console.log('Done replacing');
