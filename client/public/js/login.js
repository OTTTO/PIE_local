adminLogin = async () => {
	const accounts = await web3.eth.getAccounts();
	if (accounts[0] === undefined) {
		ethereum.enable();
		alert("MUST LOGIN TO METAMASK");
	}
	else {
		const admin = await window.KYCinstance.methods.owner().call({from: ethereum.selectedAddress, gas:3000000});
		if (accounts[0] === admin) {
        	document.location.href = "../admin/banks-list.html";
      	} else {
      		alert("MUST LOGIN AS ADMIN");
      	}
	}
}

bankLogin = async () => {
	const accounts = await web3.eth.getAccounts();
	if (accounts[0] === undefined) {
		ethereum.enable();
		alert("MUST LOGIN TO METAMASK");
	}
	else {
		const potentialBank = await window.KYCinstance.methods.banks(accounts[0]).call({from: ethereum.selectedAddress, gas:3000000});
		if (potentialBank.name != "0x0000000000000000000000000000000000000000000000000000000000000000") {
        	document.location.href = "../bank/report-fraud.html";
      	} else {
      		alert("MUST LOGIN AS BANK");
      	}
	}
}