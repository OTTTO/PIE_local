setBank = async () => {
	const account = await window.web3.eth.getAccounts();
	const bank = await window.KYCinstance.methods.banks(account[0]).call({from: ethereum.selectedAddress, gas:3000000});

	const bankName = web3.utils.toAscii(bank.name);	
	const bankText = document.getElementsByClassName("bank-logo-text")[0];

	bankText.innerText = bankName;
}