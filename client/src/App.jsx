import './App.css';
import { lazy, Suspense } from 'react';

import { Routes, Route, HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NoticeProvider } from './context/NoticesContext';
import { RcfProvider } from './context/RcfsContext';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NoticesPage = lazy(() => import('./pages/NoticesPage'));
const NoticesFormPage = lazy(() => import('./pages/NoticesFormPage'));
const RcfsPage = lazy(() => import('./pages/RcfsPages'));
const RcfsFormPage = lazy(() => import('./pages/RcfsFormPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const Facultad = lazy(() => import('./pages/facultad/Facultad'));
const Resoluciones = lazy(() => import('./pages/facultad/Resoluciones'));
const Noticias = lazy(() => import('./pages/Noticias'));
const Noticia_Id = lazy(() => import('./pages/Noticia_Id'));
const Departamento = lazy(() => import('./pages/Departamento'));
const Escuela = lazy(() => import('./pages/Escuela'));
const Investigacion = lazy(() => import('./pages/Investigacion'));
const Posgrado = lazy(() => import('./pages/Posgrado'));
const Contacto = lazy(() => import('./pages/Contacto'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const HeroPage = lazy(() => import('./pages/HeroPage'));

import ProtectedRoute from './ProtectedRoute';

import ScrollToTop from './utils/ScrollToTop';

const App = () => {
  return (
    <AuthProvider>
      <NoticeProvider>
        <RcfProvider>
          <HashRouter>
              <ScrollToTop />
              <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando…</div>}>
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
                <Route path="/contacto" element={<Contacto />} />

                {/* Rutas Admin y Protegidas */}
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute allowPasswordChange />}>
                  <Route path="/change-password" element={<ChangePasswordPage />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/notices" element={<NoticesPage />} />
                  <Route path="/add-notice" element={<NoticesFormPage />} />
                  <Route path="/notices/:id" element={<NoticesFormPage />} />
                  <Route path="/hero" element={<HeroPage />} />
                </Route>

                <Route element={<ProtectedRoute requiredRole="admin" />}>
                  <Route path="/users" element={<UsersPage />} />
                </Route>

                {/* Rutas protegidas para Usuario especifico */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/rcfs" element={<RcfsPage />} />
                  <Route path="/add-rcf" element={<RcfsFormPage />} />
                  <Route path="/rcfs/:id" element={<RcfsFormPage />} />
                </Route>

              </Routes>
              </Suspense>
          </HashRouter>
        </RcfProvider>
      </NoticeProvider>
    </AuthProvider>
  );
};

export default App;
