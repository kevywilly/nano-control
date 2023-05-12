import React from 'react';
import logo from './logo.svg';
import './App.css';

const base_path = "http://nano1:5000"
const streaming_path = `${base_path}/stream`
const collect_path = `${base_path}/collect`

function App() {
  return (
    <div className="w-full p-8">
        <h2 className="text-center text-xl font-extrabold text-indigo-600 mb-8">
            Jetson Rover
        </h2>
        <div className="flex flex-row w-full gap-8">
          <img
              className="aspect-square w-1/2 rounded-xl"
              src={streaming_path}
              alt="Jetson Rover Stream"
              content="multipart/x-mixed-replace; boundary=frame"
          />
            <div className="flex flex-col items-center gap-8 w-1/2">
                <h1 className="font-bold text-xl text-center mb-4">Data Collection</h1>
                <p>Hello</p>
            </div>
        </div>
    </div>
  );
}

export default App;
