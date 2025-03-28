import React, { useState, useEffect } from 'react';

const ConfirmedNames = () => {
  const [confirmedQRs, setConfirmedQRs] = useState([]);

  useEffect(() => {
    const fetchConfirmedQRs = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/get-confirmed-qr');
        const data = await response.json();
        setConfirmedQRs(data.savedQRCodes || []);
      } catch (error) {
        console.error('Erro ao buscar QR Codes confirmados:', error);
      }
    };

    fetchConfirmedQRs();
  }, []);

  return (
    <div>
      <h2>QR Codes Confirmados</h2>
      {confirmedQRs.length > 0 ? (
        <ul>
          {confirmedQRs.map((qr, index) => (
            <li key={index}>{qr}</li>
          ))}
        </ul>
      ) : (
        <p>Não há QR Codes confirmados ainda.</p>
      )}
    </div>
  );
};

export default ConfirmedNames;
