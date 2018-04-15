# 介绍
这次我们又要学习一个东西叫unbox
>This box comes with everything you need to start using smart contracts from a react app. This is as barebones as it gets, so nothing stands in your way.


这是个啥呢，它里面有很多框架可以让我们开发啊的时候使用。比如你可以放里面放react、redux、Authentication、[react-uport](http://truffleframework.com/boxes/react-uport)、[pet-shop](http://truffleframework.com/boxes/pet-shop)、[webpack](http://truffleframework.com/boxes/webpack)。

简单来说就是可以让我们用react来快速创建工程，开发智能合约。

# 创建项目
参考：https://github.com/truffle-box/react-box
首先创建一个目录
```
mkdir metacoin
cd metacoin
```
创建项目
```
truffle unbox react
Downloading...
Unpacking...
Setting up...
Unbox successful. Sweet!

Commands:

  Compile:              truffle compile
  Migrate:              truffle migrate
  Test contracts:       truffle test
  Test dapp:            npm test
  Run dev server:       npm run start
  Build for production: npm run build
```

# 测试一下
#### 启动开发控制台
```
truffle develop
```
#### 编译和移植
```
compile
migrate
```
#### 启动前端
另开启一个命令窗口
```
npm run start
```
webpack-dev-server会自动打开浏览器
如果报错
`Uncaught (in promise) Error: Contract has not been deployed to detected network (network/artifact mismatch)`
参看上一篇解决办法：
https://www.jianshu.com/p/a685a0b2e2f1
一切正常的话，浏览器显示
![image.png](https://upload-images.jianshu.io/upload_images/4834364-e99974ce80d29a4a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 创建代币
那接下来我们就要创建自己的代币啦，\(≧▽≦)/激动
在 `contracts`目录下新建  `MetaCoin.sol`
```
pragma solidity ^0.4.0;


contract MetaCoin {
	mapping (address => uint) balances;

	function MetaCoin() {
		balances[tx.origin] = 500000;
	}

	function sendCoin(address receiver, uint amount) returns(bool sufficient) {
		if (balances[msg.sender] < amount) return false;
		balances[msg.sender] -= amount;
		balances[receiver] += amount;
		return true;
	}

	function getBalance(address addr) returns(uint) {
  	return balances[addr];
	}
}
```
打开 `migrations/2_deploy_contracts.js`,添加 MetaCoin，修改如下
```
var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");


module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(MetaCoin);
};
```
# 部署合约
启动truffle控制台
```
truffle console
```
编译、移植
```
truffle compile 
truffle migrate
```
部署合约
```
let cont;
MetaCoin.deployed().then( ins => cont = ins)
```
# 查看

查看coinbase余额
```
cont.getBalance(web3.eth.coinbase)
BigNumber { s: 1, e: 5, c: [ 500000 ] }
cont.getBalance(web3.eth.accounts[0])
BigNumber { s: 1, e: 5, c: [ 500000 ] }
```
第0个账户，也就是coinbase，有50000个以太币。

# 转账
接下来，我们往第一个账户转账试试
首先查看第一个账户余额
```
truffle(development)> cont.getBalance(web3.eth.accounts[1])
BigNumber { s: 1, e: 0, c: [ 0 ] }
```
余额是0；
转账
```
cont.sendCoin(web3.eth.accounts[1],2)
{ tx: '0x588f8f75294f2bc45ebf67bcd400d4981c2cf2a0be372a991ba31629374c8049',
  receipt:
   { transactionHash: '0x588f8f75294f2bc45ebf67bcd400d4981c2cf2a0be372a991ba31629374c8049',
     transactionIndex: 0,
     blockHash: '0x703a36c0761ecc1b267db1e0160d34bd502e036c0af6b58db987fdaddfbe573b',
     blockNumber: 36,
     gasUsed: 49110,
     cumulativeGasUsed: 49110,
     contractAddress: null,
     logs: [],
     status: 1 },
  logs: [] }
truffle(development)>
```
在此查看余额
```
truffle(development)> cont.getBalance(web3.eth.coinbase)
BigNumber { s: 1, e: 5, c: [ 499998 ] }
truffle(development)> cont.getBalance(web3.eth.accounts[1])
BigNumber { s: 1, e: 0, c: [ 2 ] }
```

