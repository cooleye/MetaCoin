pragma solidity ^0.4.18;


contract MetaCoin {
	mapping (address => uint) balances;

	function MetaCoin() {
		balances[msg.sender] = 500000;
	}

	function sendCoin(address receiver, uint amount)public returns(bool sufficient) {
		if (balances[msg.sender] < amount) return false;
		balances[msg.sender] -= amount;
		balances[receiver] += amount;
		return true;
	}

	function getBalance(address addr) constant returns(uint) {
  	return balances[addr];
	}
}