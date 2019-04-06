getBankNames = async () => {
  events = await window.KYCinstance.getPastEvents('BankAdded', { fromBlock: 0 });
  
  let nullOpt = document.createElement("option");
  nullOpt.setAttribute("value", "");
  nullOpt.innerHTML = "Select Bank";

  const options = [nullOpt];

  for (let i = 0; i < events.length; i++) {
    let values = events[i].returnValues;
    let opt = document.createElement("option");
    opt.setAttribute("value", values.bankAddress);
    opt.innerHTML = web3.utils.toAscii(values.name);
    options.push(opt);
  }
  return options;
}

eventLister  = async (events) => {
  const tBody = document.getElementsByTagName("tbody")[0];
  tBody.innerHTML = "";

  for (let i = 0; i < events.length; i++) {
    const values = events[i].returnValues;

    const fromB = await window.KYCinstance.methods.banks(values.fromBank).call({from: ethereum.selectedAddress, gas:3000000}); 
    const toB = await window.KYCinstance.methods.banks(values.toBank).call({from: ethereum.selectedAddress, gas:3000000}); 
    const fromBank = web3.utils.toAscii(fromB.name);
    const fromAccount = web3.utils.toAscii(values.fromAccount);
    const toBank = web3.utils.toAscii(toB.name);
    const toAccount = web3.utils.toAscii(values.toAccount);
    const amount = `$${values.amount}`;
    const time = timeConverter(values.txDate / 1000);
    const txId = web3.utils.toAscii(values.txId);

    if (txIds.has(txId)) return;
    txIds.add(txId);

    const elements = [time, txId, fromBank, fromAccount, toBank, toAccount, amount]

    const row = document.createElement("tr");

    for (let i = 0; i < elements.length; i++) {
      const td = document.createElement("td");
      td.innerHTML =  elements[i];
      row.appendChild(td);
    }

    tBody.appendChild(row);
  }
}

const txIds = new Set(); 

queryChainByDate = async () => {
  const fromDate = new Date(document.getElementById("fromDate").value);
  const toDate = new Date(document.getElementById("toDate").value);

  fromDate.setDate(fromDate.getDate() + 1);
  toDate.setDate(toDate.getDate() + 1);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return;
  if (toDate < fromDate) return;

  const oneDay = 86400000;
  const numDays = ((toDate - fromDate) / oneDay) + 1;
  const days = [];  
  const date = fromDate.getTime();

  for (let i = 0; i < numDays; i++) { days.push(date + (oneDay * i)); }

  txIds.clear();

  const fromEvents = await window.KYCinstance.getPastEvents('ReportedFraudA', { filter: {txDate: days, fromBank:ethereum.selectedAddress}, fromBlock: 0 });
  const toEvents = await window.KYCinstance.getPastEvents('ReportedFraudA', { filter: {txDate: days, toBank:ethereum.selectedAddress}, fromBlock: 0 });

  eventLister(fromEvents);
  eventLister(toEvents);
}

queryChainByTxId = async () => {
  const txId = web3.utils.fromAscii(document.getElementById("txId").value);
  const txEvent = await window.KYCinstance.getPastEvents('ReportedFraudB', { filter: {txId: txId}, fromBlock: 0 });
  if (!txEvent[0]) return ;
  if ((txEvent[0].returnValues.fromBank.toLowerCase() != ethereum.selectedAddress) 
  && (txEvent[0].returnValues.toBank.toLowerCase() != ethereum.selectedAddress)) return;

  txIds.clear();

  eventLister(txEvent);
}

queryChainByToBank = async () => {
  const toBank = document.getElementById("bank-selector").value;
  if (toBank == "") return;

  
  const toEvents = await window.KYCinstance.getPastEvents('ReportedFraudA', { filter: {fromBank: ethereum.selectedAddress, toBank: toBank}, fromBlock: 0 });

  txIds.clear();
  eventLister(toEvents);

}

renderPage = async () => {
  const banks = document.getElementById("bank-selector");
  const options = await getBankNames();
  for (let j = 0; j < options.length; j++) {
    banks.appendChild(options[j]);
  }
}

startWeb3 = async () => { 
  await initWeb3(); 
  await setBank();
  renderPage();
};

startWeb3();