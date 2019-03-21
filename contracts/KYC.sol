pragma solidity >=0.4.21 <0.6.0;

import "./Ownable.sol";

contract KYC is Ownable {

    event ReportedFraudA(
        address indexed fromBank,
        address indexed toBank,
        bytes32 fromAccount,
        bytes32 toAccount,
        uint256 amount,
        uint256 indexed txDate
    );

    event ReportedFraudB(
        address fromBank,
        address toBank,
        bytes32 indexed fromAccount,
        bytes32 indexed toAccount,
        uint256 indexed amount,
        uint256 txDate
    );

    event BankAdded(
        bytes32 indexed name,
        bytes32 indexed bankType
    );

    struct Bank {
        bytes32 name;
        bytes32 bankType;
    }

    struct Fraud {
        address fromBank;
        address toBank;        
        bytes32 fromAccount;
        bytes32 toAccount;
        uint256 amount;
        uint256 txDate;
    }
    
    Fraud[] frauds;

    //bankEthAddr => bank
    mapping (address => Bank) public banks;

    constructor() public {
        //push fraud origin
        frauds.push(Fraud(address(0x0), address(0x0), "", "", 0, 0));
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
    function addBank (address bankAddress, bytes32 name, bytes32 bankType) public onlyOwner {
        //require (banks[bankAddress].name=="");
        //assigned role must exist
        //require (keccak256(abi.encode(role)) == keccak256(abi.encode("A")) || keccak256(abi.encode(role)) == keccak256(abi.encode("B")) || keccak256(abi.encode(role)) == keccak256(abi.encode("C")) || keccak256(abi.encode(role)) == keccak256(abi.encode("D")));
        
        Bank memory bank = Bank(name, bankType);
        banks[bankAddress] = bank;
        emit BankAdded(name, bankType);
    }

    function reportFraud (address fromBank, address toBank, bytes32 fromAccount, bytes32 toAccount, uint256 amount, uint256 txDate) external returns(uint256 fraudID) {

        Fraud memory fraud = Fraud(fromBank, toBank, fromAccount, toAccount, amount, txDate);
        frauds.push(fraud);

        emit ReportedFraudA(fromBank, toBank, fromAccount, toAccount, amount, txDate);
        emit ReportedFraudB(fromBank, toBank, fromAccount, toAccount, amount, txDate);
    }
/*
    function readFraud (uint256 fraudID) external view returns(address, string memory, string memory, uint256, uint256, uint256) {
        Fraud memory fraud = frauds[fraudID];
        return(fraud.bank, fraud.fromAccount, fraud.toAccount, fraud.amount, fraud.fromID, fraud.txDate);
    }   
*/
}