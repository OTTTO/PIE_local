findFraudByToAccount = async (account, timestamps) => {
  events = await window.KYCinstance.getPastEvents('ReportedFraudB', { filter: {toAccount: web3.utils.fromAscii(account)}, fromBlock: 0 });
  var frauds = [];
  
  for (var i = 0; i < events.length; i++) {
    let values = events[i].returnValues;

    //check txID
    if (timestamps.has(values.time)) continue;
    timestamps.add(values.time);
    frauds.push(web3.utils.toAscii(values.fromAccount)); 
  }
  return [frauds, timestamps];
}

trackFraudTo = async () => {

  account = document.getElementById("account").value;

  chart_config = {
    chart: {
        container: "#tree-simple",
        connectors: {
          type: "straight"
        },
        rootOrientation: "EAST"
    }
  };

  var root = chart_config.nodeStructure = newNode(account);

  var timestamps = new Set();

  await fraudClimb(root, account, timestamps);

  var my_chart = new Treant(chart_config);

  document.getElementById("tree-simple").style.visibility = "visible";

  function newNode(node) { return {text:{name: node}}; }

  async function fraudClimb(root, account, timestamps) {

    var [frauds, usedTimes] = await findFraudByToAccount.call(this, account, timestamps);

    if (frauds.length == 0) return;

    var children = root.children = [];

    for (var i = 0; i < frauds.length; i++) {
      children.push(newNode(frauds[i]));
      await fraudClimb(children[i], frauds[i], usedTimes);
    }
  }
}

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
  console.log(frauds);
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
  var fraudList = document.getElementById("fraudList");
  var tree = document.getElementById("tree-simple");
  fraudList.innerHTML = '';
  tree.innerHTML = '';
  fraudList.style.visibility = "hidden";
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
    
    let fromB = await window.KYCinstance.methods.banks(values.fromBank).call({from: ethereum.selectedAddress, gas:3000000}); 
    let toB = await window.KYCinstance.methods.banks(values.toBank).call({from: ethereum.selectedAddress, gas:3000000}); 
    let fromBank = document.createTextNode("From Bank: " + web3.utils.toAscii(fromB.name));
    let fromAccount = document.createTextNode("From Account: " + web3.utils.toAscii(values.fromAccount));
    let toBank = document.createTextNode("To Bank: " + web3.utils.toAscii(toB.name));
    let toAccount = document.createTextNode("To Account: " + web3.utils.toAscii(values.toAccount));
    let amount = document.createTextNode("Amount: " + values.amount);
    let time = document.createTextNode("Transaction Date: " + timeConverter(values.txDate / 1000));

    const elements = [fromBank, fromAccount, toBank, toAccount, amount, time];

    const fraudEvents = document.getElementById(type);
    const divItem = document.createElement('div');
    divItem.setAttribute('class', "fraudEvent")

    for (let i = 0; i < elements.length; i++) {
      let listItem = document.createElement('ul');
      listItem.appendChild(elements[i]);
      divItem.appendChild(listItem);
    }

    fraudEvents.insertBefore(divItem, fraudEvents.firstChild);
    let linebreak = document.createElement('br');
    fraudEvents.insertBefore(linebreak, divItem);
    
  }
}

listFraudFrom = () => {
  const fraudTo = document.getElementById("toFraud");
  fraudTo.style.background = "rgba(255,255,255)";

  const fraudInternal = document.getElementById("internalFraud");
  fraudInternal.style.background = "rgba(255,255,255)";

  const fraudFrom = document.getElementById("fromFraud");
  fraudFrom.style.background = "rgba(135,206,250,.8)";  

  const toFraud = document.getElementById("toFraudEvents");
  toFraud.style.display = "none";

  const internalFraud = document.getElementById("internalFraudEvents");
  internalFraud.style.display = "none";

  const fromFraud = document.getElementById("fromFraudEvents");
  fromFraud.style.display = "block";
}

listFraudTo = () => {
  const fraudFrom = document.getElementById("fromFraud");
  fraudFrom.style.background = "rgba(255,255,255)";

  const fraudInternal = document.getElementById("internalFraud");
  fraudInternal.style.background = "rgba(255,255,255)";
  
  const fraudTo = document.getElementById("toFraud");
  fraudTo.style.background = "rgba(135,206,250,.8)";

  const fromFraud = document.getElementById("fromFraudEvents");
  fromFraud.style.display = "none";

  const internalFraud = document.getElementById("internalFraudEvents");
  internalFraud.style.display = "none";

  const toFraud = document.getElementById("toFraudEvents");
  toFraud.style.display = "block";
}

listFraudInternal = () => {
  const fraudFrom = document.getElementById("fromFraud");
  fraudFrom.style.background = "rgba(255,255,255)";
  
  const fraudTo = document.getElementById("toFraud");
  fraudTo.style.background = "rgba(255,255,255)"

  const fraudInternal = document.getElementById("internalFraud");
  fraudInternal.style.background = "rgba(135,206,250,.8)";

  const fromFraud = document.getElementById("fromFraudEvents");
  fromFraud.style.display = "none";

  const toFraud = document.getElementById("toFraudEvents");
  toFraud.style.display = "none";

  const internalFraud = document.getElementById("internalFraudEvents");
  internalFraud.style.display = "block";
}

startWeb3 = async () => { 
  await initWeb3(); 

  listFraudFrom();

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