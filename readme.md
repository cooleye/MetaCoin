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

# 创建页面

#### 代码
修改 `/src/app.js`
```
import React, { Component } from 'react'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
//引入MetaCoin.sol编译后的 MetaCoin.json
import MetaCoinContract from '../build/contracts/MetaCoin.json'

import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'
import './css/main.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      accounts:[],  //保存所有账户
      metaCoinInstance:null, //保存合约实例，方便在其他地方调用
      balance:0  //保存查询账户余额
    }
  }

  /**
   * 初始化
   * 把web3保存在state中。
   */
  componentWillMount() {
    console.log("%cmount","color:green")
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
      this.instantiateContract()
    })
    .catch((err) => {
      console.log('Error finding web3.',err)
    })
    
  }

  instantiateContract() {

    const contract = require('truffle-contract')
    const MetaCoin = contract(MetaCoinContract)
    MetaCoin.setProvider(this.state.web3.currentProvider)

    //获取所有账户，用来做列表显示
    this.state.web3.eth.getAccounts((error, accounts) => {
      
      this.setState({
        accounts:accounts
      })

      //部署合约，保存合约实例
      MetaCoin.deployed()
      .then((instance) => {
        this.setState({
          metaCoinInstance:instance
        })
      })

      //设置默认账户。
      MetaCoin.defaults({from:"0x0808e37d8ad6f9568d0f9d515ca4909ebc4e77d1"}) 

    })
  }

  /**
   * 转账
   * 获取输入框中的转账地址
   * 接受地址和金额
   * 合约实例调用 sendCoin方法
   */
  sendCoin(){
      var address_from = this.refs.address_from.value;
      var address_to = this.refs.address_to.value;
      var trans_value = this.refs.trans_value.value;

      console.log('address_from:',address_from)
      if(address_to != "" && trans_value != ""){
        console.log('address_to:',address_to)
        console.log('trans_value:',trans_value)
        
        this.state.metaCoinInstance.sendCoin(address_to,trans_value)
        .then( result => {
            console.log(result)
        })

        //转账完成后吧输入框清空
        this.refs.address_from.value = "";
        this.refs.address_to.value = "";
        this.refs.trans_value.value = "";
      }
  }

  /**
   * 查询余额
   * metaCoinInstance.getBalance(查询地址)
   */
  getBalance(){
      var address_check = this.refs.address_check.value;
      this.state.metaCoinInstance.getBalance(address_check)
      .then( result => {
        //返回的result是一个BigNumber类型数据，toString转出数字字符串
        // console.log(result.toString())
          this.setState({
              balance: result.toString()
          })
          this.refs.address_check.value = ""
      })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1 list-container">
              <h1>账户列表</h1>
              <div>
                { this.state.accounts.map( acc => <div className="list-item" key={acc}>{acc}</div> ) }
              </div>
              <div>转出：<input ref="address_from"/></div>
              <div>转入：<input ref="address_to"/></div>
              <div>金额：<input ref="trans_value"/></div>
              <div><button onClick={this.sendCoin.bind(this)}>确定</button></div> 
              
              <div>
                <h1>查询余额</h1>
                <h3>余额：{this.state.balance}</h3>
                <div>地址：<input ref="address_check"/></div>
                <div><button onClick={this.getBalance.bind(this)}>查询</button></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
```
# 代码解析
##### 需要注意地方：
设置默认账户
```
//设置默认账户。
      MetaCoin.defaults({from:"0x0808e37d8ad6f9568d0f9d515ca4909ebc4e77d1"}) 
```
这里我把第0个账户，也就是coinbase地址设置为默认账户；

这个项目用到了react，对react不熟悉的同学需要先去看一下react，这里我简单说一下执行过程。
#### 保存状态
首先我在 state中保存一些状态
```
 this.state = {
      storageValue: 0,
      web3: null,
      accounts:[],  //保存所有账户
      metaCoinInstance:null, //保存合约实例，方便在其他地方调用
      balance:0  //保存查询账户余额
    }
```
#### 初始化
`componentWillMount `是react中的一个生命周期函数，他会在组件加载完成后自动执行，我们在这个函数里完成初始化操作。
可以看到，首先获取了web3
```
getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
      this.instantiateContract()
    })
    .catch((err) => {
      console.log('Error finding web3.',err)
    })
```
然后初始化合约 `instantiateContract`
```
 instantiateContract() {

    const contract = require('truffle-contract')
    const MetaCoin = contract(MetaCoinContract)
    MetaCoin.setProvider(this.state.web3.currentProvider)

    //获取所有账户，用来做列表显示
    this.state.web3.eth.getAccounts((error, accounts) => {
      
      this.setState({
        accounts:accounts
      })

      //部署合约，保存合约实例
      MetaCoin.deployed()
      .then((instance) => {
        this.setState({
          metaCoinInstance:instance
        })
      })

      //设置默认账户。
      MetaCoin.defaults({from:"0x0808e37d8ad6f9568d0f9d515ca4909ebc4e77d1"}) 

    })
  }
```
`this.state.web3.eth.getAccounts`获取所有账户，并且保存在state中。
`MetaCoin.deployed`部署合约，把合约实例`instance `也保存在state中。
这是默认账户
```
 MetaCoin.defaults({from:"0x0808e37d8ad6f9568d0f9d515ca4909ebc4e77d1"}) 

```
#### 页面显示
`render`函数中渲染页面显示的内容
```
 render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1 list-container">
              <h1>账户列表</h1>
              <div>
                { this.state.accounts.map( acc => <div className="list-item" key={acc}>{acc}</div> ) }
              </div>
              <div>转出：<input ref="address_from"/></div>
              <div>转入：<input ref="address_to"/></div>
              <div>金额：<input ref="trans_value"/></div>
              <div><button onClick={this.sendCoin.bind(this)}>确定</button></div> 
              
              <div>
                <h1>查询余额</h1>
                <h3>余额：{this.state.balance}</h3>
                <div>地址：<input ref="address_check"/></div>
                <div><button onClick={this.getBalance.bind(this)}>查询</button></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
```
#### 账户列表显示
```
  { this.state.accounts.map( acc => <div className="list-item" key={acc}>{acc}</div> ) }
```
输入转出地址，转地址
```
<div>转出：<input ref="address_from"/></div>
              <div>转入：<input ref="address_to"/></div>
              <div>金额：<input ref="trans_value"/></div>
              <div><button onClick={this.sendCoin.bind(this)}>确定</button></div> 
```
#### 转账
点击确定按钮，执行sendCoin方法
```
 sendCoin(){
      var address_from = this.refs.address_from.value;
      var address_to = this.refs.address_to.value;
      var trans_value = this.refs.trans_value.value;

      console.log('address_from:',address_from)
      if(address_to != "" && trans_value != ""){
        console.log('address_to:',address_to)
        console.log('trans_value:',trans_value)
        
        this.state.metaCoinInstance.sendCoin(address_to,trans_value)
        .then( result => {
            console.log(result)
        })

        //转账完成后吧输入框清空
        this.refs.address_from.value = "";
        this.refs.address_to.value = "";
        this.refs.trans_value.value = "";
      }
  }
```
在`sendCoin`方法中，获取输入的地址和金额，执行`this.state.metaCoinInstance.sendCoin(address_to,trans_value)`完成转账操作。

#### 余额查询

账户的余额查询也是类似。获取查询地址，通过`this.state.metaCoinInstance.getBalance(address_check)`查询余额。

[获取源码](https://github.com/cooleye/MetaCoin)