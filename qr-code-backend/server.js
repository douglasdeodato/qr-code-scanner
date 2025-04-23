const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3001;

// Habilitar CORS para permitir requisições do frontend
app.use(cors());

// Para receber dados JSON nas requisições
app.use(express.json());

// Caminho do arquivo JSON onde os QR Codes confirmados serão armazenados
const confirmedQRCodeFile = path.join(__dirname, 'confirmed_qrcodes.json');

// Rota para salvar os QR Codes confirmados
app.post('/api/save-confirmed-qr', (req, res) => {
  const confirmedQRs = req.body;

  // Verifica se há dados para salvar
  if (!Array.isArray(confirmedQRs)) {
    return res.status(400).json({ message: 'Os dados fornecidos não são um array.' });
  }

  try {
    // Salva os QR Codes confirmados no arquivo JSON
    fs.writeFileSync(confirmedQRCodeFile, JSON.stringify(confirmedQRs, null, 2));
    res.status(200).json({ message: 'QR Codes confirmados salvos com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar QR Codes:', error);
    res.status(500).json({ message: 'Erro ao salvar QR Codes.' });
  }
});

// Rota para registrar uma pessoa com QR code
app.post('/api/register-person', (req, res) => {
  const { qrCode, name, email } = req.body;
  
  if (!qrCode || !name || !email) {
    return res.status(400).json({ message: 'Dados incompletos. QR Code, nome e email são obrigatórios.' });
  }
  
  try {
    // Lê os dados existentes
    let confirmedQRs = [];
    try {
      const fileContent = fs.readFileSync(confirmedQRCodeFile, 'utf8');
      confirmedQRs = JSON.parse(fileContent);
    } catch (error) {
      // Arquivo pode não existir ainda ou estar vazio
      confirmedQRs = [];
    }
    
    // Verifica se é um array ou converte para array
    if (!Array.isArray(confirmedQRs)) {
      confirmedQRs = [];
    }
    
    // Verifica se este QR code já existe
    const existingIndex = confirmedQRs.findIndex(entry => 
      typeof entry === 'object' && entry.qrCode === qrCode);
    
    if (existingIndex !== -1) {
      // Atualiza entrada existente
      confirmedQRs[existingIndex] = {
        qrCode,
        name,
        email,
        registrationDate: new Date().toISOString()
      };
    } else {
      // Adiciona nova entrada
      confirmedQRs.push({
        qrCode,
        name,
        email,
        registrationDate: new Date().toISOString()
      });
    }
    
    // Salva os dados atualizados
    fs.writeFileSync(confirmedQRCodeFile, JSON.stringify(confirmedQRs, null, 2));
    res.status(200).json({ message: 'Pessoa registrada com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar pessoa:', error);
    res.status(500).json({ message: 'Erro ao registrar pessoa.' });
  }
});

// Rota para adicionar QR Codes válidos
app.post('/api/add-valid-qr', (req, res) => {
  const { urls } = req.body;
  
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ message: 'Nenhum URL válido fornecido.' });
  }
  
  try {
    // Caminho do arquivo para QR codes válidos
    const validQRsFile = path.join(__dirname, 'valid_qrcodes.json');
    
    // Lê os QR codes válidos existentes
    let validQRs = [];
    try {
      const fileContent = fs.readFileSync(validQRsFile, 'utf8');
      validQRs = JSON.parse(fileContent);
    } catch (error) {
      // Arquivo pode não existir ainda
      validQRs = [];
    }
    
    // Adiciona novos URLs
    urls.forEach(url => {
      if (!validQRs.includes(url)) {
        validQRs.push(url);
      }
    });
    
    // Salva a lista atualizada
    fs.writeFileSync(validQRsFile, JSON.stringify(validQRs, null, 2));
    
    res.status(200).json({ message: 'QR Codes válidos adicionados com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar QR Codes válidos:', error);
    res.status(500).json({ message: 'Erro ao adicionar QR Codes válidos.' });
  }
});

// Rota para obter QR Codes válidos
app.get('/api/get-valid-qr', (req, res) => {
  try {
    // Caminho do arquivo para QR codes válidos
    const validQRsFile = path.join(__dirname, 'valid_qrcodes.json');
    
    // Lê os QR codes válidos
    let validQRs = [];
    try {
      const fileContent = fs.readFileSync(validQRsFile, 'utf8');
      validQRs = JSON.parse(fileContent);
    } catch (error) {
      // Arquivo pode não existir ainda
      validQRs = [];
    }
    
    res.status(200).json({ validQRCodes: validQRs });
  } catch (error) {
    console.error('Erro ao obter QR Codes válidos:', error);
    res.status(500).json({ message: 'Erro ao obter QR Codes válidos.' });
  }
});

// Rota para obter os QR Codes confirmados
app.get('/api/get-confirmed-qr', (req, res) => {
  try {
    // Lê o conteúdo do arquivo JSON com os QR Codes confirmados
    let confirmedQRs = [];
    try {
      const fileContent = fs.readFileSync(confirmedQRCodeFile, 'utf8');
      confirmedQRs = JSON.parse(fileContent);
    } catch (error) {
      // Arquivo pode não existir ainda ou estar vazio
      confirmedQRs = [];
    }

    // Retorna os QR Codes confirmados
    res.status(200).json({ savedQRCodes: confirmedQRs });
  } catch (error) {
    console.error('Erro ao obter QR Codes confirmados:', error);
    res.status(500).json({ message: 'Erro ao obter QR Codes confirmados.' });
  }
});

// Rota padrão
app.get('/', (req, res) => {
  res.send('API do QR Code está funcionando!');
});

// Inicializa o servidor na porta configurada
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});