import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ConfirmedNames = () => {
  const [confirmedRegistrations, setConfirmedRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConfirmedRegistrations = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/get-confirmed-qr');
        const data = await response.json();
        
        if (response.ok) {
          // Processa os dados para garantir que estão no formato correto
          const registrations = data.savedQRCodes || [];
          
          // Converte itens antigos (strings simples) para o novo formato
          const processedRegistrations = registrations.map(item => {
            if (typeof item === 'string') {
              return {
                qrCode: item,
                name: 'Registro Antigo',
                email: 'Sem email',
                registrationDate: 'Desconhecida'
              };
            }
            return item;
          });
          
          setConfirmedRegistrations(processedRegistrations);
        } else {
          setError('Erro ao buscar registros: ' + (data.message || 'Erro desconhecido'));
        }
      } catch (error) {
        console.error('Erro ao buscar registros confirmados:', error);
        setError('Falha ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmedRegistrations();
  }, []);

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Desconhecida') return 'Desconhecida';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2>Registros Confirmados</h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Carregando registros...</p>
        </div>
      ) : error ? (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#FFBABA', 
          color: '#D8000C', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <p>{error}</p>
        </div>
      ) : confirmedRegistrations.length > 0 ? (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Nome</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>QR Code</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Data de Registro</th>
            </tr>
          </thead>
          <tbody>
            {confirmedRegistrations.map((registration, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{registration.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{registration.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px', wordBreak: 'break-all' }}>{registration.qrCode}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                  {formatDate(registration.registrationDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
        Não há registros confirmados ainda.
      </p>
    )}
    
    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
      <Link 
        to="/" 
        style={{ 
          color: 'white', 
          backgroundColor: '#2196F3', 
          padding: '10px 15px', 
          textDecoration: 'none',
          borderRadius: '4px'
        }}
      >
        Voltar para o Leitor de QR Code
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

export default ConfirmedNames;