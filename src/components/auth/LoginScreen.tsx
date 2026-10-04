'use client';

import React, { useState, useEffect } from 'react';
import { useH2OStore } from '@/lib/store';
import { verifyLogin, USERS_LIST } from '@/lib/auth';
import { Lock, User, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';

export function LoginScreen() {
  const { login } = useH2OStore();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Soporte para teclado físico
  useEffect(() => {
    if (!selectedUser) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si hay un modal o algo que atrape el foco, aunque aquí estamos en pantalla completa
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        e.preventDefault();
        setPin(prev => prev.length < 4 ? prev + e.key : prev);
        setError('');
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        setPin(prev => prev.slice(0, -1));
        setError('');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // El form maneja el enter nativamente si el foco está en un input, 
        // pero como no hay input focusado, disparamos la lógica aquí
        if (pin.length === 4 && !isLoading) {
          // No podemos llamar handleLogin directamente con el evento del teclado
          // porque espera un FormEvent, así que creamos una función helper o 
          // usamos un ref al form/botón. Lo más fácil es hacer el fetch directo:
          submitLogin(pin);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUser, pin, isLoading]);

  const submitLogin = async (currentPin: string) => {
    setError('');
    setIsLoading(true);
    try {
      const user = await verifyLogin(currentPin);
      if (user && user.id === selectedUser) {
        login(user);
      } else {
        setError('PIN incorrecto o usuario no coincide.');
      }
    } catch (err) {
      setError('Error al verificar credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    submitLogin(pin);
  };



  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const clearPin = () => {
    setPin('');
    setError('');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="w-full max-w-sm glass-panel p-8 rounded-3xl z-10 bg-white/80 backdrop-blur-xl border border-white shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-cyan-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-sky-500/30 mb-4 transform -rotate-6">
            <ShieldCheck className="w-8 h-8 text-white rotate-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">H2O Life POS</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Acceso Seguro al Sistema</p>
        </div>

        {!selectedUser ? (
          <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-sm font-bold text-slate-600 mb-4 text-center">Seleccione su usuario:</h2>
            {USERS_LIST.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u.id)}
                className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-2xl hover:border-sky-400 hover:shadow-md transition-all active:scale-95 cursor-pointer pressable"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl shadow-inner mr-4">
                  {u.avatar}
                </div>
                <div className="text-left flex-1">
                  <span className="block font-bold text-slate-800">{u.name}</span>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rol: {u.role}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleLogin} className="animate-in slide-in-from-left-4 duration-300">
            <div className="flex items-center space-x-3 mb-6 bg-slate-100 p-3 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-xs">
                {USERS_LIST.find(u => u.id === selectedUser)?.avatar}
              </div>
              <div className="flex-1">
                <span className="block text-xs text-slate-500 font-medium">Ingresando como</span>
                <span className="block font-bold text-slate-800">{USERS_LIST.find(u => u.id === selectedUser)?.name}</span>
              </div>
              <button 
                type="button" 
                onClick={() => { setSelectedUser(null); setPin(''); setError(''); }}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 px-3 py-1 bg-sky-50 rounded-lg pressable"
              >
                Cambiar
              </button>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-600 flex items-center space-x-1.5 mb-3 justify-center">
                <KeyRound className="w-4 h-4 text-slate-400" />
                <span>Ingrese su PIN de 4 dígitos</span>
              </label>
              
              <div className="flex justify-center space-x-3 mb-6">
                {[0, 1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-black transition-all duration-200 ${
                      pin.length > i 
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105' 
                        : 'bg-white border-2 border-slate-200 text-slate-300'
                    }`}
                  >
                    {pin.length > i ? '•' : ''}
                  </div>
                ))}
              </div>

              {/* Numpad táctil seguro */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-[240px] mx-auto place-items-center" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinInput(num.toString())}
                    className="w-full h-14 bg-white rounded-2xl shadow-xs border border-slate-200 text-xl font-bold text-slate-700 pressable hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearPin}
                  className="w-full h-14 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold text-slate-500 pressable hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                >
                  BORRAR
                </button>
                <button
                  type="button"
                  onClick={() => handlePinInput('0')}
                  className="w-full h-14 bg-white rounded-2xl shadow-xs border border-slate-200 text-xl font-bold text-slate-700 pressable hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                >
                  0
                </button>
                <button
                  type="submit"
                  disabled={pin.length !== 4 || isLoading}
                  className="w-full h-14 bg-emerald-500 rounded-2xl shadow-md shadow-emerald-500/20 text-white flex items-center justify-center pressable disabled:opacity-50 disabled:bg-slate-300 cursor-pointer"
                >
                  <Lock className="w-5 h-5" />
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 animate-in slide-in-from-bottom-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-xs font-bold text-rose-700">{error}</span>
              </div>
            )}
          </form>
        )}
      </div>
      
      <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
        Sistema Interno Seguro • H2O Life
      </p>
    </div>
  );
}
