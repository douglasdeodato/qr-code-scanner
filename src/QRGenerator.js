// QRGenerator.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode.react';

const QRGenerator = () => {
  const [eventName, setEventName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [baseUrl, setBaseUrl] = useState('https://example.com/register');
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [validQRs, setValidQRs] = useState([]);

  // Busca QR codes válidos existentes
  useEffect(() => {
    const fetchValidQRs = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/get-valid-qr');
        const data = await response.json();
        if (response.ok) {
          setValidQRs(data.validQRCodes || []);
        }
      } catch (error) {
        console.error('Erro ao buscar QR Codes válidos:', error);
      }
    };

    fetchValidQRs();
  }, []);

  const generateCodes = () => {
    if (!eventName.trim()) {
      setMessage('Por favor, informe o nome do evento.');
      return;
    }

    const codes = [];
    for (let i = 0; i < quantity; i++) {
      const uniqueId = `${Date.now()}-${i}`;
      const url = `${baseUrl}?event=${encodeURIComponent(eventName)}&id=${uniqueId}`;
      codes.push(url);
    }
    
    setGeneratedCodes(codes);
    saveValidCodesToServer(codes);
  };

  const saveValidCodesToServer = async (codes) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/add-valid-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: codes }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('QR Codes gerados e salvos com sucesso!');
        // Atualiza a lista de QR codes válidos
        setValidQRs([...validQRs, ...codes]);
      } else {
        setMessage(`Erro: ${data.message}`);
      }
    } catch (error) {
      setMessage('Erro ao salvar QR Codes no servidor.');
      console.error('Erro na requisição:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (url, index) => {
    // Create a link element
    const link = document.createElement('a');
    
    // Create a canvas element to render the QR code for download
    const canvas = document.getElementById(`qr-canvas-${index}`);
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      link.download = `qrcode-${eventName}-${index}.png`;
      link.href = dataUrl;
      link.click();
    } else {
      console.error('Canvas element not found');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Gerador de QR Codes</h2>
      
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="baseUrl" style={{ display: 'block', marginBottom: '5px' }}>URL Base:</label>
          <input 
            type="text" 
            id="baseUrl"
            value={baseUrl} 
            onChange={(e) => setBaseUrl(e.target.value)} 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="eventName" style={{ display: 'block', marginBottom: '5px' }}>Nome do Evento:</label>
          <input 
            type="text" 
            id="eventName"
            value={eventName} 
            onChange={(e) => setEventName(e.target.value)} 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="quantity" style={{ display: 'block', marginBottom: '5px' }}>Quantidade:</label>
          <input 
            type="number" 
            id="quantity"
            value={quantity} 
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
            min="1" 
            max="100"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        
        <button 
          onClick={generateCodes}
          disabled={loading}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? 'Gerando...' : 'Gerar QR Codes'}
        </button>
        
        {message && (
          <p style={{ 
            marginTop: '10px', 
            padding: '10px', 
            backgroundColor: message.includes('sucesso') ? '#DFF2BF' : '#FFBABA',
            color: message.includes('sucesso') ? '#4F8A10' : '#D8000C',
            borderRadius: '4px'
          }}>
            {message}
          </p>
        )}
      </div>
      
      {/* Exibe os QR Codes gerados */}
      {generatedCodes.length > 0 && (
        <div>
          <h3>QR Codes Gerados</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {generatedCodes.map((url, index) => (
              <div key={index} style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
                <div style={{ backgroundColor: '#f0f0f0', padding: '20px', marginBottom: '10px' }}>
                  {/* Real QR Code */}
                  <QRCode 
                    value={url} 
                    size={150} 
                    level={"H"}
                    includeMargin={true}
                    id={`qr-canvas-${index}`}
                    style={{ margin: '0 auto' }}
                  />
                </div>
                <p style={{ fontSize: '12px', wordBreak: 'break-all' }}>{url}</p>
                <button 
                  onClick={() => downloadQRCode(url, index)}
                  style={{ 
                    padding: '5px 10px', 
                    backgroundColor: '#2196F3', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Lista QR Codes válidos existentes */}
      <div style={{ marginTop: '30px' }}>
        <h3>QR Codes Válidos Existentes</h3>
        {validQRs.length > 0 ? (
          <ul style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px', padding: '10px' }}>
            {validQRs.map((url, index) => (
              <li key={index} style={{ marginBottom: '5px', wordBreak: 'break-all' }}>
                {url}
              </li>
            ))}
          </ul>
        ) : (
          <p>Não há QR Codes válidos cadastrados.</p>
        )}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/" style={{ color: 'blue', textDecoration: 'underline' }}>
          Voltar para o Leitor de QR Code
        </Link>
      </div>
    </div>
  );
};

export default QRGenerator;