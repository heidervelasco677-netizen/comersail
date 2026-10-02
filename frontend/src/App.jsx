import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Compras from './pages/Compras';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública para Registro e Inicio de Sesión */}
        <Route path="/auth" element={<Auth />} />

        {/* Ruta protegida para la gestión de Compras */}
        <Route 
          path="/compras" 
          element={
            <ProtectedRoute>
              <Compras />
            </ProtectedRoute>
          } 
        />

        {/* Redirección automática si ingresas a una ruta desconocida */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;