const KYC = require('../../../build/contracts/KYC.json');
const Web3 = require('web3');
const utils = require('./utils');

getWeb3 = async () =>
  new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      if (window.ethereum) {
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

addClient = async () => {
  if (this.KYCinstance) {
    name = document.getElementById("clientName").value;
    addr = document.getElementById("clientAddr").value;
    console.log("client submitted");
    await this.KYCinstance.methods.addClient(name, addr).send({from: ethereum.selectedAddress});
    console.log("client added");
  } else {
    throw new Error('KYC instance not loaded')
  }
}

addMember = async () => {
  if (this.KYCinstance) {
    addr = document.getElementById("memberAddr").value;
    role = document.getElementById("memberRole").value;
    console.log("member submitted");
    await this.KYCinstance.methods.addMember(addr, role).send({from: ethereum.selectedAddress});
    console.log("member added");
  } else {
    throw new Error('KYC instance not loaded')
  }
}

reportFraud = async () => {
  if (this.KYCinstance) {
    accountNumber = document.getElementById("accountNumber").value;
    routingNumber = document.getElementById("routingNumber").value;
    amount = document.getElementById("fraudAmount").value;
    fromFraud = document.getElementById("fromFraud").value;
    console.log("fraud submitted");
    await this.KYCinstance.methods.reportFraud(ethereum.selectedAddress, accountNumber, routingNumber, amount, fromFraud).send({from: ethereum.selectedAddress, gas:8000000});
    console.log("fraud reported");
  } else {
    throw new Error('KYC instance not loaded')
  }
}

readFraud = async () => {
  if (this.KYCinstance) {
    fraudID = document.getElementById("fraudID").value;
    fraud = await this.KYCinstance.methods.readFraud(fraudID).call({from: ethereum.selectedAddress, gas:3000000});  
 
    fraudDisplay(fraud[0], fraud[1], fraud[2], fraud[3], fraud[4], fraud[5])
    
    console.log("fraud read");
  } else {
    throw new Error('KYC instance not loaded')
  }
}

fraudListen = () => {
  this.KYCinstance.events.ReportedFraud({ fromBlock:0 }, 
    (error, event) => {
      if (error) {
        console.log(error);
      }
      else {
        values = event.returnValues;
      }
    });

  console.log('now listening for events');
}

fraudDisplay = (bank, accountNumber, routingNumber, amount, fromID, time) => {
  var bank = document.createTextNode("Bank: " + bank);
  var accountNumber = document.createTextNode("Account Number: " + accountNumber);
  var routingNumber = document.createTextNode("Routing Number: " + routingNumber);
  var amount = document.createTextNode("Amount: " + amount);
  var fromID = document.createTextNode("From_ID: " + fromID);
  var time = document.createTextNode("Time: " + utils.timeConverter(time));

  var elements = [bank, accountNumber, routingNumber, amount, fromID, time];

  fraudList = document.getElementById("fraudList");
  fraudList.innerHTML = '';

  for (var i = 0; i < elements.length; i++) {
    var listItem = document.createElement("ul");
    listItem.appendChild(elements[i]);
    fraudList.appendChild(listItem);
  }
}


startWeb3 = async () => {
  await initWeb3();
  fraudListen();
}

startWeb3();

module.exports = { startWeb3 }
