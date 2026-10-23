import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import ProductTable from '../../components/admin/ProductTable';
import ProductForm from '../../components/admin/ProductForm';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PAGE_SIZE = 20;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchProducts = async (targetPage = page) => {
    try {
      const res = await client.get(
        `/products?page=${targetPage}&limit=${PAGE_SIZE}&includeInactive=true`
      );
      const data = res.data;
      setProducts(data.products || data);
      setTotal(data.total ?? (data.products || data).length);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      if (editingProduct) {
        await client.put(`/products/${editingProduct._id || editingProduct.id}`, formData);
      } else {
        await client.post('/products', formData);
      }
      await fetchProducts(page);
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
      if (products.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await fetchProducts(page);
      }
    } catch (error) {
      alert('Error al eliminar el producto');
    }
  };

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-brand-border/20">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-mauve font-medium">
            Catálogo &bull; Inventario
          </span>
          <h1 className="font-display text-2xl uppercase tracking-wider text-content mt-0.5">
            Gestión de Productos
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Administrá productos, categorías, códigos SKU, variantes, precios y stock
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          variant="primary"
          className="inline-flex items-center self-start sm:self-auto py-2.5 text-xs sm:text-sm"
        >
          <FiPlus className="mr-1.5" /> Nuevo Producto
        </Button>
      </div>

      <ProductTable products={products} onEdit={handleOpenModal} onDelete={handleDelete} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1">
          <p className="text-xs text-content-secondary">
            Página <span className="font-semibold text-content">{page}</span> de{' '}
            <span className="font-semibold text-content">{totalPages}</span> &mdash; {total}{' '}
            productos en total
          </p>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="flex items-center justify-center w-8 h-8 rounded border border-brand-border/30 bg-surface text-content disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-elevated transition-colors"
              title="Página anterior"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="flex items-center justify-center w-8 h-8 rounded border border-brand-border/30 bg-surface text-content disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-elevated transition-colors"
              title="Página siguiente"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <ProductForm initialData={editingProduct} onSubmit={handleSubmit} loading={loading} />
      </Modal>
    </div>
  );
};

export default ProductsPage;
