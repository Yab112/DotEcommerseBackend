export interface ICoupon {
  code: string;
  discountType: 'flat' | 'percent';
  discountValue: number;
  expiryDate?: Date;
  minimumAmount?: number;
  isActive?: boolean;
  usageLimit?: number;
  usedBy?: string[]; // Assuming ObjectId is represented as a string
}
