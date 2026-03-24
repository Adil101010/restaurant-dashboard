import type { MenuItem } from '../../types/menu.types';
import { CATEGORY_LABELS, Category } from '../../types/menu.types';


interface Props {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}

const MenuItemCard: React.FC<Props> = ({ item, onEdit, onDelete, onToggle }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 ${
      item.isAvailable ? 'border-gray-100' : 'border-red-100 opacity-75'
    }`}>
      
      <div className="relative h-44 bg-gray-100 rounded-t-xl overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name}
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
        )}

       
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            item.isVeg
              ? 'bg-green-100 text-green-700 border border-green-400'
              : 'bg-red-100 text-red-700 border border-red-400'
          }`}>
            {item.isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
          </span>
        </div>

       
        <div className="absolute top-2 right-2">
          <button onClick={() => onToggle(item.id)}
            className={`text-xs font-semibold px-2 py-1 rounded-full cursor-pointer transition ${
              item.isAvailable
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-400 text-white hover:bg-gray-500'
            }`}>
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </button>
        </div>
      </div>

     
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-gray-800 text-base leading-tight">{item.name}</h3>
          <span className="text-orange-500 font-bold text-base ml-2">₹{item.price}</span>
        </div>

        <p className="text-gray-500 text-sm mb-2 line-clamp-2">{item.description}</p>

        <span className="inline-block text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full mb-3">
          {CATEGORY_LABELS[item.categoryName as Category] ?? item.categoryName}
        </span>

        
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button onClick={() => onEdit(item)}
            className="flex-1 text-sm py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium">
            ✏️ Edit
          </button>
          <button onClick={() => onDelete(item.id)}
            className="flex-1 text-sm py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium">
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
