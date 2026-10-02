import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Droplet, ArrowLeft, MapPin, Mail, Phone, Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Aviso Legal | H2O Life Barquisimeto',
  description:
    'Aviso Legal y Condiciones Generales de Uso de la plataforma H2O Life. Identificación del titular, RIF J-50982341-2, domicilio en Calle 28 con Carrera 25, Barquisimeto.',
};

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-sky-700 hover:text-sky-900 bg-white px-3.5 py-2 rounded-xl border border-sky-100 shadow-2xs transition-all hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Punto de Venta</span>
          </Link>
          <span className="text-[11px] text-slate-500 font-medium">
            Última actualización: Octubre 2026
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 border border-sky-100 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Aviso Legal & Condiciones de Uso
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Cumplimiento normativo y marco legal para el sistema web y punto de venta de H2O Life.
            </p>
          </div>

          {/* 1. Datos Identificativos del Titular */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>1. Identificación del Titular del Sitio Web</span>
            </h2>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-xs text-slate-700 space-y-2">
              <p>
                <strong className="text-slate-900">Razón Social:</strong> H2O Life C.A.
              </p>
              <p>
                <strong className="text-slate-900">Registro de Información Fiscal (RIF):</strong> J-50982341-2
              </p>
              <p>
                <strong className="text-slate-900">Sede Física y Domicilio:</strong> Calle 28 con Carrera 25, Municipio Iribarren, Barquisimeto, Estado Lara, Código Postal 3001, República Bolivariana de Venezuela.
              </p>
              <p>
                <strong className="text-slate-900">Responsable Administrativa:</strong> Freyeliz (Atención en Tienda & Despacho)
              </p>
              <p>
                <strong className="text-slate-900">Responsable Técnico de Sistemas:</strong> TSU Jorge Cabrera (Ingeniería de Software & Soporte)
              </p>
              <p>
                <strong className="text-slate-900">Contacto Directo:</strong> freyeliz@h2olife.com | +58 412 1234567 / +58 414 7654321
              </p>
            </div>
          </section>

          {/* 2. Objeto y Ámbito de Aplicación */}
          <section className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <h2 className="text-base font-extrabold text-slate-900">
              2. Objeto del Sistema y Servicios Prestados
            </h2>
            <p>
              El presente sitio y aplicación web progresiva (PWA) tiene por objeto gestionar la venta al público de agua mineral purificada por microfiltración y ozono, recargas de botellones de 20 litros, envases nuevos, paletas, helados y snacks; así como la gestión de inventario de tanques, arqueo de caja y facturación para clientes locales y con entrega a domicilio en Barquisimeto.
            </p>
            <p>
              El acceso al sistema por parte de clientes u operadores implica la aceptación plena de las presentes condiciones generales de uso.
            </p>
          </section>

          {/* 3. Propiedad Intelectual e Industrial */}
          <section className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <h2 className="text-base font-extrabold text-slate-900">
              3. Propiedad Intelectual e Industrial
            </h2>
            <p>
              Todos los contenidos de la aplicación, incluyendo pero sin limitarse a la marca <strong>H2O LIFE</strong>, logotipos, código fuente, interfaz gráfica de usuario, bases de datos y algoritmos de reconocimiento computacional, son propiedad exclusiva de H2O Life C.A. o de sus respectivos licenciantes, encontrándose protegidos por las leyes de propiedad intelectual de la República Bolivariana de Venezuela y los tratados internacionales en vigor.
            </p>
          </section>

          {/* 4. Condiciones de Compra y Precios en Divisas / Bolívares */}
          <section className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <h2 className="text-base font-extrabold text-slate-900">
              4. Lista de Precios y Tasa Oficial BCV
            </h2>
            <p>
              Los precios de los productos están expresados en Dólares Estadounidenses (USD) con su equivalente exacto en Bolívares (VES), calculado rigurosamente según la tasa de cambio oficial publicada por el <strong>Banco Central de Venezuela (BCV)</strong> correspondiente a la fecha de la transacción comercial.
            </p>
          </section>

          {/* 5. Legislación Aplicable y Jurisdicción */}
          <section className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <h2 className="text-base font-extrabold text-slate-900">
              5. Legislación Aplicable y Jurisdicción
            </h2>
            <p>
              Para la resolución de cualquier controversia o cuestión litigiosa relativa al presente sitio web o a las actividades desarrolladas en él, será de aplicación la legislación vigente en la República Bolivariana de Venezuela, sometiéndose las partes expresamente a la jurisdicción de los Tribunales Ordinarios de la Circunscripción Judicial del Estado Lara, con sede en la ciudad de Barquisimeto.
            </p>
          </section>
        </div>

        {/* Footer simple de navegación */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} H2O Life C.A. • RIF J-50982341-2 • Barquisimeto, Venezuela</p>
          <div className="mt-2 space-x-3">
            <Link href="/" className="text-sky-600 hover:underline">
              Punto de Venta
            </Link>
            <span>•</span>
            <Link href="/privacidad" className="text-sky-600 hover:underline">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
