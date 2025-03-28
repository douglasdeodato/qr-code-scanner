import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

const QRCodeReader = () => {
  const [qrData, setQrData] = useState(null); // Estado para armazenar o conteúdo do QR Code
  const [message, setMessage] = useState(''); // Estado para mostrar a mensagem de confirmação
  const [confirmedQRs, setConfirmedQRs] = useState([]); // Estado para armazenar QR Codes confirmados
  const videoRef = useRef(null); // Ref para capturar o elemento de vídeo

  // Lista de QR Codes válidos diretamente no código
  const validQRs = [
    'https://www.qrcode-monkey.com', // Removido o QR Code de exemplo
    'https://example.com',
  ];

  // Função para verificar se o QR Code lido está na lista
  const checkQRCode = (data) => {
    return validQRs.includes(data); // Verifica se o dado do QR Code está na lista
  };

  // Função para iniciar o leitor de QR Code
  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader(); // Cria uma instância do leitor de QR Code

    if (videoRef.current) {
      codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result) {
          const scannedData = result.getText();
          console.log('QR Code lido:', scannedData);  // Depuração

          setQrData(scannedData); // Armazena o conteúdo do QR Code quando detectado
          const isValid = checkQRCode(scannedData); // Verifica se o QR Code é válido

          if (isValid) {
            setMessage('QR Code confirmado! Possuímos ele na lista.'); // Mensagem de sucesso
            setConfirmedQRs((prevConfirmedQRs) => {
              // Adiciona o QR Code confirmado à lista
              const newConfirmedQRs = [...prevConfirmedQRs, scannedData];
              saveConfirmedQRs(newConfirmedQRs); // Enviar os dados para o servidor
              return newConfirmedQRs;
            });
          } else {
            setMessage('Este QR Code não está na lista.'); // Mensagem de erro
          }
        }
        if (err) {
          console.error(err); // Caso haja erro durante a leitura
        }
      });
    }

    // Cleanup: limpar quando o componente for desmontado
    return () => {
      codeReader.reset(); // Resetando o leitor
    };
  }, []); // A dependência foi removida para evitar re-renderizações desnecessárias

  // Função para salvar os QR Codes confirmados no servidor
  const saveConfirmedQRs = async (data) => {
    try {
      const response = await fetch('/api/save-confirmed-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmedQRs: data }), // Envia os dados dos QR Codes confirmados
      });
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
            color: message.includes('confirmado') ? 'green' : 'red',
            fontWeight: 'bold',
            marginTop: '10px',
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default QRCodeReader;
