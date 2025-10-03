import { useState } from 'react'
import {BrowserRouter as Router, Route, Routes,Navigate} from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage/LandingPage';
import SignUp from './components/SignUp/SignUp';
import Dashboard from './components/WeeklyDashboard/Dashboard';
import TaskDashboard from './components/Task/TaskDashboard';


function App() {

  return (
    <>
     <Router>
      <Routes>
        <Route path='/'element={<LandingPage />} />
        <Route path='/signup' element ={<SignUp />} />
        <Route path='/dashboard' element ={<Dashboard />} />
        <Route path='/tasks' element ={<TaskDashboard />} />
      </Routes>
     </Router>
</>
  )
}

export default App
