export interface Category {
  id: number;
  name: string;
  restaurantId: number;
  displayOrder: number;
  itemCount?: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  restaurantId: number;
  imageUrl: string;
  isAvailable: boolean;
  isVeg: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemRequest {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  restaurantId: number;
  imageUrl?: string;
  isVeg: boolean;
}

export interface UpdateMenuItemRequest extends Partial<CreateMenuItemRequest> {
  isAvailable?: boolean;
}
