async function check() {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  console.log('Homepage status:', res.status);
  const linkMatches = html.match(/href="(\/_next\/[^"]+)"/g) || [];
  const scriptMatches = html.match(/src="(\/_next\/[^"]+)"/g) || [];

  const urls = [
    ...linkMatches.map(m => m.replace(/^href="/, '').replace(/"$/, '')),
    ...scriptMatches.map(m => m.replace(/^src="/, '').replace(/"$/, ''))
  ];

  console.log(`Found ${urls.length} assets to check:`);
  for (const u of urls) {
    const r = await fetch('http://localhost:3000' + u);
    console.log(`[${r.status}] ${u}`);
    if (r.status !== 200) {
      console.log('--- ERROR BODY ---');
      console.log(await r.text());
      console.log('------------------');
    }
  }
}

check().catch(console.error);
