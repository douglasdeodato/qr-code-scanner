// src/QRCodeReader.js

import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { saveAs } from 'file-saver';

const QRCodeReader = () => {
  const [qrData, setQrData] = useState(null); // Estado para armazenar o conteúdo do QR Code
  const [message, setMessage] = useState(''); // Estado para mostrar a mensagem de confirmação
  const [validatedQRs, setValidatedQRs] = useState([]); // Estado para armazenar os QR Codes validados
  const [validCodes, setValidCodes] = useState([]); // Estado para armazenar os QR Codes válidos
  const videoRef = useRef(null); // Ref para capturar o elemento de vídeo

  // Função para carregar os QR Codes válidos do arquivo JSON
  const loadValidCodes = async () => {
    try {
      const response = await fetch('/validQRs.json'); // Carrega o arquivo JSON
      const data = await response.json();
      setValidCodes(data.validCodes); // Atualiza o estado com os QR Codes válidos
    } catch (error) {
      console.error('Erro ao carregar QR Codes válidos:', error);
    }
  };

  // Função para verificar se o QR Code lido está na lista
  const checkQRCode = (data) => {
    return validCodes.includes(data); // Verifica se o QR Code está na lista carregada
  };

  // Função para salvar os QR Codes validados em um arquivo JSON
  const saveValidatedQRs = () => {
    const blob = new Blob([JSON.stringify(validatedQRs, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, 'qr_codes_validos.json'); // Salva o arquivo JSON
  };

  // Função para iniciar o leitor de QR Code
  useEffect(() => {
    loadValidCodes(); // Carrega os QR Codes válidos quando o componente for montado

    const codeReader = new BrowserMultiFormatReader();

    if (videoRef.current) {
      codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result) {
          setQrData(result.getText()); // Armazena o conteúdo do QR Code quando detectado
          const isValid = checkQRCode(result.getText()); // Verifica se o QR Code é válido

          if (isValid) {
            setMessage('QR Code confirmado! Possuímos ele na lista.'); // Mensagem de sucesso
            // Adiciona o QR Code validado ao estado
            setValidatedQRs((prevValidatedQRs) => [...prevValidatedQRs, result.getText()]);
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
  }, [validCodes]); // Dependência em validCodes para atualizar o leitor de QR Code

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

      {/* Botão para salvar os QR Codes validados em um arquivo JSON */}
      <button onClick={saveValidatedQRs} style={{ marginTop: '20px' }}>
        Salvar QR Codes Validados em JSON
      </button>
    </div>
  );
};

export default QRCodeReader;
