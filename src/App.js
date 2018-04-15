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
