import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { SupabaseProvider } from './contexts/SupabaseContext.tsx';
import { SensorProvider } from './contexts/SensorContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SupabaseProvider>
      <SensorProvider>
        <App />
      </SensorProvider>
    </SupabaseProvider>
  </StrictMode>,
);
