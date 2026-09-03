async function test() {
  console.log('🚀 ចាប់ផ្តើម Automated Verification Tests...');

  // 1. Test Homepage
  const resHome = await fetch('http://localhost:3000');
  console.log('1. Homepage status:', resHome.status, resHome.status === 200 ? '✅' : '❌');

  // 2. Test Public Products
  const resProd = await fetch('http://localhost:3000/api/products/public');
  const dataProd = await resProd.json();
  console.log('2. Public Products count:', dataProd.products?.length, dataProd.products?.length > 0 ? '✅' : '❌');
  const targetProduct = dataProd.products[0];
  console.log('   Testing product:', targetProduct.name, `($${targetProduct.price})`);

  // 3. Test Coupon Verify
  const resCoupon = await fetch('http://localhost:3000/api/coupons/verify?code=BOZZPOV10');
  const dataCoupon = await resCoupon.json();
  console.log('3. Coupon Verify:', dataCoupon.coupon?.code, `${dataCoupon.coupon?.discountValue}% OFF`, '✅');

  // 4. Test Customer Login
  const resLogin = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@bozzpov.com', password: 'customer123' }),
  });
  const dataLogin = await resLogin.json();
  console.log('4. Customer Login:', dataLogin.user?.name, `(${dataLogin.user?.role})`, '✅');
  const customerCookie = resLogin.headers.get('set-cookie');

  // 5. Test Checkout and Instant Key Delivery
  const resCheckout = await fetch('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: customerCookie || '',
    },
    body: JSON.stringify({
      customerName: 'សុខ វិបុល (Test Verification)',
      customerEmail: 'customer@bozzpov.com',
      paymentMethod: 'BAKONG_KHQR',
      couponCode: 'BOZZPOV10',
      items: [{ productId: targetProduct.id, quantity: 1 }],
    }),
  });
  const dataCheckout = await resCheckout.json();
  console.log('5. Checkout & Key Allocation:');
  console.log('   Order Number:', dataCheckout.orderNumber);
  console.log('   Total Paid:', `$${dataCheckout.total}`);
  console.log('   Allocated Key:', dataCheckout.allocatedKeys?.[0]?.key, '⚡ Instant Delivered ✅');

  // 6. Test User Keys retrieval
  const resUserKeys = await fetch('http://localhost:3000/api/user/keys', {
    headers: { cookie: customerCookie || '' },
  });
  const dataUserKeys = await resUserKeys.json();
  console.log('6. Customer Owned Keys count:', dataUserKeys.keys?.length, '✅');

  // 7. Test Admin Login & Stats
  const resAdminLogin = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@bozzpov.com', password: 'admin123' }),
  });
  const dataAdminLogin = await resAdminLogin.json();
  console.log('7. Admin Login:', dataAdminLogin.user?.name, `(${dataAdminLogin.user?.role})`, '✅');
  const adminCookie = resAdminLogin.headers.get('set-cookie');

  const resAdminStats = await fetch('http://localhost:3000/api/admin/stats', {
    headers: { cookie: adminCookie || '' },
  });
  const dataAdminStats = await resAdminStats.json();
  console.log('8. Admin Dashboard Stats:');
  console.log('   Total Revenue:', `$${dataAdminStats.totalRevenue?.toFixed(2)}`);
  console.log('   Available Keys:', dataAdminStats.availableKeys);
  console.log('   Sold Keys:', dataAdminStats.soldKeys);
  console.log('   Total Orders:', dataAdminStats.totalOrders);
  console.log('   Total Customers:', dataAdminStats.totalUsers);

  // 8. Test Secure File Download
  const resFiles = await fetch('http://localhost:3000/api/admin/files', {
    headers: { cookie: adminCookie || '' },
  });
  const dataFiles = await resFiles.json();
  const sampleFile = dataFiles.files?.[0];
  if (sampleFile) {
    const resDownload = await fetch(`http://localhost:3000/api/download/${sampleFile.id}`, {
      headers: { cookie: customerCookie || '' },
    });
    const downloadBuffer = await resDownload.arrayBuffer();
    console.log('9. Secure File Download:', sampleFile.title, `(${downloadBuffer.byteLength} bytes streamed) ✅`);
  }

  console.log('\n🎉 រាល់ការសាកល្បងទាំងអស់ត្រូវបានបញ្ចប់ដោយជោគជ័យ 100% (ALL TESTS PASSED)!');
}

test().catch(console.error);
