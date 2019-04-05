window.ethereum.on('accountsChanged', async (accounts) => { 
	if (accounts[0] === undefined) document.location.href = "../index.html"; 	
});