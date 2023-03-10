import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetUser } from '../contexts/UserContext'
import PositionComponent from '../components/PositionComponent'
import "../css/Dashboard.css"
import "../css/DashboardHistory.css"
import "../css/DashboardHome.css"

export default function Dashboard() {
  const uuid = useGetUser()
  const navigate = useNavigate()
  
  const [isAddHidden, setIsAddHidden] = useState(true)

  const [positionsJson, setPositionsJson] = useState([])
  const [page, setPage] = useState(window.location.hash)

  const [comission, setComission] = useState(0.0007)
  const [comissionBSMV, setComissionBSMV] = useState(0.05)

  const addPosRef = useRef()
  const stockNameRef = useRef()
  const amountRef = useRef()
  const priceRef = useRef()

  const [stockNames, setStockNames] = useState([])

  const apiLink = "https://mysql-database-01.herokuapp.com/"

  useEffect(() => {
    if (uuid === null) {
      navigate("/login")
    }

    fetch(apiLink+"api/getPositions", {
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
    fetch(apiLink+"api/createPosition", {
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
      fetch(apiLink+"api/deletePosition", {
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
            <input type={"button"} value="Buy" onClick={() => addPosition("A")}/>
            <input type={"button"} value="Sell" onClick={() => addPosition("S")}/>
          </div>
        </div>
        <button onClick={toggleContainer}>
          {isAddHidden
            ? <i class="fa-solid fa-plus"></i>
            : <i class="fa-solid fa-xmark"></i>
          }
        </button>
        {positionsJson.map(element => <PositionComponent positionJson={element} deleteFunction={deletePosition}></PositionComponent>)}
      </div>
    )
  }

  function buildHomePage() {
    var portfolioList = []
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
    portfolioList.sort((a, b) => a.open_pos_amount > 0 ? -1 : 1)
    return <div className='home-container'>
      {portfolioList.map((e) => {
        return <div className='pos-card'>
          <p className='stock-name'>{e.stock_name}</p>
          <hr/>
          {e.open_pos_amount !== 0 ? 
            <>
              <p className='open-amount'>Open Position Amount: {e.open_pos_amount}</p>
              <p className='cost'>Cost: {(e.open_pos_payed_money / e.open_pos_amount).toFixed(2)}</p>
            </>
            : <></>
          }
          <p className='PNL'>Total Profit / Loss: {e.PNL.toLocaleString('en-US', {maximumFractionDigits: 2})}</p>
          <p className='payed-comission'>Total Payed Commision: {e.total_payed_commision.toFixed(2)}</p>
        </div>
      })}
    </div>
  }
  
  return (
    <>
      <div className='main-container'>
        {page === "#history" ? buildHistoryPage() : <></>}
        {page === "#home" ? buildHomePage() : <></>}
        <div className='navbar-container'>
          <button onClick={() => setPageHash("home")}><i class="fa-solid fa-house"></i>Home</button>
          <button onClick={() => setPageHash("history")} className='nav-active'><i class="fa-solid fa-clock-rotate-left"></i>History</button>
          <button onClick={() => setPageHash("settings")}><i class="fa-solid fa-gear"></i>Settings</button>
        </div>
      </div>
    </>
  )
}