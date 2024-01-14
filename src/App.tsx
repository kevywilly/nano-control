import React from 'react';
import './styles/globals.css'
import Dashboard from "./components/dashboard";
import {QueryClient, QueryClientProvider} from "react-query";
import {BrowserRouter as Router, Route, Routes,} from "react-router-dom";
import Calibrator from "./components/calibrator";
import Training from "./components/training";
import NavBar from "./components/navbar";
import Navigator from "./components/navigator";
import Navigator2 from "./components/navigator2";

const queryClient = new QueryClient()

function App() {
  return (
      <QueryClientProvider client={queryClient}>
          <Router>
              <Routes>
                  <Route path="/" element={<NavBar/>}>
                      <Route path="/" element={<Navigator2/>}/>
                      <Route path="/dashboard" element={<Dashboard/>}/>
                      <Route path="/navigator" element={<Navigator/>}/>
                      <Route path="/navigator2" element={<Navigator2/>}/>
                      <Route path="/calibration" element={<Calibrator/>}/>
                      <Route path="/training" element={<Training/>}/>
                  </Route>
              </Routes>
          </Router>

      </QueryClientProvider>
  );
}

export default App;
