async function verifyMobileEndpoint() {
  const base = 'http://192.168.31.101:3000';
  console.log('Testing endpoint:', base);
  try {
    const res = await fetch(base);
    console.log('Main Page HTTP Status:', res.status);
    console.log('HSTS Header:', res.headers.get('strict-transport-security'));
    
    const html = await res.text();
    const hasOldScreen = html.includes('Iniciando sistema de ventas');
    console.log('Contains old blocking screen ("Iniciando sistema de ventas"):', hasOldScreen);
    
    const hasPosNavbar = html.includes('H2O') && html.includes('Recargas');
    console.log('Contains POS and Recargas elements:', hasPosNavbar);

    const matches = html.match(/src="(\/_next\/[^"]+)"/g) || [];
    const scripts = matches.map(m => m.replace('src="', '').replace('"', ''));
    console.log(`Found ${scripts.length} JS chunk references.`);

    let failed = 0;
    for (const s of scripts) {
      try {
        const chunkRes = await fetch(base + s);
        if (!chunkRes.ok) {
          console.error(`FAILED: ${s} - HTTP ${chunkRes.status}`);
          failed++;
        }
      } catch (err) {
        console.error(`ERROR fetching ${s}:`, err.message);
        failed++;
      }
    }
    console.log(`Scripts verified over 192.168.31.101: ${scripts.length - failed}/${scripts.length} OK. Failed: ${failed}`);
  } catch (err) {
    console.error('Fatal endpoint error:', err);
  }
}

verifyMobileEndpoint();
