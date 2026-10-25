import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import ProductTable from '../../components/admin/ProductTable';
import ProductForm from '../../components/admin/ProductForm';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import themeConfig from '../../config/theme';
import { resolveProductImage } from '../../utils/productImages';
import {
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiPercent,
  FiDownload,
  FiEye,
  FiEyeOff,
  FiStar,
  FiX,
  FiCheck,
  FiAlertTriangle,
  FiImage,
  FiLayers,
} from 'react-icons/fi';

const PAGE_SIZE = 20;

const applyRounding = (val, mode) => {
  const num = Math.max(0, Number(val) || 0);
  if (mode === '100') return Math.round(num / 100) * 100;
  if (mode === '500') return Math.round(num / 500) * 500;
  if (mode === '10') return Math.round(num / 10) * 10;
  return Math.round(num);
};

const getTotalStock = (product) => {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
  }
  return Number(product.stock || 0);
};

const hasPhoto = (product) => {
  const resolved = resolveProductImage(product);
  return Boolean(resolved?.thumb || resolved?.main || product.imageUrl || product.image);
};

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [duplicateTemplate, setDuplicateTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [parentCatFilter, setParentCatFilter] = useState('');
  const [subCatFilter, setSubCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name_asc');

  // Multi-select
  const [selectedIds, setSelectedIds] = useState([]);

  // Bulk Price Update Modal state
  const [isBulkPriceOpen, setIsBulkPriceOpen] = useState(false);
  const [bulkScope, setBulkScope] = useState('ALL'); // ALL | FILTERED | SELECTED | CATEGORY
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const [bulkAdjustmentType, setBulkAdjustmentType] = useState('PERCENT'); // PERCENT | FIXED
  const [bulkValue, setBulkValue] = useState('10');
  const [bulkRounding, setBulkRounding] = useState('100'); // NONE | 10 | 100 | 500
  const [bulkRecalcTransfer, setBulkRecalcTransfer] = useState(true);
  const [bulkTransferDiscount, setBulkTransferDiscount] = useState('10');
  const [bulkApplying, setBulkApplying] = useState(false);

  const fetchProductsAndCategories = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        client.get('/products?page=1&limit=500&includeInactive=true'),
        client.get('/categories?flat=true').catch(() => ({ data: [] })),
      ]);
      const data = prodRes.data;
      setAllProducts(data.products || data || []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  // Open product edit modal if navigated with ?edit=<productId>
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && allProducts.length > 0) {
      const target = allProducts.find((p) => (p.id || p._id) === editId);
      if (target) {
        setDuplicateTemplate(null);
        setEditingProduct(target);
        setIsModalOpen(true);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('edit');
        setSearchParams(nextParams, { replace: true });
      }
    }
  }, [searchParams, allProducts, setSearchParams]);

  // Parent & Subcategories
  const parentCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  const subCategoriesForSelectedParent = useMemo(() => {
    if (!parentCatFilter) return [];
    return categories.filter((c) => c.parentId === parentCatFilter);
  }, [categories, parentCatFilter]);

  // Inventory summary stats
  const summaryStats = useMemo(() => {
    const total = allProducts.length;
    let active = 0;
    let paused = 0;
    let outOfStock = 0;
    let lowStock = 0;
    let withPhoto = 0;
    let featured = 0;

    allProducts.forEach((p) => {
      if (p.active !== false) active++;
      else paused++;

      const stock = getTotalStock(p);
      if (stock <= 0) outOfStock++;
      else if (stock <= 3) lowStock++;

      if (hasPhoto(p)) withPhoto++;
      if (p.featured || p.badge === 'Destacado') featured++;
    });

    return { total, active, paused, outOfStock, lowStock, withPhoto, featured };
  }, [allProducts]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = allProducts.filter((p) => {
      // Search match
      if (q) {
        const matchMain =
          (p.name || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.category?.name || '').toLowerCase().includes(q);
        const matchVariants =
          Array.isArray(p.variants) &&
          p.variants.some(
            (v) =>
              (v.sku || '').toLowerCase().includes(q) ||
              (v.color || '').toLowerCase().includes(q) ||
              (v.flavor || '').toLowerCase().includes(q) ||
              (v.type || '').toLowerCase().includes(q) ||
              (v.size || '').toLowerCase().includes(q)
          );
        if (!matchMain && !matchVariants) return false;
      }

      // Category / Subcategory filter
      if (subCatFilter) {
        if ((p.categoryId || p.category?.id) !== subCatFilter) return false;
      } else if (parentCatFilter) {
        const childIds = categories
          .filter((c) => c.parentId === parentCatFilter)
          .map((c) => c.id);
        const validIds = new Set([parentCatFilter, ...childIds]);
        const pCatId = p.categoryId || p.category?.id;
        const pParentId = p.category?.parentId;
        if (!validIds.has(pCatId) && pParentId !== parentCatFilter) return false;
      }

      // Status / Stock / Photo filter
      const stock = getTotalStock(p);
      const isAct = p.active !== false;
      const isFeat = Boolean(p.featured || p.badge === 'Destacado');

      if (statusFilter === 'ACTIVE' && !isAct) return false;
      if (statusFilter === 'PAUSED' && isAct) return false;
      if (statusFilter === 'FEATURED' && !isFeat) return false;
      if (statusFilter === 'OUT_OF_STOCK' && stock > 0) return false;
      if (statusFilter === 'LOW_STOCK' && (stock <= 0 || stock > 3)) return false;
      if (statusFilter === 'NO_PHOTO' && hasPhoto(p)) return false;
      if (statusFilter === 'WITH_PHOTO' && !hasPhoto(p)) return false;
      if (
        statusFilter === 'WITH_VARIANTS' &&
        (!Array.isArray(p.variants) || p.variants.length === 0)
      )
        return false;

      return true;
    });

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'price_asc') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'price_desc') return Number(b.price || 0) - Number(a.price || 0);
      if (sortBy === 'stock_asc') return getTotalStock(a) - getTotalStock(b);
      if (sortBy === 'stock_desc') return getTotalStock(b) - getTotalStock(a);
      if (sortBy === 'sold_desc')
        return Number(b.soldCount || 0) - Number(a.soldCount || 0);
      return (a.name || '').localeCompare(b.name || '', 'es');
    });

    return list;
  }, [
    allProducts,
    searchQuery,
    parentCatFilter,
    subCatFilter,
    statusFilter,
    sortBy,
    categories,
  ]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, parentCatFilter, subCatFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const handleOpenModal = (product = null) => {
    setDuplicateTemplate(null);
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDuplicate = (product) => {
    const cloned = {
      ...product,
      id: undefined,
      _id: undefined,
      name: `${product.name} (Copia)`,
      sku: product.sku ? `${product.sku}-COPIA` : '',
      variants: Array.isArray(product.variants)
        ? product.variants.map((v, idx) => ({
            ...v,
            id: undefined,
            sku: v.sku ? `${v.sku}-C${idx + 1}` : '',
          }))
        : [],
    };
    setEditingProduct(null);
    setDuplicateTemplate(cloned);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setDuplicateTemplate(null);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      if (editingProduct) {
        await client.put(`/products/${editingProduct._id || editingProduct.id}`, formData);
      } else {
        await client.post('/products', formData);
      }
      await fetchProductsAndCategories();
      handleCloseModal();
    } catch (error) {
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Error al guardar el producto'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await client.delete(`/products/${id}`);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      await fetchProductsAndCategories();
    } catch (error) {
      alert('Error al eliminar el producto');
    }
  };

  // Inline quick actions
  const handleToggleActive = async (product) => {
    const id = product.id || product._id;
    const nextActive = product.active === false;
    try {
      await client.put(`/products/${id}`, { active: nextActive });
      setAllProducts((prev) =>
        prev.map((p) => ((p.id || p._id) === id ? { ...p, active: nextActive } : p))
      );
    } catch (err) {
      alert('No se pudo cambiar el estado del producto');
    }
  };

  const handleToggleFeatured = async (product) => {
    const id = product.id || product._id;
    const currentlyFeatured = Boolean(product.featured || product.badge === 'Destacado');
    const nextFeatured = !currentlyFeatured;
    const nextBadge = nextFeatured
      ? product.badge || 'Destacado'
      : product.badge === 'Destacado'
      ? ''
      : product.badge || '';
    try {
      await client.put(`/products/${id}`, {
        featured: nextFeatured,
        badge: nextBadge,
      });
      setAllProducts((prev) =>
        prev.map((p) =>
          (p.id || p._id) === id
            ? { ...p, featured: nextFeatured, badge: nextBadge }
            : p
        )
      );
    } catch (err) {
      alert('No se pudo actualizar el destacado');
    }
  };

  const handleQuickStockChange = async (product, delta) => {
    const id = product.id || product._id;
    const nextStock = Math.max(0, Number(product.stock || 0) + delta);
    try {
      await client.put(`/products/${id}`, { stock: nextStock });
      setAllProducts((prev) =>
        prev.map((p) => ((p.id || p._id) === id ? { ...p, stock: nextStock } : p))
      );
    } catch (err) {
      alert('Error al actualizar stock');
    }
  };

  const handleVariantStockChange = async (product, variantId, delta) => {
    const id = product.id || product._id;
    const updatedVariants = (product.variants || []).map((v) => {
      if ((v.id || v.sku) === variantId || v.id === variantId) {
        return { ...v, stock: Math.max(0, Number(v.stock || 0) + delta) };
      }
      return v;
    });
    const newTotalStock = updatedVariants.reduce(
      (sum, v) => sum + Number(v.stock || 0),
      0
    );
    try {
      await client.put(`/products/${id}`, {
        variants: updatedVariants,
        stock: newTotalStock,
      });
      setAllProducts((prev) =>
        prev.map((p) =>
          (p.id || p._id) === id
            ? { ...p, variants: updatedVariants, stock: newTotalStock }
            : p
        )
      );
    } catch (err) {
      alert('Error al actualizar stock de la variante');
    }
  };

  // Multi-select handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllPage = () => {
    const pageIds = paginatedProducts.map((p) => p.id || p._id);
    const allInPageSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allInPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleBulkStatus = async (activeState) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => client.put(`/products/${id}`, { active: activeState }))
      );
      await fetchProductsAndCategories();
      setSelectedIds([]);
    } catch (err) {
      alert('Error al actualizar productos seleccionados');
    }
  };

  const handleBulkFeatured = async (featuredState) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          client.put(`/products/${id}`, {
            featured: featuredState,
            badge: featuredState ? 'Destacado' : '',
          })
        )
      );
      await fetchProductsAndCategories();
      setSelectedIds([]);
    } catch (err) {
      alert('Error al actualizar destacados');
    }
  };

  // Bulk Price Target Products
  const bulkTargetProducts = useMemo(() => {
    if (bulkScope === 'SELECTED') {
      return allProducts.filter((p) => selectedIds.includes(p.id || p._id));
    }
    if (bulkScope === 'FILTERED') {
      return filteredProducts;
    }
    if (bulkScope === 'CATEGORY' && bulkCategoryId) {
      const childIds = categories
        .filter((c) => c.parentId === bulkCategoryId)
        .map((c) => c.id);
      const validIds = new Set([bulkCategoryId, ...childIds]);
      return allProducts.filter(
        (p) =>
          validIds.has(p.categoryId || p.category?.id) ||
          p.category?.parentId === bulkCategoryId
      );
    }
    return allProducts;
  }, [bulkScope, bulkCategoryId, allProducts, filteredProducts, selectedIds, categories]);

  const calculateNewPrice = (oldPrice) => {
    const base = Number(oldPrice) || 0;
    const val = Number(bulkValue) || 0;
    const rawNew =
      bulkAdjustmentType === 'PERCENT' ? base * (1 + val / 100) : base + val;
    return applyRounding(rawNew, bulkRounding);
  };

  const calculateNewTransfer = (newPrice, oldTransfer) => {
    if (!bulkRecalcTransfer) return oldTransfer;
    const disc = Math.min(90, Math.max(0, Number(bulkTransferDiscount) || 0));
    if (disc <= 0) return null;
    return applyRounding(newPrice * (1 - disc / 100), bulkRounding);
  };

  const handleApplyBulkPrices = async (e) => {
    e.preventDefault();
    if (bulkTargetProducts.length === 0) return;
    const numVal = Number(bulkValue);
    if (Number.isNaN(numVal) || numVal === 0) {
      alert('Ingresá un valor distinto de 0 para el ajuste.');
      return;
    }

    setBulkApplying(true);
    try {
      for (const p of bulkTargetProducts) {
        const id = p.id || p._id;
        const newPrice = calculateNewPrice(p.price);
        const newTransfer = calculateNewTransfer(newPrice, p.transferPrice);
        const updatedVariants = Array.isArray(p.variants)
          ? p.variants.map((v) => ({
              ...v,
              price: calculateNewPrice(v.price || p.price),
            }))
          : [];

        const minVariantPrice =
          updatedVariants.length > 0
            ? Math.min(...updatedVariants.map((v) => Number(v.price) || newPrice))
            : newPrice;

        await client.put(`/products/${id}`, {
          price: minVariantPrice,
          transferPrice: calculateNewTransfer(minVariantPrice, newTransfer),
          variants: updatedVariants.length > 0 ? updatedVariants : undefined,
        });
      }

      await fetchProductsAndCategories();
      setIsBulkPriceOpen(false);
    } catch (err) {
      alert('Ocurrió un error al aplicar el ajuste masivo de precios.');
    } finally {
      setBulkApplying(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const source = selectedIds.length > 0
      ? allProducts.filter((p) => selectedIds.includes(p.id || p._id))
      : filteredProducts;

    const headers = [
      'SKU',
      'Producto',
      'Categoria',
      'Precio_Lista',
      'Precio_Transferencia',
      'Stock_Total',
      'Variantes',
      'Estado',
      'Destacado',
      'Tiene_Foto',
    ];

    const escapeCSV = (val) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = source.map((p) => {
      const catLabel = p.category?.parent?.name
        ? `${p.category.parent.name} > ${p.category.name}`
        : p.category?.name || 'General';
      return [
        escapeCSV(p.sku || ''),
        escapeCSV(p.name || ''),
        escapeCSV(catLabel),
        Number(p.price || 0),
        p.transferPrice ? Number(p.transferPrice) : '',
        getTotalStock(p),
        Array.isArray(p.variants) ? p.variants.length : 0,
        p.active !== false ? 'Activo' : 'Pausado',
        p.featured || p.badge === 'Destacado' ? 'Si' : 'No',
        hasPhoto(p) ? 'Si' : 'No',
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `catalogo_nocturna_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setParentCatFilter('');
    setSubCatFilter('');
    setStatusFilter('ALL');
    setSortBy('name_asc');
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(parentCatFilter) ||
    Boolean(subCatFilter) ||
    statusFilter !== 'ALL' ||
    sortBy !== 'name_asc';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-brand-border/20">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-mauve font-medium">
            Catálogo &bull; Inventario &bull; Precios
          </span>
          <h1 className="font-display text-2xl uppercase tracking-wider text-content mt-0.5">
            Gestión de Productos
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Control rápido de stock por variante, actualización masiva de precios y visibilidad en tienda
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center px-3 py-2 rounded-md text-xs font-medium bg-surface hover:bg-surface-elevated text-content-secondary hover:text-content border border-brand-border/30 transition-colors"
            title="Descargar listado en formato Excel / CSV"
          >
            <FiDownload className="mr-1.5 text-mauve" size={14} />
            Exportar CSV
          </button>

          <button
            type="button"
            onClick={() => {
              setBulkScope(selectedIds.length > 0 ? 'SELECTED' : 'ALL');
              setIsBulkPriceOpen(true);
            }}
            className="inline-flex items-center px-3.5 py-2 rounded-md text-xs font-medium bg-surface-elevated hover:bg-brand/60 text-content border border-mauve/40 transition-colors"
          >
            <FiPercent className="mr-1.5 text-mauve" size={14} />
            Ajuste Masivo de Precios
          </button>

          <Button
            onClick={() => handleOpenModal()}
            variant="primary"
            className="inline-flex items-center py-2 text-xs"
          >
            <FiPlus className="mr-1.5" /> Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Quick Filter Pills / Inventory Health Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-brand/30 border-mauve text-content'
              : 'bg-surface border-brand-border/20 text-content-secondary hover:border-brand-border/40'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider text-content-muted block">
            Total Catálogo
          </span>
          <span className="text-lg font-semibold text-content mt-0.5 block">
            {summaryStats.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            statusFilter === 'ACTIVE'
              ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-200'
              : 'bg-surface border-brand-border/20 text-content-secondary hover:border-brand-border/40'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider text-content-muted block">
            Activos / Pausados
          </span>
          <span className="text-lg font-semibold text-emerald-300 mt-0.5 block">
            {summaryStats.active}{' '}
            <span className="text-xs text-content-muted font-normal">
              / {summaryStats.paused} paus.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === 'FEATURED' ? 'ALL' : 'FEATURED')
          }
          className={`p-3 rounded-lg border text-left transition-colors ${
            statusFilter === 'FEATURED'
              ? 'bg-amber-950/50 border-amber-700/60 text-amber-200'
              : 'bg-surface border-brand-border/20 text-content-secondary hover:border-brand-border/40'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider text-content-muted flex items-center gap-1">
            <FiStar size={10} className="text-amber-400" /> Destacados Home
          </span>
          <span className="text-lg font-semibold text-amber-300 mt-0.5 block">
            {summaryStats.featured}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')
          }
          className={`p-3 rounded-lg border text-left transition-colors ${
            statusFilter === 'LOW_STOCK'
              ? 'bg-amber-950/50 border-amber-700/60 text-amber-200'
              : 'bg-surface border-brand-border/20 text-content-secondary hover:border-brand-border/40'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider text-content-muted flex items-center gap-1">
            <FiAlertTriangle size={10} className="text-amber-400" /> Stock Bajo (≤ 3)
          </span>
          <span className="text-lg font-semibold text-amber-300 mt-0.5 block">
            {summaryStats.lowStock}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === 'OUT_OF_STOCK' ? 'ALL' : 'OUT_OF_STOCK')
          }
          className={`p-3 rounded-lg border text-left transition-colors ${
            statusFilter === 'OUT_OF_STOCK'
              ? 'bg-rose-950/50 border-rose-700/60 text-rose-200'
              : 'bg-surface border-brand-border/20 text-content-secondary hover:border-brand-border/40'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider text-content-muted block">
            Agotados (0 un.)
          </span>
          <span className="text-lg font-semibold text-rose-300 mt-0.5 block">
            {summaryStats.outOfStock}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === 'NO_PHOTO' ? 'ALL' : 'NO_PHOTO')
          }
          className={`p-3 rounded-lg border text-left transition-colors ${
            statusFilter === 'NO_PHOTO'
              ? 'bg-brand/40 border-mauve text-content'
              : 'bg-surface border-brand-border/20 text-content-secondary hover:border-brand-border/40'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider text-content-muted flex items-center gap-1">
            <FiImage size={10} className="text-mauve" /> Cobertura Fotos
          </span>
          <span className="text-lg font-semibold text-content mt-0.5 block">
            {summaryStats.withPhoto}/{summaryStats.total}{' '}
            <span className="text-[11px] text-amber-300 font-normal">
              ({summaryStats.total - summaryStats.withPhoto} sin foto)
            </span>
          </span>
        </button>
      </div>

      {/* Search & Cascading Category Filters Bar */}
      <div className="bg-surface p-4 rounded-lg border border-brand-border/20 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search input */}
          <div className="lg:col-span-4 relative">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
              size={14}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, SKU, variante, sabor o color..."
              className="w-full pl-9 pr-8 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content placeholder-content-muted focus:outline-none focus:border-mauve"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content"
                title="Limpiar búsqueda"
              >
                <FiX size={13} />
              </button>
            )}
          </div>

          {/* Parent Category */}
          <div className="lg:col-span-2">
            <select
              value={parentCatFilter}
              onChange={(e) => {
                setParentCatFilter(e.target.value);
                setSubCatFilter('');
              }}
              aria-label="Filtrar por categoría principal"
              className="w-full px-3 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
            >
              <option value="">Todas las categorías</option>
              {parentCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory (cascading) */}
          <div className="lg:col-span-2">
            <select
              value={subCatFilter}
              onChange={(e) => setSubCatFilter(e.target.value)}
              disabled={!parentCatFilter || subCategoriesForSelectedParent.length === 0}
              aria-label="Filtrar por subcategoría"
              className="w-full px-3 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content disabled:opacity-40 focus:outline-none focus:border-mauve"
            >
              <option value="">
                {!parentCatFilter
                  ? 'Subcategoría (elegí cat.)'
                  : subCategoriesForSelectedParent.length === 0
                  ? 'Sin subcategorías'
                  : 'Todas las subcategorías'}
              </option>
              {subCategoriesForSelectedParent.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status / Filter dropdown */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrar por estado o stock"
              className="w-full px-3 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
            >
              <option value="ALL">Estado: Todos</option>
              <option value="ACTIVE">Solo Activos</option>
              <option value="PAUSED">Solo Pausados</option>
              <option value="FEATURED">Destacados en Home (★)</option>
              <option value="LOW_STOCK">Stock Bajo (1 a 3 un.)</option>
              <option value="OUT_OF_STOCK">Sin Stock (0 un.)</option>
              <option value="NO_PHOTO">Sin Foto cargada</option>
              <option value="WITH_PHOTO">Con Foto cargada</option>
              <option value="WITH_VARIANTS">Con Variantes</option>
            </select>
          </div>

          {/* Sort dropdown */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Ordenar productos"
              className="w-full px-3 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
            >
              <option value="name_asc">Orden: Nombre (A-Z)</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="stock_asc">Stock: Menor a Mayor</option>
              <option value="stock_desc">Stock: Mayor a Menor</option>
              <option value="sold_desc">Más Vendidos</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-brand-border/15 text-xs">
            <span className="text-content-secondary">
              Mostrando <strong className="text-content">{filteredProducts.length}</strong> de{' '}
              {allProducts.length} productos
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="text-mauve hover:text-content inline-flex items-center gap-1 font-medium"
            >
              <FiX size={13} /> Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Multi-select Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-brand/30 border border-mauve/50 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-content">
            <span className="px-2 py-0.5 rounded bg-brand text-content font-semibold border border-mauve/40">
              {selectedIds.length}
            </span>
            <span className="font-medium">
              producto{selectedIds.length !== 1 ? 's' : ''} seleccionado
              {selectedIds.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkStatus(true)}
              className="px-2.5 py-1.5 rounded text-xs font-medium bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-200 border border-emerald-700/50 inline-flex items-center gap-1"
            >
              <FiEye size={12} /> Activar
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus(false)}
              className="px-2.5 py-1.5 rounded text-xs font-medium bg-surface-elevated hover:bg-surface text-content-secondary border border-brand-border/30 inline-flex items-center gap-1"
            >
              <FiEyeOff size={12} /> Pausar
            </button>
            <button
              type="button"
              onClick={() => handleBulkFeatured(true)}
              className="px-2.5 py-1.5 rounded text-xs font-medium bg-amber-950/60 hover:bg-amber-900/70 text-amber-200 border border-amber-700/50 inline-flex items-center gap-1"
            >
              <FiStar size={12} /> Destacar
            </button>
            <button
              type="button"
              onClick={() => {
                setBulkScope('SELECTED');
                setIsBulkPriceOpen(true);
              }}
              className="px-2.5 py-1.5 rounded text-xs font-medium bg-brand hover:bg-brand/80 text-content border border-mauve/40 inline-flex items-center gap-1"
            >
              <FiPercent size={12} /> Ajustar Precios ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2 py-1.5 text-xs text-content-muted hover:text-content"
            >
              Deseleccionar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <ProductTable
        products={paginatedProducts}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onToggleActive={handleToggleActive}
        onToggleFeatured={handleToggleFeatured}
        onQuickStockChange={handleQuickStockChange}
        onVariantStockChange={handleVariantStockChange}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAllPage}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1">
          <p className="text-xs text-content-secondary">
            Página <span className="font-semibold text-content">{page}</span> de{' '}
            <span className="font-semibold text-content">{totalPages}</span> &mdash;{' '}
            {filteredProducts.length} productos
          </p>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center justify-center w-8 h-8 rounded border border-brand-border/30 bg-surface text-content disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-elevated transition-colors"
              title="Página anterior"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center justify-center w-8 h-8 rounded border border-brand-border/30 bg-surface text-content disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-elevated transition-colors"
              title="Página siguiente"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit / Duplicate Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="max-w-2xl"
        title={
          editingProduct
            ? `Editar Producto: ${editingProduct.name}`
            : duplicateTemplate
            ? 'Duplicar Producto'
            : 'Nuevo Producto'
        }
      >
        <ProductForm
          initialData={editingProduct || duplicateTemplate}
          categories={categories}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Modal>

      {/* Bulk Price Update Modal */}
      <Modal
        isOpen={isBulkPriceOpen}
        onClose={() => setIsBulkPriceOpen(false)}
        title="Ajuste Masivo de Precios"
      >
        <form onSubmit={handleApplyBulkPrices} className="space-y-4">
          <p className="text-xs text-content-secondary">
            Actualizá precios de lista, variantes y precios con descuento por transferencia en un
            solo paso con redondeo automático.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-content-secondary uppercase tracking-wider mb-1">
                Aplicar a
              </label>
              <select
                value={bulkScope}
                onChange={(e) => setBulkScope(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
              >
                <option value="ALL">Todo el catálogo ({allProducts.length} prod.)</option>
                <option value="FILTERED">
                  Filtro actual ({filteredProducts.length} prod.)
                </option>
                <option value="CATEGORY">Una categoría específica</option>
                {selectedIds.length > 0 && (
                  <option value="SELECTED">
                    Seleccionados en tabla ({selectedIds.length} prod.)
                  </option>
                )}
              </select>
            </div>

            {bulkScope === 'CATEGORY' && (
              <div>
                <label className="block text-[11px] font-medium text-content-secondary uppercase tracking-wider mb-1">
                  Categoría objetivo
                </label>
                <select
                  value={bulkCategoryId}
                  onChange={(e) => setBulkCategoryId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
                >
                  <option value="">Elegir categoría...</option>
                  {parentCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-content-secondary uppercase tracking-wider mb-1">
                Tipo de ajuste
              </label>
              <select
                value={bulkAdjustmentType}
                onChange={(e) => setBulkAdjustmentType(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
              >
                <option value="PERCENT">Porcentaje (% de aumento o descuento)</option>
                <option value="FIXED">Monto fijo en Pesos ($ ARS)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-content-secondary uppercase tracking-wider mb-1">
                {bulkAdjustmentType === 'PERCENT'
                  ? 'Porcentaje (ej: 15 o -10)'
                  : 'Monto en $ (ej: 2000 o -1500)'}
              </label>
              <input
                type="number"
                step="any"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                required
                className="w-full px-3 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-content-secondary uppercase tracking-wider mb-1">
                Redondeo comercial
              </label>
              <select
                value={bulkRounding}
                onChange={(e) => setBulkRounding(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
              >
                <option value="100">Múltiplos de $100 (recomendado)</option>
                <option value="500">Múltiplos de $500</option>
                <option value="10">Múltiplos de $10</option>
                <option value="NONE">Exacto (sin redondear)</option>
              </select>
            </div>
          </div>

          {/* Transfer discount recalculation */}
          <div className="p-3 rounded-md bg-canvas border border-brand-border/20 space-y-2">
            <label className="flex items-center gap-2 text-xs text-content cursor-pointer">
              <input
                type="checkbox"
                checked={bulkRecalcTransfer}
                onChange={(e) => setBulkRecalcTransfer(e.target.checked)}
                className="rounded border-brand-border/40 bg-surface text-brand focus:ring-mauve"
              />
              <span>Calcular automáticamente el Precio por Transferencia / Efectivo</span>
            </label>
            {bulkRecalcTransfer && (
              <div className="flex items-center gap-2 pl-6">
                <span className="text-xs text-content-secondary">Descuento sobre lista:</span>
                <input
                  type="number"
                  min="0"
                  max="80"
                  value={bulkTransferDiscount}
                  onChange={(e) => setBulkTransferDiscount(e.target.value)}
                  className="w-20 px-2.5 py-1 bg-surface border border-brand-border/30 rounded text-xs text-content"
                />
                <span className="text-xs text-mauve font-medium">% OFF</span>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-content-secondary">
              <span className="uppercase tracking-wider font-medium text-mauve">
                Vista previa ({bulkTargetProducts.length} productos afectados)
              </span>
              <span>Muestra de los primeros 5 productos</span>
            </div>
            <div className="border border-brand-border/20 rounded-md overflow-hidden divide-y divide-brand-border/15 bg-canvas max-h-48 overflow-y-auto">
              {bulkTargetProducts.slice(0, 5).map((p) => {
                const currentPrice = Number(p.price || 0);
                const nextPrice = calculateNewPrice(currentPrice);
                const nextTransfer = calculateNewTransfer(nextPrice, p.transferPrice);
                return (
                  <div
                    key={p.id || p._id}
                    className="px-3 py-2 flex items-center justify-between text-xs"
                  >
                    <span className="truncate max-w-[200px] text-content">{p.name}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-content-muted line-through">
                        {themeConfig.brand.currencySymbol}
                        {currentPrice.toLocaleString('es-AR')}
                      </span>
                      <span className="text-mauve">&rarr;</span>
                      <span className="text-emerald-300 font-semibold">
                        {themeConfig.brand.currencySymbol}
                        {nextPrice.toLocaleString('es-AR')}
                      </span>
                      {nextTransfer && (
                        <span className="text-[10px] text-content-secondary">
                          (Transf: {themeConfig.brand.currencySymbol}
                          {Number(nextTransfer).toLocaleString('es-AR')})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {bulkTargetProducts.length === 0 && (
                <div className="p-3 text-center text-xs text-content-muted">
                  Seleccioná una categoría o filtro con productos para previsualizar.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-border/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBulkPriceOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={bulkApplying || bulkTargetProducts.length === 0}
              className="inline-flex items-center"
            >
              <FiCheck className="mr-1.5" />
              {bulkApplying
                ? 'Actualizando precios...'
                : `Aplicar a ${bulkTargetProducts.length} productos`}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
