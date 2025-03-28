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

// Rota para obter os QR Codes confirmados
app.get('/api/get-confirmed-qr', (req, res) => {
  try {
    // Lê o conteúdo do arquivo JSON com os QR Codes confirmados
    const fileContent = fs.readFileSync(confirmedQRCodeFile, 'utf8');
    const confirmedQRs = JSON.parse(fileContent);

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
