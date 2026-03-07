import { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Typography, Button, TextField, InputAdornment,
  Card, CardContent, CardMedia, Chip, IconButton, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem as MuiMenuItem,
  FormControlLabel, Checkbox, Skeleton, Alert, Tooltip,
  
} from '@mui/material';
import {
  Add, Search, Edit, Delete, FilterList,
  LocalFireDepartment, EmojiNature, Star, AccessTime,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  menuApi, type MenuItem, type MenuItemRequest,
  type Category, CATEGORY_LABELS,
} from '../api/menuApi';
import { formatCurrency } from '../utils/formatters';

// ─── Empty Form ────────────────────────────────────────────────
const emptyForm = (): MenuItemRequest => ({
  restaurantId: 0,
  name: '',
  description: '',
  price: 0,
  category: 'SNACKS',
  imageUrl: '',
  isVegetarian: false,
  isVegan: false,
  isAvailable: true,
  ingredients: '',
  allergens: '',
  preparationTime: 15,
  calories: undefined,
  isBestseller: false,
  isSpicy: false,
  spiceLevel: 0,
});

// ─── Item Card ─────────────────────────────────────────────────
const MenuItemCard = ({
  item,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggle: (item: MenuItem) => void;
}) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s',
      opacity: item.isAvailable ? 1 : 0.65,
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,0,0,0.12)' },
    }}
  >
    {/* Image */}
    <Box sx={{ position: 'relative' }}>
      <CardMedia
        component="img"
        height={160}
        image={item.imageUrl || 'https://via.placeholder.com/300x160?text=No+Image'}
        alt={item.name}
        sx={{ objectFit: 'cover' }}
      />
      {/* Badges */}
      <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {item.isBestseller && (
          <Chip label="Bestseller" size="small" icon={<Star sx={{ fontSize: 12 }} />}
            sx={{ bgcolor: '#FF6B35', color: 'white', fontWeight: 700, fontSize: 10 }} />
        )}
        {item.isVegetarian && (
          <Chip label="Veg" size="small" icon={<EmojiNature sx={{ fontSize: 12 }} />}
            sx={{ bgcolor: '#4CAF50', color: 'white', fontWeight: 700, fontSize: 10 }} />
        )}
        {item.isSpicy && (
          <Chip label="Spicy" size="small" icon={<LocalFireDepartment sx={{ fontSize: 12 }} />}
            sx={{ bgcolor: '#f44336', color: 'white', fontWeight: 700, fontSize: 10 }} />
        )}
      </Box>
      {/* Availability toggle */}
      <Box sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 2, px: 0.5 }}>
        <Switch
          size="small"
          checked={item.isAvailable ?? true}
          onChange={() => onToggle(item)}
          color="success"
        />
      </Box>
    </Box>

    <CardContent sx={{ p: 2 }}>
      {/* Category chip */}
      <Chip
        label={CATEGORY_LABELS[item.category]}
        size="small"
        sx={{ bgcolor: '#FFF3EC', color: '#FF6B35', fontWeight: 600, fontSize: 10, mb: 1 }}
      />

      {/* Name & Price */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1, pr: 1, lineHeight: 1.3 }}>
          {item.name}
        </Typography>
        <Typography variant="subtitle1" fontWeight={800} color="primary.main">
          {formatCurrency(item.price)}
        </Typography>
      </Box>

      {/* Description */}
      {item.description && (
        <Typography variant="caption" color="text.secondary"
          sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1 }}>
          {item.description}
        </Typography>
      )}

      {/* Meta row */}
      <Box display="flex" gap={1.5} mb={1.5} flexWrap="wrap">
        {item.preparationTime && (
          <Box display="flex" alignItems="center" gap={0.3}>
            <AccessTime sx={{ fontSize: 13, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{item.preparationTime} min</Typography>
          </Box>
        )}
        {item.calories && (
          <Typography variant="caption" color="text.secondary">{item.calories} kcal</Typography>
        )}
        {item.rating > 0 && (
          <Box display="flex" alignItems="center" gap={0.3}>
            <Star sx={{ fontSize: 13, color: '#FF9800' }} />
            <Typography variant="caption" fontWeight={600}>{item.rating.toFixed(1)}</Typography>
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Box display="flex" justifyContent="flex-end" gap={1}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(item)}
            sx={{ bgcolor: '#F5F5F5', '&:hover': { bgcolor: '#E3F2FD' } }}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => onDelete(item)}
            sx={{ bgcolor: '#F5F5F5', '&:hover': { bgcolor: '#FFEBEE' } }}>
            <Delete fontSize="small" color="error" />
          </IconButton>
        </Tooltip>
      </Box>
    </CardContent>
  </Card>
);

// ─── Add / Edit Dialog ─────────────────────────────────────────
const MenuItemDialog = ({
  open, onClose, onSave, initial, restaurantId,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: MenuItemRequest) => Promise<void>;
  initial: MenuItem | null;
  restaurantId: number;
}) => {
  const [form, setForm] = useState<MenuItemRequest>(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        restaurantId,
        name: initial.name,
        description: initial.description || '',
        price: initial.price,
        category: initial.category,
        imageUrl: initial.imageUrl || '',
        isVegetarian: initial.isVegetarian,
        isVegan: initial.isVegan,
        isAvailable: initial.isAvailable,
        ingredients: initial.ingredients || '',
        allergens: initial.allergens || '',
        preparationTime: initial.preparationTime || 15,
        calories: initial.calories,
        isBestseller: initial.isBestseller,
        isSpicy: initial.isSpicy,
        spiceLevel: initial.spiceLevel || 0,
      });
    } else {
      setForm({ ...emptyForm(), restaurantId });
    }
  }, [initial, restaurantId, open]);

  const set = (key: keyof MenuItemRequest, val: unknown) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Item name is required');
    if (!form.price || form.price <= 0) return toast.error('Valid price is required');
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {initial ? 'Edit Menu Item' : 'Add New Item'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {/* Name */}
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField fullWidth label="Item Name *" value={form.name}
              onChange={e => set('name', e.target.value)} size="small" />
          </Grid>
          {/* Price */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth label="Price *" type="number" value={form.price}
              onChange={e => set('price', parseFloat(e.target.value))} size="small"
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
          </Grid>
          {/* Category */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category *</InputLabel>
              <Select value={form.category} label="Category *"
                onChange={e => set('category', e.target.value as Category)}>
                {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
                  <MuiMenuItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</MuiMenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Prep time */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth label="Prep Time (min)" type="number"
              value={form.preparationTime} size="small"
              onChange={e => set('preparationTime', parseInt(e.target.value))} />
          </Grid>
          {/* Calories */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth label="Calories (kcal)" type="number"
              value={form.calories || ''} size="small"
              onChange={e => set('calories', parseInt(e.target.value))} />
          </Grid>
          {/* Description */}
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Description" multiline rows={2}
              value={form.description} size="small"
              onChange={e => set('description', e.target.value)} />
          </Grid>
          {/* Image URL */}
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Image URL" value={form.imageUrl}
              onChange={e => set('imageUrl', e.target.value)} size="small"
              placeholder="https://example.com/image.jpg" />
          </Grid>
          {/* Ingredients */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Ingredients (comma separated)"
              value={form.ingredients} size="small"
              onChange={e => set('ingredients', e.target.value)} />
          </Grid>
          {/* Allergens */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Allergens (comma separated)"
              value={form.allergens} size="small"
              onChange={e => set('allergens', e.target.value)} />
          </Grid>
          {/* Spice Level */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Spice Level (0-5)" type="number"
              value={form.spiceLevel} size="small"
              inputProps={{ min: 0, max: 5 }}
              onChange={e => set('spiceLevel', parseInt(e.target.value))} />
          </Grid>
          {/* Checkboxes */}
          <Grid size={{ xs: 12 }}>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {([
                ['isVegetarian', 'Vegetarian'],
                ['isVegan', 'Vegan'],
                ['isSpicy', 'Spicy'],
                ['isBestseller', 'Bestseller'],
                ['isAvailable', 'Available'],
              ] as [keyof MenuItemRequest, string][]).map(([key, label]) => (
                <FormControlLabel key={key}
                  control={<Checkbox size="small" checked={!!form[key]}
                    onChange={e => set(key, e.target.checked)} />}
                  label={label} />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}
          sx={{ borderRadius: 2, bgcolor: '#FF6B35', '&:hover': { bgcolor: '#e55a28' } }}>
          {saving ? 'Saving...' : initial ? 'Save Changes' : 'Add Item'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Delete Confirm Dialog ─────────────────────────────────────
const DeleteDialog = ({
  item, onClose, onConfirm,
}: { item: MenuItem | null; onClose: () => void; onConfirm: () => void }) => (
  <Dialog open={!!item} onClose={onClose} PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle fontWeight={700}>Delete Item?</DialogTitle>
    <DialogContent>
      <Typography>
        Are you sure you want to delete <strong>{item?.name}</strong>? This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 2 }}>
      <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
      <Button onClick={onConfirm} variant="contained" color="error" sx={{ borderRadius: 2 }}>
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

// ─── Main Page ─────────────────────────────────────────────────
const MenuPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'ALL'>('ALL');
  const [filterVeg, setFilterVeg] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);

  const restaurantId = user?.restaurantId ?? 0;

  // ── Fetch ──
  const fetchItems = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const data = await menuApi.getByRestaurant(restaurantId);
      setItems(data);
    } catch {
      setError('Failed to load menu items');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Filter ──
  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'ALL' || item.category === filterCategory;
    const matchVeg = filterVeg === 'ALL' ||
      (filterVeg === 'VEG' ? item.isVegetarian : !item.isVegetarian);
    return matchSearch && matchCat && matchVeg;
  });

  // ── Categories used ──
  const usedCategories = Array.from(new Set(items.map(i => i.category)));

  // ── Add / Edit Save ──
  const handleSave = async (data: MenuItemRequest) => {
    try {
      if (editItem) {
        await menuApi.update(editItem.id, data);
        toast.success('Item updated!');
      } else {
        await menuApi.create(data);
        toast.success('Item added!');
      }
      setDialogOpen(false);
      setEditItem(null);
      fetchItems();
    } catch {
      toast.error('Failed to save item');
    }
  };

  // ── Toggle availability ──
  const handleToggle = async (item: MenuItem) => {
    try {
      const updated = await menuApi.toggleAvailability(item.id);
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
      toast.success(`${item.name} marked as ${updated.isAvailable ? 'Available' : 'Unavailable'}`);
    } catch {
      toast.error('Failed to update availability');
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await menuApi.delete(deleteItem.id);
      toast.success(`${deleteItem.name} deleted`);
      setDeleteItem(null);
      fetchItems();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const openAdd = () => { setEditItem(null); setDialogOpen(true); };
  const openEdit = (item: MenuItem) => { setEditItem(item); setDialogOpen(true); };

  // ── Stats ──
  const available = items.filter(i => i.isAvailable).length;
  const bestsellers = items.filter(i => i.isBestseller).length;
  const vegItems = items.filter(i => i.isVegetarian).length;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Menu Management</Typography>
          <Typography variant="body2" color="text.secondary">
            {items.length} items · {available} available · {bestsellers} bestsellers · {vegItems} veg
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}
          sx={{ borderRadius: 2, bgcolor: '#FF6B35', '&:hover': { bgcolor: '#e55a28' }, fontWeight: 600 }}>
          Add Item
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Search & Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
        <TextField
          size="small" placeholder="Search items..."
          value={search} onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 240, bgcolor: 'white', borderRadius: 2 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 160, bgcolor: 'white' }}>
          <InputLabel><FilterList fontSize="small" /> Category</InputLabel>
          <Select value={filterCategory} label="Category"
            onChange={e => setFilterCategory(e.target.value as Category | 'ALL')}>
            <MuiMenuItem value="ALL">All Categories</MuiMenuItem>
            {usedCategories.map(cat => (
              <MuiMenuItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</MuiMenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130, bgcolor: 'white' }}>
          <InputLabel>Type</InputLabel>
          <Select value={filterVeg} label="Type"
            onChange={e => setFilterVeg(e.target.value as 'ALL' | 'VEG' | 'NON_VEG')}>
            <MuiMenuItem value="ALL">All</MuiMenuItem>
            <MuiMenuItem value="VEG">Veg Only</MuiMenuItem>
            <MuiMenuItem value="NON_VEG">Non-Veg Only</MuiMenuItem>
          </Select>
        </FormControl>
        {(filterCategory !== 'ALL' || filterVeg !== 'ALL' || search) && (
          <Button size="small" onClick={() => { setSearch(''); setFilterCategory('ALL'); setFilterVeg('ALL'); }}>
            Clear Filters
          </Button>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {filtered.length} of {items.length} items
        </Typography>
      </Box>

      {/* Grid */}
      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Typography variant="h6" color="text.secondary" mb={1}>
            {items.length === 0 ? 'No menu items yet' : 'No items match your filters'}
          </Typography>
          {items.length === 0 && (
            <Button variant="contained" startIcon={<Add />} onClick={openAdd}
              sx={{ mt: 2, borderRadius: 2, bgcolor: '#FF6B35', '&:hover': { bgcolor: '#e55a28' } }}>
              Add Your First Item
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map(item => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <MenuItemCard
                item={item}
                onEdit={openEdit}
                onDelete={setDeleteItem}
                onToggle={handleToggle}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialogs */}
      <MenuItemDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditItem(null); }}
        onSave={handleSave}
        initial={editItem}
        restaurantId={restaurantId}
      />
      <DeleteDialog
        item={deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default MenuPage;
