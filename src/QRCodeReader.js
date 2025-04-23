import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrowserMultiFormatReader } from '@zxing/library';
import RegistrationForm from './RegistrationForm';

const QRCodeReader = () => {
  const [qrData, setQrData] = useState(null);
  const [message, setMessage] = useState('');
  const [confirmedQRs, setConfirmedQRs] = useState([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [validQRs, setValidQRs] = useState([
    'https://www.qrcode-monkey.com',
    'https://example.com',
  ]);
  const [isScanning, setIsScanning] = useState(true);
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  // Função para buscar QR codes válidos do servidor
  useEffect(() => {
    const fetchValidQRs = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/get-valid-qr');
        const data = await response.json();
        if (response.ok && Array.isArray(data.validQRCodes)) {
          setValidQRs(prevValidQRs => {
            // Combine os QR codes hardcoded com os do servidor
            const combinedQRs = [...prevValidQRs];
            data.validQRCodes.forEach(qr => {
              if (!combinedQRs.includes(qr)) {
                combinedQRs.push(qr);
              }
            });
            return combinedQRs;
          });
        }
      } catch (error) {
        console.error('Erro ao buscar QR Codes válidos:', error);
      }
    };

    fetchValidQRs();
  }, []);

  // Função para verificar se o QR Code está na lista de válidos
  const checkQRCode = (data) => {
    return validQRs.includes(data);
  };

  // Função para iniciar o scanner de QR code
  const startScanner = () => {
    if (!codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader();
    }
    
    if (videoRef.current && isScanning) {
      codeReaderRef.current.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result) {
          const scannedData = result.getText();
          console.log('QR Code lido:', scannedData);
          
          // Pausa o scanner após ler um QR code
          setIsScanning(false);
          setQrData(scannedData);
          
          const isValid = checkQRCode(scannedData);
          
          if (isValid) {
            setMessage('QR Code confirmado! Possuímos ele na lista.');
            setShowRegistrationForm(true);
          } else {
            setMessage('Este QR Code não está na lista.');
            setShowRegistrationForm(false);
          }
        }
        if (err) {
          // Ignora erros de não decodificação - são esperados quando não há QR code na câmera
          if (err.name !== 'NotFoundException') {
            console.error('Erro ao ler QR code:', err);
          }
        }
      });
    }
  };

  // Função para parar o scanner
  const stopScanner = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
  };

  // Efeito para gerenciar o ciclo de vida do scanner
  useEffect(() => {
    if (isScanning) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanning]);

  // Função para reiniciar o scanner
  const restartScanner = () => {
    setQrData(null);
    setMessage('');
    setShowRegistrationForm(false);
    setIsScanning(true);
  };

  // Manipular o registro bem-sucedido
  const handleRegistrationSuccess = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/get-confirmed-qr');
      const data = await response.json();
      setConfirmedQRs(data.savedQRCodes || []);
      // Não reinicie o scanner aqui - deixe o usuário decidir quando reiniciar
    } catch (error) {
      console.error('Erro ao buscar QR Codes confirmados:', error);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Leitor de QR Code</h2>
      
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h3>Escaneie um QR Code com a câmera:</h3>
        <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
          <video 
            ref={videoRef} 
            style={{ 
              width: '100%', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              display: isScanning ? 'block' : 'none'
            }} 
          />
          
          {!isScanning && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <p>Scanner pausado</p>
              <button 
                onClick={restartScanner}
                style={{ 
                  padding: '10px 15px', 
                  backgroundColor: '#4CAF50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Escanear Novo QR Code
              </button>
            </div>
          )}
        </div>
      </div>
      
      {qrData && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '5px', 
          border: '1px solid #ddd' 
        }}>
          <h3>Resultado do QR Code:</h3>
          <p style={{ wordBreak: 'break-all' }}>{qrData}</p>
        </div>
      )}
      
      {message && (
        <div
          style={{
            color: message.includes('confirmado') ? 'green' : 'red',
            fontWeight: 'bold',
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: message.includes('confirmado') ? '#f0fff0' : '#fff0f0',
            borderRadius: '5px',
            textAlign: 'center'
          }}
        >
          {message}
        </div>
      )}
      
      {/* Mostra o formulário de registro se o QR code for válido */}
      {showRegistrationForm && qrData && (
        <RegistrationForm 
          qrCode={qrData} 
          onRegisterSuccess={handleRegistrationSuccess} 
        />
      )}
      
      {/* Links de navegação */}
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
        <Link 
          to="/confirmed-names" 
          style={{ 
            color: 'white', 
            backgroundColor: '#2196F3', 
            padding: '10px 15px', 
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          Ver Registros Confirmados
        </Link>
        <Link 
          to="/qr-generator" 
          style={{ 
            color: 'white', 
            backgroundColor: '#FF9800', 
            padding: '10px 15px', 
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          Gerar QR Codes
        </Link>
      </div>
    </div>
  );
};

export default QRCodeReader;