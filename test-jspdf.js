const { jsPDF } = require('jspdf');
const doc = new jsPDF();
if (typeof doc.setEncryption === 'function') {
  console.log('jsPDF has setEncryption');
} else {
  console.log('jsPDF does NOT have setEncryption');
}