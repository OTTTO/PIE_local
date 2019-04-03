findFraudByFromAccount = async (account, timestamp) => {
  events = await window.KYCinstance.getPastEvents('ReportedFraudB', { filter: {fromAccount: web3.utils.fromAscii(account)}, fromBlock: 0 });
  var frauds = [];
  var theseTimestamps = [];

  for (let i = 0; i < events.length; i++) {
    let values = events[i].returnValues;

    if ((timestamp > values.time) || timestamps.has(values.time)) continue;
    else {
      timestamps.add(values.time);
      theseTimestamps.push(values.time);
      frauds.push(web3.utils.toAscii(values.toAccount)); 
    }
  }
  return [frauds, theseTimestamps];
}

var timestamps;

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

  var root = chart_config.nodeStructure = newNode(account);

  timestamps = new Set();

  await fraudClimb(root, account, 0);

  var my_chart = new Treant(chart_config);

  document.getElementById("tree-simple").style.visibility = "visible";

  function newNode(node) { return {text:{name: node}}; }

  async function fraudClimb(root, account, theseTimestamps) {

    var [frauds, theseTimestamps] = await findFraudByFromAccount.call(this, account, theseTimestamps);

    if (frauds.length == 0) return;

    var children = root.children = [];

    for (var i = 0; i < frauds.length; i++) {
      children.push(newNode(frauds[i]));
      await fraudClimb(children[i], frauds[i], theseTimestamps[i]);
    }
  }
}

clearFraud = () => {
  var tree = document.getElementById("tree-simple");
  tree.innerHTML = '';
  tree.style.visibility = "hidden";
}

listenCallback = async (error, event, type) => {
  if (error) { console.log(error); }
  else {
    let values = event.returnValues;
    if (values.fromBank == values.toBank && (type == "fromFraudEvents" || type == "toFraudEvents")) return;
    let blockNumber = event.blockNumber;
    if (eventBlocks.has(blockNumber)) return;
    eventBlocks.add(blockNumber);

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
      let td = document.createElement("td");
      td.innerHTML =  elements[i];
      row.appendChild(td);
    }
    const table = document.getElementById(type);
    table.appendChild(row);
  }
}
startWeb3 = async () => { 
  await initWeb3(); 
  await setBank();

  window.KYCinstance.events.ReportedFraudA({ filter: {fromBank:ethereum.selectedAddress, toBank:ethereum.selectedAddress}, fromBlock:0 }, 
  async (error, event) => {
    listenCallback(error, event, "internalFraudEvents");
  });

  window.KYCinstance.events.ReportedFraudA({ filter: {fromBank:ethereum.selectedAddress}, fromBlock:0 }, 
  async (error, event) => {
    listenCallback(error, event, "fromFraudEvents");
  });

  window.KYCinstance.events.ReportedFraudA({ filter: {toBank:ethereum.selectedAddress}, fromBlock:0 }, 
  async (error, event) => {
    listenCallback(error, event, "toFraudEvents");
  });
  
  console.log('now listening for events');
  
};

var eventBlocks = new Set();

startWeb3();