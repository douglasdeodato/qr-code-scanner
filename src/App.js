import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QRCodeReader from './QRCodeReader';
import ConfirmedNames from './ConfirmedNames';
import QRGenerator from './QRGenerator';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<QRCodeReader />} />
          <Route path="/confirmed-names" element={<ConfirmedNames />} />
          <Route path="/qr-generator" element={<QRGenerator />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;