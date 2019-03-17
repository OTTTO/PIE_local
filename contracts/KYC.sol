pragma solidity >=0.4.21 <0.6.0;

import "./Ownable.sol";

contract KYC is Ownable {

    event ReportedFraud(
        uint256 fraudID,
        address indexed bank,
        string fromAccount,
        string toAccount,
        uint256 amount,
        uint256 indexed fromID,
        uint256 indexed txDate
    );

    struct Bank {
        string name;
        string bankType;
    }

    struct Fraud {
        address bank;
        string fromAccount;
        string toAccount;
        uint256 amount;
        uint256 fromID;
        uint256 txDate;
    }
    
    Fraud[] frauds;

    //bankEthAddr => bank
    mapping (address => Bank) banks;

    constructor() public {
        //push fraud origin
        frauds.push(Fraud(address(0x0), "", "", 0, 0, 0));
    }
/*
    modifier classA () {
        require (keccak256(abi.encode(members[msg.sender])) == keccak256(abi.encode("A"))); 
        _;
    }

    modifier classB () {
        require (keccak256(abi.encode(members[msg.sender])) == keccak256(abi.encode("B")) || keccak256(abi.encode(members[msg.sender])) == keccak256(abi.encode("A"))); 
        _;
    }

    modifier classC () {
        require (keccak256(abi.encode(members[msg.sender])) == keccak256(abi.encode("C")) || keccak256(abi.encode(members[msg.sender])) == keccak256(abi.encode("B")) || keccak256(abi.encode(members[msg.sender])) == keccak256(abi.encode("A"))); 
        _; 
    }

    modifier classD () {
        require (keccak256(abi.encode(members[msg.sender])) == keccak256(abi.encode("D")) || keccak256(abi.encode(members[msg.sender])) == keccak256(abi.encode("C")) || keccak256(abi.encode(members[msg.sender])) == keccak256(abi.encode("B")) || keccak256(abi.encode(members[msg.sender])) == keccak256(abi.encode("A"))); 
        _; 
    }
*/
    function addMember (address bankAddress, string memory name, string memory bankType) public onlyOwner {
       // require bank doesnt exist at this address
        //assigned role must exist
        //require (keccak256(abi.encode(role)) == keccak256(abi.encode("A")) || keccak256(abi.encode(role)) == keccak256(abi.encode("B")) || keccak256(abi.encode(role)) == keccak256(abi.encode("C")) || keccak256(abi.encode(role)) == keccak256(abi.encode("D")));
        
       // numberOfMembers++;
        Bank memory bank = Bank(name, bankType);
        banks[bankAddress] = bank;
    }

    function reportFraud (address bank, string calldata fromAccount, string calldata toAccount, uint256 amount, uint256 fromID, uint256 txDate) external returns(uint256 fraudID) {
        fraudID = frauds.length;
        require (fromID < fraudID);

        Fraud memory fraud = Fraud(bank, fromAccount, toAccount, amount, fromID, txDate);
        frauds.push(fraud);

        emit ReportedFraud(fraudID, bank, fromAccount, toAccount, amount, fromID, txDate);
    }

    function readFraud (uint256 fraudID) external view returns(address, string memory, string memory, uint256, uint256, uint256) {
        Fraud memory fraud = frauds[fraudID];
        return(fraud.bank, fraud.fromAccount, fraud.toAccount, fraud.amount, fraud.fromID, fraud.txDate);
    }   


}