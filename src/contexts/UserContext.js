import React, { useContext, useState } from 'react'

const getUserContext = React.createContext()
const setUserContext = React.createContext()

export function useGetUser() {
  return useContext(getUserContext)
}

export function useSetUser() {
  return useContext(setUserContext)
}

export function UserContext({ children }) {
  const [userUuid, setUserUuid] = useState(null)
  return (
    <getUserContext.Provider value={userUuid}>
      <setUserContext.Provider value={setUserUuid}>
        {children}
      </setUserContext.Provider>
    </getUserContext.Provider>
  )
}
