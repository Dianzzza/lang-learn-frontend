
import { useEffect, useState } from 'react';
import { io, Socket } from "socket.io-client";

interface WelcomeData {
  msg: string;
}

interface BroadcastMessage {
  from: string;
  text: string;
}

let socket: Socket | null = null;

export default function SocketTester() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Łączenie z backendem (zmień port, jeśli inny)
    socket = io('http://localhost:4000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('✅ Połączono z Socket.IO:', socket?.id);
    });

    socket.on('welcome', (data: WelcomeData) => {
      setMessages((m) => [...m, `server: ${data.msg}`]);
    });

    socket.on('broadcast:message', (data: BroadcastMessage) => {
      setMessages((m) => [...m, `od ${data.from}: ${data.text}`]);
    });

    // Sprzątanie po odłączeniu komponentu
    return () => {
      if (socket) {
        socket.disconnect();
        socket.off();
      }
    };
  }, []);

  const sendHello = (): void => {
    if (socket) {
      socket.emit('client:hello', { text: 'Hej z frontu!' });
      setMessages((m) => [...m, 'you: Hej z frontu!']);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      maxWidth: '400px',
      margin: '20px auto',
      fontFamily: 'monospace'
    }}>
      <h3>🔌 Socket.IO Tester</h3>
      
      <button 
        onClick={sendHello}
        style={{
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        Wyślij "Hello" 👋
      </button>

      <div style={{ 
        background: '#f5f5f5', 
        padding: '10px', 
        borderRadius: '4px',
        minHeight: '200px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        <strong>📨 Wiadomości:</strong>
        {messages.length === 0 ? (
          <p style={{ color: '#999', fontStyle: 'italic' }}>
            Brak wiadomości...
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {messages.map((msg, index) => (
              <li key={index} style={{ marginBottom: '5px' }}>
                {msg}
              </li>
            ))}
          </ul>
        )}
      </div>

      <small style={{ color: '#666' }}>
        Status: {socket?.connected ? '🟢 Połączono' : '🔴 Rozłączono'}
      </small>
    </div>
  );
}