import api from './axiosConfig';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'RAZORPAY' | 'CASH_ON_DELIVERY' | 'WALLET';



export type BackendDate = string | number[];

export const parseBackendDate = (val: BackendDate | null | undefined): Date | null => {
  if (!val) return null;

  if (Array.isArray(val)) {
    
    const [year, month, day, hour = 0, min = 0, sec = 0] = val;
    return new Date(year, month - 1, day, hour, min, sec); 
  }

  
  const normalized = (val as string)
    .replace(' ', 'T')
    .replace(/(\.\d{1,3})\d*$/, '$1');  

  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
};

export const formatBackendDate = (
  val: BackendDate | null | undefined,
  options?: { dateOnly?: boolean; timeOnly?: boolean }
): string => {
  const d = parseBackendDate(val);
  if (!d) return '—';

  if (options?.timeOnly) {
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  if (options?.dateOnly) {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};



export interface OrderItemResponse {
  id: number;
  menuItemId: number;
  itemName: string;
  quantity: number;
  price: number;
  subtotal: number;
  specialInstructions?: string;
}

export interface OrderResponse {
  id: number;
  userId: number;
  restaurantId: number;
  restaurantName: string;
  restaurantAddress?: string;
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
  customerEmail?: string;
  estimatedDeliveryTime?: BackendDate;  
  deliveredAt?: BackendDate;            
  createdAt: BackendDate;               
  updatedAt: BackendDate;               
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  deliveryPartnerId?: number;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  deliveryPartnerVehicle?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}



export const orderApi = {

  getRestaurantOrders: (restaurantId: number, page = 0, size = 20) =>
    api
      .get<ApiResponse<PageResponse<OrderResponse>>>(
        `/api/orders/restaurant/${restaurantId}?page=${page}&size=${size}`
      )
      .then(r => r.data.data),

  getRestaurantOrdersByStatus: (
    restaurantId: number,
    status: OrderStatus,
    page = 0,
    size = 20
  ) =>
    api
      .get<ApiResponse<PageResponse<OrderResponse>>>(
        `/api/orders/restaurant/${restaurantId}/status/${status}?page=${page}&size=${size}`
      )
      .then(r => r.data.data),

  getOrderById: (orderId: number) =>
    api
      .get<ApiResponse<OrderResponse>>(`/api/orders/${orderId}`)
      .then(r => r.data.data),

  updateStatus: (orderId: number, status: OrderStatus) =>
    api
      .put<ApiResponse<OrderResponse>>(
        `/api/orders/${orderId}/status?status=${status}`
      )
      .then(r => r.data.data),

  cancelOrder: (orderId: number) =>
    api
      .post<ApiResponse<OrderResponse>>(`/api/orders/${orderId}/cancel`)
      .then(r => r.data.data),
};