import React from 'react';
import './App.css';
import Dashboard2 from "./components/dashboard2";
import {QueryClient, QueryClientProvider} from "react-query";

const queryClient = new QueryClient()


function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <div className="w-full h-full">
            <Dashboard2/>
        </div>
      </QueryClientProvider>
  );
}

export default App;
