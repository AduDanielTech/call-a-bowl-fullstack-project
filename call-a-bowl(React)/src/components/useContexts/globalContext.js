import React, { createContext, useState, useEffect, useMemo } from 'react';

const AppContext = createContext();

function AppProvider({ children }) {
  const [jsonData, setJsonData] = useState(null);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);



  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  // Function to fetch data and handle caching
  const fetchData = async () => {
    try {
      const cachedData = localStorage.getItem('jsonData');
      const response = await fetch(`${backendUrl}/api/products`);
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
  
        if (cachedData && JSON.stringify(data.newItem) === cachedData) {
          setJsonData(JSON.parse(cachedData));
        } else {
          localStorage.setItem('jsonData', JSON.stringify(data.newItem));
          setJsonData(data.newItem);
        }
  
        setIsLoading(false);
        setError(null);
      } else {
        throw new Error('Response is not in JSON format');
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []); // useEffect to trigger fetchData when the component mounts

  // Memoize the jsonData value to prevent unnecessary re-renders
  const memoizedJsonData = useMemo(() => jsonData, [jsonData]);



  if (error) {
    // Render error message if there was an error
    return <div>Error: {error}</div>;
  }

  // Render your application content with the fetched data
  return (
    <AppContext.Provider value={{ jsonData: memoizedJsonData, cart, setCart, isLoading, error , }}>
      {children}
    </AppContext.Provider>
  );
}

export { AppContext, AppProvider };
