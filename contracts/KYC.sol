pragma solidity >=0.4.21 <0.6.0;

import "./Ownable.sol";

contract KYC is Ownable {

	event ReportedFraud(
		uint256 indexed fraudID,
		address bank,
		string accountNumber,
		string routingNumber,
		uint256 indexed amount,
		uint256 indexed fromID,
		uint256 time
	);

	struct Fraud {
		address bank;
		string accountNumber;
		string routingNumber;
		uint256 amount;
		uint256 fromID;
		uint256 timestamp;
	}
	
	Fraud[] frauds;
	uint256 numFrauds;

	//member => role
	mapping (address => string) members;
	uint8 numberOfMembers;
	
	//clientName => clientAddress
	mapping (string => string) clients;

	constructor() public {
		//push fraud origin
		frauds.push(Fraud(address(0x0), "", "", 0, 0, 0));
	}

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

	function addMember (address member, string memory role) public onlyOwner {
		//total members
		require (numberOfMembers < 55);

		//assigned role must exist
		require (keccak256(abi.encode(role)) == keccak256(abi.encode("A")) || keccak256(abi.encode(role)) == keccak256(abi.encode("B")) || keccak256(abi.encode(role)) == keccak256(abi.encode("C")) || keccak256(abi.encode(role)) == keccak256(abi.encode("D")));
		
		numberOfMembers++;
		members[member] = role;
	}

	function addClient (string calldata name, string calldata addr) external classB { clients[name] = addr; }

	function getClientAddr (string calldata name) external view returns(string memory addr) { return clients[name]; }

	function reportFraud (address bank, string calldata accountNumber, string calldata routingNumber, uint256 amount, uint256 fromID) external classD returns(uint256 fraudID) {
		fraudID = ++numFrauds;
		require (fromID < fraudID);

		uint256 time = now;

		Fraud memory fraud = Fraud(bank, accountNumber, routingNumber, amount, fromID, time);
		frauds.push(fraud);

		emit ReportedFraud(fraudID, bank, accountNumber, routingNumber, amount, fromID, time);
	}

	function readFraud (uint256 fraudID) external view returns(address, string memory, string memory, uint256, uint256, uint256) {
		Fraud memory fraud = frauds[fraudID];
		return(fraud.bank, fraud.accountNumber, fraud.routingNumber, fraud.amount, fraud.fromID, fraud.timestamp);
	}	


}