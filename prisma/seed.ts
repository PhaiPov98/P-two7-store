import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 ចាប់ផ្តើមបញ្ចូលទិន្នន័យ (Seeding database)...');

  // Clear existing
  await prisma.download.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.productKey.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.file.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const bobPassword = await bcrypt.hash('Phaipovpro9868@98581234567!@#$%^%', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Bozz Pov (Admin)',
      email: 'admin@bozzpov.com',
      password: adminPassword,
      phone: '+855 12 345 678',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const bobAdmin = await prisma.user.create({
    data: {
      name: 'Bozz Pov Admin',
      email: 'bob800195@gmail.com',
      password: bobPassword,
      phone: '+855 12 345 678',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'សុខ វិបុល (Sok Vibul)',
      email: 'customer@bozzpov.com',
      password: customerPassword,
      phone: '+855 98 765 432',
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('✅ បានបង្កើត Admin និង Customer Users');

  // 2. Create Categories
  const categoriesData = [
    {
      nameKm: 'Windows Keys',
      nameEn: 'Windows Keys',
      slug: 'windows-keys',
      description: 'Product Key សម្រាប់ Windows 11, Windows 10 Pro & Home',
      icon: 'Monitor',
    },
    {
      nameKm: 'Microsoft Office',
      nameEn: 'Microsoft Office',
      slug: 'microsoft-office',
      description: 'Office 2024, 2021, Office 365 Product Keys',
      icon: 'FileSpreadsheet',
    },
    {
      nameKm: 'Antivirus',
      nameEn: 'Antivirus & Security',
      slug: 'antivirus',
      description: 'Antivirus និង Security Software ការពារកុំព្យូទ័រ',
      icon: 'ShieldCheck',
    },
    {
      nameKm: 'Adobe',
      nameEn: 'Adobe Creative',
      slug: 'adobe',
      description: 'Adobe Photoshop, Premiere Pro, Creative Cloud',
      icon: 'Palette',
    },
    {
      nameKm: 'Software',
      nameEn: 'Software & Tools',
      slug: 'software',
      description: 'Software និង Applications ពេញនិយម',
      icon: 'Cpu',
    },
    {
      nameKm: 'Game Keys',
      nameEn: 'Game Keys',
      slug: 'game-keys',
      description: 'Game Keys, Steam, Epic Games, Game Passes',
      icon: 'Gamepad2',
    },
    {
      nameKm: 'Premium',
      nameEn: 'Premium Services',
      slug: 'premium',
      description: 'Premium Accounts, VPN, AI Tools Subscription',
      icon: 'Crown',
    },
    {
      nameKm: 'ឯកសារ & Tools',
      nameEn: 'Files & Tools',
      slug: 'digital-files-tools',
      description: 'Digital Files, ISO Clean, Activators និង Utilities',
      icon: 'FolderDown',
    },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }
  console.log('✅ បានបង្កើត Categories');

  // 3. Create Products and Keys
  const productsData = [
    {
      name: 'Windows 11 Pro Genuine Product Key',
      slug: 'windows-11-pro-key',
      description: 'Windows 11 Pro គឺជាប្រព័ន្ធប្រតិបត្តិការចុងក្រោយបំផុតរបស់ Microsoft ដែលផ្តល់នូវសុវត្ថិភាពខ្ពស់ ដំណើរការលឿន និងមុខងារទំនើបសម្រាប់អ្នកប្រើប្រាស់អាជីព និងអាជីវកម្ម។ Product Key នេះជា Key ស្របច្បាប់ អាច Activate បានទាំង Clean Install និង Upgrade ពី Windows 10/11 Home។ គាំទ្រ 32/64 bit និងអាច Update បានរហូត។',
      shortDesc: 'Product Key ស្របច្បាប់សម្រាប់ Windows 11 Pro (64-Bit) ប្រើបានមួយជីវិត (Lifetime Activation)',
      price: 13.99,
      comparePrice: 24.99,
      discountPercent: 44,
      images: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['windows-keys'].id,
      version: '24H2 / 23H2 (Build 26100+)',
      platform: 'Windows (PC / Laptop)',
      systemRequirements: 'CPU: 1GHz Dual Core 64-bit, RAM: 4GB, Storage: 64GB, TPM 2.0, UEFI Secure Boot',
      features: 'Lifetime License, 1 PC Activation, Online Activation, 100% Update Support, BitLocker Encryption, Remote Desktop',
      rating: 4.9,
      reviewCount: 148,
      soldCount: 382,
      isFeatured: true,
      isBestSeller: true,
      isActive: true,
      stockCount: 15,
      keys: [
        'DEMO-W11PR-VK7JG-NPHTM-C97JM-9MPGT',
        'DEMO-W11PR-NRG8B-VKK3Q-CXVCJ-9G2XF',
        'DEMO-W11PR-W269N-WFGWX-YVC9B-4J6C9',
        'DEMO-W11PR-NYW3X-G8G9Y-D7K67-2J389',
        'DEMO-W11PR-7HNRX-D7KGG-3K4RQ-4WPJ4',
      ],
    },
    {
      name: 'Microsoft Office 2024 Pro Plus Lifetime Key',
      slug: 'microsoft-office-2024-pro-plus-key',
      description: 'Microsoft Office 2024 Professional Plus គឺជាកញ្ចប់កម្មវិធីការិយាល័យជំនាន់ចុងក្រោយបង្អស់ រួមមាន Word, Excel, PowerPoint, Outlook, Access និង OneNote។ មិនចាំបាច់បង់ប្រចាំខែ (No Monthly Subscription) ទិញម្តងប្រើប្រាស់បានមួយជីវិត លើកុំព្យូទ័រ 1 គ្រឿង។',
      shortDesc: 'Office 2024 Pro Plus ពេញលេញ Word, Excel, PowerPoint, Outlook ប្រើប្រាស់មួយជីវិត',
      price: 24.99,
      comparePrice: 49.99,
      discountPercent: 50,
      images: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['microsoft-office'].id,
      version: '2024 LTSC (v16.0)',
      platform: 'Windows 10 / 11',
      systemRequirements: 'Windows 10/11, 4GB RAM, 4GB Free Storage, 1.6 GHz Processor',
      features: 'Word, Excel, PowerPoint, Outlook, Access, Publisher, OneNote, Lifetime Support, Multi-language',
      rating: 5.0,
      reviewCount: 96,
      soldCount: 215,
      isFeatured: true,
      isBestSeller: true,
      isActive: true,
      stockCount: 12,
      keys: [
        'DEMO-OFF24-X49NK-87F93-7928C-2PT98',
        'DEMO-OFF24-NMMKJ-6RK4F-KMJVX-8D9MJ',
        'DEMO-OFF24-74N4J-844C7-72V6M-4R4MD',
      ],
    },
    {
      name: 'Windows 10 Pro Genuine Product Key',
      slug: 'windows-10-pro-key',
      description: 'Windows 10 Pro Product Key ស្របច្បាប់ ផ្តល់នូវភាពងាយស្រួល ស្ថិរភាព និងគាំទ្ររាល់ Software ចាស់និងថ្មី។ អាច Upgrade ទៅ Windows 11 Pro បានដោយឥតគិតថ្លៃនៅពេលក្រោយ។',
      shortDesc: 'Product Key Windows 10 Pro 64-bit / 32-bit Lifetime Online Activation',
      price: 9.99,
      comparePrice: 19.99,
      discountPercent: 50,
      images: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['windows-keys'].id,
      version: '22H2',
      platform: 'Windows PC / Laptop',
      systemRequirements: '1GHz CPU, 2GB RAM, 20GB Storage',
      features: 'Lifetime License, Free Upgrade to Win 11, BitLocker, Remote Desktop',
      rating: 4.8,
      reviewCount: 72,
      soldCount: 190,
      isFeatured: false,
      isBestSeller: true,
      isActive: true,
      stockCount: 20,
      keys: [
        'DEMO-W10PR-TX9XD-98N7V-6WMQ6-BX7FG',
        'DEMO-W10PR-3KHY7-WNT83-DGQKR-F7HPR',
      ],
    },
    {
      name: 'Adobe Photoshop 2024 License',
      slug: 'adobe-photoshop-2024-license',
      description: 'Adobe Photoshop 2024 កម្មវិធីកាត់តរូបភាពដ៏មានឥទ្ធិពលបំផុតលើពិភពលោក ជាមួយបច្ចេកវិទ្យា Generative AI Fill, Neural Filters, និង Tools ទំនើបៗសម្រាប់ Designer និង Photographer។',
      shortDesc: 'Photoshop 2024 ជំនាន់ថ្មីបំផុត ជាមួយ AI Generative Fill & Neural Tools',
      price: 29.99,
      comparePrice: 59.99,
      discountPercent: 50,
      images: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['adobe'].id,
      version: 'v25.11 (2024)',
      platform: 'Windows / macOS',
      systemRequirements: 'Windows 10/11 64-bit, 8GB RAM (16GB recommended), GPU with DirectX 12',
      features: 'Generative AI Fill, Remove Tool, Neural Filters, Multi-language Support',
      rating: 4.9,
      reviewCount: 54,
      soldCount: 110,
      isFeatured: true,
      isBestSeller: false,
      isActive: true,
      stockCount: 8,
      keys: [
        'DEMO-ADOBE-PS24-8849-2048-9182-3847',
        'DEMO-ADOBE-PS24-1192-4938-2940-5829',
      ],
    },
    {
      name: 'Internet Download Manager (IDM) Lifetime Key',
      slug: 'idm-lifetime-key',
      description: 'Internet Download Manager (IDM) បង្កើនល្បឿនទាញយកឯកសាររហូតដល់ 5 ដង អាច Resume ការទាញយកដែលរអាក់រអួល និងទាញយក Video ពី Facebook, YouTube, TikTok បានងាយស្រួល។',
      shortDesc: 'IDM Lifetime License 1 PC អាច Update បានរហូត គ្មានថ្ងៃផុតកំណត់',
      price: 8.99,
      comparePrice: 18.00,
      discountPercent: 50,
      images: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['software'].id,
      version: '6.42 Build 18+',
      platform: 'Windows All Versions',
      systemRequirements: 'Windows 7/8/10/11',
      features: '5x Download Speed, Video Grabber, Resume Support, Official Lifetime Key',
      rating: 4.9,
      reviewCount: 220,
      soldCount: 520,
      isFeatured: true,
      isBestSeller: true,
      isActive: true,
      stockCount: 25,
      keys: [
        'DEMO-IDMLT-98721-ABCD3-EFGH4-56789',
        'DEMO-IDMLT-12345-67890-ABCDE-FGHIJ',
      ],
    },
    {
      name: 'Kaspersky Total Security 1-Year (3 Devices)',
      slug: 'kaspersky-total-security-1year',
      description: 'ការពារកុំព្យូទ័រ និងទូរស័ព្ទរបស់អ្នកពី Virus, Malware, Ransomware, និង Hacker។ រួមបញ្ចូល VPN សុវត្ថិភាព និង Password Manager ផងដែរ។',
      shortDesc: 'កញ្ចប់សុវត្ថិភាពពេញលេញ 1 ឆ្នាំ ប្រើប្រាស់បាន 3 គ្រឿង (PC, Mac, Android)',
      price: 14.50,
      comparePrice: 29.99,
      discountPercent: 52,
      images: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['antivirus'].id,
      version: '2025/2026 Edition',
      platform: 'Windows / Mac / Android / iOS',
      systemRequirements: '2GB RAM, 1.5GB Storage, Internet connection',
      features: 'Real-time Anti-Virus, Ransomware Protection, Safe Money, Fast VPN',
      rating: 4.8,
      reviewCount: 41,
      soldCount: 88,
      isFeatured: false,
      isBestSeller: false,
      isActive: true,
      stockCount: 14,
      keys: [
        'DEMO-KASP3-8874-9921-0023-4412',
        'DEMO-KASP3-7721-3329-8819-2201',
      ],
    },
    {
      name: 'Microsoft 365 Personal (1-Year Subscription)',
      slug: 'microsoft-365-personal-1year',
      description: 'គណនី Microsoft 365 ផ្លូវការ រួមបញ្ចូល 1TB Cloud Storage (OneDrive) និងកម្មវិធី Office ទាំងអស់សម្រាប់ 1 នាក់ (PC, Mac, Tablet, Phone ដល់ទៅ 5 គ្រឿងក្នុងពេលតែមួយ)។',
      shortDesc: 'Microsoft 365 រួមមាន Word, Excel, PPT + 1TB OneDrive Cloud Storage រយៈពេល 1 ឆ្នាំ',
      price: 18.99,
      comparePrice: 39.99,
      discountPercent: 53,
      images: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['microsoft-office'].id,
      version: 'Always Updated 365',
      platform: 'Windows, Mac, iOS, Android',
      systemRequirements: 'Any modern device',
      features: '1TB OneDrive Cloud, 5 Devices at once, Premium Templates, Microsoft Support',
      rating: 4.9,
      reviewCount: 63,
      soldCount: 142,
      isFeatured: true,
      isBestSeller: false,
      isActive: true,
      stockCount: 10,
      keys: [
        'DEMO-M365P-99281-AAAAA-BBBBB-CCCCC',
      ],
    },
    {
      name: 'WinRAR 7.00 Pro Lifetime Commercial License',
      slug: 'winrar-700-pro-license',
      description: 'WinRAR 7.00 កម្មវិធីពន្លា និងបង្ហាប់ឯកសារ ZIP/RAR ដ៏ល្បីល្បាញបំផុត។ License ស្របច្បាប់ គ្មានផ្ទាំងរំខានទៀតឡើយ ប្រើប្រាស់មួយជីវិត។',
      shortDesc: 'WinRAR 7.00 Pro License ផ្លូវការ គ្មានផ្ទាំង Warning ប្រើបានមួយជីវិត',
      price: 4.99,
      comparePrice: 12.00,
      discountPercent: 58,
      images: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['software'].id,
      version: '7.00 (64-bit / 32-bit)',
      platform: 'Windows All',
      systemRequirements: 'Any Windows PC',
      features: 'RAR and ZIP compression, 256-bit AES encryption, Lifetime validity',
      rating: 4.9,
      reviewCount: 110,
      soldCount: 310,
      isFeatured: false,
      isBestSeller: false,
      isActive: true,
      stockCount: 30,
      keys: [
        'DEMO-WRAR7-11111-22222-33333-44444',
      ],
    },
  ];

  const createdProducts: Record<string, any> = {};

  for (const prod of productsData) {
    const { keys, ...productInfo } = prod;
    const created = await prisma.product.create({
      data: {
        ...productInfo,
      },
    });
    createdProducts[prod.slug] = created;

    // Create demo keys
    for (const k of keys) {
      await prisma.productKey.create({
        data: {
          key: k,
          status: 'AVAILABLE',
          productId: created.id,
        },
      });
    }
  }
  console.log('✅ បានបង្កើត Products និង Available Product Keys');

  // 4. Create Digital Files & Tools
  const filesData = [
    {
      title: 'Windows 11 Pro 24H2 Clean Official ISO (64-bit)',
      slug: 'windows-11-pro-24h2-iso',
      description: 'ឯកសារ Windows 11 Pro ISO Clean ផ្លូវការពី Microsoft ជំនាន់ចុងក្រោយ 24H2 (Build 26100) គ្មានមេរោគ គ្មានការកែប្រែ អាចដំឡើងលើគ្រប់កុំព្យូទ័រ។',
      version: '24H2 (Build 26100.1742)',
      fileType: 'ISO',
      fileSize: '5.4 GB',
      filePath: 'windows-11-pro-24h2.iso',
      downloadCount: 12540,
      isFree: true,
      price: 0,
      changelog: '- Update build 26100.1742\n- គាំទ្រ AI features ថ្មីៗ\n- កែសម្រួលសុវត្ថិភាពប្រព័ន្ធ',
      requirements: 'USB Drive 8GB+, Rufus or Ventoy Tool',
      categoryId: categories['digital-files-tools'].id,
      isActive: true,
    },
    {
      title: 'Microsoft Office 2024 LTSC Pro Plus Offline Installer',
      slug: 'office-2024-ltsc-installer',
      description: 'កញ្ចប់ដំឡើង Office 2024 LTSC Professional Plus Offline ពេញលេញ អាចដំឡើងដោយមិនចាំបាច់មាន Internet។',
      version: '16.0.17932.20162',
      fileType: 'ZIP',
      fileSize: '3.8 GB',
      filePath: 'office-2024-pro-plus.zip',
      downloadCount: 8230,
      isFree: true,
      price: 0,
      changelog: '- កញ្ចប់ Offline ពេញលេញ\n- រួមមាន Word, Excel, PPT, Outlook, Access\n- គាំទ្រ Windows 10 & 11',
      requirements: 'Windows 10/11 64-bit, 4GB Free Storage',
      categoryId: categories['digital-files-tools'].id,
      isActive: true,
    },
    {
      title: 'Adobe Photoshop 2024 Multi-Language Full Installer',
      slug: 'adobe-photoshop-2024-installer',
      description: 'កញ្ចប់ Setup Adobe Photoshop 2024 ងាយស្រួលដំឡើង ដំណើរការរលូន និងមានស្ថិរភាពខ្ពស់។',
      version: 'v25.11',
      fileType: 'ZIP',
      fileSize: '3.2 GB',
      filePath: 'photoshop-2024-installer.zip',
      downloadCount: 6410,
      isFree: false,
      price: 5.00,
      changelog: '- Neural Filters Integration\n- Bug fixes and stability enhancement',
      requirements: 'Windows 10/11, 8GB RAM, DirectX 12 GPU',
      categoryId: categories['adobe'].id,
      isActive: true,
    },
    {
      title: 'Windows & Office Digital License Diagnostic Tool',
      slug: 'license-diagnostic-tool',
      description: 'កម្មវិធីជំនួយត្រួតពិនិត្យស្ថានភាព License Key និងជួយដោះស្រាយបញ្ហា Activation លើ Windows និង Office បានយ៉ាងរហ័ស។',
      version: 'v4.5.2',
      fileType: 'ZIP',
      fileSize: '12 MB',
      filePath: 'kms-activator-clean.zip',
      downloadCount: 18920,
      isFree: true,
      price: 0,
      changelog: '- Fast activation test\n- Clear product key cache\n- Windows 11 24H2 support',
      requirements: 'Windows 7/8/10/11 with Admin rights',
      categoryId: categories['digital-files-tools'].id,
      isActive: true,
    },
    {
      title: 'WinRAR 7.00 Pro 64-bit Official Installer',
      slug: 'winrar-700-installer',
      description: 'ឯកសារដំឡើង WinRAR 7.00 Pro 64-bit ផ្លូវការ លឿន និងងាយស្រួលប្រើ។',
      version: '7.00 Final',
      fileType: 'EXE',
      fileSize: '3.5 MB',
      filePath: 'winrar-700-64bit.exe',
      downloadCount: 24350,
      isFree: true,
      price: 0,
      changelog: '- Improved RAR compression algorithm\n- Faster decompression on multi-core CPUs',
      requirements: 'Windows All (32/64 bit)',
      categoryId: categories['software'].id,
      isActive: true,
    },
  ];

  const createdFiles: Record<string, any> = {};
  for (const f of filesData) {
    const created = await prisma.file.create({ data: f });
    createdFiles[f.slug] = created;
  }
  console.log('✅ បានបង្កើត Digital Files');

  // 5. Create Sample Order for Customer
  const win11 = createdProducts['windows-11-pro-key'];
  const office24 = createdProducts['microsoft-office-2024-pro-plus-key'];

  // Order 1: Completed & Paid with assigned keys
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'BP-20260831-001',
      userId: customer.id,
      customerName: 'សុខ វិបុល (Sok Vibul)',
      customerEmail: 'customer@bozzpov.com',
      customerPhone: '+855 98 765 432',
      subtotal: 38.98,
      discount: 3.90,
      total: 35.08,
      paymentStatus: 'PAID',
      orderStatus: 'COMPLETED',
      paymentMethod: 'BAKONG_KHQR',
      paymentDetails: JSON.stringify({
        bank: 'Bakong / KHQR',
        transactionRef: 'BKG-TXN-884920491',
        paidAt: new Date().toISOString(),
      }),
      createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
  });

  // Create Order Items and Assign SOLD Keys
  const item1 = await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: win11.id,
      name: 'Windows 11 Pro Genuine Product Key',
      price: 13.99,
      quantity: 1,
    },
  });

  const soldKey1 = await prisma.productKey.create({
    data: {
      key: 'DEMO-W11PR-BKG99-SOLD1-PROXX-88492',
      status: 'SOLD',
      productId: win11.id,
      orderItemId: item1.id,
      soldAt: new Date(Date.now() - 86400000 * 2),
    },
  });

  const item2 = await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: office24.id,
      name: 'Microsoft Office 2024 Pro Plus Lifetime Key',
      price: 24.99,
      quantity: 1,
    },
  });

  const soldKey2 = await prisma.productKey.create({
    data: {
      key: 'DEMO-OFF24-PROPLUS-SOLD1-99881-22341',
      status: 'SOLD',
      productId: office24.id,
      orderItemId: item2.id,
      soldAt: new Date(Date.now() - 86400000 * 2),
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      amount: 35.08,
      currency: 'USD',
      provider: 'BAKONG_KHQR',
      transactionId: 'BKG-TXN-884920491',
      status: 'SUCCESS',
      payload: JSON.stringify({ status: 'COMPLETED', method: 'KHQR' }),
    },
  });

  // Customer download log
  await prisma.download.create({
    data: {
      userId: customer.id,
      fileId: createdFiles['windows-11-pro-24h2-iso'].id,
      ipAddress: '103.216.51.12',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    },
  });

  // 6. Create Coupons
  await prisma.coupon.create({
    data: {
      code: 'BOZZPOV10',
      discountType: 'PERCENT',
      discountValue: 10, // 10%
      minSpend: 10,
      maxDiscount: 50,
      isActive: true,
      usageCount: 14,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'WELCOME5',
      discountType: 'FIXED',
      discountValue: 5, // $5
      minSpend: 20,
      isActive: true,
      usageCount: 8,
    },
  });

  // 7. Create Reviews
  await prisma.review.create({
    data: {
      userId: customer.id,
      productId: win11.id,
      rating: 5,
      comment: 'Key ដំណើរការបានល្អណាស់! បង់ប្រាក់តាម Bakong ភ្លាម Key លោតចេញភ្លាម Activate ភ្លែត។ សេវាកម្មរហ័សទាន់ចិត្ត 10/10!',
    },
  });

  await prisma.review.create({
    data: {
      userId: customer.id,
      productId: office24.id,
      rating: 5,
      comment: 'Office 2024 Pro Plus Activate ជោគជ័យ 100%! មិនបាច់បារម្ភរឿង Expired ទៀតទេ។ អរគុណ Bozz Pov!',
    },
  });

  console.log('🎉 Seeding ត្រូវបានបញ្ចប់ដោយជោគជ័យ 100%!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
