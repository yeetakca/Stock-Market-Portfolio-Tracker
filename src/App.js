import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import './App.css';
import { UserContext } from './contexts/UserContext';

function App() {
  return (
    <UserContext>
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/login' element={<Login />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </UserContext>
  )
}

export default App;