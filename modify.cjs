const fs = require('fs');
const content = fs.readFileSync('src/components/TimelineCreator.tsx', 'utf8');

const startTag = '<div className="bg-slate-50 p-4 rounded-lg mb-8 border border-slate-200">';
const endTag = '<div className="mb-4 flex flex-wrap justify-between items-center gap-4">';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find start or end index.");
  process.exit(1);
}

const replacement = `<div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Contract Dates</h2>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Other Information</label>
            <textarea value={otherInformation} onChange={e => setOtherInformation(e.target.value)} placeholder="Any other important details..." className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[80px]" />
          </div>
        </div>
      </div>

      `;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('src/components/TimelineCreator.tsx', newContent);
console.log("Successfully replaced UI section.");