import axiosInstance from './axiosConfig';

export type DiscountType = 'PERCENTAGE' | 'FLAT_DISCOUNT' | 'FREE_DELIVERY';
export type CouponStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  validFrom: string;
  validUntil: string;
  maxUsageCount: number;
  maxUsagePerUser: number;
  currentUsageCount: number;
  remainingUsage: number;
  status: CouponStatus;
  restaurantId?: number;
  applicableFor: string;
}

export interface CreateCouponRequest {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  validFrom: string;
  validUntil: string;
  maxUsageCount: number;
  maxUsagePerUser: number;
  restaurantId?: number;
  applicableFor: string;
}

export const promotionsApi = {
  getRestaurantCoupons: async (restaurantId: number): Promise<Coupon[]> => {
    const response = await axiosInstance.get<Coupon[]>(
      `/api/coupons/restaurant/${restaurantId}`
    );
    return response.data;
  },

  getActiveCoupons: async (): Promise<Coupon[]> => {
    const response = await axiosInstance.get<Coupon[]>('/api/coupons/active');
    return response.data;
  },

  createCoupon: async (data: CreateCouponRequest): Promise<Coupon> => {
    const response = await axiosInstance.post<Coupon>('/api/coupons', data);
    return response.data;
  },

  deactivateCoupon: async (couponId: number): Promise<Coupon> => {
    const response = await axiosInstance.put<Coupon>(
      `/api/coupons/${couponId}/deactivate`
    );
    return response.data;
  },
};
