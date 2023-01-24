import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetUser } from '../contexts/UserContext'
import PositionComponent from '../components/PositionComponent'
import "../css/Dashboard.css"

export default function Dashboard() {
  const uuid = useGetUser()
  const navigate = useNavigate()

  const [positionsJson, setPositionsJson] = useState([])
  const [stockNames, setStockNames] = useState([])

  const stockNameRef = useRef()
  const amountRef = useRef()
  const priceRef = useRef()

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
      setPositionsJson(Object.values(data))
      addToSuggestion()
    }).catch((err) => {
      alert("Something went wrong. Try again later.")
    })
  }, [])

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
      setPositionsJson([...positionsJson, ...Object.values(data)])
      addToSuggestion()
      stockNameRef.current.value = ""
      priceRef.current.value = ""
      amountRef.current.value = ""
    }).catch((err) => {
      alert("Something went wrong. Try again later.")
    })
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

  const handleUpperCase = () => {
    stockNameRef.current.value = stockNameRef.current.value.toUpperCase()
  }
  
  return (
    <>
      <div className='loading-container'>
         
      </div>
      <div className='main-container'>
        <div className='positions-container'>
          <div className='column-name-container'>
            <p>Name</p>
            <p>Amount</p>
            <p>Price</p>
          </div>
          {positionsJson.map(element => <PositionComponent positionJson={element}></PositionComponent>)}
        </div>
        <div className='sticky-position-container'>
          <div className='d1'>
            <input type={"text"} placeholder="Stock Name" ref={stockNameRef} onInput={handleUpperCase} list="stockList"/>
            <datalist id="stockList">
                {stockNames.map(element => <option value={element}>{element}</option>)}
            </datalist>
            <input type={"number"} placeholder="Amount" ref={amountRef}/>
            <input type={"number"} placeholder="Price" ref={priceRef} step=".01"/>
          </div>
          <div className='d2'>
            <input type={"button"} value="Buy" onClick={() => addPosition("A")}/>
            <input type={"button"} value="Sell" onClick={() => addPosition("S")}/>
          </div>
        </div>
      </div>
    </>
  )
}