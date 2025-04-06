// Polyfill for process in client-side code
window.process = {
  env: {
    NODE_ENV: import.meta.env.MODE,
    REACT_APP_API_URL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000'
  }
};

export default window.process; 