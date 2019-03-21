//import { initWeb3 } from './injectWeb3.js';

const form = document.getElementById("client-form");
for (var i = 0; i < 5; i++) {
  var fieldset = document.createElement("fieldset");
  var fromAccount = document.createElement("input");
  fromAccount.setAttribute("placeholder", "FROM Account");
  var toAccount = document.createElement("input");
  toAccount.setAttribute("placeholder", "TO Account");
  var bank = document.createElement("select");
  bank.setAttribute("id", "toBank");
  var opt1 = document.createElement("option");
  opt1.setAttribute("value", "0xac93bbf91e6d4c333e011f1aef88a56a76423f6c");
  opt1.innerHTML = "Riemann's Bank";
  var opt2 = document.createElement("option");
  opt2.setAttribute("value", "0x1cf0685498d9c75f4327bb16246b91969689190f");
  opt2.innerHTML = "West Wrangler Bank";
  bank.appendChild(opt1);
  bank.appendChild(opt2);
  var amount = document.createElement("input");
  amount.setAttribute("placeholder", "Amount");
  amount.setAttribute("type", "number");
  var txDate = document.createElement("input");
  txDate.setAttribute("placeholder", "Transaction Date");
  txDate.setAttribute("onfocus", "(this.type='date')");
  txDate.setAttribute("onblur", "(this.type='')" );
  fieldset.appendChild(fromAccount);
  fieldset.appendChild(toAccount);
  fieldset.appendChild(bank);  
  fieldset.appendChild(amount);
  fieldset.appendChild(txDate);
  form.appendChild(fieldset);
}

var fieldset = document.createElement("fieldset");
var button = document.createElement("button");
button.setAttribute("type", "button");
button.setAttribute("onClick", "reportFraud()");
button.innerHTML = "Publish to Blockchain";
fieldset.appendChild(button);
form.appendChild(fieldset);

reportFraud = async () => {
  if (window.KYCinstance) {
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
      window.KYCinstance.methods.reportFraud(ethereum.selectedAddress, toBank, fromAccount, toAccount, params[2], txDate.getTime()).send({from: ethereum.selectedAddress, gas:3200000});  
    }
  } else {
    throw new Error('KYC instance not loaded')
  }
}

startWeb3 = async () => { 
  await initWeb3(); 
  if (ethereum.selectedAddress == "0xf0dd2be7aa3e59dea9d8c24da1af03cab984d3c8") { document.getElementById("report-image").src = "../images/report2.png" }
};

startWeb3();
