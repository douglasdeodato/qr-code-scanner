const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors'); // Adicione cors para permitir requisições do frontend
const PORT = process.env.PORT || 3001;

// Middleware para parsear JSON
app.use(express.json());
app.use(cors()); // Permite requisições de qualquer origem

// Rota para salvar QR Codes
app.post('/api/save-confirmed-qr', (req, res) => {
  try {
    const newQRCodes = req.body;
    console.log('QR Codes recebidos:', newQRCodes);

    // Caminho absoluto para o arquivo JSON
    const filePath = path.join(__dirname, 'confirmed_qrcodes.json');
    console.log('Caminho do arquivo:', filePath);

    // Ler conteúdo existente
    let confirmedQRs = [];
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      confirmedQRs = JSON.parse(fileContent);
    } catch (readError) {
      console.log('Criando novo arquivo de QR Codes');
    }

    // Adicionar novos QR Codes únicos
    newQRCodes.forEach(qrCode => {
      if (!confirmedQRs.includes(qrCode)) {
        confirmedQRs.push(qrCode);
      }
    });

    // Salvar arquivo
    fs.writeFileSync(filePath, JSON.stringify(confirmedQRs, null, 2));
    
    console.log('QR Codes salvos:', confirmedQRs);
    
    res.status(200).json({ 
      message: 'QR Codes salvos com sucesso!',
      savedQRCodes: newQRCodes 
    });
  } catch (error) {
    console.error('Erro ao salvar QR Codes:', error);
    res.status(500).json({ message: 'Erro ao salvar QR Codes' });
  }
});

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});