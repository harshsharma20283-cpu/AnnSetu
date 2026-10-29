const API_BASE = '';

export async function fetchItems(status = 'active') {
  const res = await fetch(`${API_BASE}/items?status=${status}`);
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
}

export async function createItem(itemData) {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create item');
  }
  return res.json();
}

export async function updateItem(id, updates) {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update item');
  }
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete item');
  return true;
}

export async function getShelfLifeSuggestions(query) {
  if (!query || !query.trim()) return [];
  const res = await fetch(`${API_BASE}/shelf-life/suggest?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function estimateItemExpiry(name, location = 'fridge', purchaseDate = '') {
  const res = await fetch(`${API_BASE}/shelf-life/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, location, purchase_date: purchaseDate || undefined }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function lookupBarcode(barcode) {
  // Using Open Food Facts free public API
  const cleanCode = barcode.trim();
  const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${cleanCode}.json`);
  if (!res.ok) throw new Error('Product not found in Open Food Facts');
  const data = await res.json();
  if (data.status !== 1 || !data.product) {
    throw new Error('Product details not found');
  }
  const p = data.product;
  return {
    name: p.product_name || p.generic_name || 'Packaged Product',
    category: p.categories_tags?.[0]?.replace('en:', '') || 'packaged',
    image: p.image_url || p.image_front_url || '',
    brand: p.brands || '',
    quantity: p.quantity || '',
  };
}
