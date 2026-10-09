'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet } from 'lucide-react';

interface LaunchAnimationProps {
  onComplete?: () => void;
}

export function LaunchAnimation({ onComplete }: LaunchAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // La animación completa durará unos 2.5 segundos antes de desmontarse
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 800); // Dar tiempo para la animación de salida
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Premium / Playful Motion Design Archetype
  const dropEasing = [0.25, 0.1, 0.25, 1]; // Apple HIG style easing para una entrada suave pero con peso
  const textEasing = [0.2, 0, 0, 1]; // MD3 Snappy para los textos

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="launch-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }} // Salida inmersiva (se acerca hacia la cámara al desaparecer)
          transition={{ duration: 0.8, ease: textEasing }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-sky-950 overflow-hidden"
        >
          {/* Capa Ambiental (Ambient Layer) - Regla de las 3 capas del Motion Design */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.5, 0.2], scale: [0.8, 1.2, 1.5] }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/20 rounded-full blur-[100px]"
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Héroe: El logo / Gota (Primary Layer) */}
            <motion.div
              initial={{ y: -60, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{
                duration: 0.7,
                ease: [0.175, 0.885, 0.32, 1.275], // Bounce Settle (Overshoot) para Playful
                delay: 0.2,
              }}
              className="relative"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-sky-400 to-blue-600 rounded-3xl shadow-2xl shadow-sky-500/40 flex items-center justify-center relative overflow-hidden">
                {/* Reflejo estilo cristal / Apple Design */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent h-1/2 rounded-t-3xl" />
                <Droplet className="w-12 h-12 text-white fill-white drop-shadow-md" />
              </div>

              {/* Efecto Secundario (Secondary Layer) - Expansión/Onda expansiva */}
              <motion.div
                initial={{ opacity: 0.8, scale: 1 }}
                animate={{ opacity: 0, scale: 1.8 }}
                transition={{
                  duration: 1.2,
                  ease: "easeOut",
                  delay: 0.5,
                }}
                className="absolute inset-0 bg-sky-400 rounded-3xl -z-10"
              />
            </motion.div>

            {/* Tipografía Coreografiada (1/3 Rule de staggers) */}
            <div className="mt-8 overflow-hidden flex flex-col items-center">
              <motion.h1
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  ease: textEasing,
                  delay: 0.6, // Stagger de 400ms después del héroe
                }}
                className="text-4xl font-black text-white tracking-tight"
              >
                H2O Life
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  ease: textEasing,
                  delay: 0.75, // Stagger de 150ms después del título principal
                }}
                className="text-sky-300 font-medium tracking-widest uppercase text-sm mt-2"
              >
                Punto de Venta
              </motion.p>
            </div>
          </div>

          {/* Loading Indicator Inferior */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="absolute bottom-12 w-48 h-1 bg-sky-900/50 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{
                duration: 1.5,
                ease: "circOut",
                delay: 1.2,
              }}
              className="w-full h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
