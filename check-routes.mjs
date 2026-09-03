async function testAll() {
  const routes = ['/', '/products', '/software', '/files', '/cart', '/checkout', '/login', '/admin'];
  for (const r of routes) {
    const res = await fetch(`http://localhost:3000${r}`);
    console.log(`Route ${r.padEnd(12)} -> Status ${res.status}`);
  }
}
testAll().catch(console.error);
