const logFraud = async (type, values) => {
    const tbody = document.getElementById(type);
    const txId = web3.utils.toAscii(values.txId);
    const fromAccount = web3.utils.toAscii(values.fromAccount);
    const fromB = await window.KYCinstance.methods.banks(values.fromBank).call({from: ethereum.selectedAddress, gas:3000000}); 
    const fromBank = web3.utils.toAscii(fromB.name);
    const toAccount = web3.utils.toAscii(values.toAccount);
    const amount = `₹${values.amount}`;
    const txTime = timeConverter(values.txDate / 1000);

    const elements = [txId, fromAccount, fromBank, toAccount, amount, txTime];

    const tr = document.createElement("tr");

    for (let i = 0; i < elements.length; i++) {
        const td = document.createElement("td");
        td.innerHTML = (elements[i]);
        tr.appendChild(td);
    }

    if (type === "notViewed") {
        const checkbox = document.createElement("div");
        const label = document.createElement("label");
        checkbox.appendChild(label)
        const check = document.createElement("input");
        check.setAttribute("type", "checkbox");
        check.addEventListener("click", viewFraud);
        label.appendChild(check);

        const button = document.createElement("button");
        button.setAttribute("class", "btn btn-notifyme");
        button.setAttribute("data-toggle", "modal");
        button.setAttribute("data-target", "#myModal");        
        button.innerHTML = "Check & Action"
        button.addEventListener("click", function() { 
            setTimeout(checkAndRespond.bind(this), 250);
        });

        const elements = [checkbox, button];

        for (let i = 0; i < elements.length; i++) {
            const td = document.createElement("td");
            td.appendChild(elements[i]);
            tr.appendChild(td);
        }
    }

    tbody.appendChild(tr);

}

const disposition = async () => { 
    const viewedTxns = new Set();
    const notViewedTxns = new Set();
    const latest = await web3.eth.getBlockNumber();
    const viewedEvents = await window.KYCinstance.getPastEvents('FraudViewed', { filter: {toBank:ethereum.selectedAddress}, fromBlock: 0 });

    for (let i = 0; i < viewedEvents.length; i++) {
        viewedTxns.add(viewedEvents[i].returnValues.txID)
    }

    window.KYCinstance.events.FraudViewed({ filter: {toBank: ethereum.selectedAddress}, fromBlock: latest }, 
        (error, event) => {
            viewedTxns.add(event.returnValues.txId);
        });

    window.KYCinstance.events.ReportedFraudA({ filter: {toBank:ethereum.selectedAddress}, fromBlock: 0 }, 
        (error, event) => {
            if (viewedTxns.has(event.returnValues.txId)) {
                logFraud("disposition", event.returnValues);
            } else if (!notViewedTxns.has(event.returnValues.txId)) {
                notViewedTxns.add(event.returnValues.txId);
                logFraud("notViewed", event.returnValues);
            } 
        });
}

const viewFraud = async function () {
    const row = this.parentElement.parentElement.parentElement.parentElement;
    const details = row.children;
    const txId = web3.utils.fromAscii(details[0].innerHTML);
    await window.KYCinstance.methods.viewFraud(txId, ethereum.selectedAddress).send({from: ethereum.selectedAddress});;
    location.reload(true);
}

const checkAndRespond = async function () {    
    // FAKE ACCOUNTS
    const accounts = 
    [
        {account:"12345678", balance:0,   bank: "North Arya Bank"},
        {account:"87654321", balance:0,   bank: "Asian Bank"},
        {account:"98765432", balance:100, bank: "North Arya Bank"},
        {account:"32123456", balance:0,   bank: "North Arya Bank"},
        {account:"23456789", balance:50,  bank: "Asian Bank"},
        {account:"56789021", balance:0,   bank: "Asian Bank"},
        {account:"23109876", balance:30,  bank: "North Arya Bank"},
        {account:"43567890", balance:20,  bank: "North Arya Bank"},

        {account:"65437891", balance:0,    bank: "Asian Bank"},
        {account:"61746812", balance:0,    bank: "North Arya Bank"},
        {account:"19748232", balance:500,  bank: "Asian Bank"},
        {account:"74621673", balance:0,    bank: "Asian Bank"},
        {account:"93461831", balance:300,  bank: "North Arya Bank"},
        {account:"72613631", balance:200,  bank: "North Arya Bank"},

        {account:"35437891", balance:0,    bank: "Asian Bank"},
        {account:"41746812", balance:0,    bank: "North Arya Bank"},
        {account:"59748232", balance:500,  bank: "Asian Bank"},
        {account:"64621673", balance:0,    bank: "Asian Bank"},
        {account:"73461831", balance:300,  bank: "North Arya Bank"},
        {account:"82613631", balance:200,  bank: "North Arya Bank"}
    ];
    // FAKE TRANSACTIONS
    const dateNow = new Date;
    const hours = (24 - (dateNow.getTimezoneOffset() / 60) % 24);
    dateNow.setHours(hours,0,0,0);
    console.log(dateNow);
    const transactions = 
    [ 
        {txId:"101101101101", fromBank:"North Arya Bank", fromAccount:"12345678", toBank:"Asian Bank",      toAccount:"87654321", amount:200, txTime: dateNow},
        {txId:"183246127312", fromBank:"Asian Bank",      fromAccount:"87654321", toBank:"North Arya Bank", toAccount:"98765432", amount:100, txTime: dateNow},
        {txId:"232478783413", fromBank:"Asian Bank",      fromAccount:"87654321", toBank:"North Arya Bank", toAccount:"32123456", amount:100, txTime: dateNow},
        {txId:"332765936141", fromBank:"North Arya Bank", fromAccount:"32123456", toBank:"Asian Bank",      toAccount:"23456789", amount:50,  txTime: dateNow},
        {txId:"467146148141", fromBank:"North Arya Bank", fromAccount:"32123456", toBank:"Asian Bank",      toAccount:"56789021", amount:50,  txTime: dateNow},
        {txId:"553686823142", fromBank:"Asian Bank",      fromAccount:"56789021", toBank:"North Arya Bank", toAccount:"23109876", amount:30,  txTime: dateNow},
        {txId:"664318741813", fromBank:"Asian Bank",      fromAccount:"56789021", toBank:"North Arya Bank", toAccount:"43567890", amount:20,  txTime: dateNow},

        {txId:"201101101101", fromBank:"Asian Bank",      fromAccount:"65437891", toBank:"North Arya Bank", toAccount:"61746812", amount:1000, txTime: dateNow},
        {txId:"532765936141", fromBank:"North Arya Bank", fromAccount:"61746812", toBank:"Asian Bank",      toAccount:"19748232", amount:500,  txTime: dateNow},
        {txId:"667146148141", fromBank:"North Arya Bank", fromAccount:"61746812", toBank:"Asian Bank",      toAccount:"74621673", amount:500,  txTime: dateNow},
        {txId:"753686823142", fromBank:"Asian Bank",      fromAccount:"74621673", toBank:"North Arya Bank", toAccount:"93461831", amount:300,  txTime: dateNow},
        {txId:"864318741813", fromBank:"Asian Bank",      fromAccount:"74621673", toBank:"North Arya Bank", toAccount:"72613631", amount:200,  txTime: dateNow},

        {txId:"301101101101", fromBank:"Asian Bank",      fromAccount:"35437891", toBank:"North Arya Bank", toAccount:"41746812", amount:1000, txTime: dateNow},
        {txId:"432765936141", fromBank:"North Arya Bank", fromAccount:"41746812", toBank:"Asian Bank",      toAccount:"59748232", amount:500,  txTime: dateNow},
        {txId:"567146148141", fromBank:"North Arya Bank", fromAccount:"41746812", toBank:"Asian Bank",      toAccount:"64621673", amount:500,  txTime: dateNow},
        {txId:"653686823142", fromBank:"Asian Bank",      fromAccount:"64621673", toBank:"North Arya Bank", toAccount:"73461831", amount:300,  txTime: dateNow},
        {txId:"764318741813", fromBank:"Asian Bank",      fromAccount:"64621673", toBank:"North Arya Bank", toAccount:"82613631", amount:200,  txTime: dateNow}
    ];
    // Treant chart
    const chart_config = {
        chart: {
            container: "#tree-simple",
            connectors: {
              type: "straight"
            },
            rootOrientation: "WEST",
            nodeAlign: "TOP",
            siblingSeperation: 60,
            subTeeSeparation: 60,
            scrollbar: "fancy"
        }
    };

    //get originalAccount
    const row = this.parentElement.parentElement;
    const dataElements = row.getElementsByTagName("td");
    const toAccount = dataElements[3].innerHTML;
    const originalAccount = search("account", toAccount, accounts)[0];
    //BFS Data Structure
    const fraudAccounts =[];

    //short-circuit evaluation
    if (originalAccount === undefined) {
        $('#tree-simple').empty().append('Account currently suspended').show();
        return;
    }
    const toReport = {fromBanks:[], toBanks:[], fromAccounts:[], toAccounts:[], amounts:[], dates:[], ids:[]};
    //check original fraud
    if (originalAccount.balance === 0) {
        //push OA onto BFS DS
        fraudAccounts.push(originalAccount.account)
        //Set originalAccount as root
        const root = chart_config.nodeStructure = newNode(originalAccount.bank, originalAccount.account);
        //BFS (need different approach for checking same account, implement txID checks)
        while (fraudAccounts.length > 0) {
            //get this level
            const fraudTxns = search("fromAccount", fraudAccounts[0], transactions);
            //process this level
            for (const txn of fraudTxns) {
                //get parent node
                const parentNode = findNested(root, txn.fromAccount);
                const txnAccount = search("account", txn.toAccount, accounts)[0];
                if (txnAccount.balance === 0) {
                    //add node to chart
                    addChild(parentNode, txnAccount, 'active');
                    //account for new node in BFS DS
                    fraudAccounts.push(txnAccount.account)
                } else {
                    //add suspended node to chart
                    addChild(parentNode, txnAccount, 'suspended');
                }
                //REPORT FRAUD 
                //check ReportedFraudB for txId (time indicator)
                //get bank addresses
                const toBankEvent = await window.KYCinstance.getPastEvents('BankAdded', { filter: {name: web3.utils.fromAscii(txn.toBank)}, fromBlock: 0 });
                const fromBankEvent = await window.KYCinstance.getPastEvents('BankAdded', { filter: {name: web3.utils.fromAscii(txn.fromBank)}, fromBlock: 0 });
                const toBank = toBankEvent[0].returnValues.bankAddress;
                const fromBank = fromBankEvent[0].returnValues.bankAddress;
                //get accounts
                const fromAccount = web3.utils.fromAscii(txn.fromAccount);
                const toAccount = web3.utils.fromAscii(txn.toAccount);
                //get date
                const date = txn.txTime.getTime();
                //get amount
                const amount= txn.amount;
                //get txID
                const txId = web3.utils.fromAscii(txn.txId);
                //fill JSON arrays
                toReport.fromBanks.push(fromBank);
                toReport.toBanks.push(toBank);
                toReport.fromAccounts.push(fromAccount);
                toReport.toAccounts.push(toAccount);
                toReport.amounts.push(amount);
                toReport.dates.push(date);
                toReport.ids.push(txId);
            }
            //remove processed node
            fraudAccounts.shift();
        }         
    } else {
        //suspend account
        //chart_config.nodeStructure = newSuspended(originalAccount.account);
        $('#tree-simple').empty().append('Money found, account suspended').show();
        return;
    }
    
    $("#tree-simple").show();
    const my_chart = new Treant(chart_config);

    //upload to blockchain
    await window.KYCinstance.methods.systematicReport(
        toReport.fromBanks,
        toReport.toBanks,
        toReport.fromAccounts,
        toReport.toAccounts,
        toReport.amounts,
        toReport.dates,
        toReport.ids
    ).send({from: ethereum.selectedAddress, gas:3200000});

    function addChild(root, child, nodeType) {
        let newChild;
        if (nodeType === 'active') {
            newChild = newNode(child.bank, child.account);
        } else {
            newChild = newSuspended(child.bank, child.account);
        }

        if (root.children) {
            root.children = [...root.children, newChild]
        } else 
            root.children = [newChild];
    }

    function newNode(bank, account) { return {text:{name: bank, title:account}}; }

    function newSuspended(bank, account) { return {text:{name: bank, title:account, desc:"SUSPENDED"}, HTMLclass:"suspended"}; } 

    function suspendAccount(actNum) {
        alert(`${actNum} has been suspended!`);
    }

    function search(key, value, myArray) {
        const arr = [];
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i][key] === value) arr.push(myArray[i]);
        }
        return arr;
    }

    function findNested(obj, value) {
        if (obj.text && (obj.text.title === value)) {
            return obj;
        } else if (obj.children) {
            for (let i = 0, len = obj.children.length; i < len; i++) {
                const found = findNested(obj.children[i], value);
                if (found) return found;
            }
        }
    }
}

const startWeb3 = async () => { 
  await initWeb3(); 
  await setBank();
  await disposition();
};

startWeb3();