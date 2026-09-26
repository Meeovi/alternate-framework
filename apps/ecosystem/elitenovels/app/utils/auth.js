// ~/utils/auth.js

export function isLoggedIn() {
  const token = localStorage.getItem('authToken');
  return !!token; // Returns true if the token exists, false otherwise
}

export async function getUser() {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  try {
    // Example of a fetch request to an API to get the user info
    const response = await fetch('/V1/customers/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
