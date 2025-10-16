// src/db.ts
import { openDB, type DBSchema } from 'idb';

interface TareasDB extends DBSchema {
  'tareas-store': {
    key: number;
    value: {
      id?: number;
      titulo: string;
      completada: boolean;
      sincronizado: number; // Cambiado a number
    };
    indexes: { 'sincronizado': number };
  };
}

const dbPromise = openDB<TareasDB>('tareas-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('tareas-store')) {
      const store = db.createObjectStore('tareas-store', {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('sincronizado', 'sincronizado');
    }
  },
});

export const agregarTarea = async (titulo: string) => {
  const db = await dbPromise;
  // Guardamos 'sincronizado' como 0
  await db.add('tareas-store', { titulo, completada: false, sincronizado: 0 });
};

export const obtenerTareas = async () => {
  const db = await dbPromise;
  return db.getAll('tareas-store');
};

export const obtenerTareasNoSincronizadas = async () => {
  const db = await dbPromise;
  return db.getAllFromIndex('tareas-store', 'sincronizado', 0);
};

export const marcarSincronizadas = async (tareas: any[]) => {
  const db = await dbPromise;
  const tx = db.transaction('tareas-store', 'readwrite');
  await Promise.all(
    // Marcamos 'sincronizado' como 1
    tareas.map(tarea => tx.store.put({ ...tarea, sincronizado: 1 }))
  );
  await tx.done;
};