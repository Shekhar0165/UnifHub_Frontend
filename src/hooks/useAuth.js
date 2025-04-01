import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const useAuth = () => {
  const [accessToken, setAccessToken] = useState(Cookies.get('accessToken'));

  const refreshToken = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/refresh-token`, {
        method: 'POST',
        credentials: 'include', // Ensures cookies are sent
      });

      if (response.ok) {
        const data = await response.json();
        Cookies.set('accessToken', data.accessToken, { expires: 1 }); // Store new access token
        setAccessToken(data.accessToken);
        return data.accessToken;
      } else {
        console.error('Failed to refresh token');
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  return { accessToken, refreshToken };
};

export default useAuth;
