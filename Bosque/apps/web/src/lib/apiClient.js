const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090';
const TOKEN_KEY = 'bosque_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, { method = 'GET', body, isFormData = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body)
  });

  if (response.status === 204) return null;

  const contentType = response.headers.get('Content-Type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.message || `Erro na requisição (${response.status})`);
  }

  return data;
}

// Imagens vêm com URL relativa (`/uploads/...`) quando servidas pela própria API;
// se o storage for trocado por um serviço externo (S3/Cloudinary), a URL já vem absoluta.
function imageUrl(url) {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `${API_URL}${url}`;
}

const apiClient = {
  API_URL,
  getToken,
  setToken,
  imageUrl,
  get: (path) => request(path),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body, opts) => request(path, { method: 'PUT', body, ...opts }),
  del: (path) => request(path, { method: 'DELETE' }),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/api/auth/me')
};

export default apiClient;
export { apiClient, API_URL };
