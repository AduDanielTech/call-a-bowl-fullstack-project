import React, { createContext, useState, useEffect, useMemo } from 'react';

const AppContext = createContext();

const CACHE_KEY = 'jsonData';

function AppProvider({ children }) {
  const [jsonData, setJsonData] = useState(null);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const backendUrl = 'https://call-a-bowl-fullstack-project.vercel.app';
   /* const backendUrl = process.env.REACT_APP_BACKEND_URL; */
  
  const updateLocalStorage = (data) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem('lastFetchTime', Date.now());
  };
  
  const fetchData = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/products`);
  
      if (!response.ok) {
        console.log('Error: Fetch request not successful');
        return;
      }
  
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const { newItem } = await response.json();
        console.log('Fresh data:', newItem);
  
        setJsonData(newItem);
        updateLocalStorage(newItem);
      } else {
        console.log('Error: Response is not in JSON format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };
  
  useEffect(() => {
    const fetchDataAndLog = async () => {
      await fetchData();
      console.log('After fetching data');
      setIsLoading(false);
    };
  
    fetchDataAndLog();
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
/* 
 const fetchData = async () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const lastFetchTime = localStorage.getItem('lastFetchTime');

      if (cachedData && lastFetchTime && Date.now() - lastFetchTime < 120000) {
        // Use cached data if it exists and the elapsed time is less than 2 minutes
        setJsonData(JSON.parse(cachedData));
      } else {
        const freshData = await fetchAndHandleErrors(`${backendUrl}/api/products`);
        setJsonData(freshData);

        // Update the cache with fresh data and last fetch time
        updateLocalStorage(freshData);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching menu data:', error);

      if (!jsonData) {
        setError(error.message);
      }

      setIsLoading(false);
    }
  };

  const updateLocalStorage = (data) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem('lastFetchTime', Date.now());
  };

  const fetchAndHandleErrors = async (url) => {
    try {
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const contentType = response.headers.get('content-type');
  
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data.newItem;
      } else {
        throw new Error('Response is not in JSON format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };
  

  const fetchDataAndUpdateLocalStorage = async () => {
    try {
      const freshData = await fetchAndHandleErrors(`${backendUrl}/api/products`);
      updateLocalStorage(freshData);
      return freshData;
    } catch (error) {
      console.error('Error updating local storage:', error);
      throw error;
    }
  };


    useEffect(() => {
    const fetchDataFromLocalStorage = async () => {
      try {
        const data = await fetchDataAndUpdateLocalStorage();
        setJsonData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataFromLocalStorage();
  }, []);
 */