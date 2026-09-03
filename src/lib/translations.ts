export const KHMER_TEXT = {
  // Brand & Slogans
  brandName: 'P-Two7',
  brandSubtitle: 'ហាងឌីជីថល',
  heroTitle: 'Welcome',
  heroSubtitle: 'ទិញ Product Key និងទាញយក Software & Tools បានភ្លាមៗ និងងាយស្រួល។',
  
  // Navigation
  nav: {
    home: 'ទំព័រដើម',
    products: 'ផលិតផល',
    files: 'ឯកសារ & Tools',
    software: 'កម្មវិធី',
    discounts: 'បញ្ចុះតម្លៃ',
    support: 'ជំនួយ',
    cart: 'កន្ត្រក',
    account: 'គណនីរបស់ខ្ញុំ',
    login: 'ចូលគណនី',
    register: 'បង្កើតគណនី',
    logout: 'ចាកចេញ',
    adminDashboard: 'ផ្ទាំងគ្រប់គ្រង Admin',
    searchPlaceholder: 'ស្វែងរកផលិតផល, Product Key ឬឯកសារ...',
  },

  // Actions
  actions: {
    buyNow: 'ទិញឥឡូវ',
    addToCart: 'បន្ថែមទៅកន្ត្រក',
    download: 'ទាញយក',
    downloadNow: 'ទាញយកឥឡូវនេះ',
    viewDetails: 'មើលព័ត៌មានលម្អិត',
    viewFiles: 'មើលឯកសារ',
    copyKey: 'ចម្លង Key',
    copied: 'បានចម្លង!',
    checkout: 'ទៅកាន់ការបង់ប្រាក់',
    continueShopping: 'បន្តទិញទំនិញ',
    applyCoupon: 'ប្រើប្រាស់',
    save: 'រក្សាទុក',
    cancel: 'បោះបង់',
    delete: 'លុប',
    edit: 'កែសម្រួល',
    addKey: 'បន្ថែម Key',
    bulkImport: 'បញ្ចូល Keys ច្រើន',
    search: 'ស្វែងរក',
    filter: 'តម្រង',
    reset: 'កំណត់ឡើងវិញ',
    submit: 'បញ្ជូន',
    confirmPayment: 'ខ្ញុំបានទូទាត់ប្រាក់រួចរាល់',
  },

  // Statuses
  orderStatus: {
    PENDING: 'កំពុងរង់ចាំ',
    PROCESSING: 'កំពុងដំណើរការ',
    COMPLETED: 'បានបញ្ចប់',
    CANCELLED: 'បានបោះបង់',
    REFUNDED: 'បានសងប្រាក់',
  },

  paymentStatus: {
    PENDING: 'មិនទាន់ទូទាត់',
    PAID: 'បានទូទាត់',
    FAILED: 'បរាជ័យ',
    REFUNDED: 'បានសងប្រាក់',
  },

  keyStatus: {
    AVAILABLE: 'អាចប្រើបាន',
    SOLD: 'បានលក់',
    DISABLED: 'បានបិទ',
  },

  stockStatus: {
    inStock: 'មានក្នុងស្តុក',
    outOfStock: 'អស់ស្តុក',
    limited: 'នៅសល់តិច',
  },

  // Features
  badges: {
    instantDelivery: 'ផ្តល់ជូនភ្លាមៗ',
    securePayment: 'ការទូទាត់មានសុវត្ថិភាព',
    verifiedProducts: 'ផលិតផលមានការផ្ទៀងផ្ទាត់',
    support247: 'ជំនួយ 24/7',
    lifetimeActivation: 'ប្រើបានមួយជីវិត',
    moneyBack: 'ធានាសងប្រាក់ 100%',
  },

  // Sort Options
  sort: {
    latest: 'ថ្មីបំផុត',
    priceLowHigh: 'តម្លៃទាប → ខ្ពស់',
    priceHighLow: 'តម្លៃខ្ពស់ → ទាប',
    popular: 'ពេញនិយម',
  },

  // Payment Methods
  payments: {
    bakong: 'Bakong KHQR',
    aba: 'ABA PAY / KHQR',
    wing: 'Wing Bank',
    card: 'Credit / Debit Card (Visa, Mastercard)',
  },
};

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function formatPriceRiel(priceUsd: number): string {
  const riel = Math.round(priceUsd * 4100);
  return `${riel.toLocaleString()} ៛`;
}

export function formatDateKhmer(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('km-KH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
