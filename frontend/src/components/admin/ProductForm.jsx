import React, { useState, useEffect, useRef } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import client from '../../api/client';
import { FiUploadCloud, FiTrash2, FiRefreshCw, FiLink, FiPlus } from 'react-icons/fi';

const emptyVariant = () => ({
  sku: '',
  type: '',
  size: '',
  color: '',
  flavor: '',
  volume: '',
  price: '',
  stock: 0,
  active: true,
});

const ProductForm = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    brand: '',
    badge: '',
    description: '',
    price: '',
    transferPrice: '',
    stock: 0,
    imageUrl: '',
    active: true,
    variants: [],
  });

  const [categories, setCategories] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await client.get('/categories?flat=true');
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        categoryId: initialData.categoryId || initialData.category?.id || '',
        brand: initialData.brand || '',
        badge: initialData.badge || '',
        description: initialData.description || '',
        price: initialData.price ?? '',
        transferPrice: initialData.transferPrice ?? '',
        stock: initialData.stock ?? 0,
        imageUrl: initialData.imageUrl || initialData.image || '',
        active: initialData.active !== false,
        variants: Array.isArray(initialData.variants)
          ? initialData.variants.map((v) => ({
              id: v.id,
              sku: v.sku || '',
              type: v.type || '',
              size: v.size || '',
              color: v.color || '',
              flavor: v.flavor || '',
              volume: v.volume || '',
              price: v.price ?? '',
              stock: v.stock ?? 0,
              active: v.active !== false,
            }))
          : [],
      });
      if (initialData.imageUrl && initialData.imageUrl.startsWith('http')) {
        setShowUrlInput(true);
      }
    } else {
      setFormData({
        name: '',
        sku: '',
        categoryId: categories[0]?.id || '',
        brand: '',
        badge: '',
        description: '',
        price: '',
        transferPrice: '',
        stock: 0,
        imageUrl: '',
        active: true,
        variants: [],
      });
      setUploadError('');
    }
  }, [initialData, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleVariantChange = (idx, field, value) => {
    setFormData((prev) => {
      const next = [...prev.variants];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, variants: next };
    });
  };

  const addVariantRow = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, emptyVariant()],
    }));
  };

  const removeVariantRow = (idx) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no debe superar los 5MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Formato no válido. Usá JPG, PNG o WEBP.');
      return;
    }

    setUploadError('');
    setUploadingImage(true);

    try {
      const data = new FormData();
      data.append('image', file);

      const res = await client.post('/upload/image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: res.data.url }));
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.response?.data?.error || 'Error al subir la imagen.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedVariants = formData.variants
      .filter((v) => v.sku && String(v.sku).trim())
      .map((v) => ({
        sku: String(v.sku).trim(),
        type: v.type ? String(v.type).trim() : null,
        size: v.size ? String(v.size).trim() : null,
        color: v.color ? String(v.color).trim() : null,
        flavor: v.flavor ? String(v.flavor).trim() : null,
        volume: v.volume ? String(v.volume).trim() : null,
        price: parseFloat(v.price || formData.price || 0),
        stock: parseInt(v.stock || 0, 10),
        active: v.active !== false,
      }));

    const basePrice =
      cleanedVariants.length > 0
        ? Math.min(...cleanedVariants.map((v) => v.price))
        : parseFloat(formData.price || 0);

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku ? formData.sku.trim() : null,
      categoryId: formData.categoryId || null,
      brand: formData.brand ? formData.brand.trim() : null,
      badge: formData.badge ? formData.badge.trim() : null,
      description: formData.description ? formData.description.trim() : '',
      price: basePrice,
      transferPrice: formData.transferPrice ? parseFloat(formData.transferPrice) : null,
      stock:
        formData.stock !== '' && formData.stock !== undefined && formData.stock !== null
          ? parseInt(formData.stock, 10)
          : 0,
      imageUrl: formData.imageUrl ? formData.imageUrl.trim() : null,
      active: Boolean(formData.active),
      variants: cleanedVariants,
    };

    onSubmit(payload);
  };

  const categoryOptions = [
    { value: '', label: 'Seleccionar categoría...' },
    ...categories.map((c) => ({
      value: c.id,
      label: c.parent ? `${c.parent.name} → ${c.name}` : c.name,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 pr-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="sm:col-span-2">
          <Input
            label="Nombre del Producto *"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Vibrador Conejo Silicona"
          />
        </div>
        <Input
          label="Código SKU"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="Ej: NOC-0010"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Select
          label="Categoría / Subcategoría"
          name="categoryId"
          options={categoryOptions}
          value={formData.categoryId}
          onChange={handleChange}
        />
        <Input
          label="Marca (Opcional)"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="Ej: Miss V / Sexy Fantasy"
        />
        <Input
          label="Badge / Etiqueta (Opcional)"
          name="badge"
          value={formData.badge}
          onChange={handleChange}
          placeholder="Ej: Nuevo / Destacado"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Input
          label="Precio Base ($) *"
          type="number"
          name="price"
          required
          value={formData.price}
          onChange={handleChange}
          min="0"
          step="1"
          placeholder="Ej: 15000"
        />
        <Input
          label="Precio Transferencia ($)"
          type="number"
          name="transferPrice"
          value={formData.transferPrice}
          onChange={handleChange}
          min="0"
          step="1"
          placeholder="Opcional"
        />
        <Input
          label="Stock General"
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          min="0"
          placeholder="0"
        />
      </div>

      <label className="inline-flex items-center gap-2 text-xs text-content cursor-pointer">
        <input
          type="checkbox"
          name="active"
          checked={formData.active}
          onChange={handleChange}
          className="rounded border-brand-border/40 bg-canvas text-brand focus:ring-mauve"
        />
        <span>Producto activo y visible en el catálogo público</span>
      </label>

      {/* Variantes del producto */}
      <div className="p-4 rounded-lg border border-brand-border/25 bg-canvas space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display text-xs uppercase tracking-widest text-content">
              Variantes ({formData.variants.length})
            </h4>
            <p className="text-[11px] text-content-muted">
              Opcional: agregá variantes por tipo, talle, color, sabor/aroma o volumen.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addVariantRow}
            className="text-xs py-1 px-2.5"
          >
            <FiPlus className="mr-1" /> Agregar variante
          </Button>
        </div>

        {formData.variants.length > 0 && (
          <div className="space-y-3">
            {formData.variants.map((v, idx) => (
              <div
                key={v.id || idx}
                className="p-3 rounded border border-brand-border/20 bg-surface space-y-2.5"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Input
                    label="SKU *"
                    value={v.sku}
                    onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                    placeholder="SKU único"
                  />
                  <Input
                    label="Precio ($)"
                    type="number"
                    value={v.price}
                    onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                    placeholder="Precio"
                  />
                  <Input
                    label="Stock"
                    type="number"
                    value={v.stock}
                    onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                    placeholder="0"
                  />
                  <div className="flex items-end justify-end pb-1">
                    <button
                      type="button"
                      onClick={() => removeVariantRow(idx)}
                      className="text-xs text-rose-300 hover:text-rose-200 inline-flex items-center gap-1 px-2 py-1.5 rounded bg-rose-950/40 border border-rose-800/40"
                    >
                      <FiTrash2 size={12} /> Quitar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <Input
                    label="Tipo"
                    value={v.type}
                    onChange={(e) => handleVariantChange(idx, 'type', e.target.value)}
                    placeholder="Ej: Anal / Vaginal"
                  />
                  <Input
                    label="Talle"
                    value={v.size}
                    onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                    placeholder="Ej: S / M / Único"
                  />
                  <Input
                    label="Color"
                    value={v.color}
                    onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                    placeholder="Ej: Negro / Rosa"
                  />
                  <Input
                    label="Sabor / Aroma"
                    value={v.flavor}
                    onChange={(e) => handleVariantChange(idx, 'flavor', e.target.value)}
                    placeholder="Ej: Frutilla"
                  />
                  <Input
                    label="Volumen / Medida"
                    value={v.volume}
                    onChange={(e) => handleVariantChange(idx, 'volume', e.target.value)}
                    placeholder="Ej: 100 ml / 15x3 cm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subida de Imagen (Opcional: si no tiene foto se muestra el placeholder de marca) */}
      <div className="p-4 rounded-lg border border-brand-border/25 bg-canvas">
        <label className="block text-xs font-medium uppercase tracking-wider text-content-secondary mb-2">
          Imagen del Producto (Opcional — si no tiene, se muestra placeholder de marca)
        </label>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />

        {formData.imageUrl ? (
          <div className="flex items-center space-x-3.5 bg-surface p-3 rounded-md border border-brand-border/20">
            <div className="w-16 h-16 bg-canvas rounded overflow-hidden flex-shrink-0 border border-brand-border/25 flex items-center justify-center">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded inline-block mb-1 border border-emerald-800/40">
                ✓ Imagen asignada
              </span>
              <p className="text-xs text-content-muted truncate font-mono">{formData.imageUrl}</p>
              <div className="flex space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="text-xs bg-surface-elevated hover:bg-brand text-content px-2.5 py-1 rounded transition-colors flex items-center border border-brand-border/25"
                >
                  <FiRefreshCw className="mr-1 text-xs" /> Cambiar
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 px-2.5 py-1 rounded transition-colors flex items-center border border-rose-800/40"
                >
                  <FiTrash2 className="mr-1 text-xs" /> Quitar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="w-full border border-dashed border-brand-border/40 hover:border-mauve rounded-lg p-6 text-center transition-colors cursor-pointer flex flex-col items-center justify-center group bg-surface"
            >
              <div className="w-10 h-10 rounded-full bg-surface-elevated text-mauve flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <FiUploadCloud size={20} />
              </div>
              <span className="text-xs font-medium text-content">
                {uploadingImage ? 'Subiendo imagen...' : 'Seleccionar archivo de imagen'}
              </span>
              <span className="text-[11px] text-content-muted mt-1">
                JPG, PNG o WEBP (Máx. 5MB)
              </span>
            </button>
          </div>
        )}

        {uploadError && (
          <p className="text-xs text-rose-300 mt-2 bg-rose-950/60 p-2 rounded border border-rose-800/50">
            {uploadError}
          </p>
        )}

        <div className="mt-2.5 text-right">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs text-mauve hover:text-content underline inline-flex items-center transition-colors"
          >
            <FiLink className="mr-1 text-xs" />
            {showUrlInput ? 'Ocultar URL directa' : 'Ingresar URL de imagen'}
          </button>
        </div>

        {showUrlInput && (
          <div className="mt-2">
            <Input
              label="URL directa de la imagen"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-content-secondary mb-1.5 tracking-wide">
          Descripción
        </label>
        <textarea
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="block w-full rounded-md border border-brand-border/30 bg-surface-elevated text-content text-xs sm:text-sm p-3 focus:outline-none focus:border-mauve focus:ring-1 focus:ring-mauve placeholder:text-content-muted"
          placeholder="Descripción de materiales, medidas, modo de uso y cuidados..."
        />
      </div>

      <div className="pt-3">
        <Button
          type="submit"
          variant="primary"
          loading={loading || uploadingImage}
          disabled={uploadingImage}
          fullWidth
          className="py-3 text-xs sm:text-sm font-medium"
        >
          {initialData ? 'Actualizar Producto' : 'Guardar Producto en Catálogo'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
