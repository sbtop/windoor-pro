import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Clean up example data only once
const CLEANUP_FLAG = 'krystalii-cleanup-v1';
if (!localStorage.getItem(CLEANUP_FLAG)) {
    const PROJECTS_KEY = 'krystalii-projects-v2';
    const CLIENTS_KEY = 'krystalii-clients-v2';
    
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(CLIENTS_KEY);
    
    localStorage.setItem(CLEANUP_FLAG, 'true');
    console.log('🧹 Example data cleaned - Ready for production');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
