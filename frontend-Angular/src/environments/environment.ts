const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host}:8080/api`;
  }
  return 'http://localhost:8080/api';
};

export const environment = {
  production: true,
  apiUrl: getApiUrl()
};
