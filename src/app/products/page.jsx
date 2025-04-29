'use client';

import { useState, useEffect } from 'react';
import { Search } from 'react-bootstrap-icons';

export default function ProductsPage() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (search) {
      if (searchTimeout) clearTimeout(searchTimeout);
      const timeout = setTimeout(() => {
        searchProducts();
      }, 500);
      setSearchTimeout(timeout);
    } else {
      if (products.length > 0) {
        setDisplayedProducts(products);
      } else {
        fetchProducts();
      }
    }
  }, [search]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND}/products`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      
      const data = await res.json();
      
      setProducts(data);
      setDisplayedProducts(data);
      
      if (data.length === 0) {
        setMessage("No products found");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setMessage("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const searchProducts = async () => {
    setIsLoading(true);
    try {
      // Backend search might be case-sensitive, so we'll implement client-side filtering
      // for case-insensitive search when products are already loaded
      if (products.length > 0) {
        const searchTerm = search.toLowerCase();
        const filteredProducts = products.filter(product => 
          product.name.toLowerCase().includes(searchTerm) || 
          (product.category && product.category.toLowerCase().includes(searchTerm))
        );
        
        setDisplayedProducts(filteredProducts);
        
        if (filteredProducts.length === 0) {
          setMessage(`No products found matching "${search}"`);
        } else {
          setMessage("");
        }
        setIsLoading(false);
      } else {
        // If products aren't loaded yet, we'll still use the backend search
        // but we'll convert to lowercase for the query
        const res = await fetch(`${BACKEND}/products/search?query=${encodeURIComponent(search.toLowerCase())}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }
        
        const data = await res.json();
        
        setDisplayedProducts(data);
        
        if (data.length === 0) {
          setMessage(`No products found matching "${search}"`);
        } else {
          setMessage("");
        }
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setMessage("Failed to search products");
    } finally {
      setIsLoading(false);
    }
  };

  // Product List Item Component
  const ProductListItem = ({ product, index }) => {
    // Get stock value directly from product
    const stockValue = product.stock_value || 0;
    
    return (
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="py-3 pl-4 pr-2 text-center">{index + 1}</td>
        <td className="py-3 px-2">{product.name}</td>
        <td className="py-3 px-2">
          {product.category && (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
              {product.category}
            </span>
          )}
        </td>
        <td className="py-3 px-2 text-center">
          <span className="tabular-nums">{stockValue}</span>
        </td>
        <td className="py-3 px-2 text-right">${product.price}</td>
      </tr>
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      
      <div className="relative mb-6 max-w-md">
        <input 
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : displayedProducts.length > 0 ? (
        <div className="mt-4 overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3 pl-4 pr-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 text-center">
                  No.
                </th>
                <th scope="col" className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="py-3 px-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="py-3 px-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedProducts.map((product, index) => (
                <ProductListItem key={product.id} product={product} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">{message || "No products found"}</p>
          {search && (
            <button 
              onClick={() => {
                setSearch("");
                fetchProducts();
              }}
              className="mt-4 px-3 py-1 bg-gray-900 text-white rounded"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
} 