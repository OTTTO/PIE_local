setBank = async () => {
	let account = await window.web3.eth.getAccounts();
	let bank = await window.KYCinstance.methods.banks(account[0]).call({from: ethereum.selectedAddress, gas:3000000});

	const bankName = web3.utils.toAscii(bank.name)
	
	const theBank = document.createElement('span');
	theBank.setAttribute("id", "bankName");
	theBank.innerText = bankName;

	const footer = document.getElementsByTagName("footer")[0];

	footer.appendChild(theBank);
}

startWeb3 = async () => {
	await initWeb3();
	await setBank();
}

startWeb3();