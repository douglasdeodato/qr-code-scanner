import React, { useState } from 'react';

const RegistrationForm = ({ qrCode, onRegisterSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email) {
      setMessage('Por favor, preencha todos os campos.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await fetch('http://localhost:3001/api/register-person', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrCode, name, email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Registro realizado com sucesso!');
        setName('');
        setEmail('');
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
      } else {
        setMessage(`Erro: ${data.message}`);
      }
    } catch (error) {
      setMessage('Erro ao conectar com o servidor.');
      console.error('Erro na requisição:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h3>Registrar Pessoa</h3>
      <p>QR Code: {qrCode}</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Nome:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          {isSubmitting ? 'Processando...' : 'Registrar'}
        </button>
      </form>
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
  );
};

export default RegistrationForm;