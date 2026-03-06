export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface CustomerInfo {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  restaurantId: number;
  customer: CustomerInfo;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  specialInstructions?: string;
  estimatedPrepTime?: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewOrderSocketEvent {
  orderId: number;
  orderNumber: string;
  items: { name: string; quantity: number }[];
  customer: { name: string };
  total: number;
}
