import React from 'react';
import './styles/globals.css'
import Dashboard from "./components/dashboard";
import {QueryClient, QueryClientProvider} from "react-query";

const queryClient = new QueryClient()


function App() {
  return (
      <QueryClientProvider client={queryClient}>
          <div>
            <Dashboard/>
          </div>
      </QueryClientProvider>
  );
}

export default App;
