eventLister  = (events) => {
  for (var i = 0; i < events.length; i++) {
    values = events[i].returnValues;
    var fromAccount = document.createTextNode("From Account: " + web3.utils.toAscii(values.fromAccount));
    var toAccount = document.createTextNode("To Account: " + web3.utils.toAscii(values.toAccount));
    var amount = document.createTextNode("Amount: " + values.amount);

    var elements = [fromAccount, toAccount, amount];

    fraudEvents = document.getElementById("reportedFrauds");
    var divItem = document.createElement('div');
    divItem.setAttribute('class', "fraudEvent")

    for (var j = 0; j < elements.length; j++) {
      var listItem = document.createElement('ul');
      listItem.appendChild(elements[j]);
      divItem.appendChild(listItem);
    }
    fraudEvents.appendChild(divItem);
  }
}

queryChain = async () => {
  fraudEvents = document.getElementById("reportedFrauds");
  fraudEvents.innerHTML = "";

  fromDate = new Date(document.getElementById("fromDate").value);
  toDate = new Date(document.getElementById("toDate").value);
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return;
  if (toDate < fromDate) return;
  oneDay = 86400000;
  numDays = ((toDate - fromDate) / oneDay) + 1;
  days = [];
  date = fromDate.getTime();

  for (var i = 0; i < numDays; i++) { days.push(date + (oneDay * i)); }

  fromEvents = await window.KYCinstance.getPastEvents('ReportedFraudA', { filter: {txDate: days, fromBank:ethereum.selectedAddress}, fromBlock: 0 });
  toEvents = await window.KYCinstance.getPastEvents('ReportedFraudA', { filter: {txDate: days, toBank:ethereum.selectedAddress}, fromBlock: 0 });
  eventLister(fromEvents);
  eventLister(toEvents);

  button = document.createElement("button");
  button.setAttribute('class', "notifyAll");
  button.innerHTML = "NOTIFY ALL";
  
  fraudEvents = document.getElementById("reportedFrauds");
  fraudEvents.appendChild(button);
}

startWeb3 = async () => { await initWeb3(); };

startWeb3();