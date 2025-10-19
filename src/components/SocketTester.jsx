// src/components/SocketTester.jsx
import { useEffect, useState } from 'react';
import { io } from "socket.io-client";

let socket;

export default function SocketTester() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // łączenie z backendem (zmień port, jeśli inny)
    socket = io('http://localhost:4000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('✅ Połączono z Socket.IO:', socket.id);
    });

    socket.on('welcome', (data) => {
      setMessages((m) => [...m, `server: ${data.msg}`]);
    });

    socket.on('broadcast:message', (data) => {
      setMessages((m) => [...m, `od ${data.from}: ${data.text}`]);
    });

    // sprzątanie po odłączeniu komponentu
    return () => {
      socket.disconnect();
      socket.off();
    };
  }, []);

  const sendHello = () => {
    socket.emit('client:hello', { text: 'Hej z frontu!' });
    setMessages((m) => [...m, 'you: Hej z frontu!']);
  };

  return (
    <div style={{ padding: '1rem', background: '#f2f2f2', borderRadius: '8px' }}>
      <h3>🧠 Socket Tester</h3>
      <button onClick={sendHello}>Wyślij hello</button>
      <div style={{ marginTop: '1rem' }}>
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
    </div>
  );
}
