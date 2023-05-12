import React from 'react';
import './App.css';
import Dashboard from "./components/dashboard";
import {QueryClient, QueryClientProvider} from "react-query";

const queryClient = new QueryClient()


function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <div className="w-full p-8">
            <h2 className="text-center text-xl font-extrabold text-indigo-600 mb-8">
                Jetson Rover
            </h2>
            <Dashboard/>
        </div>
      </QueryClientProvider>
  );
}

export default App;
