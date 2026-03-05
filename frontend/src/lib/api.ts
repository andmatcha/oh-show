const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

export async function apiClient(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
) {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  // レスポンスが204 No Contentなどの場合はnullを返す
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
