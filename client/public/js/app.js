const KYC = require('../../../build/contracts/KYC.json');
const Web3 = require('web3');
const utils = require('./utils');

getWeb3 = async () =>
  new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', function (accounts) {
          document.location.href = "../html/entry.html";
        });
        web3 = new Web3(ethereum);
        console.log("Thanks for using MetaMask!");
        try {
          await ethereum.enable();
        } catch (error) {
          console.log(error);
        }
        resolve(web3);
      } else {
        const provider = new Web3.providers.HttpProvider("http://127.0.0.1:30305");
        const web3 = new Web3(provider);
        console.log("No web3 injected, using localhost");
        resolve(web3);
      }
    });
  });

initWeb3 = async () => {
  try {
    this.web3 = await getWeb3();

    console.log("Selected Address:", ethereum.selectedAddress);

    const networkId = await this.web3.eth.net.getId();
    const deployedNetwork = KYC.networks[networkId];
    console.log("kyc address:", deployedNetwork.address);

    this.KYCinstance = new this.web3.eth.Contract(
      KYC.abi, 
      deployedNetwork.address);

  } catch (err) {
    alert('Failed to load web3, accounts, or contract');
    console.error(err);
  }
}

addMember = async () => {
  if (this.KYCinstance) {
    addr = document.getElementById("memberAddr").value;
    name = document.getElementById("bankName").value;
    type = document.getElementById("bankType");
    bankType = type.options[type.selectedIndex].value;
    console.log("member submitted");
    await this.KYCinstance.methods.addMember(addr, name, bankType).send({from: ethereum.selectedAddress});
    console.log("member added");
  } else {
    throw new Error('KYC instance not loaded')
  }
}

reportFraud = async () => {
  if (this.KYCinstance) {
    for (var i = 0; i < 5; i++) {
      var fieldset = document.getElementsByTagName("fieldset")[i];
      var params = [];
      for (var j = 0; j < 4; j++) {
        params.push(fieldset.getElementsByTagName("input")[j].value);
      }
      bank = document.getElementById("toBank");
      toBank = bank.options[bank.selectedIndex].value;
      fromAccount = web3.utils.fromAscii(params[0])
      toAccount = web3.utils.fromAscii(params[1])
      if (params[0] == "") continue;
      txDate = new Date(params[3])
      this.KYCinstance.methods.reportFraud(ethereum.selectedAddress, toBank, fromAccount, toAccount, params[2], txDate.getTime()).send({from: ethereum.selectedAddress, gas:3200000});  
    }
  } else {
    throw new Error('KYC instance not loaded')
  }
}
/*
readFraud = async () => {
  if (this.KYCinstance) {
    fraudID = document.getElementById("fraudID").value;
    fraud = await this.KYCinstance.methods.readFraud(fraudID).call({from: ethereum.selectedAddress, gas:3000000});  

    var bank = document.createTextNode("Bank: " + fraud[0]);
    var accountNumber = document.createTextNode("From Account: " + fraud[1]);
    var routingNumber = document.createTextNode("To Account: " + fraud[2]);
    var amount = document.createTextNode("Amount: " + fraud[3]);
    var fromID = document.createTextNode("From_ID: " + fraud[4])
    var time = document.createTextNode("Time: " + utils.timeConverter(fraud[5]));

    var elements = [bank, accountNumber, routingNumber, amount, fromID, time];

    fraudList = document.getElementById("fraudList");
    fraudList.innerHTML = '';
    fraudList.style.visibility = "visible";

    for (var i = 0; i < elements.length; i++) {
      var listItem = document.createElement("ul");
      listItem.appendChild(elements[i]);
      fraudList.appendChild(listItem);
    }

  } else {
    throw new Error('KYC instance not loaded')
  }
}*/

listenCallback = async (error, event) => {
  if (error) { console.log(error); }
  else {
    let values = event.returnValues;
    console.log("from/to",values.fromBank, values.toBank);
    let fromB = await this.KYCinstance.methods.banks(values.fromBank).call({from: ethereum.selectedAddress, gas:3000000}); 
    let toB = await this.KYCinstance.methods.banks(values.toBank).call({from: ethereum.selectedAddress, gas:3000000}); 
    var fromBank = document.createTextNode("From Bank: " + fromB.name);
    var fromAccount = document.createTextNode("From Account: " + web3.utils.toAscii(values.fromAccount));
    var toBank = document.createTextNode("To Bank: " + toB.name);
    var toAccount = document.createTextNode("To Account: " + web3.utils.toAscii(values.toAccount));
    var amount = document.createTextNode("Amount: " + values.amount);
    var time = document.createTextNode("Transaction Date: " + utils.timeConverter(values.txDate / 1000));

    const elements = [fromBank, fromAccount, toBank, toAccount, amount, time];

    const fraudEvents = document.getElementById("fraudEvents");
    const divItem = document.createElement('div');
    divItem.setAttribute('class', "fraudEvent")

    for (var i = 0; i < elements.length; i++) {
      var listItem = document.createElement('ul');
      listItem.appendChild(elements[i]);
      divItem.appendChild(listItem);
    }

    fraudEvents.insertBefore(divItem, fraudEvents.firstChild);
    var linebreak = document.createElement('br');
    fraudEvents.insertBefore(linebreak, divItem);
  }
}

fraudListen = () => {
  this.KYCinstance.events.ReportedFraudA({ filter: {toBank:ethereum.selectedAddress}, fromBlock:0 }, listenCallback); 
  this.KYCinstance.events.ReportedFraudA({ filter: {fromBank:ethereum.selectedAddress}, fromBlock:0 }, listenCallback);
  console.log('now listening for events');
}

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

  fromEvents = await this.KYCinstance.getPastEvents('ReportedFraudA', { filter: {txDate: days, fromBank:ethereum.selectedAddress}, fromBlock: 0 });
  toEvents = await this.KYCinstance.getPastEvents('ReportedFraudA', { filter: {txDate: days, toBank:ethereum.selectedAddress}, fromBlock: 0 });
  eventLister(fromEvents);
  eventLister(toEvents);

  button = document.createElement("button");
  button.setAttribute('class', "notifyAll");
  button.innerHTML = "NOTIFY ALL";
  
  fraudEvents = document.getElementById("reportedFrauds");
  fraudEvents.appendChild(button);


}

findFraudByFromAccount = async (account) => {
  events = await this.KYCinstance.getPastEvents('ReportedFraudB', { filter: {fromAccount: web3.utils.fromAscii(account)}, fromBlock: 0 });
  var frauds = [];
  for (var i = 0; i < events.length; i++) {
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

  var root = chart_config.nodeStructure = newNode(account);

  await fraudClimb(root, account);

  var my_chart = new Treant(chart_config);

  document.getElementById("tree-simple").style.visibility = "visible";

  function newNode(node) { return {text:{name: node}}; }

  async function fraudClimb(root, account) {

    var frauds = await findFraudByFromAccount.call(this, account);

    if (frauds.length == 0) return;

    var children = root.children = [];

    for (var i = 0; i < frauds.length; i++) {
      children.push(newNode(frauds[i]));
      await fraudClimb(children[i], frauds[i]);
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

startWeb3 = async () => {
  await initWeb3();
  fraudListen();
  if (location.href.split("/").slice(-1)[0] == "report.html") {
    if (ethereum.selectedAddress == "0xf0dd2be7aa3e59dea9d8c24da1af03cab984d3c8") { document.getElementById("report-image").src = "../images/report2.png" }
  }
}

startWeb3();

module.exports = { startWeb3 }
