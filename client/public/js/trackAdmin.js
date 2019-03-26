findFraudByFromAccount = async (account) => {
  events = await window.KYCinstance.getPastEvents('ReportedFraudB', { filter: {fromAccount: web3.utils.fromAscii(account)}, fromBlock: 0 });
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

listenCallback = async (error, event) => {
  if (error) { console.log(error); }
  else {
    let values = event.returnValues;
    let fromB = await window.KYCinstance.methods.banks(values.fromBank).call({from: ethereum.selectedAddress, gas:3000000}); 
    let toB = await window.KYCinstance.methods.banks(values.toBank).call({from: ethereum.selectedAddress, gas:3000000}); 
    var fromBank = document.createTextNode("From Bank: " + web3.utils.toAscii(fromB.name));
    var fromAccount = document.createTextNode("From Account: " + web3.utils.toAscii(values.fromAccount));
    var toBank = document.createTextNode("To Bank: " + web3.utils.toAscii(toB.name));
    var toAccount = document.createTextNode("To Account: " + web3.utils.toAscii(values.toAccount));
    var amount = document.createTextNode("Amount: " + values.amount);
    var time = document.createTextNode("Transaction Date: " + timeConverter(values.txDate / 1000));

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
  window.KYCinstance.events.ReportedFraudA({ fromBlock:0 }, listenCallback); 
  console.log('now listening for events');
}

startWeb3 = async () => { 
  await initWeb3(); 
  fraudListen();
};

startWeb3();