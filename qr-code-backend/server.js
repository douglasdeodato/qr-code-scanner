const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

app.use(express.json()); // Para que o express consiga entender JSON no corpo das requisições

// Endpoint para salvar os QR Codes confirmados
app.post('/api/save-confirmed-qr', (req, res) => {
  const qrCodes = req.body; // Os QR Codes confirmados enviados pelo frontend

  console.log('Recebendo QR Codes:', qrCodes); // Debug: Exibe os QR Codes recebidos

  // Caminho para o arquivo JSON
  const filePath = path.join(__dirname, 'confirmed_qrcodes.json');
  console.log('Caminho do arquivo JSON:', filePath); // Debug: Verificando o caminho do arquivo

  // Lê o arquivo existente (se existir), senão cria um array vazio
  fs.readFile(filePath, 'utf8', (err, data) => {
    let confirmedQRs = [];
    
    if (err && err.code !== 'ENOENT') {
      console.error('Erro ao ler o arquivo:', err); // Debug: Exibe erros ao ler o arquivo
      return res.status(500).json({ message: 'Erro ao ler o arquivo.' });
    }

    // Se o arquivo existir e não estiver vazio, parseia o conteúdo
    if (data) {
      confirmedQRs = JSON.parse(data);
      console.log('Dados existentes no arquivo:', confirmedQRs); // Debug: Exibe os dados existentes no arquivo
    }

    // Adiciona os novos QR Codes confirmados à lista
    confirmedQRs.push(...qrCodes);

    // Salva o arquivo JSON atualizado
    fs.writeFile(filePath, JSON.stringify(confirmedQRs, null, 2), (err) => {
      if (err) {
        console.error('Erro ao salvar o arquivo:', err); // Debug: Exibe erros ao salvar o arquivo
        return res.status(500).json({ message: 'Erro ao salvar o arquivo.' });
      }
      console.log('Arquivo atualizado com sucesso.'); // Debug: Confirma que o arquivo foi salvo
      res.status(200).json({ message: 'QR Code(s) confirmados e salvos!' });
    });
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
