'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Alert } from '@/components/Alert';
import { getProducts, createProduct, updateProduct, deleteProduct } from './actions';

type Product = {
  id: string;
  name: string;
  category?: string;
  sku?: string | null;
  price: string;
  quantity: number;
  description?: string | null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => setMessage(null), 3000);
    return () => window.clearTimeout(id);
  }, [message]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message || 'Failed to load products' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleActionResult = async (promise: Promise<void>, successMessage: string) => {
    try {
      await promise;
      setMessage({ type: 'success', text: successMessage });
      await loadProducts();
      setEditingId(null);
      setShowForm(false);
      return true;
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message || 'Action failed' });
      return false;
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const formData = new FormData();
    formData.set('id', deleteTarget.id);
    const deleted = await handleActionResult(deleteProduct(formData), 'Product deleted.');
    if (deleted) {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">View, add, edit, and delete products.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Your Products</h2>
            <Button type="button" onClick={() => setShowForm(prev => !prev)}>
              {showForm ? 'Cancel' : 'Add New Product'}
            </Button>
          </div>

          {showForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">New Product</h3>
              <form
                action={async (formData: FormData) => {
                  await handleActionResult(createProduct(formData), 'Product created successfully.');
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <FormInput name="name" label="Name" required />
                <FormInput name="category" label="Category (optional)" />
                <FormInput name="sku" label="Barcode (optional)" />
                <FormInput name="price" label="Price" type="number" step="0.01" required />
                <FormInput name="quantity" label="Stock" type="number" min="0" required />

                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit">
                    Save Product
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Name</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Barcode</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Price</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      No products yet. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  products.map(product => {
                    const isEditing = editingId === product.id;
                    return isEditing ? (
                      <tr key={product.id} className="border-t">
                        <td colSpan={5} className="px-4 py-3">
                          <form
                            action={async (formData: FormData) => {
                              formData.set('id', product.id);
                              await handleActionResult(updateProduct(formData), 'Product updated.');
                            }}
                            className="grid grid-cols-1 md:grid-cols-5 gap-2"
                          >
                            <input
                              name="name"
                              defaultValue={product.name}
                              className="rounded border border-gray-300 px-3 py-2 w-full"
                              placeholder="Product Name"
                              required
                            />
                            <input
                              name="category"
                              defaultValue={product.category || ''}
                              className="rounded border border-gray-300 px-3 py-2 w-full"
                              placeholder="Category"
                            />
                            <input
                              name="sku"
                              defaultValue={product.sku || ''}
                              className="rounded border border-gray-300 px-3 py-2 w-full"
                              placeholder="Barcode"
                            />
                            <input
                              name="price"
                              type="number"
                              step="0.01"
                              defaultValue={String(product.price)}
                              className="rounded border border-gray-300 px-3 py-2 w-full"
                              placeholder="Price"
                              required
                            />
                            <input
                              name="quantity"
                              type="number"
                              min={0}
                              defaultValue={String(product.quantity)}
                              className="rounded border border-gray-300 px-3 py-2 w-full"
                              placeholder="Stock"
                              required
                            />
                            <div className="md:col-span-5 flex justify-end gap-2 mt-2">
                              <Button type="submit" className="w-auto">Save</Button>
                              <Button type="button" variant="secondary" className="w-auto" onClick={() => setEditingId(null)}>Cancel</Button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      <tr key={product.id} className="border-t">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{product.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-700">{product.category || product.description || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-700">{product.sku ?? '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-700">{formatCurrency(product.price)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-700">{product.quantity}</span>
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-auto"
                            onClick={() => setEditingId(product.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            className="w-auto"
                            onClick={() => setDeleteTarget(product)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {deleteTarget && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 shadow-lg w-11/12 max-w-md">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                <p className="mt-2 text-gray-600">Are you sure you want to delete <strong>{deleteTarget.name}</strong>?</p>
                <div className="mt-4 flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)} className="w-auto">
                    Cancel
                  </Button>
                  <Button type="button" variant="danger" onClick={confirmDelete} className="w-auto">
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function formatCurrency(value: string) {
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(num);
}
