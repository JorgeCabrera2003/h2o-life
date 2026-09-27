import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Intentar consultar API de tasa de cambio oficial de Venezuela
    const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      next: { revalidate: 3600 }, // Cachear por 1 hora
      signal: AbortSignal.timeout(3500),
    });

    if (response.ok) {
      const data = await response.json();
      const rate = Number(data.promedio || data.precio || 45.0);
      return NextResponse.json({
        rate: Number(rate.toFixed(4)),
        source: 'BCV Oficial',
        updated_at: data.fechaActualizacion || new Date().toISOString(),
        is_manual_override: false,
      });
    }
  } catch {
    // Si la API externa no responde o falla conexión
  }

  // Tasa de contingencia por defecto
  return NextResponse.json({
    rate: 45.50,
    source: 'BCV Oficial (Estimado)',
    updated_at: new Date().toISOString(),
    is_manual_override: false,
  });
}
