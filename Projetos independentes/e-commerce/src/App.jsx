
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CartProvider } from '@/context/CartContext';
import Layout from '@/components/Layout';
import Homepage from '@/pages/Homepage';
import ProductCatalog from '@/pages/ProductCatalog';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <CartProvider>
      <Router>
        <Helmet>
          <title>LuxeStore - Premium E-Commerce Experience</title>
          <meta name="description" content="Discover premium products with an exceptional shopping experience. Browse electronics, fashion, home decor and more." />
        </Helmet>
        <Toaster />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Homepage />} />
            <Route path="products" element={<ProductCatalog />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
