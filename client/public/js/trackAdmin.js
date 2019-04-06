findFraudByFromAccount = async (account) => {
  events = await window.KYCinstance.getPastEvents('ReportedFraudB', { filter: {fromAccount: web3.utils.fromAscii(account)}, fromBlock: 0 });
  const frauds = [];
  for (let i = 0; i < events.length; i++) {
    frauds.push(web3.utils.toAscii(events[i].returnValues.toAccount)); 
  }
  return frauds;
}

trackFraud = async () => {

  account = document.getElementById("account").value;

  chart_config = {
    chart: {
        container: "#tree-simple",
        connectors: {
          type: "straight"
        },
        rootOrientation: "WEST"
    }
  };

  const root = chart_config.nodeStructure = newNode(account);

  await fraudClimb(root, account);

  const my_chart = new Treant(chart_config);

  document.getElementById("tree-simple").style.visibility = "visible";

  function newNode(node) { return {text:{name: node}}; }

  async function fraudClimb(root, account) {

    const frauds = await findFraudByFromAccount.call(this, account);

    if (frauds.length == 0) return;

    const children = root.children = [];

    for (let i = 0; i < frauds.length; i++) {
      children.push(newNode(frauds[i]));
      await fraudClimb(children[i], frauds[i]);
    }
  }
}

clearFraud = () => {
  const tree = document.getElementById("tree-simple");
  tree.innerHTML = '';
  tree.style.visibility = "hidden";
}

listenCallback = async (error, event, type) => {
  if (error) { console.log(error); }
  else {
    const values = event.returnValues;

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

    const table = document.getElementsByTagName("table")[0];
    table.appendChild(row);
  }
}


fraudListen = () => {
  window.KYCinstance.events.ReportedFraudA({ fromBlock:0 }, listenCallback); 
  console.log('now listening for events');
}

startWeb3 = async () => { 
  await initWeb3(); 
  fraudListen();
};

startWeb3();