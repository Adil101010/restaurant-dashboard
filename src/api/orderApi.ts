import api from './axiosConfig';

export type OrderStatus =
  | 'PENDING_PAYMENT' | 'PENDING' | 'CONFIRMED'
  | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'RAZORPAY' | 'CASH_ON_DELIVERY' | 'WALLET';

export interface OrderItemResponse {
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface OrderResponse {
  id: number;
  userId: number;
  restaurantId: number;
  restaurantName: string;
  items: OrderItemResponse[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  deliveryInstructions?: string;
  customerPhone: string;
  customerName: string;
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;       
  size: number;
  last: boolean;
}

export const orderApi = {
  getRestaurantOrders: (restaurantId: number, page = 0, size = 10) =>
    api.get<{ data: PageResponse<OrderResponse> }>(
      `/api/orders/restaurant/${restaurantId}?page=${page}&size=${size}`
    ).then(r => r.data.data),

  getOrderById: (orderId: number) =>
    api.get<{ data: OrderResponse }>(`/api/orders/${orderId}`)
      .then(r => r.data.data),

  updateStatus: (orderId: number, status: OrderStatus) =>
    api.put<{ data: OrderResponse }>(
      `/api/orders/${orderId}/status?status=${status}`
    ).then(r => r.data.data),

  cancelOrder: (orderId: number) =>
    api.post(`/api/orders/${orderId}/cancel`).then(r => r.data),
};
