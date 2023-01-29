import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetUser } from '../contexts/UserContext'
import PositionComponent from '../components/PositionComponent'
import "../css/Dashboard.css"
import "../css/DashboardHistory.css"

export default function Dashboard() {
  const uuid = useGetUser()
  const navigate = useNavigate()
  
  const [isAddHidden, setIsAddHidden] = useState(true)

  const [positionsJson, setPositionsJson] = useState([])
  const [page, setPage] = useState(window.location.hash)

  const addPosRef = useRef()
  const stockNameRef = useRef()
  const amountRef = useRef()
  const priceRef = useRef()

  const [stockNames, setStockNames] = useState([])

  const apiLink = "http://localhost:3001/"

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
  
  return (
    <>
      <div className='main-container'>
        {page === "#history" ? buildHistoryPage() : <></>}
        <div className='navbar-container'>
          <button onClick={() => setPageHash("home")}><i class="fa-solid fa-house"></i>Home</button>
          <button onClick={() => setPageHash("history")} className='nav-active'><i class="fa-solid fa-clock-rotate-left"></i>History</button>
          <button onClick={() => setPageHash("settings")}><i class="fa-solid fa-gear"></i>Settings</button>
        </div>
      </div>
    </>
  )
}