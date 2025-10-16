// src/App.tsx
import { useState, useEffect } from 'react';
import { agregarTarea, obtenerTareas } from './db';
import miLogo from './assets/logo.png';
import './App.css';

interface Tarea {
  id?: number;
  titulo: string;
  completada: boolean;
}

export default function App() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const cargarDatos = async () => {
      setTareas(await obtenerTareas());
    };
    cargarDatos();

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!nuevaTarea.trim()) return;

  // 1. Guardamos la tarea en IndexedDB SIEMPRE.
  await agregarTarea(nuevaTarea);
  setNuevaTarea('');
  setTareas(await obtenerTareas());

  // 2. Intentamos sincronizar, independientemente del estado de conexión.
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // Registramos la tarea. Si hay conexión, se ejecutará casi de inmediato.
      // Si no hay conexión, se ejecutará cuando la recupere.
      await (registration as any).sync.register('sync-tareas');
      
      // Solo mostramos la alerta si estamos offline para no molestar al usuario.
      if (!online) {
        alert('Tarea guardada offline. Se sincronizará en segundo plano.');
      }
    } catch (error) {
      console.error('Error al registrar la sincronización:', error);
      // Si el registro falla, aquí podrías intentar enviar la tarea directamente con fetch().
    }
  } else {
    // Fallback para navegadores que no soportan Background Sync.
    // Aquí podrías intentar enviar la tarea directamente con fetch().
  }
};

// --- FUNCIÓN FINAL PARA MANEJAR LAS NOTIFICACIONES ---
  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return alert('Tu navegador no soporta notificaciones push.');
    }

    const registration = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      return alert('No has permitido las notificaciones.');
    }

    // --- ¡AQUÍ ESTÁ LA LÓGICA DE SUSCRIPCIÓN! ---
    
    // 1. Pega tu clave pública VAPID generada aquí.
    const vapidPublicKey = 'BNUe6f28oHBf00PQeMzK3zpCXHz6wqYh5epwmSFPQy3iEdDr3W1SAG6nGUce3lPpXaoWHTiTcjirp6tSprzz6rk';

    try {
      // 2. Generamos la suscripción única.
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // Siempre debe ser true
        applicationServerKey: vapidPublicKey,
      });

      console.log('Suscripción Push generada:', subscription);
      alert('¡Te has suscrito a las notificaciones exitosamente!');

      // 3. En una aplicación real, enviarías esta 'subscription' a tu backend.
      // await fetch('/api/subscribe', {
      //   method: 'POST',
      //   body: JSON.stringify(subscription),
      //   headers: { 'Content-type': 'application/json' }
      // });

    } catch (error) {
      console.error('Error al generar la suscripción push:', error);
      alert('Hubo un error al suscribirte a las notificaciones.');
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <img src={miLogo} className="App-logo" alt="Logo de Citas PWA" />
        <h1>Mis Tareas PWA</h1>
        <div className={`status ${online ? 'online' : 'offline'}`}>
          {online ? 'En línea' : 'Sin conexión'}
        </div>
      </header>

      <form onSubmit={handleSubmit} className="task-form">
        <input
          type="text"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          placeholder="Añadir una nueva tarea..."
        />
        <button type="submit">Agregar</button>
      </form>

      <div className="task-list">
        {tareas.length > 0 ? (
          tareas.map((tarea) => (
            <div key={tarea.id} className="task-item">
              <span>{tarea.titulo}</span>
            </div>
          ))
        ) : (
          <p>Aún no hay tareas. ¡Añade una!</p>
        )}
      </div>

      <div className="notifications-section">
        <button className="notification-button" onClick={handleSubscribe}>
          Activar Notificaciones
        </button>
      </div>

      <footer className="App-footer">
        <p>© 2025 Citas PWA</p>
      </footer>
    </div>
  );
}

