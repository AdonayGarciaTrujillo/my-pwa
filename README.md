# CITASPWA

Esta es una Aplicación Web Progresiva (PWA) desarrollada como parte del curso de Aplicaciones Web Progresivas. La aplicación permite a los usuarios gestionar una lista de tareas de manera eficiente, con un enfoque en la funcionalidad offline y la resiliencia.

## ✨ Características Implementadas

El proyecto implementa las características avanzadas de una PWA moderna:

* **App Shell y Cacheo:** Utiliza el patrón App Shell para una carga instantánea. Implementa estrategias de caché avanzadas (`Cache-First`, `Stale-While-Revalidate`) para garantizar el funcionamiento sin conexión.
* **Almacenamiento Offline con IndexedDB:** Las tareas se guardan en la base de datos del navegador, permitiendo crear y consultar tareas sin necesidad de una conexión a internet.
* **Sincronización en Segundo Plano:** Utiliza la `Background Sync API` para enviar automáticamente las tareas creadas offline a un servidor una vez que se recupera la conexión.
* **Notificaciones Push:** La aplicación puede solicitar permisos y recibir notificaciones push para mejorar el engagement del usuario.
* **Diseño Responsivo y Moderno:** La interfaz está construida con CSS moderno para una experiencia de usuario limpia e intuitiva en cualquier dispositivo.

## 🚀 Cómo Ejecutar el Proyecto

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://www.youtube.com/watch?v=eQMcIGVc8N0](https://www.youtube.com/watch?v=eQMcIGVc8N0)
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Compilar para producción:**
    ```bash
    npm run build
    ```
4.  **Ejecutar la previsualización:**
    ```bash
    npm run preview
    ```




# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
