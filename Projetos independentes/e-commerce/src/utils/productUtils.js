
export const filterProducts = (products, { search, category, priceRange, sortBy }) => {
  let filtered = [...products];

  // Search filter
  if (search) {
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Category filter
  if (category && category !== 'All') {
    filtered = filtered.filter(product => product.category === category);
  }

  // Price range filter
  if (priceRange) {
    filtered = filtered.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );
  }

  // Sorting
  switch (sortBy) {
    case 'price-low-high':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high-low':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      filtered.sort((a, b) => b.id - a.id);
      break;
    default:
      break;
  }

  return filtered;
};

export const getRelatedProducts = (products, currentProduct, limit = 4) => {
  return products
    .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
    .slice(0, limit);
};
