import React from 'react';
import './styles/globals.css'
import Dashboard from "./components/dashboard";
import {QueryClient, QueryClientProvider} from "react-query";
import {BrowserRouter as Router, Route, Routes,} from "react-router-dom";
import Calibrator from "./components/calibrator";
import Training from "./components/training";
import NavBar from "./components/navbar";
import Navigator from "./components/navigator";

const queryClient = new QueryClient()

function App() {
  return (
      <QueryClientProvider client={queryClient}>
          <Router>
              <Routes>
                  <Route path="/" element={<NavBar/>}>
                      <Route path="/" element={<Navigator/>}/>
                      <Route path="/dashboard" element={<Dashboard/>}/>
                      <Route path="/navigator" element={<Navigator/>}/>
                      <Route path="/calibration" element={<Calibrator/>}/>
                      <Route path="/training" element={<Training/>}/>
                  </Route>
              </Routes>
          </Router>

      </QueryClientProvider>
  );
}

export default App;
