import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Grid, Typography, Button, TextField, InputAdornment,
  Card, CardContent, CardMedia, Chip, IconButton, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem as MuiMenuItem,
  FormControlLabel, Checkbox, Skeleton, Alert, Tooltip, Divider,
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
import EmptyState from '../components/common/EmptyState';
import useDebounce from '../hooks/useDebounce';


// ─── emptyForm ─────────────────────────────────────────────────
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
  isOnOffer: false,      // ✅
  discountPercent: 0,
  offerLabel: '',
});


// ─── MenuItemCard ───────────────────────────────────────────────
const MenuItemCard = React.memo(({
  item, onEdit, onDelete, onToggle,
}: {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggle: (item: MenuItem) => void;
}) => {
  const finalPrice = item.isOnOffer && item.discountPercent > 0   // ✅
    ? (item.discountedPrice > 0
        ? item.discountedPrice
        : item.price - (item.price * item.discountPercent) / 100)
    : null;

  return (
    <Card sx={{
      borderRadius: 3,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s',
      opacity: item.isAvailable ? 1 : 0.65,
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,0,0,0.12)' },
    }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img" height={160}
          image={item.imageUrl || 'https://via.placeholder.com/300x160?text=No+Image'}
          alt={item.name}
          loading="lazy"
          sx={{ objectFit: 'cover' }}
        />

        {/* ── Badges: top-left ── */}
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
          {/* ✅ isOnOffer */}
          {item.isOnOffer && item.discountPercent > 0 && (
            <Chip
              label={`${item.discountPercent}% OFF`}
              size="small"
              sx={{ bgcolor: '#7B1FA2', color: 'white', fontWeight: 800, fontSize: 10 }}
            />
          )}
        </Box>

        {/* ── Availability toggle: top-right ── */}
        <Box sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 2, px: 0.5 }}>
          <Switch size="small" checked={item.isAvailable ?? true}
            onChange={() => onToggle(item)} color="success" />
        </Box>
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Chip label={CATEGORY_LABELS[item.category]} size="small"
          sx={{ bgcolor: '#FFF3EC', color: '#FF6B35', fontWeight: 600, fontSize: 10, mb: 1 }} />

        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1, pr: 1, lineHeight: 1.3 }}>
            {item.name}
          </Typography>
          <Box textAlign="right">
            {finalPrice ? (
              <>
                <Typography variant="caption"
                  sx={{ textDecoration: 'line-through', color: 'text.secondary', display: 'block', lineHeight: 1 }}>
                  {formatCurrency(item.price)}
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#7B1FA2' }}>
                  {formatCurrency(finalPrice)}
                </Typography>
              </>
            ) : (
              <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                {formatCurrency(item.price)}
              </Typography>
            )}
          </Box>
        </Box>

        {/* ✅ isOnOffer */}
        {item.isOnOffer && item.offerLabel && (
          <Typography variant="caption" sx={{ color: '#7B1FA2', fontWeight: 600, display: 'block', mb: 0.5 }}>
            🏷️ {item.offerLabel}
          </Typography>
        )}

        {item.description && (
          <Typography variant="caption" color="text.secondary"
            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1 }}>
            {item.description}
          </Typography>
        )}

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
});


// ─── MenuItemDialog ─────────────────────────────────────────────
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
        isOnOffer: initial.isOnOffer || false,        // ✅
        discountPercent: initial.discountPercent || 0,
        offerLabel: initial.offerLabel || '',
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
    if (form.isOnOffer && (!form.discountPercent || form.discountPercent <= 0))  // ✅
      return toast.error('Discount % is required when offer is enabled');
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

          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField fullWidth label="Item Name *" value={form.name}
              onChange={e => set('name', e.target.value)} size="small" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth label="Price *" type="number" value={form.price}
              onChange={e => set('price', parseFloat(e.target.value))} size="small"
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
          </Grid>
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
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth label="Prep Time (min)" type="number"
              value={form.preparationTime} size="small"
              onChange={e => set('preparationTime', parseInt(e.target.value))} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth label="Calories (kcal)" type="number"
              value={form.calories || ''} size="small"
              onChange={e => set('calories', parseInt(e.target.value))} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Description" multiline rows={2}
              value={form.description} size="small"
              onChange={e => set('description', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Image URL" value={form.imageUrl}
              onChange={e => set('imageUrl', e.target.value)} size="small"
              placeholder="https://example.com/image.jpg" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Ingredients (comma separated)"
              value={form.ingredients} size="small"
              onChange={e => set('ingredients', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Allergens (comma separated)"
              value={form.allergens} size="small"
              onChange={e => set('allergens', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Spice Level (0-5)" type="number"
              value={form.spiceLevel} size="small"
              inputProps={{ min: 0, max: 5 }}
              onChange={e => set('spiceLevel', parseInt(e.target.value))} />
          </Grid>

          {/* ── Flags ── */}
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

          {/* ── Offer / Discount Section ── */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 0.5 }} />
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mt={1} mb={0.5}>
              🏷️ OFFER / DISCOUNT
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={!!form.isOnOffer}                  // ✅
                  onChange={e => {
                    set('isOnOffer', e.target.checked);       // ✅
                    if (!e.target.checked) {
                      set('discountPercent', 0);
                      set('offerLabel', '');
                    }
                  }}
                />
              }
              label="Enable Offer"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Discount %"
              type="number"
              size="small"
              disabled={!form.isOnOffer}                      // ✅
              value={form.discountPercent || ''}
              inputProps={{ min: 1, max: 99 }}
              onChange={e => set('discountPercent', parseInt(e.target.value))}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              helperText={
                form.isOnOffer && form.discountPercent && form.price  // ✅
                  ? `Final: ${formatCurrency(form.price - (form.price * form.discountPercent) / 100)}`
                  : ' '
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Offer Label"
              size="small"
              disabled={!form.isOnOffer}                      // ✅
              value={form.offerLabel || ''}
              placeholder="e.g. Weekend Special"
              onChange={e => set('offerLabel', e.target.value)}
            />
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


// ─── DeleteDialog ───────────────────────────────────────────────
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


// ─── MenuPage ───────────────────────────────────────────────────
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
  const debouncedSearch = useDebounce(search, 300);

  const fetchItems = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await menuApi.getByRestaurant(restaurantId);
      setItems(data);
    } catch {
      setError('Failed to load menu items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = useMemo(() => items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchCat = filterCategory === 'ALL' || item.category === filterCategory;
    const matchVeg = filterVeg === 'ALL' ||
      (filterVeg === 'VEG' ? item.isVegetarian : !item.isVegetarian);
    return matchSearch && matchCat && matchVeg;
  }), [items, debouncedSearch, filterCategory, filterVeg]);

  const usedCategories = useMemo(
    () => Array.from(new Set(items.map(i => i.category))),
    [items]
  );

  const handleSave = useCallback(async (data: MenuItemRequest) => {
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
  }, [editItem, fetchItems]);

  const handleToggle = useCallback(async (item: MenuItem) => {
    try {
      const updated = await menuApi.toggleAvailability(item.id);
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
      toast.success(`${item.name} marked as ${updated.isAvailable ? 'Available' : 'Unavailable'}`);
    } catch {
      toast.error('Failed to update availability');
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteItem) return;
    try {
      await menuApi.delete(deleteItem.id);
      toast.success(`${deleteItem.name} deleted`);
      setDeleteItem(null);
      fetchItems();
    } catch {
      toast.error('Failed to delete item');
    }
  }, [deleteItem, fetchItems]);

  const openAdd = useCallback(() => { setEditItem(null); setDialogOpen(true); }, []);
  const openEdit = useCallback((item: MenuItem) => { setEditItem(item); setDialogOpen(true); }, []);

  const { available, bestsellers, vegItems } = useMemo(() => ({
    available: items.filter(i => i.isAvailable).length,
    bestsellers: items.filter(i => i.isBestseller).length,
    vegItems: items.filter(i => i.isVegetarian).length,
  }), [items]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}
        flexWrap="wrap" gap={2}>
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}
          action={<Button color="error" size="small" onClick={fetchItems}>Retry</Button>}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
        <TextField
          size="small" placeholder="Search items..."
          value={search} onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 240 }, bgcolor: 'white', borderRadius: 2 }}
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
          <Button size="small"
            onClick={() => { setSearch(''); setFilterCategory('ALL'); setFilterVeg('ALL'); }}>
            Clear Filters
          </Button>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {filtered.length} of {items.length} items
        </Typography>
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <EmptyState
          type={search || filterCategory !== 'ALL' || filterVeg !== 'ALL' ? 'search' : 'menu'}
          title={items.length === 0 ? 'No menu items yet' : 'No items match your filters'}
          description={
            items.length === 0
              ? 'Start by adding your first menu item to the restaurant.'
              : 'Try changing or filtering your search filters.'
          }
          actionLabel={items.length === 0 ? 'Add First Item' : undefined}
          onAction={items.length === 0 ? openAdd : undefined}
        />
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
