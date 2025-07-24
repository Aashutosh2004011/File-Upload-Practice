/* eslint-disable @typescript-eslint/no-explicit-any */
export const getToken = (): string | null => {
    return localStorage.getItem('token');
  };
  
  export const setToken = (token: string): void => {
    localStorage.setItem('token', token);
  };
  
  export const removeToken = (): void => {
    localStorage.removeItem('token');
  };
  
  export const getUser = (): any | null => {
    const token = getToken();
    if (!token) return null;
  
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload;
    } catch (error) {
        console.log('error: ', error);
      removeToken();
      return null;
    }
  };