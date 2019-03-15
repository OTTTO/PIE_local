pragma solidity >=0.4.21 <0.6.0;

import "./Ownable.sol";

contract KYC is Ownable {

    event ReportedFraud(
        uint256 fraudID,
        address indexed bank,
        string accountNumber,
        string routingNumber,
        uint256 amount,
        uint256 indexed fromID,
        uint256 txDate,
        uint256 indexed reportedDate
    );

    struct Bank {
        string name;
        string bankType;
    }

    struct Fraud {
        address bank;
        string accountNumber;
        string routingNumber;
        uint256 amount;
        uint256 fromID;
        uint256 timestamp;
    }
    
    Fraud[] frauds;

    //bankEthAddr => bank
    mapping (address => Bank) banks;
  //  uint8 numberOfMembers;

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
        //total members
       // require (numberOfMembers < 55);
       // require bank doesnt exist at this address
        //assigned role must exist
        //require (keccak256(abi.encode(role)) == keccak256(abi.encode("A")) || keccak256(abi.encode(role)) == keccak256(abi.encode("B")) || keccak256(abi.encode(role)) == keccak256(abi.encode("C")) || keccak256(abi.encode(role)) == keccak256(abi.encode("D")));
        
       // numberOfMembers++;
        Bank memory bank = Bank(name, bankType);
        banks[bankAddress] = bank;
    }

    function reportFraud (address bank, string calldata accountNumber, string calldata routingNumber, uint256 amount, uint256 fromID, uint256 txDate, uint256 reportedDate) external returns(uint256 fraudID) {
        fraudID = frauds.length;
        require (fromID < fraudID);

        uint256 time = now;

        Fraud memory fraud = Fraud(bank, accountNumber, routingNumber, amount, fromID, time);
        frauds.push(fraud);

        emit ReportedFraud(fraudID, bank, accountNumber, routingNumber, amount, fromID, txDate, reportedDate);
    }

    function readFraud (uint256 fraudID) external view returns(address, string memory, string memory, uint256, uint256, uint256) {
        Fraud memory fraud = frauds[fraudID];
        return(fraud.bank, fraud.accountNumber, fraud.routingNumber, fraud.amount, fraud.fromID, fraud.timestamp);
    }   


}