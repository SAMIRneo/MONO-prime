import { createRoot } from 'react-dom/client';
import App from './app';
import './foundation.css';
import './theme.css';
import './responsive.css';

createRoot(document.getElementById('root')!).render(<App />);
