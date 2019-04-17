getBankNames = async () => {
  addEvents = await window.KYCinstance.getPastEvents('BankAdded', { fromBlock: 0 });
  rmEvents = await window.KYCinstance.getPastEvents('BankRemoved', { fromBlock: 0 });

  const invalidAddresses = new Set();

  for (let i = 0; i < rmEvents.length; i++) {
    const values = rmEvents[i].returnValues;
    invalidAddresses.add(values.bankAddress);
  }

  const options = [];
  for (let i = 0; i < addEvents.length; i++) {
    const values = addEvents[i].returnValues;
    if (invalidAddresses.has(values.bankAddress)) continue;
    const opt = document.createElement("option");
    opt.setAttribute("value", values.bankAddress);
    opt.innerHTML = web3.utils.toAscii(values.name);
    options.push(opt);
  }
  return options;
}

renderPage = async () => {
  const tBody = document.getElementsByTagName("tbody")[0];
  for (var i = 0; i < 7; i++) {
    const txId = document.createElement("input");
    txId.setAttribute("placeholder", "Transaction ID");

    const fromAccount = document.createElement("input");
    fromAccount.setAttribute("placeholder", "FROM Account");

    const bank = document.createElement("select");
    bank.setAttribute("id", "toBank");
    var options = await getBankNames();
    for (let j = 0; j < options.length; j++) {
      bank.appendChild(options[j]);
    }

    const toAccount = document.createElement("input");
    toAccount.setAttribute("placeholder", "TO Account"); 

    const amount = document.createElement("input");
    amount.setAttribute("placeholder", "Amount");
    amount.setAttribute("type", "number");
    
    const txDate = document.createElement("input");
    txDate.setAttribute("id", "txDate");
    txDate.setAttribute("placeholder", "Txn Date");
    txDate.setAttribute("onfocus", "(this.type='date')");
    txDate.setAttribute("onblur", "(this.type='')" );


    elements = [txId, fromAccount, bank, toAccount, amount, txDate];

    const tr = document.createElement("tr");

    for (let i = 0; i < elements.length; i++) {
      elements[i].setAttribute("class", "form-control");
      const td = document.createElement("td");
      td.appendChild(elements[i])
      tr.appendChild(td);
    }

    tBody.appendChild(tr);
  }
}

reportFraud = async () => {
  if (window.KYCinstance) {
    const tbody = document.getElementsByTagName("tbody")[0];
    for (let i = 0; i < 7; i++) {
      const tr = tbody.getElementsByTagName("tr")[i];
      const params = [];
      for (let j = 0; j < 5; j++) {
        params.push(tr.getElementsByTagName("input")[j].value);
      }
      bank = document.getElementById("toBank");
      toBank = bank.options[bank.selectedIndex].value;
      fromAccount = web3.utils.fromAscii(params[1])
      toAccount = web3.utils.fromAscii(params[2])
      if (params[0] == "") continue;
      
      const earliestDate = new Date(1965, 0, 0);
      const latestDate = new Date();
      const txDate = new Date(params[4]);
      //const hours = (txDate.getTimezoneOffset() / 60) % 24;
      txDate.setHours(txDate.getHours() + 24);

      if (txDate < earliestDate || txDate > latestDate) {
        alert("invalid date");
        return;
      }

      window.KYCinstance.methods.reportFraud(ethereum.selectedAddress, toBank, fromAccount, toAccount, params[3], txDate.getTime(), web3.utils.fromAscii(params[0])).send({from: ethereum.selectedAddress, gas:3200000});
      
    }
  } else {
    throw new Error('KYC instance not loaded')
  }
}

startWeb3 = async () => { 
  await initWeb3(); 
  await setBank();
  renderPage();
};

startWeb3();


