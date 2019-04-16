findFraudByFromAccount = async (account, timestamp) => {
  events = await window.KYCinstance.getPastEvents('ReportedFraudB', { filter: {fromAccount: web3.utils.fromAscii(account)}, fromBlock: 0 });
  const frauds = [];
  const theseTimestamps = [];

  for (let i = 0; i < events.length; i++) {
    let values = events[i].returnValues;

    /*if ((timestamp > values.time) || timestamps.has(values.time)) continue;
    else {*/
      const addEvent = await window.KYCinstance.getPastEvents('BankAdded', { filter: {bankAddress: values.toBank},fromBlock: 0 });
      const bankName = web3.utils.toAscii(addEvent[0].returnValues.name);
      timestamps.add(values.time);
      theseTimestamps.push(values.time);
      frauds.push({
        name: bankName,
        account: web3.utils.toAscii(values.toAccount)
      }); 
    //}
  }
  return [frauds, theseTimestamps];
}

let timestamps;

trackFraud = async () => {

  account = document.getElementById("account").value;

  chart_config = {
    chart: {
        container: "#tree-simple",
        connectors: {
          type: "straight"
        },
        rootOrientation: "WEST",
        nodeAlign: "TOP"
    }
  };

  accountEvents = await window.KYCinstance.getPastEvents('ReportedFraudB', { filter: {fromAccount: web3.utils.fromAscii(account)}, fromBlock: 0 });
  let values = accountEvents[0].returnValues;
  const addEvent = await window.KYCinstance.getPastEvents('BankAdded', { filter: {bankAddress: values.fromBank},fromBlock: 0 });
  const bankName = web3.utils.toAscii(addEvent[0].returnValues.name);

  const root = chart_config.nodeStructure = newNode(bankName, account);

  timestamps = new Set();

  await fraudClimb(root, account, 0);

  $('#tree-simple').show();
  const my_chart = new Treant(chart_config);

  document.getElementById("tree-simple").style.visibility = "visible";

  function newNode(name, account) { 
    return {text:{name: name, title: account.toString()}}; 
  }

  async function fraudClimb(root, account, theseTimestamps) {

    let frauds;

    [frauds, theseTimestamps] = await findFraudByFromAccount.call(this, account, theseTimestamps);

    if (frauds.length == 0) return;

    const children = root.children = [];

    for (let i = 0; i < frauds.length; i++) {
      children.push(newNode(frauds[i].name, frauds[i].account));
      await fraudClimb(children[i], frauds[i].account, theseTimestamps[i]);
    }
  }
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
    const amount = `₹${values.amount}`;
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
  window.KYCinstance.events.ReportedFraudA({ fromBlock: 0 }, listenCallback); 
  console.log('now listening for events');
}

startWeb3 = async () => { 
  await initWeb3(); 
  fraudListen();
};

startWeb3();