import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QRCodeReader from './QRCodeReader';
import ConfirmedNames from './ConfirmedNames'; // Corrigido para ConfirmedNames.js

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<QRCodeReader />} />
          <Route path="/confirmed-names" element={<ConfirmedNames />} /> {/* Corrigido o caminho */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
