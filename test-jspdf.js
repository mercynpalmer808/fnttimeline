import { jsPDF } from 'jspdf';
const doc = new jsPDF();
doc.setFontSize(8);
doc.setFont("helvetica", "bold");
console.log("Width:", doc.getTextWidth("Property Address: "));
