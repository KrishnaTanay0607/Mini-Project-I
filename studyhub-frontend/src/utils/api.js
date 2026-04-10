const BASE = 'http://localhost:5000';

/** True if id looks like a MongoDB ObjectId (24 hex chars) */
export const isMongoId = (id) => {
  if (!id) return false;
  return /^[a-f\d]{24}$/i.test(String(id));
};

export const api = async (path, options = {}) => {
  const token = localStorage.getItem('sh_token');
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot connect to server. Is the backend running on port 5000?');
  }

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error('Server returned an invalid response.'); }

  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};
