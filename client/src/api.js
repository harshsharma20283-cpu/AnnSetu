const API_BASE = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('annsetu_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  if (data.token) {
    localStorage.setItem('annsetu_token', data.token);
    localStorage.setItem('annsetu_user', JSON.stringify(data.user));
  }
  return data;
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  if (data.token) {
    localStorage.setItem('annsetu_token', data.token);
    localStorage.setItem('annsetu_user', JSON.stringify(data.user));
  }
  return data;
}

export async function getCurrentUser() {
  const token = localStorage.getItem('annsetu_token');
  if (!token) return null;
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    localStorage.removeItem('annsetu_token');
    localStorage.removeItem('annsetu_user');
    return null;
  }
  const data = await res.json();
  return data.user;
}

export function logoutUser() {
  localStorage.removeItem('annsetu_token');
  localStorage.removeItem('annsetu_user');
}

export async function getGoogleAuthUrl() {
  const redirectUri = window.location.origin;
  try {
    const res = await fetch(`${API_BASE}/auth/google?redirect_to=${encodeURIComponent(redirectUri)}`);
    const data = await res.json();
    if (res.ok && data.url) return data.url;
  } catch (err) {
    console.warn('Backend google auth url failed, using direct Supabase URL fallback:', err);
  }
  return `https://dwuudsgauyrjgtqypvrm.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}`;
}

export async function handleOAuthCallback({ accessToken, code }) {
  const res = await fetch(`${API_BASE}/auth/oauth-callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Google login failed');
  if (data.token) {
    localStorage.setItem('annsetu_token', data.token);
    localStorage.setItem('annsetu_user', JSON.stringify(data.user));
  }
  return data;
}

export async function uploadGroceryPhoto(file) {
  const token = localStorage.getItem('annsetu_token');
  const formData = new FormData();
  formData.append('photo', file);

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/upload/photo`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload photo');
  return data.url;
}

export async function fetchExpiringAlerts() {
  const res = await fetch(`${API_BASE}/items/alerts`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return { count: 0, items: [] };
  return res.json();
}

export async function fetchItems(status = 'active') {
  const res = await fetch(`${API_BASE}/items?status=${status}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
}

export async function createItem(itemData) {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
