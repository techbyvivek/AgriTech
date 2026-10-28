import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useState } from 'react';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import WeatherPage from './pages/WeatherPage';
import FarmsPage from './pages/FarmsPage';
import CropsPage from './pages/CropsPage';
import NotFound from './pages/NotFound';
import { SiteNav, Footer } from './components/SiteChrome';
function Protected({ children }) { const { user, loading } = useAuth(); if (loading) return <div className="page-loader">Loading Agri-Tech…</div>; return user ? children : <Navigate to="/login" replace />; }
function AppShell() { const [lang, setLang] = useState('en'); return <div className="app-shell"><SiteNav lang={lang} setLang={setLang}/><Routes>
<Route path="/" element={<Landing lang={lang}/>} />
<Route path="/login" element={<AuthPage mode="login" lang={lang}/>} />
<Route path="/register" element={<AuthPage mode="register" lang={lang}/>} />
<Route path="/dashboard" element={<Protected><Dashboard lang={lang}/></Protected>} />
<Route path="/farms" element={<Protected><FarmsPage lang={lang}/></Protected>} />
<Route path="/crops" element={<Protected><CropsPage lang={lang}/></Protected>} />
<Route path="/marketplace" element={<Marketplace lang={lang}/>} />
<Route path="/weather" element={<WeatherPage lang={lang}/>} />
<Route path="*" element={<NotFound/>}/>
</Routes><Footer/></div>; }
export default function App(){ return <BrowserRouter><AppShell/></BrowserRouter>; }
