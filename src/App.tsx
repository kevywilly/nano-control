import React from 'react';
import './App.css';
import Dashboard from "./components/dashboard";
import {QueryClient, QueryClientProvider} from "react-query";

const queryClient = new QueryClient()


function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <div className="w-full h-full">
            <Dashboard/>
        </div>
      </QueryClientProvider>
  );
}

export default App;
