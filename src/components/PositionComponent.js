import React from 'react'
import '../css/PositionComponent.css'

export default function PositionComponent(props) {
  return (
    <div className={props.positionJson.operation === "A" ? "position-item-container buy" : "position-item-container sell"}>
      <p>{props.positionJson.stock_name}</p>
      <p>{props.positionJson.amount}</p>
      <p>{props.positionJson.price}</p>
    </div>
  )
}
