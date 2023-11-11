import React, { createContext, useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';

const AppContext = createContext();

const CACHE_KEY = 'jsonData';

function AppProvider({ children }) {
  const [jsonData, setJsonData] = useState(null);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = "https://call-a-bowl-fullstack-project.vercel.app";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const lastFetchTime = localStorage.getItem('lastFetchTime');
    
        if (cachedData && lastFetchTime && Date.now() - lastFetchTime < 120000) {
          // Use cached data if it exists and the elapsed time is less than 2 minutes
          setJsonData(JSON.parse(cachedData));
        } else {
          const response = await fetch(`${backendUrl}/api/products`);
    
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
    
          const contentType = response.headers.get('content-type');
    
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
    
            // Update the state with fresh data
            setJsonData(data.newItem);
    
            // Update the cache with fresh data and last fetch time
            localStorage.setItem(CACHE_KEY, JSON.stringify(data.newItem));
            localStorage.setItem('lastFetchTime', Date.now());
    
            // Make another API call to update the local storage with the latest data from the backend
            fetch(`${backendUrl}/api/products`)
              .then(response => response.json())
              .then(data => {
                localStorage.setItem(CACHE_KEY, JSON.stringify(data.newItem));
                localStorage.setItem('lastFetchTime', Date.now());
              })
              .catch(error => console.error('Error updating local storage:', error));
          } else {
            throw new Error('Response is not in JSON format');
          }
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
    };
    
  
    fetchData();
  }, []);
  const memoizedJsonData = useMemo(() => jsonData, [jsonData]);

  if (error) {
    // Render an error message
    return <div>Error: {error}</div>;
  }

  return (
    <AppContext.Provider value={{ jsonData: memoizedJsonData, cart, setCart, isLoading, error }}>
      {children}
    </AppContext.Provider>
  );
}

export { AppContext, AppProvider };
