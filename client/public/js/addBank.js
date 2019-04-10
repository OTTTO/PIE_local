addBank = async () => {
  if (window.KYCinstance) {
    addr = document.getElementById("memberAddr").value;
    name = web3.utils.fromAscii(document.getElementById("bankName").value);
    type = document.getElementById("bankType");
    bankType = web3.utils.fromAscii(type.options[type.selectedIndex].value);    
    if (bankType== 0x00) { alert("Must input Bank Type"); return; }
    if (name == 0x00) { alert("Must input Bank Name"); return; }
    if (!addr) { alert("Must input Ethereum Address"); return; }

    await window.KYCinstance.methods.addBank(addr, name, bankType).send({from: ethereum.selectedAddress});

  } else {
    throw new Error('KYC instance not loaded')
  }
}

removeBank = async function() {
  if (window.KYCinstance) {
    const row = this.parentElement
    const details = row.children;
    bankType = web3.utils.fromAscii(details[0].innerHTML);
    name = web3.utils.fromAscii(details[1].innerHTML);
    addr = details[2].innerHTML;

    const bool = confirm("Are you sure you want to delete this bank?")

    if (bool) {
      await window.KYCinstance.methods.removeBank(addr, name, bankType).send({from: ethereum.selectedAddress});
      row.innerHTML = "";
    }

  } else {
    throw new Error('KYC instance not loaded')
  }    
}

const invalidAddresses = new Set();

getInvalidAddresses = async () => {
  events = await window.KYCinstance.getPastEvents('BankRemoved', { fromBlock: 0 });

  for (let i = 0; i < events.length; i++) {
    let values = events[i].returnValues;
    invalidAddresses.add(values.bankAddress);
  }
}

getBankList = async (error, event) => {
  const tBody = document.getElementsByTagName("tbody")[0]
  const values = event.returnValues;
  const addr = values.bankAddress;
  if (invalidAddresses.has(addr)) return;
  const name = web3.utils.toAscii(values.name);
  const bankType = web3.utils.toAscii(values.bankType);
  const elements = [bankType, name, addr];

  const row = document.createElement("tr"); 

  for (let i = 0; i < elements.length; i++) {
    const td = document.createElement("td");
    td.innerHTML =  elements[i];
    row.appendChild(td);
  }

  const delButton = document.createElement("button");
  delButton.setAttribute("class", "btn btn-icon btn-delete");
  delButton.addEventListener("click", removeBank);
  const delIcon = document.createElement("i");
  delIcon.setAttribute("class", "fas fa-trash-alt");
  delButton.appendChild(delIcon);
//<button class="btn btn-icon btn-edit" data-toggle="tooltip" data-placement="top" title="Edit"><i class="fas fa-edit"></i></button>
  row.appendChild(delButton);
  tBody.appendChild(row);
}
startWeb3 = async () => {
    await initWeb3();
    await getInvalidAddresses();    
    window.KYCinstance.events.BankAdded({ fromBlock: 0 }, getBankList);
}

startWeb3();
