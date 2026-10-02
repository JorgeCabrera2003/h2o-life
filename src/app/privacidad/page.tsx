import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, ArrowLeft, Database, EyeOff, UserCheck, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad | H2O Life Barquisimeto',
  description:
    'Declaración de Privacidad y Protección de Datos de H2O Life. Conoce cómo recopilamos, resguardamos y procesamos los datos de clientes en nuestra sede de Calle 28 con Carrera 25.',
};

export default function PrivacidadPage() {
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
            Vigente desde: Octubre 2026
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100 shadow-2xs">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Política de Privacidad & Protección de Datos
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              En H2O Life respetamos tu privacidad y garantizamos la confidencialidad absoluta de tu información personal.
            </p>
          </div>

          {/* 1. Responsable del Tratamiento */}
          <section className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>1. Responsable del Tratamiento de Datos</span>
            </h2>
            <p>
              El responsable del tratamiento de los datos personales recabados a través de esta plataforma es <strong>H2O Life C.A.</strong> (RIF J-50982341-2), con domicilio comercial en Calle 28 con Carrera 25, Barquisimeto, Estado Lara, Venezuela.
            </p>
          </section>

          {/* 2. Datos Recopilados */}
          <section className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>2. Datos Personales que Recopilamos</span>
            </h2>
            <p>
              Para prestar un servicio de abastecimiento de agua eficiente y personalizado, registramos exclusivamente la siguiente información:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>
                <strong>Datos de Identificación y Contacto:</strong> Nombre y apellido del cliente, número de teléfono móvil para envío de comprobantes de pago y avisos de despacho vía WhatsApp.
              </li>
              <li>
                <strong>Ubicación Geográfica y Domicilio:</strong> Dirección física de entrega, puntos de referencia y coordenadas de geolocalización (latitud y longitud) para el despacho preciso de botellones en la ruta de Barquisimeto.
              </li>
              <li>
                <strong>Historial Comercial:</strong> Registro de compras de agua, recargas, helados, saldos a favor o deudas pendientes y referencias bancarias de pagos móviles o transferencias.
              </li>
            </ul>
          </section>

          {/* 3. Finalidad del Tratamiento */}
          <section className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <h2 className="text-base font-extrabold text-slate-900">
              3. Finalidad del Uso de la Información
            </h2>
            <p>Los datos recabados son utilizados estrictamente para:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">🚚 Despacho a Domicilio</span>
                <p className="text-[11px] text-slate-500">Planificación de ruta y cálculo de distancia desde la Calle 28 con Carrera 25.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">📱 Comprobantes Digitales</span>
                <p className="text-[11px] text-slate-500">Envío instantáneo de recibos de venta y saldos en $ y Bs al WhatsApp del cliente.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">🛡️ Auditoría & Arqueo</span>
                <p className="text-[11px] text-slate-500">Cuadratura diaria de ingresos y egresos para la administración de Freyeliz y Jorge.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">🔐 Seguridad de Acceso</span>
                <p className="text-[11px] text-slate-500">Control de roles (Superadmin, Administradora, Trabajador) y prevención de fraudes.</p>
              </div>
            </div>
          </section>

          {/* 4. Seguridad de los Datos */}
          <section className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <EyeOff className="w-4 h-4 text-emerald-600" />
              <span>4. Almacenamiento Seguro y No Cesión a Terceros</span>
            </h2>
            <p>
              H2O Life <strong>no vende, no alquila ni comercializa</strong> los datos personales de sus clientes a ninguna entidad publicitaria ni terceros.
            </p>
            <p>
              Toda la información se transmite bajo protocolos criptográficos seguros (HTTPS con cifrado SSL/TLS y HSTS). La base de datos cuenta con políticas de seguridad a nivel de fila (Row Level Security - RLS) gestionadas con PostgreSQL en Supabase.
            </p>
          </section>

          {/* 5. Derechos de los Clientes */}
          <section className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <h2 className="text-base font-extrabold text-slate-900">
              5. Derechos de Acceso, Rectificación y Supresión
            </h2>
            <p>
              Cualquier cliente puede solicitar en cualquier momento la actualización de su número telefónico, dirección de entrega o la eliminación de su ficha comunicándose directamente con la administración a través de:
            </p>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-950 font-medium space-y-1">
              <p>• WhatsApp de Atención: <strong>+58 412 1234567 (Freyeliz)</strong></p>
              <p>• Correo Electrónico: <strong>freyeliz@h2olife.com</strong></p>
              <p>• Atención Presencial: <strong>Calle 28 con Carrera 25, Barquisimeto</strong></p>
            </div>
          </section>
        </div>

        {/* Footer simple */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} H2O Life C.A. • Todos los derechos reservados.</p>
          <div className="mt-2 space-x-3">
            <Link href="/" className="text-emerald-700 hover:underline">
              Punto de Venta
            </Link>
            <span>•</span>
            <Link href="/aviso-legal" className="text-emerald-700 hover:underline">
              Aviso Legal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
