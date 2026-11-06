import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/pinyon-script/400.css';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/montserrat';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
