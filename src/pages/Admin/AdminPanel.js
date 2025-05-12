// src/pages/Admin/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import './AdminPanel.scss';

const AdminPanel = () => {
  // State management
  const [activeTab, setActiveTab] = useState('schools');
  const [schools, setSchools] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form data for new items
  const [newSchool, setNewSchool] = useState({
    name: '',
    description: '',
    acceptanceRate: '',
    avgGPA: '',
    avgMCAT: '',
    website: '',
    logo: null
  });
  
  const [newProfile, setNewProfile] = useState({
    type: 'biomedical',
    gender: 'Male',
    ethnicity: '',
    state: '',
    year: new Date().getFullYear().toString(),
    gpa: '',
    sgpa: '',
    mcat: '',
    mcatBreakdown: '',
    acceptedSchools: [''],
    backgroundItems: ['']
  });
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    type: 'subscription', // or 'one-time'
    features: ['']
  });
  
  // Firestore database and storage
  const db = getFirestore();
  const storage = getStorage();
  
  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch schools
        const schoolsSnapshot = await getDocs(collection(db, 'schools'));
        const schoolsList = schoolsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSchools(schoolsList);
        
        // Fetch profiles
        const profilesSnapshot = await getDocs(collection(db, 'profiles'));
        const profilesList = profilesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProfiles(profilesList);
        
        // Fetch products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [db]);
  
  // Handler for adding a new school
  const handleAddSchool = async (e) => {
    e.preventDefault();
    
    try {
      // Upload logo if provided
      let logoUrl = '';
      if (newSchool.logo) {
        const logoRef = ref(storage, `school-logos/${newSchool.name.replace(/\s+/g, '-').toLowerCase()}`);
        await uploadBytes(logoRef, newSchool.logo);
        logoUrl = await getDownloadURL(logoRef);
      }
      
      // Add school to Firestore
      const schoolData = {
        ...newSchool,
        logoUrl,
        createdAt: new Date().toISOString()
      };
      
      delete schoolData.logo; // Remove the file object
      
      await addDoc(collection(db, 'schools'), schoolData);
      
      // Reset form and refresh data
      setNewSchool({
        name: '',
        description: '',
        acceptanceRate: '',
        avgGPA: '',
        avgMCAT: '',
        website: '',
        logo: null
      });
      
      // Refresh schools list
      const schoolsSnapshot = await getDocs(collection(db, 'schools'));
      const schoolsList = schoolsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSchools(schoolsList);
      
      alert('School added successfully!');
    } catch (error) {
      console.error('Error adding school:', error);
      alert('Error adding school: ' + error.message);
    }
  };
  
  // Handler for adding a new profile
  const handleAddProfile = async (e) => {
    e.preventDefault();
    
    try {
      // Add profile to Firestore
      const profileData = {
        ...newProfile,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'profiles'), profileData);
      
      // Reset form and refresh data
      setNewProfile({
        type: 'biomedical',
        gender: 'Male',
        ethnicity: '',
        state: '',
        year: new Date().getFullYear().toString(),
        gpa: '',
        sgpa: '',
        mcat: '',
        mcatBreakdown: '',
        acceptedSchools: [''],
        backgroundItems: ['']
      });
      
      // Refresh profiles list
      const profilesSnapshot = await getDocs(collection(db, 'profiles'));
      const profilesList = profilesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProfiles(profilesList);
      
      alert('Profile added successfully!');
    } catch (error) {
      console.error('Error adding profile:', error);
      alert('Error adding profile: ' + error.message);
    }
  };
  
  // Handler for adding a new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    try {
      // Add product to Firestore
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'products'), productData);
      
      // Reset form and refresh data
      setNewProduct({
        name: '',
        description: '',
        price: '',
        type: 'subscription',
        features: ['']
      });
      
      // Refresh products list
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
      
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + error.message);
    }
  };
  
  // Handler for file input change
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setNewSchool({
        ...newSchool,
        logo: e.target.files[0]
      });
    }
  };
  
  // Handler for array field changes
  const handleArrayChange = (setter, field, index, value) => {
    setter(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
  };
  
  // Handler for adding new array item
  const handleAddArrayItem = (setter, field) => {
    setter(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };
  
  // Handler for removing array item
  const handleRemoveArrayItem = (setter, field, index) => {
    setter(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };
  
  if (loading) {
    return (
      <div className="admin-panel">
        <Navbar />
        <div className="admin-content">
          <div className="container">
            <div className="loading-spinner">Loading admin data...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="admin-panel">
      <Navbar />
      
      <div className="admin-content">
        <div className="container">
          <div className="admin-header">
            <h1>Admin Panel</h1>
            <p>Manage schools, profiles, and products</p>
          </div>
          
          <div className="admin-tabs">
            <button 
              className={`tab-button ${activeTab === 'schools' ? 'active' : ''}`}
              onClick={() => setActiveTab('schools')}
            >
              Schools
            </button>
            <button 
              className={`tab-button ${activeTab === 'profiles' ? 'active' : ''}`}
              onClick={() => setActiveTab('profiles')}
            >
              Profiles
            </button>
            <button 
              className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
          </div>
          
          {/* Schools Tab */}
          {activeTab === 'schools' && (
            <div className="tab-content">
              <div className="action-section">
                <h2>Add New School</h2>
                <form onSubmit={handleAddSchool} className="admin-form">
                  <div className="form-group">
                    <label>School Name</label>
                    <input 
                      type="text" 
                      value={newSchool.name}
                      onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      value={newSchool.description}
                      onChange={(e) => setNewSchool({...newSchool, description: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Acceptance Rate</label>
                      <input 
                        type="text" 
                        value={newSchool.acceptanceRate}
                        onChange={(e) => setNewSchool({...newSchool, acceptanceRate: e.target.value})}
                        placeholder="e.g. 3.7%"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Average GPA</label>
                      <input 
                        type="text" 
                        value={newSchool.avgGPA}
                        onChange={(e) => setNewSchool({...newSchool, avgGPA: e.target.value})}
                        placeholder="e.g. 3.9"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Average MCAT</label>
                      <input 
                        type="text" 
                        value={newSchool.avgMCAT}
                        onChange={(e) => setNewSchool({...newSchool, avgMCAT: e.target.value})}
                        placeholder="e.g. 517"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Website URL</label>
                    <input 
                      type="url" 
                      value={newSchool.website}
                      onChange={(e) => setNewSchool({...newSchool, website: e.target.value})}
                      placeholder="https://..."
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>School Logo</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  
                  <button type="submit" className="submit-button">
                    Add School
                  </button>
                </form>
              </div>
              
              <div className="data-section">
                <h2>Existing Schools</h2>
                
                {schools.length === 0 ? (
                  <p className="no-data">No schools found. Add your first school above.</p>
                ) : (
                  <div className="data-grid">
                    {schools.map(school => (
                      <div key={school.id} className="data-card">
                        <div className="card-header">
                          {school.logoUrl && (
                            <img src={school.logoUrl} alt={school.name} className="school-logo" />
                          )}
                          <h3>{school.name}</h3>
                        </div>
                        <div className="card-details">
                          <p><strong>Acceptance Rate:</strong> {school.acceptanceRate}</p>
                          <p><strong>Avg GPA:</strong> {school.avgGPA}</p>
                          <p><strong>Avg MCAT:</strong> {school.avgMCAT}</p>
                        </div>
                        <div className="card-actions">
                          <button className="action-button edit">Edit</button>
                          <button className="action-button delete">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Profiles Tab */}
          {activeTab === 'profiles' && (
            <div className="tab-content">
              <div className="action-section">
                <h2>Add New Profile</h2>
                <form onSubmit={handleAddProfile} className="admin-form">
                  <div className="form-group">
                    <label>Profile Type</label>
                    <select 
                      value={newProfile.type}
                      onChange={(e) => setNewProfile({...newProfile, type: e.target.value})}
                      required
                    >
                      <option value="biomedical">Biomedical</option>
                      <option value="biology">Biology</option>
                      <option value="chemistry">Chemistry</option>
                      <option value="neuroscience">Neuroscience</option>
                      <option value="psychology">Psychology</option>
                      <option value="non-trad">Non-Traditional</option>
                    </select>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Gender</label>
                      <select 
                        value={newProfile.gender}
                        onChange={(e) => setNewProfile({...newProfile, gender: e.target.value})}
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Ethnicity</label>
                      <input 
                        type="text" 
                        value={newProfile.ethnicity}
                        onChange={(e) => setNewProfile({...newProfile, ethnicity: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>State</label>
                      <input 
                        type="text" 
                        value={newProfile.state}
                        onChange={(e) => setNewProfile({...newProfile, state: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Application Year</label>
                      <input 
                        type="text" 
                        value={newProfile.year}
                        onChange={(e) => setNewProfile({...newProfile, year: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>GPA</label>
                      <input 
                        type="text" 
                        value={newProfile.gpa}
                        onChange={(e) => setNewProfile({...newProfile, gpa: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Science GPA</label>
                      <input 
                        type="text" 
                        value={newProfile.sgpa}
                        onChange={(e) => setNewProfile({...newProfile, sgpa: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>MCAT Score</label>
                      <input 
                        type="text" 
                        value={newProfile.mcat}
                        onChange={(e) => setNewProfile({...newProfile, mcat: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>MCAT Breakdown</label>
                      <input 
                        type="text" 
                        value={newProfile.mcatBreakdown}
                        onChange={(e) => setNewProfile({...newProfile, mcatBreakdown: e.target.value})}
                        placeholder="e.g. 128, 130, 129, 130"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Accepted Schools</label>
                    {newProfile.acceptedSchools.map((school, index) => (
                      <div key={index} className="array-item">
                        <input 
                          type="text" 
                          value={school}
                          onChange={(e) => handleArrayChange(
                            setNewProfile, 
                            'acceptedSchools', 
                            index, 
                            e.target.value
                          )}
                          required
                        />
                        {index > 0 && (
                          <button 
                            type="button" 
                            className="remove-button"
                            onClick={() => handleRemoveArrayItem(
                              setNewProfile, 
                              'acceptedSchools', 
                              index
                            )}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button" 
                      className="add-button"
                      onClick={() => handleAddArrayItem(setNewProfile, 'acceptedSchools')}
                    >
                      Add School
                    </button>
                  </div>
                  
                  <div className="form-group">
                    <label>Background Items</label>
                    {newProfile.backgroundItems.map((item, index) => (
                      <div key={index} className="array-item">
                        <input 
                          type="text" 
                          value={item}
                          onChange={(e) => handleArrayChange(
                            setNewProfile, 
                            'backgroundItems', 
                            index, 
                            e.target.value
                          )}
                          required
                        />
                        {index > 0 && (
                          <button 
                            type="button" 
                            className="remove-button"
                            onClick={() => handleRemoveArrayItem(
                              setNewProfile, 
                              'backgroundItems', 
                              index
                            )}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button" 
                      className="add-button"
                      onClick={() => handleAddArrayItem(setNewProfile, 'backgroundItems')}
                    >
                      Add Item
                    </button>
                  </div>
                  
                  <button type="submit" className="submit-button">
                    Add Profile
                  </button>
                </form>
              </div>
              
              <div className="data-section">
                <h2>Existing Profiles</h2>
                
                {profiles.length === 0 ? (
                  <p className="no-data">No profiles found. Add your first profile above.</p>
                ) : (
                  <div className="data-grid">
                    {profiles.map(profile => (
                      <div key={profile.id} className="data-card">
                        <div className="card-header">
                          <h3>{profile.type} Profile</h3>
                          <span className="profile-badge">{profile.year}</span>
                        </div>
                        <div className="card-details">
                          <p><strong>Gender/Ethnicity:</strong> {profile.gender}, {profile.ethnicity}</p>
                          <p><strong>GPA/MCAT:</strong> {profile.gpa} / {profile.mcat}</p>
                          <p><strong>Accepted to:</strong> {profile.acceptedSchools[0]}</p>
                        </div>
                        <div className="card-actions">
                          <button className="action-button edit">Edit</button>
                          <button className="action-button delete">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="tab-content">
              <div className="action-section">
                <h2>Add New Product</h2>
                <form onSubmit={handleAddProduct} className="admin-form">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input 
                      type="text" 
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Price</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Type</label>
                      <select 
                        value={newProduct.type}
                        onChange={(e) => setNewProduct({...newProduct, type: e.target.value})}
                        required
                      >
                        <option value="subscription">Subscription</option>
                        <option value="one-time">One-time Payment</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Features</label>
                    {newProduct.features.map((feature, index) => (
                      <div key={index} className="array-item">
                        <input 
                          type="text" 
                          value={feature}
                          onChange={(e) => handleArrayChange(
                            setNewProduct, 
                            'features', 
                            index, 
                            e.target.value
                          )}
                          required
                        />
                        {index > 0 && (
                          <button 
                            type="button" 
                            className="remove-button"
                            onClick={() => handleRemoveArrayItem(
                              setNewProduct, 
                              'features', 
                              index
                            )}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button" 
                      className="add-button"
                      onClick={() => handleAddArrayItem(setNewProduct, 'features')}
                    >
                      Add Feature
                    </button>
                  </div>
                  
                  <button type="submit" className="submit-button">
                    Add Product
                  </button>
                </form>
              </div>
              
              <div className="data-section">
                <h2>Existing Products</h2>
                
                {products.length === 0 ? (
                  <p className="no-data">No products found. Add your first product above.</p>
                ) : (
                  <div className="data-grid">
                    {products.map(product => (
                      <div key={product.id} className="data-card">
                        <div className="card-header">
                          <h3>{product.name}</h3>
                          <span className="product-badge">${product.price} {product.type === 'subscription' ? '/mo' : ''}</span>
                        </div>
                        <div className="card-details">
                          <p>{product.description}</p>
                          <ul className="feature-list">
                            {product.features.map((feature, index) => (
                              <li key={index}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="card-actions">
                          <button className="action-button edit">Edit</button>
                          <button className="action-button delete">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;