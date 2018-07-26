import React from 'react'
import ReactDOM from 'react-dom'
import CasinoJson from '../../build/contracts/Casino'
import Web3 from 'web3'
import './../css/index.css'
class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            lastWinner: 0,
            numberOfBets: 0,
            minimumBet: 0,
            totalBet: 0,
            maxAmountOfBets: 0,
        }
        if (typeof web3 != 'undefined') {
            console.log("Using web3 detected from external source like Metamask")
            this.web3 = new Web3(web3.currentProvider)
        } else {
            console.log("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
            this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
        }
        const MyContract = new this.web3.eth.Contract(CasinoJson.abi, '0xbb5941ef8cfa83e7d40cdeda416e68ebdfa5c665')
        this.state.ContractInstance = MyContract
    }
    componentDidMount() {
        this.updateState()
        this.setupListeners()
        setInterval(this.updateState.bind(this), 10e3)
        this.web3.eth.getAccounts().then(console.log)
    }
    updateState() {
        this.state.ContractInstance.methods.minimumBet().call((err, result) => {
            if (result != null) {
                this.setState({
                    minimumBet: parseFloat(this.web3.utils.fromWei(result, 'ether'))
                })
            }
        })
        this.state.ContractInstance.methods.totalBet().call((err, result) => {
            if (result != null) {
                this.setState({
                    totalBet: parseFloat(this.web3.utils.fromWei(result, 'ether'))
                })
            }
        })
        this.state.ContractInstance.methods.numberOfBets().call((err, result) => {
            if (result != null) {
                this.setState({
                    numberOfBets: parseInt(result)
                })
            }
        })
        this.state.ContractInstance.methods.maxAmountOfBets().call((err, result) => {
            if (result != null) {
                this.setState({
                    maxAmountOfBets: parseInt(result)
                })
            }
        })
    }
    // Listen for events and executes the voteNumber method
    setupListeners() {
        let liNodes = this.refs.numbers.querySelectorAll('li')
        liNodes.forEach(number => {
            number.addEventListener('click', event => {
                event.target.className = 'number-selected'
                this.voteNumber(parseInt(event.target.innerHTML), done => {
                    // Remove the other number selected
                    for (let i = 0; i < liNodes.length; i++) {
                        liNodes[i].className = ''
                    }
                })
            })
        })
    }
    voteNumber(number, cb) {
        let bet = this.refs['ether-bet'].value
        if (!bet) bet = 0.1
        if (parseFloat(bet) < this.state.minimumBet) {
            alert('You must bet more than the minimum')
            cb()
        } else {
            this.web3.eth.getAccounts().then((accounts) => {
                console.log("accounts：", accounts)
                this.state.ContractInstance.methods.bet(number).send({
                    gas: 300000,
                    from: accounts[0],
                    value: this.web3.utils.toWei(bet, 'ether')
                },(err, result) => {
                    console.log(err)
                    cb()
                })
            })
            
        }
    }

    generateNumberWinner = () => {
        this.state.ContractInstance.methods.generateNumberWinner().call()
    }
    render() {
        return (
            <div className="main-container">
                <h1>Bet for your best number and win huge amounts of Ether</h1>
                <div className="block">
                    <b>Number of bets:</b> &nbsp;
                <span>{this.state.numberOfBets}</span>
                </div>
                <div className="block">
                    <b>Last number winner:</b> &nbsp;
                <span>{this.state.lastWinner}</span>
                </div>
                <div className="block">
                    <b>Total ether bet:</b> &nbsp;
               <span>{this.state.totalBet} ether</span>
                </div>
                <div className="block">
                    <b>Minimum bet:</b> &nbsp;
               <span>{this.state.minimumBet} ether</span>
                </div>
                <div className="block">
                    <b>Max amount of bets:</b> &nbsp;
               <span>{this.state.maxAmountOfBets} ether</span>
                </div>
                <hr />
                <h2>Vote for the next number</h2>
                <label>
                    <b>How much Ether do you want to bet? <input className="bet-input" ref="ether-bet" type="number" placeholder={this.state.minimumBet} /></b> ether
               <br />
                </label>
                <ul ref="numbers">
                    <li>1</li>
                    <li>2</li>
                    <li>3</li>
                    <li>4</li>
                    <li>5</li>
                    <li>6</li>
                    <li>7</li>
                    <li>8</li>
                    <li>9</li>
                    <li>10</li>
                </ul>
                <button onClick={this.generateNumberWinner}>开奖</button>
            </div>
        )
    }
}
ReactDOM.render(
    <App />,
    document.querySelector('#root')
)