import api from './axiosConfig';

export interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isAvailable: boolean;
  rating: number;
  totalOrders: number;
  ingredients: string;
  allergens: string;
  preparationTime: number;
  calories: number;
  isBestseller: boolean;
  isSpicy: boolean;
  spiceLevel: number;
  createdAt: string;
  updatedAt: string;

  isOnOffer: boolean;       // ✅ backend se match
  discountPercent: number;
  offerLabel: string;
  discountedPrice: number;
}

export type Category =
  | 'APPETIZER' | 'MAIN_COURSE' | 'DESSERT' | 'BEVERAGES'
  | 'SALAD' | 'SOUP' | 'BREAD' | 'RICE' | 'NOODLES'
  | 'PIZZA' | 'BURGER' | 'SANDWICH' | 'BREAKFAST'
  | 'SNACKS' | 'SPECIAL' | 'SIDE_DISH';

export interface MenuItemRequest {
  restaurantId: number;
  name: string;
  description?: string;
  price: number;
  category: Category;
  imageUrl?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isAvailable?: boolean;
  ingredients?: string;
  allergens?: string;
  preparationTime?: number;
  calories?: number;
  isBestseller?: boolean;
  isSpicy?: boolean;
  spiceLevel?: number;

  isOnOffer?: boolean;      // ✅ backend se match
  discountPercent?: number;
  offerLabel?: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  APPETIZER: 'Appetizer',
  MAIN_COURSE: 'Main Course',
  DESSERT: 'Dessert',
  BEVERAGES: 'Beverages',
  SALAD: 'Salad',
  SOUP: 'Soup',
  BREAD: 'Bread',
  RICE: 'Rice',
  NOODLES: 'Noodles',
  PIZZA: 'Pizza',
  BURGER: 'Burger',
  SANDWICH: 'Sandwich',
  BREAKFAST: 'Breakfast',
  SNACKS: 'Snacks',
  SPECIAL: 'Special',
  SIDE_DISH: 'Side Dish',
};

export const menuApi = {
  getByRestaurant: (restaurantId: number) =>
    api.get<MenuItem[]>(`/api/menu/restaurant/${restaurantId}`).then(r => r.data),

  getById: (id: number) =>
    api.get<MenuItem>(`/api/menu/items/${id}`).then(r => r.data),

  create: (data: MenuItemRequest) =>
    api.post<MenuItem>('/api/menu/items', data).then(r => r.data),

  update: (id: number, data: MenuItemRequest) =>
    api.put<MenuItem>(`/api/menu/items/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/api/menu/items/${id}`).then(r => r.data),

  toggleAvailability: (id: number) =>
    api.patch<MenuItem>(`/api/menu/items/${id}/availability`).then(r => r.data),

  getByCategory: (restaurantId: number, category: Category) =>
    api.get<MenuItem[]>(`/api/menu/restaurant/${restaurantId}/category/${category}`)
      .then(r => r.data),
};
