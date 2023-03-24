import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSetUser } from '../contexts/UserContext'
import '../css/Login.css'
import sha256 from 'crypto-js/sha256'

export default function Login() {
  const usernameRef = useRef()
  const passwordRef = useRef()
  const loginButtonRef = useRef()
  const loginFormRef = useRef()

  const setUser = useSetUser()

  const navigate = useNavigate()

  const apiLink = "https://mysql-database-01.herokuapp.com/apis/stock_market_portfolio"
  //const apiLink = "http://localhost:3001/apis/stock_market_portfolio"

  const handleSubmit = (event) => {
    event.preventDefault()
    usernameRef.current.classList.remove("input-error")
    passwordRef.current.classList.remove("input-error")
    if (usernameRef.current.value === "") {
      usernameRef.current.classList.add("input-error")
      return
    }
    if (passwordRef.current.value === "") {
      passwordRef.current.classList.add("input-error")
      return
    }

    loginButtonRef.current.value = "Logging In..."
    fetch(apiLink+"/auth", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: usernameRef.current.value,
        password: `${sha256(passwordRef.current.value)}`
      })
    }).then((res) => res.json()).then((data) => {
      if (data.length === 0) {
        alert("User not found. Username or password is wrong.")
        return
      }
      loginButtonRef.current.classList.add("success-login")
      loginButtonRef.current.value = "Success"
      setTimeout(() => {
        setUser(data[0].uuuid)
        navigate("/#home")
      }, 1000);
    }).catch((err) => {
      alert("Something went wrong. Try again later.")
    }).finally(() => {
      if (loginButtonRef.current.value !== "Success") {
        loginButtonRef.current.value = "Login"
      }
    })
  }

  return (
    <div className='login-main-container'>
        <div className='login-container'>
          <form onSubmit={handleSubmit} ref={loginFormRef}>
            <h1>Login</h1>
            <hr/>
            <label for="username">Username</label>
            <input type='text' id="username" ref={usernameRef} />
            <label for="password">Password</label>
            <input type='password' id="password" ref={passwordRef} />
            <hr/>
            <input type="submit" value="Login" ref={loginButtonRef}></input>
          </form>
        </div>
    </div>
  )
}