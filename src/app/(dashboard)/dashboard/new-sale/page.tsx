'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { getProducts } from './actions';

type Product = {
  id: string;
  name: string;
  sku: string;
  price: string;
  quantity: number;
};

type CartItem = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
};

export default function NewSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSale, setShowSale] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, sku: product.sku, price: Number(product.price), quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, qty: number) => {
    setCart(prev =>
      prev
        .map(item => (item.id === id ? { ...item, quantity: Math.max(1, qty) } : item))
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const printBill = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
            <p className="text-gray-600 mt-1">Process sales quickly with product search and a printable bill.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Sales</h2>
            <Button type="button" onClick={() => setShowSale(prev => !prev)}>
              {showSale ? 'Close Sale' : 'New Sale'}
            </Button>
          </div>

          {showSale ? (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <section className="lg:col-span-2">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <FormInput
                    name="search"
                    label="Search products"
                    placeholder="Name or barcode"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <div className="text-sm text-gray-500">{filteredProducts.length} results</div>
                </div>

                <div className="mt-4 max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg">
                  {isLoading ? (
                    <div className="p-6 text-center text-gray-500">Loading products…</div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No products found.</div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-sm font-medium text-gray-600">Name</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-600">Barcode</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-600">Price</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-600">Stock</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-600">Add</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map(product => (
                          <tr key={product.id} className="border-t">
                            <td className="px-4 py-3 text-sm text-gray-800">{product.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{product.sku}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(product.price)}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{product.quantity}</td>
                            <td className="px-4 py-3">
                              <Button type="button" onClick={() => addToCart(product)}>
                                Add
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>

              <section className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900">Current Sale</h3>
                {cart.length === 0 ? (
                  <p className="text-gray-600 mt-3">Add products to the cart to start the sale.</p>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-600">{item.sku}</div>
                            <div className="text-sm text-gray-700">{formatCurrency(String(item.price))}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={e => updateQuantity(item.id, Number(e.target.value))}
                              className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
                            />
                            <Button type="button" variant="secondary" onClick={() => removeFromCart(item.id)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Total</span>
                        <span className="text-xl font-semibold text-gray-900">{formatCurrency(String(total))}</span>
                      </div>
                    </div>

                    <Button type="button" onClick={printBill}>
                      Print Bill
                    </Button>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="mt-6 bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600">
                Start a sale by clicking the button above. Search products by name or barcode, add them to the cart, then print a receipt.
              </p>
            </div>
          )}

          <div className="hidden print:block mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Receipt</h2>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatCurrency(String(item.price * item.quantity))}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(String(total))}</span>
            </div>
          </div>
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
