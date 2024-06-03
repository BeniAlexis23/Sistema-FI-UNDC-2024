import './App.css';

import { BrowserRouter, Routes, Route, HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NoticeProvider } from './context/NoticesContext';
import { RcfProvider } from './context/RcfsContext';

import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import NoticesPage from './pages/NoticesPage';
import NoticesFormPage from './pages/NoticesFormPage';
import RcfsPage from './pages/RcfsPages';
import RcfsFormPage from './pages/RcfsFormPage';
import HomePage from './pages/HomePage';
import Facultad from './pages/facultad/Facultad';
import Resoluciones from './pages/facultad/Resoluciones';
import Noticias from './pages/Noticias';
import Noticia_Id from './pages/Noticia_Id';
import Departamento from './pages/Departamento';
import Escuela from './pages/Escuela';
import Investigacion from './pages/Investigacion';
import Posgrado from './pages/Posgrado';

import ProtectedRoute from './ProtectedRoute';

import ScrollToTop from './utils/ScrollToTop';

const App = () => {
  return (
    <AuthProvider>
      <NoticeProvider>
        <RcfProvider>
          <HashRouter>
            <ScrollToTop />
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/facultad" element={<Facultad />} />
              <Route path="/facultad/resoluciones" element={<Resoluciones />} />
              <Route path="/noticias" element={<Noticias />} />
              <Route path="/noticias/:id" element={<Noticia_Id />} />
              <Route path="/departamento" element={<Departamento />} />
              <Route path="/escuela" element={<Escuela />} />
              <Route path="/escuela/tutoria" element={<Escuela />} />
              <Route path="/escuela/rsu" element={<Escuela />} />
              <Route path="/investigacion" element={<Investigacion />} />
              <Route path="/posgrado" element={<Posgrado />} />

              {/* Rutas Admin y Protegidas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/notices" element={<NoticesPage />} />
                <Route path="/add-notice" element={<NoticesFormPage />} />
                <Route path="/notices/:id" element={<NoticesFormPage />} />
                <Route path="/rcfs" element={<RcfsPage />} />
                <Route path="/add-rcf" element={<RcfsFormPage />} />
                <Route path="/rcfs/:id" element={<RcfsFormPage />} />
              </Route>
            </Routes>
          </HashRouter>
        </RcfProvider>
      </NoticeProvider>
    </AuthProvider>
  );
};

export default App;