const API_BASE = '/api';

async function request(method, path, body) {
	const options = {
		method,
		credentials: 'include',
		headers: {},
	};

	if (body instanceof FormData) {
		options.body = body;
	} else if (body !== undefined) {
		options.headers['Content-Type'] = 'application/json';
		options.body = JSON.stringify(body);
	}

	const response = await fetch(`${API_BASE}${path}`, options);
	const isJson = response.headers.get('content-type')?.includes('application/json');
	const data = isJson ? await response.json() : null;

	if (!response.ok) {
		throw new Error(data?.error || `Request failed with status ${response.status}`);
	}

	return data;
}

const apiClient = {
	get: (path) => request('GET', path),
	post: (path, body) => request('POST', path, body),
	patch: (path, body) => request('PATCH', path, body),
	put: (path, body) => request('PUT', path, body),
	delete: (path) => request('DELETE', path),
	fileUrl: (relativePath) => (relativePath ? `/uploads/${relativePath}` : null),
};

export default apiClient;
export { apiClient };
