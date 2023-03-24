import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PositionComponent from '../components/PositionComponent'
import "../css/Dashboard.css"
import "../css/DashboardHistory.css"
import "../css/DashboardHome.css"
import "../css/DashboardSettings.css"
import Cookie from 'js-cookie'

export default function Dashboard() {
  const navigate = useNavigate()

  const [isAddHidden, setIsAddHidden] = useState(true)

  const [positionsJson, setPositionsJson] = useState([])
  const [page, setPage] = useState(window.location.hash)
  const [filter, setFilter] = useState("open")

  const [comission, setComission] = useState(0.0007)
  const [comissionBSMV, setComissionBSMV] = useState(0.05)

  const addPosRef = useRef()
  const stockNameRef = useRef()
  const amountRef = useRef()
  const priceRef = useRef()

  const [stockNames, setStockNames] = useState([])

  var uuid = ""

  //const apiLink = "https://mysql-database-01.herokuapp.com/apis/stock_market_portfolio"
  const apiLink = "http://localhost:3001/apis/stock_market_portfolio"

  useEffect(() => {
    if (!Cookie.get("uuuid")) {
      navigate("/login")
    }

    uuid = Cookie.get("uuuid")

    fetch(apiLink+"/getPositions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uuuid: uuid
      })
    }).then((res) => res.json()).then((data) => {
      setPositionsJson(Object.values(data).reverse())
    }).catch((err) => {
      alert("Something went wrong. Try again later.")
    })
  }, [])

  useEffect(() => {
    addToSuggestion()
  }, [positionsJson])

  const handleUpperCase = () => {
    stockNameRef.current.value = stockNameRef.current.value.toUpperCase()
  }

  function setPageHash(pageHash) {
    window.location.hash = '#' + pageHash;
    setPage(window.location.hash)
  }

  function addToSuggestion() {
    var x = []
    positionsJson.forEach(element => {
      if (x.indexOf(element.stock_name) === -1) {
        x.push(element.stock_name)
      }
    })
    setStockNames(x)
  }

  function addPosition(operation) {
    fetch(apiLink+"/createPosition", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uuuid: uuid,
        stock_name: stockNameRef.current.value,
        operation: operation,
        price: priceRef.current.value,
        amount: amountRef.current.value
      })
    }).then((res) => res.json()).then((data) => {
      if (data === "ERROR") throw "ERROR"
      setPositionsJson([...Object.values(data), ...positionsJson])
      stockNameRef.current.value = ""
      priceRef.current.value = ""
      amountRef.current.value = ""
    }).catch((err) => {
      alert("Something went wrong. Try again later.")
    })
  }

  function deletePosition(puuid) {
    if (window.confirm('Are you sure you want to delete this position?')) {
      fetch(apiLink+"/deletePosition", {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          puuid: puuid
        })
      }).then((res) => res.json()).then((data) => {
        if (data === "ERROR") throw "ERROR"
        var temp = [...positionsJson]
        temp.splice(temp.findIndex((element) => element.puuid === puuid), 1)
        setPositionsJson(temp)
      }).catch((err) => {
        alert("Something went wrong. Try again later.")
      })
    }
  }

  function toggleContainer() {
    addPosRef.current.classList.toggle("hidden")
    if (addPosRef.current.classList.contains("hidden")) {
      setIsAddHidden(true)
    }else {
      setIsAddHidden(false)
    }
  }

  function buildHistoryPage() {
    return (
      <div className='history-container'>
        {positionsJson.length
          ? <>
            <div className='column-name-container'>
              <p>Name</p>
              <p>Amount</p>
              <p>Price</p>
            </div>
          </>
          : <></>
        }
        <div className='add-position-container hidden' ref={addPosRef}>
          <div className='row1'>
            <input type={"text"} placeholder="Stock Name" ref={stockNameRef} onInput={handleUpperCase} list="stockList"/>
            <datalist id="stockList">
                {stockNames.map(element => <option value={element}>{element}</option>)}
            </datalist>
            <input type={"number"} placeholder="Amount" ref={amountRef}/>
            <input type={"number"} placeholder="Price" ref={priceRef} step=".01"/>
          </div>
          <div className='row2'>
            <button onClick={() => addPosition("A")}>Buy</button>
            <button onClick={() => addPosition("S")}>Sell</button>
          </div>
        </div>
        <button onClick={toggleContainer}>
          {isAddHidden
            ? <i class="fa-solid fa-plus"></i>
            : <i class="fa-solid fa-xmark"></i>
          }
        </button>
        <p className='history-info'><i class="fa-regular fa-circle-question"></i> Click to position that you want to delete and confirm.</p>
        {positionsJson.map(element => <PositionComponent positionJson={element} deleteFunction={deletePosition}></PositionComponent>)}
      </div>
    )
  }

  function buildHomePage() {
    var portfolioList = []
    var totalPnl = 0
    var totalCommission = 0
    for (var i = 0; i < positionsJson.length; i++) {
      var position = positionsJson[positionsJson.length-1-i]
      if (portfolioList.filter((e) => e.stock_name === position.stock_name).length > 0) {
        var j = portfolioList.findIndex((e) => e.stock_name === position.stock_name)
        if (portfolioList[j].stock_name === position.stock_name) {
          if (position.operation === "A") {
            portfolioList[j].open_pos_amount += position.amount
            portfolioList[j].total_payed_commision += ((position.amount*position.price)*comission) + (((position.amount*position.price)*comission)*comissionBSMV)
            portfolioList[j].open_pos_payed_money += (position.amount*position.price) + ((position.amount*position.price)*comission) + (((position.amount*position.price)*comission)*comissionBSMV)
          }else {
            portfolioList[j].open_pos_amount -= position.amount
            portfolioList[j].total_payed_commision += ((position.amount*position.price)*comission) + (((position.amount*position.price)*comission)*comissionBSMV)
            portfolioList[j].open_pos_payed_money -= (position.amount*position.price) - ((position.amount*position.price)*comission) - (((position.amount*position.price)*comission)*comissionBSMV)
          }
          if (portfolioList[j].open_pos_amount === 0) {
            portfolioList[j].PNL += -portfolioList[j].open_pos_payed_money
            portfolioList[j].open_pos_payed_money = 0
          }
        }
      }else {
        portfolioList.push({
          "stock_name": position.stock_name,
          "open_pos_amount": position.amount,
          "open_pos_payed_money": (position.amount*position.price) + ((position.amount*position.price)*comission) + (((position.amount*position.price)*comission)*comissionBSMV),
          "PNL": 0,
          "total_payed_commision": ((position.amount*position.price)*comission) + (((position.amount*position.price)*comission)*comissionBSMV)
        })
      }
    }
    portfolioList.sort((a, b) => a.stock_name.localeCompare(b.stock_name))
    for (var i = 0; i < portfolioList.length; i++) {
      totalPnl += portfolioList[i].PNL
      totalCommission += portfolioList[i].total_payed_commision
    }
    return <div className='home-container'>
      {portfolioList.length ?
        <>
          <div className='selection-container'>
            <input className={filter === "open" ? 'selected' : ""} type={"button"} value="Open" onClick={() => setFilter("open")}/>
            <input className={filter === "closed" ? 'selected' : ""} type={"button"} value="Closed" onClick={() => setFilter("closed")}/>
          </div>
          <div className='total-info-container'>
            <div>
              <p>Total P/L</p>
              <hr/>
              <p>{totalPnl.toLocaleString('en-US', {maximumFractionDigits: 2})} ₺</p>
            </div>
            <div>
              <p>Total Payed Commision</p>
              <hr/>
              <p>{totalCommission.toLocaleString('en-US', {maximumFractionDigits: 2})} ₺</p>
            </div>
          </div>
          {portfolioList.filter((e) => filter === "open" ? e.open_pos_amount > 0 : e.open_pos_amount === 0).map((e) => {
            return <div className='pos-card'>
              <p className='stock-name'>{e.stock_name}</p>
              <hr/>
              {e.open_pos_amount !== 0 ? 
                <>
                <div className='open-info'>
                  <p>You have <br/> {e.open_pos_amount.toLocaleString('en-US', {maximumFractionDigits: 2})} lot(s) at the price of {(e.open_pos_payed_money / e.open_pos_amount).toLocaleString('en-US', {maximumFractionDigits: 2})} ₺</p>
                </div>
                </>
                : <></>
              }
              <p className={"PNL " + `${e.PNL > 0 ? "profit" : e.PNL === 0 ? "" : "loss"}`}>Profit / Loss: {e.PNL.toLocaleString('en-US', {maximumFractionDigits: 2})} ₺</p>
              <p className='payed-comission'>Payed Commision: {e.total_payed_commision.toLocaleString('en-US', {maximumFractionDigits: 2})} ₺</p>
            </div>
          })}
        </>
        : <p className='home-info'><i class="fa-regular fa-circle-question"></i> You don't have any logged position. First, please enter a position from history page. <br/><br/> <i class="fa-sharp fa-solid fa-arrow-down"></i></p>
      }
    </div>
  }

  function buildSettingPage() {
    return <div className='settings-container'>
      <button onClick={logout}><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>
    </div>
  }

  function logout() {
    Cookie.remove("uuuid")
    navigate("/login")
  }
  
  return (
    <>
      <div className='main-container'>
        <div className='fixed'></div>
        {page === "" ? buildHomePage() : <></>}
        {page === "#home" ? buildHomePage() : <></>}
        {page === "#history" ? buildHistoryPage() : <></>}
        {page === "#settings" ? buildSettingPage() : <></>}
        <div className='big-navbar-container'>
          <div className='navbar-container'>
            <button onClick={() => setPageHash("home")} className={window.location.hash === "#home" ? "nav-active" : ""}><i class="fa-solid fa-house"></i>Home</button>
            <button onClick={() => setPageHash("history")} className={window.location.hash === "#history" ? "nav-active" : ""}><i class="fa-solid fa-clock-rotate-left"></i>History</button>
            <button onClick={() => setPageHash("settings")} className={window.location.hash === "#settings" ? "nav-active" : ""}><i class="fa-solid fa-gear"></i>Settings</button>
          </div>
        </div>
      </div>
    </>
  )
}