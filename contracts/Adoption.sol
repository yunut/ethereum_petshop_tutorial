pragma solidity ^0.5.0;

contract Adoption {
	address[16] public adopters;
	address payable owner;
	
	constructor () public {
		owner = address(0x7dB25Eaf16F2cF1CC8F57A0d778e3df192D4FaB7);
	}
	
	function adopt(uint petId) public payable returns (uint) {
		require(petId >= 0 && petId <= 15);
		require(msg.value == 0.01 ether);
		adopters[petId] = msg.sender;
		owner.transfer(msg.value);
		return petId;
	}

	function getAdopters() public view returns (address[16] memory) {
		return adopters;
	}
}
