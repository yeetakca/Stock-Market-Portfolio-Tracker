import React from 'react'
import { useGetUser } from '../contexts/UserContext'
import "../css/Dashboard.css"

export default function Dashboard() {
  const uuid = useGetUser()
  return (
    <div>
      {uuid
        ? <div>Authorized User {uuid}</div>
        : <div>Not Authorized</div>
      }
    </div>
  )
}