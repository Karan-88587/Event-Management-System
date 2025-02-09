import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import SignUp from './components/SignUp/SignUp';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import HostEvent from './components/HostEvent/HostEvent';
import Event from './components/HostEvent/Event';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/host-event" element={<HostEvent />} />
            <Route path="/event/:eventId" element={<Event />} />
            <Route path="/edit-event/:eventId" element={<HostEvent />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;