window.ethereum.on('accountsChanged', async (accounts) => { 
	console.log(accounts[0]);
	if (accounts[0] === undefined) document.location.href = "../index.html"; 	
});