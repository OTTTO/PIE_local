addBank = async () => {
  if (window.KYCinstance) {
    addr = document.getElementById("memberAddr").value;
    name = web3.utils.fromAscii(document.getElementById("bankName").value);
    type = document.getElementById("bankType");
    bankType = web3.utils.fromAscii(type.options[type.selectedIndex].value);
    console.log("member submitted");
    await window.KYCinstance.methods.addBank(addr, name, bankType).send({from: ethereum.selectedAddress});
    console.log("member added");
  } else {
    throw new Error('KYC instance not loaded')
  }
}

initWeb3();