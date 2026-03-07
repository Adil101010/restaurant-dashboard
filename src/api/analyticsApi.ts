import axiosInstance from './axiosConfig';

export interface RevenueData {
  todayRevenue: number;
  weeklyRevenue: number;    
  monthlyRevenue: number;   
  totalRevenue: number;
  restaurantId: number;
}

export interface OrderStatsData {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface TopItem {
  menuItemId: number;
  menuItemName: string;
  totalQuantity: number;
  totalRevenue: number;
  imageUrl?: string;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export const analyticsApi = {
  getRevenue: async (restaurantId: number): Promise<RevenueData> => {
    const response = await axiosInstance.get<RevenueData>(
      `/api/analytics/restaurant/${restaurantId}/revenue`
    );
    return response.data;
  },

  getOrderStats: async (restaurantId: number): Promise<OrderStatsData> => {
    const response = await axiosInstance.get<OrderStatsData>(
      `/api/analytics/restaurant/${restaurantId}/orders`
    );
    return response.data;
  },

  getTopItems: async (restaurantId: number, limit = 5): Promise<TopItem[]> => {
    const response = await axiosInstance.get<TopItem[]>(
      `/api/analytics/restaurant/${restaurantId}/top-items?limit=${limit}`
    );
    return response.data;
  },

  getWeeklyRevenue: async (restaurantId: number): Promise<DailyRevenue[]> => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const from = weekAgo.toISOString().split('T')[0];
    const to = today.toISOString().split('T')[0];

    const response = await axiosInstance.get<DailyRevenue[]>(
      `/api/analytics/restaurant/${restaurantId}/revenue?from=${from}&to=${to}`
    );
    return response.data;
  },
};
