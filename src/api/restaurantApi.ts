import api from './axiosConfig';

export interface Restaurant {
  id: number;
  ownerId: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  cuisine: string;
  openingTime: string;
  closingTime: string;
  rating: number;
  totalReviews: number;
  imageUrl: string;
  isActive: boolean;
  isOpen: boolean;
  deliveryFee: number;
  minOrderAmount: number;
  avgDeliveryTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantRequest {
  ownerId: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  cuisine?: string;
  openingTime?: string;
  closingTime?: string;
  imageUrl?: string;
  deliveryFee?: number;
  minOrderAmount?: number;
  avgDeliveryTime?: number;
}

export const restaurantApi = {

  register: (data: RestaurantRequest): Promise<Restaurant> =>
    api
      .post<Restaurant>('/api/restaurants/register', data)
      .then(r => r.data),        

  getById: (id: number): Promise<Restaurant> =>
    api
      .get<Restaurant>(`/api/restaurants/${id}`)
      .then(r => r.data),      

  update: (id: number, data: RestaurantRequest): Promise<Restaurant> =>
    api
      .put<Restaurant>(`/api/restaurants/${id}`, data)
      .then(r => r.data),      
};