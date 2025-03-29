import Cookies from 'js-cookie';

/**
 * Refreshes the auth tokens using the refresh token stored in cookies
 * @param {function} router - Next.js router instance for redirecting if needed
 * @returns {Promise<Object|null>} - The refresh response data or null if failed
 */
export const refreshTokens = async (router) => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      // If no refresh token is available, redirect to login
      router && router.push('/');
      return null;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ token: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      return data; // Successfully refreshed tokens
    } else {
      // Refresh token failed, redirect to login
      router && router.push('/');
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    router && router.push('/');
    return null;
  }
};

/**
 * Makes an authenticated API request with token refresh capability
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options (method, headers, etc.)
 * @param {function} router - Next.js router instance for redirecting if needed
 * @returns {Promise<Object>} - The API response data
 */
export const authenticatedFetch = async (url, options = {}, router) => {
  // Set default options
  const fetchOptions = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    let response = await fetch(url, fetchOptions);

    // If unauthorized, try to refresh token and retry the request
    if (response.status === 401) {
      const refreshResult = await refreshTokens(router);
      
      if (refreshResult) {
        // Retry the original request
        response = await fetch(url, fetchOptions);
      } else {
        // If refresh failed, throw error
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}; 