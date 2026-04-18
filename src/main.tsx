import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Clean up localStorage to remove example data
const cleanLocalStorage = () => {
    const PROJECTS_KEY = 'windoor-projects-v2';
    const CLIENTS_KEY = 'windoor-clients-v2';
    
    // Clear projects and clients to ensure clean start
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(CLIENTS_KEY);
    
    console.log('🧹 LocalStorage cleaned - Ready for production');
};

cleanLocalStorage();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
