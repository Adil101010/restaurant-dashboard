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
  name: string;
  totalQuantity: number;
  orderCount: number;
  totalRevenue: number;
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
    const response = await axiosInstance.get<{ date: string; revenue: number }[]>(
      `/api/analytics/restaurant/${restaurantId}/weekly-revenue`
    );

    return response.data.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      revenue: Number(item.revenue),
      orders: 0,
    }));
  },
};
