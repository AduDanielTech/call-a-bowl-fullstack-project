import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router';



const backendUrl = process.env.REACT_APP_BACKEND_URL;

const NewSpecialItem = ({ isAuthenticated }) => {
  const [newMenuItem, setNewMenuItem] = useState({
    MENU: '',
    PRICE: 0,
    IMAGE: null,
    CATEGORY: 'SOUP',
  });
  const [response, setResponse] = useState('');
  const navigate = useNavigate();
  const handleInputChange = (event) => {
    const { name, value, type, files } = event.target;
    const newValue = type === 'file' ? files[0] : value;
    setNewMenuItem({ ...newMenuItem, [name]: newValue });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const formData = new FormData();
    formData.append('MENU', newMenuItem.MENU);
    formData.append('PRICE', parseInt(newMenuItem.PRICE, 10));
    formData.append('IMAGE', newMenuItem.IMAGE);
    formData.append('CATEGORY', newMenuItem.CATEGORY);
    console.log(formData);
    try {
      const response = await fetch(`${backendUrl}/api/special/new`, {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        const responseData = await response.json(); // Parse the JSON response
  
        // Handle success, e.g., show a success message and access the details
        console.log(responseData.message);
        setResponse(responseData.message);
        console.log('New Item Details:', responseData.newItem);
      } else {
        // Handle errors, e.g., show an error message
        console.error('Error adding item:', response.statusText);
        setResponse('Network error:', response.statusText);
      }
    } catch (error) {
      // Handle network errors
      console.error('Network error:', error);
      setResponse('Network error:', error);
    }
  };

  return (
    <div>
      <form encType="multipart/form-data" method="post" onSubmit={handleSubmit}>

      <br/>
        <div style={{color:'green'}}>
          {response? response : ''}
          </div>
        <br/>
        <br/>
        <input
          type="text"
          name="MENU"
          placeholder="special Item"
          value={newMenuItem.MENU}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="PRICE"
          placeholder="Price"
          value={newMenuItem.PRICE}
          onChange={handleInputChange}
        />
        <input
          type="file"
          name="IMAGE"
          accept="image/*"
          onChange={handleInputChange}
        />
        <br />
         <label className="label">Category</label>
              <select className="input" 
               name="CATEGORY"
          placeholder="Category"
          value={newMenuItem.CATEGORY}
          onChange={handleInputChange}
              >
                <option value="SOUP">SOUP</option>
                <option value="RICE MEALS">RICE MEALS</option>
                <option value="YAM & PLANTAIN">YAM & PLANTAIN</option>
                <option value="PASTA & NOODLES">PASTA & NOODLES</option>
                <option value="BEANS">BEANS</option>
                <option value="SMALLCHOPS & GRILLS">SMALLCHOPS & GRILLS</option>
                <option value="LUNCHPACK">LUNCHPACK</option>
                <option value="EXTRAS">EXTRAS</option>
                <option value="DRINKS">DRINKS</option>
                <option value="SWALLOW">SWALLOW</option>
                <option value="SOUP">SOUP</option>
              </select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default NewSpecialItem;
