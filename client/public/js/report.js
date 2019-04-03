getBankNames = async () => {
  events = await window.KYCinstance.getPastEvents('BankAdded', { fromBlock: 0 });
  var options = [];
  for (let i = 0; i < events.length; i++) {
    let values = events[i].returnValues;
    let opt = document.createElement("option");
    opt.setAttribute("value", values.bankAddress);
    opt.innerHTML = web3.utils.toAscii(values.name);
    options.push(opt);
  }
  return options;
}

renderPage = async () => {
  const form = document.getElementById("client-form");
  for (var i = 0; i < 5; i++) {
    var fieldset = document.createElement("fieldset");
    var fromAccount = document.createElement("input");
    fromAccount.setAttribute("placeholder", "FROM Account");
    var toAccount = document.createElement("input");
    toAccount.setAttribute("placeholder", "TO Account"); 
    var linebreak1 = document.createElement("br");
    var linebreak2 = document.createElement("br");
    var bank = document.createElement("select");
    bank.setAttribute("id", "toBank");
    var options = await getBankNames();
    for (let j = 0; j < options.length; j++) {
      bank.appendChild(options[j]);
    }
    var amount = document.createElement("input");
    amount.setAttribute("placeholder", "Amount");
    amount.setAttribute("type", "number");
    var txDate = document.createElement("input");
    txDate.setAttribute("id", "txDate");
    txDate.setAttribute("placeholder", "Transaction Time");
    txDate.setAttribute("onfocus", "(this.type='datetime-local')");
    txDate.setAttribute("onblur", "(this.type='')" );
    var txId = document.createElement("input");
    txId.setAttribute("placeholder", "Transaction ID");
    fieldset.appendChild(fromAccount);
    fieldset.appendChild(toAccount);
    fieldset.appendChild(linebreak1);
    fieldset.appendChild(bank);  
    fieldset.appendChild(amount);
    fieldset.appendChild(linebreak2);
    fieldset.appendChild(txDate);
    fieldset.appendChild(txId);
    form.appendChild(fieldset);
  }

  var fieldset = document.createElement("fieldset");
  var button = document.createElement("button");
  button.setAttribute("type", "button");
  button.setAttribute("onClick", "reportFraud()");
  button.innerHTML = "Publish to Blockchain";
  fieldset.appendChild(button);
  form.appendChild(fieldset);
}

reportFraud = async () => {
  if (window.KYCinstance) {
    for (var i = 0; i < 5; i++) {
      var fieldset = document.getElementsByTagName("fieldset")[i];
      var params = [];
      for (var j = 0; j < 5; j++) {
        params.push(fieldset.getElementsByTagName("input")[j].value);
      }
      bank = document.getElementById("toBank");
      toBank = bank.options[bank.selectedIndex].value;
      fromAccount = web3.utils.fromAscii(params[0])
      toAccount = web3.utils.fromAscii(params[1])
      if (params[0] == "") continue;
      
      const earliestDate = new Date(1965, 0, 0);
      const latestDate = new Date();
      var txDate = new Date(params[3]);
      const hours = (24 - (txDate.getTimezoneOffset() / 60)) % 24;
      txDate.setHours(hours,0,0,0);
      const timestamp = new Date(params[3]);

      if (timestamp < earliestDate || timestamp > latestDate) {
        alert("invalid date");
        return;
      }

      window.KYCinstance.methods.reportFraud(ethereum.selectedAddress, toBank, fromAccount, toAccount, params[2], txDate.getTime(), timestamp.getTime(), web3.utils.fromAscii(params[4])).send({from: ethereum.selectedAddress, gas:3200000});  
    }
  } else {
    throw new Error('KYC instance not loaded')
  }
}

startWeb3 = async () => { 
  await initWeb3(); 
  await setBank();
  if (ethereum.selectedAddress == "0xf0dd2be7aa3e59dea9d8c24da1af03cab984d3c8") { document.getElementById("report-image").src = "../images/report2.png" }
  renderPage();
};

startWeb3();


