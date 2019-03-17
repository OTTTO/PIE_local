const form = document.getElementById("client-form");
for (var i = 0; i < 5; i++) {
  var fieldset = document.createElement("fieldset");
  var account = document.createElement("input");
  account.setAttribute("placeholder", "FROM Account");
  var routing = document.createElement("input");
  routing.setAttribute("placeholder", "TO Account");
  var amount = document.createElement("input");
  amount.setAttribute("placeholder", "Amount");
  amount.setAttribute("type", "number");
  var from = document.createElement("input");
  from.setAttribute("placeholder", "From Fraud");
  from.setAttribute("type", "number");
  var txDate = document.createElement("input");
  txDate.setAttribute("placeholder", "Transaction Date");
  txDate.setAttribute("onfocus", "(this.type='date')");
  txDate.setAttribute("onblur", "(this.type='')" );
  fieldset.appendChild(account);
  fieldset.appendChild(routing);
  fieldset.appendChild(amount);
  fieldset.appendChild(from);
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