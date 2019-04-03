logFraud = async (type, values) => {
    const tbody = document.getElementById(type);
    const txId = web3.utils.toAscii(values.txId);
    const fromAccount = web3.utils.toAscii(values.fromAccount);
    const toB = await window.KYCinstance.methods.banks(values.toBank).call({from: ethereum.selectedAddress, gas:3000000}); 
    const toBank = web3.utils.toAscii(toB.name);
    const toAccount = web3.utils.toAscii(values.toAccount);
    const amount = `$${values.amount}`;
    const txTime = timeConverter(values.time / 1000);

    const elements = [txId, fromAccount, toBank, toAccount, amount, txTime];

    var tr = document.createElement("tr");

    for (let i = 0; i < elements.length; i++) {
        const td = document.createElement("td");
        td.innerHTML = (elements[i]);
        tr.appendChild(td);
    }

    if (type === "notViewed") {
        const checkbox = document.createElement("div");
        checkbox.setAttribute("class", "checkbox");
        const label = document.createElement("label");
        checkbox.appendChild(label)
        const check = document.createElement("input");
        check.setAttribute("type", "checkbox");
        check.addEventListener("click", viewFraud);
        label.appendChild(check);

        const button = document.createElement("button");
        button.setAttribute("class", "btn btn-notifyme");        
        button.innerHTML = "Notify Me"

        const elements = [checkbox, button];

        for (let i = 0; i < elements.length; i++) {
            const td = document.createElement("td");
            td.appendChild(elements[i]);
            tr.appendChild(td);
        }
    }

    tbody.appendChild(tr);

}

disposition = async () => { 
    var viewedTxns = new Set();
    const latest = await web3.eth.getBlockNumber();
    const viewedEvents = await window.KYCinstance.getPastEvents('FraudViewed', { filter: {toBank:ethereum.selectedAddress}, fromBlock: 0 });

    for (let i = 0; i < viewedEvents.length; i++) {
        viewedTxns.add(viewedEvents[i].returnValues.txID)
    }

    window.KYCinstance.events.FraudViewed({ filter: {toBank: ethereum.selectedAddress}, fromBlock: latest }, 
        (error, event) => {
            viewedTxns.add(event.returnValues.txId);
        });

    window.KYCinstance.events.ReportedFraudA({ filter: {toBank:ethereum.selectedAddress}, fromBlock:0 }, 
        (error, event) => {
            if (viewedTxns.has(event.returnValues.txId)) {
                logFraud("disposition", event.returnValues);
            } else {
                logFraud("notViewed", event.returnValues);
            }
        });
}

viewFraud = async function () {
    const row = this.parentElement.parentElement.parentElement.parentElement;
    const details = row.children;
    const txId = web3.utils.fromAscii(details[0].innerHTML);
    await window.KYCinstance.methods.viewFraud(txId, ethereum.selectedAddress).send({from: ethereum.selectedAddress});;
}

startWeb3 = async () => { 
  await initWeb3(); 
  await setBank();
  await disposition();
};

startWeb3();