import React, { createContext, useState, useEffect, useMemo } from 'react';


import useSWR from 'swr';
const AppContext = createContext();

// Define a cache key
const CACHE_KEY = 'jsonData';

function AppProvider({ children }) {
  const [jsonData, setJsonData] = useState(null);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = "https://call-a-bowl-fullstack-project.vercel.app";

  const fetchData = async () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);

      if (cachedData) {
        // Use cached data immediately
        setJsonData(JSON.parse(cachedData));
      }

      const response = await fetch(`${backendUrl}/api/products`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        // Update the cache with fresh data
        localStorage.setItem(CACHE_KEY, JSON.stringify(data.newItem));

        // Update the state with fresh data
        setJsonData(data.newItem);
      } else {
        throw new Error('Response is not in JSON format');
      }

      setIsLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching menu data:', error);

      if (!jsonData) {
        setError(error.message);
      }
      
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const memoizedJsonData = useMemo(() => jsonData, [jsonData]);

  if (error) {
    // Render an error message
    return <div>Error: {error}</div>;
  }

  // Render your application content with the fetched data
  return (
    <AppContext.Provider value={{ jsonData: memoizedJsonData, cart, setCart, isLoading, error }}>
      {children}
    </AppContext.Provider>
  );
}


export { AppContext, AppProvider };
