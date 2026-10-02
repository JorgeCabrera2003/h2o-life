async function test() {
  try {
    const res = await fetch('http://localhost:3000');
    const html = await res.text();
    const matches = html.match(/src="(\/_next\/[^"]+)"/g) || [];
    const scripts = matches.map(m => m.replace('src="', '').replace('"', ''));
    console.log('Found', scripts.length, 'scripts');
    let failed = 0;
    for (const s of scripts) {
      try {
        const r = await fetch('http://localhost:3000' + s);
        if (!r.ok) {
          console.log('FAILED:', s, r.status);
          failed++;
        }
      } catch (err) {
        console.log('ERROR:', s, err.message);
        failed++;
      }
    }
    console.log('Finished chunk verification. Failed count:', failed);
  } catch (e) {
    console.error('Fatal fetch error:', e);
  }
}
test();
