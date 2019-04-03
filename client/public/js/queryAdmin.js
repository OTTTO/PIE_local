eventLister  = async (events) => {
  const tBody = document.getElementsByTagName("tbody")[0];
  tBody.innerHTML = "";

  for (var i = 0; i < events.length; i++) {
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

    const elements = [time, txId, fromBank, fromAccount, toBank, toAccount, amount]

    const row = document.createElement("tr");

    for (let i = 0; i < elements.length; i++) {
      const td = document.createElement("td");
      td.innerHTML =  elements[i];
      row.appendChild(td);
    }

    const button = document.createElement("button");
    button.setAttribute("class", "btn btn-notifyme");
    button.innerHTML = "Notify Me"

    const td = document.createElement("td");
    td.appendChild(button);
    row.appendChild(td);

    tBody.appendChild(row);
  }

}

queryChainByDate = async () => {
  var fromDate = new Date(document.getElementById("fromDate").value);
  var toDate = new Date(document.getElementById("toDate").value);

  fromDate.setDate(fromDate.getDate() + 1);
  toDate.setDate(toDate.getDate() + 1);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return;
  if (toDate < fromDate) return;

  const oneDay = 86400000;
  const numDays = ((toDate - fromDate) / oneDay) + 1;
  var days = [];  
  var date = fromDate.getTime();

  for (var i = 0; i < numDays; i++) { days.push(date + (oneDay * i)); }

  var events = await window.KYCinstance.getPastEvents('ReportedFraudA', { filter: {txDate: days}, fromBlock: 0 });

  eventLister(events);
}

queryChainByTxId = async () => {
  var txId = web3.utils.fromAscii(document.getElementById("txId").value);
  var txEvent = await window.KYCinstance.getPastEvents('ReportedFraudB', { filter: {txId: txId}, fromBlock: 0 });

  eventLister(txEvent);
}

startWeb3 = async () => { await initWeb3(); };

startWeb3();