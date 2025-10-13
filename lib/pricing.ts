// Pricing packages configuration
// This file contains static pricing data that matches the database packages

export interface PricingPackage {
  id: string;
  name: string;
  displayName: string;
  price: number;
  priceText: string;
  period: string;
  tokenQuota: number;
  maxStudents: number;
  features: string[];
  highlight: boolean;
  popular?: boolean;
}

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    id: 'free',
    name: 'free',
    displayName: 'Miễn phí',
    price: 0,
    priceText: '0 VNĐ',
    period: '',
    tokenQuota: 50,
    maxStudents: 1,
    features: [
      '50 tokens/ngày',
      '5 bài học cơ bản',
      'Chat AI giới hạn',
      'Hỗ trợ cộng đồng',
    ],
    highlight: false,
  },
  {
    id: 'basic',
    name: 'basic',
    displayName: 'Gói Basic',
    price: 99000,
    priceText: '99,000 VNĐ',
    period: '/tháng',
    tokenQuota: 500,
    maxStudents: 1,
    features: [
      '500 tokens/ngày',
      'Tất cả bài học',
      'Chat AI không giới hạn',
      'Báo cáo tiến độ',
      'Hỗ trợ qua email',
    ],
    highlight: false,
  },
  {
    id: 'premium',
    name: 'premium',
    displayName: 'Gói Premium',
    price: 249000,
    priceText: '249,000 VNĐ',
    period: '/tháng',
    tokenQuota: 2000,
    maxStudents: 3,
    features: [
      '2,000 tokens/ngày',
      'Tất cả tính năng Basic',
      'Hỗ trợ 3 học sinh',
      'Báo cáo chi tiết',
      'Hỗ trợ ưu tiên',
      'Backup dữ liệu',
    ],
    highlight: true,
    popular: true,
  },
  {
    id: 'teacher',
    name: 'teacher',
    displayName: 'Gói Teacher',
    price: 499000,
    priceText: '499,000 VNĐ',
    period: '/tháng',
    tokenQuota: 999999,
    maxStudents: 30,
    features: [
      'Tokens không giới hạn',
      'Quản lý 30 học sinh',
      'Dashboard giáo viên',
      'Analytics chi tiết',
      'White-label option',
      'Hỗ trợ 24/7',
      'API access',
    ],
    highlight: false,
  },
];

// Helper functions
export function getPackageById(id: string): PricingPackage | undefined {
  return PRICING_PACKAGES.find(pkg => pkg.id === id);
}

export function getPackageByName(name: string): PricingPackage | undefined {
  return PRICING_PACKAGES.find(pkg => pkg.name === name);
}

export function getActivePackages(): PricingPackage[] {
  return PRICING_PACKAGES.filter(pkg => pkg.id !== 'free');
}

export function getFreePackage(): PricingPackage {
  return PRICING_PACKAGES.find(pkg => pkg.id === 'free')!;
}

export function getPopularPackage(): PricingPackage | undefined {
  return PRICING_PACKAGES.find(pkg => pkg.popular);
}

// Format price for display
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

// Get savings percentage compared to basic
export function getSavingsPercentage(packageId: string): number {
  const basicPackage = getPackageById('basic');
  const currentPackage = getPackageById(packageId);
  
  if (!basicPackage || !currentPackage || currentPackage.id === 'free') {
    return 0;
  }
  
  // Calculate monthly savings if buying annually
  const monthlyBasicPrice = basicPackage.price;
  const monthlyCurrentPrice = currentPackage.price;
  
  if (monthlyCurrentPrice <= monthlyBasicPrice) {
    return 0;
  }
  
  // For premium and teacher, show value proposition
  const valueRatio = (currentPackage.tokenQuota / currentPackage.maxStudents) / 
                    (basicPackage.tokenQuota / basicPackage.maxStudents);
  
  return Math.round((valueRatio - 1) * 100);
}

// Check if user should see upgrade prompt
export function shouldShowUpgrade(currentPlan: string): boolean {
  return currentPlan === 'free' || currentPlan === 'basic';
}

// Get recommended next package
export function getRecommendedPackage(currentPlan: string): PricingPackage | null {
  switch (currentPlan) {
    case 'free':
      return getPackageById('basic') || null;
    case 'basic':
      return getPackageById('premium') || null;
    case 'premium':
      return getPackageById('teacher') || null;
    default:
      return null;
  }
}
