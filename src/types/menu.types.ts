export const Category = {
  APPETIZER: 'APPETIZER',
  MAIN_COURSE: 'MAIN_COURSE',
  DESSERT: 'DESSERT',
  BEVERAGES: 'BEVERAGES',
  SALAD: 'SALAD',
  SOUP: 'SOUP',
  BREAD: 'BREAD',
  RICE: 'RICE',
  NOODLES: 'NOODLES',
  PIZZA: 'PIZZA',
  BURGER: 'BURGER',
  SANDWICH: 'SANDWICH',
  BREAKFAST: 'BREAKFAST',
  SNACKS: 'SNACKS',
  SPECIAL: 'SPECIAL',
  SIDE_DISH: 'SIDE_DISH',
} as const;

export type Category = typeof Category[keyof typeof Category];

export const CATEGORY_LABELS: Record<Category, string> = {
  APPETIZER: '🥗 Appetizer',
  MAIN_COURSE: '🍛 Main Course',
  DESSERT: '🍰 Dessert',
  BEVERAGES: '🥤 Beverages',
  SALAD: '🥙 Salad',
  SOUP: '🍲 Soup',
  BREAD: '🍞 Bread',
  RICE: '🍚 Rice',
  NOODLES: '🍜 Noodles',
  PIZZA: '🍕 Pizza',
  BURGER: '🍔 Burger',
  SANDWICH: '🥪 Sandwich',
  BREAKFAST: '🍳 Breakfast',
  SNACKS: '🍟 Snacks',
  SPECIAL: '⭐ Special',
  SIDE_DISH: '🍽️ Side Dish',
};

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
