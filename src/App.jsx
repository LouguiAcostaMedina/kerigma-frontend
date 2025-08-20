/**
 * Componente principal de la aplicación
 * Configura el router, contextos y providers necesarios
 */

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import AppRouter from '@/components/AppRouter';
import { ToastContainer } from '@/utils/notifications';
import '@/assets/styles/globals.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          <AppRouter />
          <ToastContainer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
