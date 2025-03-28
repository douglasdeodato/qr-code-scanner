import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

const QRCodeReader = () => {
  const [qrData, setQrData] = useState(null);
  const [message, setMessage] = useState('');
  const [confirmedQRs, setConfirmedQRs] = useState([]);
  const videoRef = useRef(null);

  // Lista de QR Codes válidos
  const validQRs = [
    'https://www.qrcode-monkey.com',
    'https://example.com',
  ];

  // Função para verificar se o QR Code está na lista de válidos
  const checkQRCode = (data) => {
    return validQRs.includes(data);
  };

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    if (videoRef.current) {
      codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result) {
          const scannedData = result.getText();
          console.log('QR Code lido:', scannedData);

          setQrData(scannedData);
          const isValid = checkQRCode(scannedData);

          if (isValid) {
            // Mensagem de sucesso
            setMessage('QR Code confirmado! Possuímos ele na lista.');
            
            // Salva apenas QR Codes confirmados
            setConfirmedQRs((prevConfirmedQRs) => {
              // Verifica se o QR Code já não está na lista
              if (!prevConfirmedQRs.includes(scannedData)) {
                const newConfirmedQRs = [...prevConfirmedQRs, scannedData];
                
                // Salva apenas os QR Codes confirmados
                saveConfirmedQRs(newConfirmedQRs);
                return newConfirmedQRs;
              }
              return prevConfirmedQRs;
            });
          } else {
            // Mensagem de erro se o QR Code não for válido
            setMessage('Este QR Code não está na lista.');
          }
        }
        if (err) {
          console.error(err);
        }
      });
    }

    return () => {
      codeReader.reset();
    };
  }, []);

  // Função para salvar os QR Codes confirmados
  const saveConfirmedQRs = async (data) => {
    try {
      const response = await fetch('http://localhost:3001/api/save-confirmed-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Envia apenas os QR Codes confirmados
        body: JSON.stringify(data), 
      });

      // Adicione log de resposta
      const responseData = await response.json();
      console.log('Resposta do servidor:', responseData);

      if (response.ok) {
        console.log('QR Codes salvos com sucesso!');
      } else {
        console.error('Erro ao salvar os QR Codes.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };

  return (
    <div>
      <h2>Leitor de QR Code</h2>
      <div>
        <h3>Escaneie um QR Code com a câmera:</h3>
        <video ref={videoRef} style={{ width: '30%', height: 'auto' }} />
      </div>
      {qrData && <div><h3>Resultado do QR Code:</h3><p>{qrData}</p></div>}
      {message && (
        <div
          style={{
            // Define a cor baseada na mensagem
            color: message.includes('confirmado') ? 'green' : 'red',
            fontWeight: 'bold',
            marginTop: '10px',
          }}
        >
          {message}
        </div>
      )}
      
      {/* Mostra a lista de QR Codes confirmados */}
      {confirmedQRs.length > 0 && (
        <div>
          <h3>QR Codes Confirmados:</h3>
          <ul>
            {confirmedQRs.map((qr, index) => (
              <li key={index}>{qr}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QRCodeReader;