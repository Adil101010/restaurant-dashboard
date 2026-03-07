import { useState, useMemo } from 'react';
import type { MenuItem, CreateMenuItemRequest } from '../../types/menu.types';
import { Category, CATEGORY_LABELS } from '../../types/menu.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMenuItemRequest) => void;
  editItem?: MenuItem | null;
  restaurantId: number;
}

const defaultForm = {
  name: '',
  description: '',
  price: '',
  categoryId: Category.SNACKS as string,
  imageUrl: '',
  isVeg: true,
};

const AddItemModal = ({ isOpen, onClose, onSubmit, editItem, restaurantId }: Props) => {
  const initialForm = useMemo(() => {
    if (editItem) {
      return {
        name: editItem.name,
        description: editItem.description,
        price: String(editItem.price),
        categoryId: editItem.categoryName,
        imageUrl: editItem.imageUrl ?? '',
        isVeg: editItem.isVeg,
      };
    }
    return defaultForm;
  }, [editItem]);

  const [form, setForm] = useState(initialForm);

  // Sync form when editItem changes
  const formData = editItem ? initialForm : form;
  const setFormData = (val: typeof defaultForm) => {
    if (!editItem) setForm(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      categoryId: formData.categoryId as unknown as number,
      restaurantId,
      imageUrl: formData.imageUrl || undefined,
      isVeg: formData.isVeg,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {editItem ? '✏️ Edit Item' : '➕ Add Menu Item'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Item Name *</label>
            <input
              type="text" required
              placeholder="e.g. Paneer Butter Masala"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description *</label>
            <textarea
              required rows={2}
              placeholder="Brief description of the item"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Price (₹) *</label>
              <input
                type="number" required min="0"
                placeholder="e.g. 250"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Category *</label>
              <select
                title="Select category"
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Image URL (optional)</label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <button type="button"
              onClick={() => setFormData({ ...formData, isVeg: true })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                formData.isVeg ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
              🟢 Veg
            </button>
            <button type="button"
              onClick={() => setFormData({ ...formData, isVeg: false })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                !formData.isVeg ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
              🔴 Non-Veg
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition">
              {editItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
