adminLogin = async () => {
	const owner = await window.KYCinstance.methods.owner().call({from: ethereum.selectedAddress, gas:3000000});
	const account = await window.web3.eth.getAccounts();
	console.log(owner, account);
	if (account[0] == owner) {
        document.location.href = "../html/admin.html";
	} else {
		alert("You are not logged in as admin");
	}
}

bankLogin = async () => {
	const account = await window.web3.eth.getAccounts();
	const potentialBank = await window.KYCinstance.methods.banks(account[0]).call({from: ethereum.selectedAddress, gas:3000000});
	if (potentialBank.name != "0x0000000000000000000000000000000000000000000000000000000000000000") {
		document.location.href = "../html/bank.html";
	} else {
		alert("You are not logged in as a Bank");
	}
}

initWeb3();