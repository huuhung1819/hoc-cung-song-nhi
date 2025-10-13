// VietQR Generator
// Generate QR codes for bank transfers using VietQR standard

export interface BankInfo {
  bankName: string;
  bankBin: string;
  accountNumber: string;
  accountName: string;
}

// Bank BIN codes for major Vietnamese banks
export const BANK_CODES: Record<string, string> = {
  'Vietcombank': '970436',
  'Techcombank': '970407',
  'VPBank': '970432',
  'ACB': '970416',
  'MB Bank': '970422',
  'Sacombank': '970403',
  'VIB': '970441',
  'TPBank': '970423',
  'OCB': '970448',
  'Agribank': '970405',
  'BIDV': '970418',
  'VietinBank': '970415',
  'LP Bank': '970449', // LPBank
  'MSB': '970426',
  'HDBank': '970437',
  'SHB': '970443',
  'Eximbank': '970431',
  'NCB': '970419',
  'GPBank': '970408',
  'SCB': '970429',
};

// Your bank information (configured for CẤN HỮU HÙNG)
export const YOUR_BANK_INFO: BankInfo = {
  bankName: 'LP Bank',
  bankBin: '970449',
  accountNumber: '0762236886',
  accountName: 'CẤN HỮU HÙNG',
};

export interface VietQROptions {
  amount?: number;
  description?: string;
  template?: 'compact' | 'print' | 'compact2';
  addInfo?: string;
}

/**
 * Generate VietQR URL for bank transfer
 */
export function generateVietQR(
  bankInfo: BankInfo,
  options: VietQROptions = {}
): string {
  const {
    amount,
    description,
    template = 'compact',
    addInfo
  } = options;

  const params = new URLSearchParams();
  
  // Add amount if provided
  if (amount && amount > 0) {
    params.append('amount', amount.toString());
  }
  
  // Add description/note
  if (addInfo || description) {
    params.append('addInfo', encodeURIComponent(addInfo || description || ''));
  }
  
  // Add account name
  if (bankInfo.accountName) {
    params.append('accountName', encodeURIComponent(bankInfo.accountName));
  }
  
  // Build the URL
  const baseUrl = `https://img.vietqr.io/image/${bankInfo.bankBin}-${bankInfo.accountNumber}-${template}.png`;
  const queryString = params.toString();
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Generate QR URL for your configured bank account
 */
export function generateYourVietQR(options: VietQROptions = {}): string {
  return generateVietQR(YOUR_BANK_INFO, options);
}

/**
 * Generate payment QR for specific order
 */
export function generatePaymentQR(
  orderId: string,
  userPhone: string,
  amount: number
): string {
  const description = `${orderId} ${userPhone}`;
  
  return generateYourVietQR({
    amount,
    description,
    addInfo: description,
    template: 'compact'
  });
}

/**
 * Get bank transfer instructions text
 */
export function getBankTransferInstructions(
  amount: number,
  orderContent: string
): string {
  return `
🏦 Ngân hàng: ${YOUR_BANK_INFO.bankName}
💳 Số tài khoản: ${YOUR_BANK_INFO.accountNumber}
👤 Chủ tài khoản: ${YOUR_BANK_INFO.accountName}
💰 Số tiền: ${formatCurrency(amount)} VNĐ
📝 Nội dung chuyển khoản: ${orderContent}
  `.trim();
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

/**
 * Validate bank account information
 */
export function validateBankInfo(bankInfo: BankInfo): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!bankInfo.bankName) {
    errors.push('Tên ngân hàng không được để trống');
  }
  
  if (!bankInfo.bankBin) {
    errors.push('Mã BIN ngân hàng không được để trống');
  } else if (!/^\d{6}$/.test(bankInfo.bankBin)) {
    errors.push('Mã BIN phải có đúng 6 chữ số');
  }
  
  if (!bankInfo.accountNumber) {
    errors.push('Số tài khoản không được để trống');
  } else if (!/^\d{8,15}$/.test(bankInfo.accountNumber)) {
    errors.push('Số tài khoản phải có từ 8-15 chữ số');
  }
  
  if (!bankInfo.accountName) {
    errors.push('Tên chủ tài khoản không được để trống');
  } else if (bankInfo.accountName.length < 2) {
    errors.push('Tên chủ tài khoản phải có ít nhất 2 ký tự');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get bank name from BIN code
 */
export function getBankNameFromBin(bin: string): string | null {
  const entry = Object.entries(BANK_CODES).find(([, code]) => code === bin);
  return entry ? entry[0] : null;
}

/**
 * Get BIN code from bank name
 */
export function getBinFromBankName(bankName: string): string | null {
  // Try exact match first
  if (BANK_CODES[bankName]) {
    return BANK_CODES[bankName];
  }
  
  // Try case-insensitive match
  const normalizedBankName = bankName.toLowerCase();
  const entry = Object.entries(BANK_CODES).find(([name]) => 
    name.toLowerCase().includes(normalizedBankName) ||
    normalizedBankName.includes(name.toLowerCase())
  );
  
  return entry ? entry[1] : null;
}

/**
 * Test QR generation (for development)
 */
export function testVietQR(): string {
  return generateYourVietQR({
    amount: 99000,
    description: 'Test payment DH123456 0912345678',
    template: 'compact'
  });
}
