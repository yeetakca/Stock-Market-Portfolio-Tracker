import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../css/NotFound.css'

export default function NotFound() {
  const [countdown, setCountdown] = useState(5)
  
  const navigate = useNavigate()

  useEffect(() => {
    if (countdown < 0) {
      navigate("/login")
    }
    setTimeout(() => {
      setCountdown(countdown-1)
    }, 1000);
  }, [countdown])

  return (
    <div className='main-container'>
      <div className='info-container'>
        <h1>
          Page not found.
        </h1>
        <hr/>
        <p>
          Returning back to "Login" page in {countdown} seconds.
        </p>
      </div>
    </div>
  )
}
