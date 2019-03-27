getBankNames = async () => {
  events = await window.KYCinstance.getPastEvents('BankAdded', { fromBlock: 0 });
  
  let nullOpt = document.createElement("option");
  nullOpt.setAttribute("value", "");
  nullOpt.innerHTML = "Select TO Bank";

  var options = [nullOpt];

  for (let i = 0; i < events.length; i++) {
    let values = events[i].returnValues;
    let opt = document.createElement("option");
    opt.setAttribute("value", values.bankAddress);
    opt.innerHTML = web3.utils.toAscii(values.name);
    options.push(opt);
  }
  return options;
}

eventLister  = (events) => {
  for (var i = 0; i < events.length; i++) {
    let values = events[i].returnValues;
    let fromAccount = document.createTextNode("From Account: " + web3.utils.toAscii(values.fromAccount));
    let toAccount = document.createTextNode("To Account: " + web3.utils.toAscii(values.toAccount));
    let amount = document.createTextNode("Amount: " + values.amount);
    //var time = document.createTextNode("Transaction Date: " + timeConverter(values.txDate / 1000));

    var elements = [fromAccount, toAccount, amount];

    const fraudEvents = document.getElementById("reportedFrauds");
    let divItem = document.createElement('div');
    divItem.setAttribute('class', "fraudEvent")

    for (var j = 0; j < elements.length; j++) {
      var listItem = document.createElement('ul');
      listItem.appendChild(elements[j]);
      divItem.appendChild(listItem);
    }
    fraudEvents.appendChild(divItem);

    button = document.createElement("button");
    button.setAttribute('class', "notify");
    button.innerHTML = "NOTIFY";
    
    divItem.appendChild(button);
  }
  
  const button = document.createElement("button");
  button.setAttribute('class', "notifyAll");
  button.innerHTML = "NOTIFY ALL";
  
  const fraudEvents = document.getElementById("reportedFrauds");
  fraudEvents.appendChild(button);
}

queryChainByDate = async () => {
  const fraudEvents = document.getElementById("reportedFrauds");
  fraudEvents.innerHTML = "";

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

  var fromEvents = await window.KYCinstance.getPastEvents('ReportedFraudA', { filter: {txDate: days, fromBank:ethereum.selectedAddress}, fromBlock: 0 });
  var toEvents = await window.KYCinstance.getPastEvents('ReportedFraudA', { filter: {txDate: days, toBank:ethereum.selectedAddress}, fromBlock: 0 });
  eventLister(fromEvents);
  eventLister(toEvents);
}

queryChainByTxID = async () => {
  var txId = getElementById("txID").value;
  var txEvent = await window.KYCinstance.getPastEvents('ReportedFraudB', { filter: {txId: txId}, fromBlock: 0 });
  if ((txEvent[0].returnValues.fromBank != ethereum.selectedAddress) 
  && (txEvent[0].returnValues.toBank != ethereum.selectedAddress)) return;

  eventLister(txEvent);
}

queryChainByToBank = async () => {
  const bank = document.getElementById("toBank").value;
  if (bank == "") return;
  
  const toBank = web3.utils.fromAscii(bank);
  var toEvents = await window.KYCinstance.getPastEvents('ReportedFraudA', { filter: {fromBank: ethereum.selectedAddress, toBank: toBank}, fromBlock: 0 });

  eventLister(toEvents);

}

renderPage = async () => {
  var banks = document.createElement("select");
  banks.setAttribute("id", "toBank");
  var options = await getBankNames();
  for (let j = 0; j < options.length; j++) {
    banks.appendChild(options[j]);
  }
  const qFields = document.getElementById("queryFields");
  const qButton = document.getElementById("toQueryButton");
  qFields.insertBefore(banks, qButton);
}

startWeb3 = async () => { 
  await initWeb3(); 
  renderPage();
};

startWeb3();