import React, {useEffect, useRef, useState} from 'react';
import './Gallery.css';
import { useDropzone } from "react-dropzone";
import {enqueueSnackbar} from "notistack";
import CustomSnackbarContent from "../components/snackbar";
import {useNavigate} from "react-router-dom";

const Modal = ({ show, handleClose, photos, setPhotos }) => {
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null); // Track which dropdown is open
  const dropdownRef = useRef(null); // Ref for dropdown container

  // Define hashtags by category
  const hashtagCategories = {
    Person: ['Stepan', 'Taras', 'Karina', 'Andrey', 'Oksana', 'Family', 'Friends', 'Pets'],
    Place: ['Great Britain', 'Kiev', 'Glevaha', 'England', 'Abroad trip', 'Ukraine trip'],
    Action: ['Walk', 'Eating', 'chilling', 'we are guestss', 'we have guests'],
    Year: ['2006-2010', '2010-2014','2014-2016', '2017-2019','2020', '2021','2022', '2023', '2024']
  };

  const [availableHashtags, setAvailableHashtags] = useState(hashtagCategories['Place']); // Default category
  const [selectedCategory, setSelectedCategory] = useState('Place'); // Default category for display

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setPhotos((prevPhotos) =>
        [...prevPhotos, ...acceptedFiles.map(file => ({ file, name: '', hashtags: [] }))]
      );
    },
    accept: 'image/*'
  });

  const handleHashtagChange = (index, hashtag) => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((photo, i) =>
        i === index
          ? {
              ...photo,
              hashtags: photo.hashtags.includes(hashtag)
                ? photo.hashtags.filter((h) => h !== hashtag)
                : [...photo.hashtags, hashtag]
            }
          : photo
      )
    );
  };

  const toggleDropdown = (index) => {
    setOpenDropdownIndex((prevIndex) => (prevIndex === index ? null : index)); // Toggle dropdown for specific photo
  };

  const removePhoto = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append('files', photo.file);
      formData.append('hashtags', photo.hashtags.join(',')); // Send hashtags as a comma-separated string
    });

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      enqueueSnackbar('Successfully uploaded!', {
        content: (key) => <CustomSnackbarContent message="Photos were uploaded!" />,
      });
      setPhotos([]);
      handleClose();
    } catch (error) {
      console.error('Error uploading photos:', error);
      enqueueSnackbar('Failed to upload', {
        content: (key) => <CustomSnackbarContent message="Failed to upload" />,
      });
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownIndex !== null && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownIndex(null); // Close the dropdown
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownIndex]);

  return (
    <>
      {show ? (
        <div className="modal-overlay" onClick={handleClose} style={{overflowY: 'auto', overflowX: 'auto',}}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Upload Photos</h2>
            <div
              {...getRootProps()}
              style={{
                border: '2px dashed #cccccc',
                borderRadius: '5px',
                width: '100%',
                height: '200px',
                lineHeight: '200px',
                textAlign: 'center',
                color: '#cccccc',
                backgroundColor: isDragActive ? '#e0e0e0' : '#f9f9f9',
                cursor: 'pointer',
              }}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the photos here ...</p>
              ) : (
                <p>Drag & drop screenshots here, or click to select screenshots</p>
              )}
            </div>
            <div style={{ marginTop: '20px' }}>
              {photos.map((photo, index) => (
                <div key={index} style={{ display: 'inline-block', marginRight: '10px', position: 'relative' }}>
                  <button
                    onClick={() => removePhoto(index)}
                    style={{
                      position: 'absolute',
                      background: 'grey',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      padding: '5px',
                    }}
                  >
                    ×
                  </button>
                  {photo.file && photo.file instanceof File ? (
                    <img
                      src={URL.createObjectURL(photo.file)}
                      alt={`Preview ${index}`}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                      }}
                    />
                  ) : (
                    <p>Invalid file</p>
                  )}
                  <div style={{ position: 'relative', marginTop: '5px' }}>
                    <button
                      onClick={() => toggleDropdown(index)}
                      style={{
                        padding: '10px',
                        cursor: 'pointer',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        backgroundColor: '#f8f8f8',
                        marginRight: '10px',
                      }}
                    >
                      {photo.hashtags.length > 0 ? `${photo.hashtags.join(', ')}` : 'Filter by hashtags'}
                    </button>

                    {/* Dropdown */}
                    {openDropdownIndex === index && (
                      <div
                        ref={dropdownRef}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          padding: '10px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          borderRadius: '5px',
                          display: 'flex',
                          width: '600px',
                          maxHeight: '200px',
                          maxWidth: '50vw',
                          overflowY: 'auto',
                          overflowX: 'auto',
                          zIndex: 1,
                        }}
                      >
                        {Object.keys(hashtagCategories).map((category) => (
                          <div key={category} style={{ flex: 1, padding: '0 10px' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>{category}</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              {hashtagCategories[category].map((hashtag, i) => (
                                <li
                                  key={i}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    marginBottom: '5px',
                                  }}
                                  onClick={() => handleHashtagChange(index, hashtag)}
                                >
                                  <input
                                    type="checkbox"
                                    id={`hashtag-${index}-${i}`}
                                    checked={photo.hashtags.includes(hashtag)}
                                    onChange={() => handleHashtagChange(index, hashtag)}
                                    style={{ marginRight: '10px' }}
                                  />
                                  <label htmlFor={`hashtag-${index}-${i}`} style={{ cursor: 'pointer' }}>
                                    {photo.hashtags.includes(hashtag) ? '✔ ' : ''}{hashtag}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleUpload} className="uploadmodal" style={{ marginTop: '20px' }}>
              Upload Photos
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};
const Gallery = () => {
  const [showModal, setShowModal] = useState(false);
  const [photos, setPhotos] = useState([]); // All photos fetched from the backend
  const [displayPhotos, setDisplayPhotos] = useState([]); // Photos to be displayed
  const [error, setError] = useState(null);
  const [hashtags, setHashtags] = useState(['Stepan', 'Taras', 'Shevchuki', 'Atos', 'Karina', 'Oksana', 'Andrey', 'Sea', 'Forest']);
  const [selectedHashtags, setSelectedHashtags] = useState([]); // Array to hold selected hashtags
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Toggle for dropdown
  const dropdownRef = useRef(null);

  const hashtagCategories = {
    Person: ['Stepan', 'Taras', 'Karina', 'Andrey', 'Oksana', 'Family', 'Friends', 'Pets'],
    Place: ['Great Britain', 'Kiev', 'Glevaha', 'England', 'Abroad trip', 'Ukraine trip'],
    Action: ['Walk', 'Eating', 'chilling', 'we are guests', 'we have guests'],
    Year: ['2006-2010', '2010-2014','2014-2016', '2017-2019','2020', '2021','2022', '2023', '2024']
  };

  // Function to fetch all photos initially
  const fetchAllPhotos = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load photos');
      }

      const data = await response.json();
      console.log(data.length)
      setDisplayPhotos(data); // Display all photos initially
    } catch (err) {
      setError('Failed to load photos');
    }
  };

  // Function to fetch filtered photos based on selected hashtags
  const fetchFilteredPhotos = async (hashtags) => {
    try {
      let url = 'http://127.0.0.1:5000/photos';
      if (hashtags.length > 0) {
        const query = hashtags.join(',');
        url += `?hashtags=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load photos');
      }

      const data = await response.json();
      setDisplayPhotos(data); // Update the displayed photos
    } catch (err) {
      setError('Failed to load photos');
    }
  };

  useEffect(() => {
    fetchAllPhotos(); // Fetch all photos when the component mounts
  }, []);

  // Handle the selection of multiple hashtags
  const handleHashtagChange = (hashtag) => {
    setSelectedHashtags((prevSelected) => {
      if (prevSelected.includes(hashtag)) {
        // Deselect if already selected
        return prevSelected.filter((tag) => tag !== hashtag);
      } else {
        // Add to selected hashtags
        return [...prevSelected, hashtag];
      }
    });
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Fetch filtered photos when the "Search Photos" button is clicked
  const handleSearchClick = () => {
    fetchFilteredPhotos(selectedHashtags);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
      <div style={{textAlign: 'center', marginTop: '50px'}}>
        <a href="/" className="home-button"><i className="fa-solid fa-house"></i></a>
        {error && <p>{error}</p>}

        {/* Multi-Select Dropdown */}
        <div
            style={{
                position: 'absolute',
                top: '10px',       // Distance from the top of the screen
                left: '50%',       // Move the element to the center horizontally
                transform: 'translateX(-50%)', // Adjust the element's position to truly center it
                display: 'inline-block',
                textAlign: 'left',
                height: '50px'
            }}
            ref={dropdownRef}
        >
          <button
              onClick={toggleDropdown}
              style={{
                padding: '15px',
                cursor: 'pointer',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#f8f8f8',
                marginRight: '10px',
                width: '150px',
              }}
          >
            {selectedHashtags.length > 0 ? `${selectedHashtags.join(', ')}` : 'Filter by hashtags'}
          </button>

          {isDropdownOpen && (
              <div
                  ref={dropdownRef}
                  style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          padding: '10px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          borderRadius: '5px',
                          display: 'flex',
                          width: '600px',
                          zIndex: 1,
                  }}
              >
                {Object.keys(hashtagCategories).map((category) => (
                    <div key={category} style={{ flex: 1, padding: '0 10px' }}>
                      <h4 style={{ margin: '0 0 10px 0' }}>{category}</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {hashtagCategories[category].map((hashtag, index) => (
                            <li
                                key={index}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  marginBottom: '5px',
                                }}
                                onClick={() => handleHashtagChange(hashtag)}
                            >
                              <input
                                  type="checkbox"
                                  id={`hashtag-${index}`}
                                  checked={selectedHashtags.includes(hashtag)}
                                  onChange={() => handleHashtagChange(hashtag)}
                                  style={{ marginRight: '10px' }}
                              />
                              <label htmlFor={`hashtag-${index}`} style={{ cursor: 'pointer' }}>
                                {selectedHashtags.includes(hashtag) ? '✔ ' : ''}{hashtag}
                              </label>
                            </li>
                        ))}
                      </ul>
                    </div>
                ))}
              </div>
          )}

          {/* Button to fetch photos */}
          <button
              onClick={handleSearchClick}
              style={{
                padding: '15px',
                cursor: 'pointer',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#007bff',
                color: '#fff'
              }}
          >
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>

        <button className="open-modal-button" onClick={handleOpenModal}><i className="fa-solid fa-upload"></i></button>

        <div className="photo-grid">
          {displayPhotos.length > 0 ? (
              displayPhotos.map((photo, index) => (
                  <div key={index} className="photo-card">
                    <iframe
                        src={`https://drive.google.com/file/d/${photo.id}/preview`}
                        title="Google Drive Image"
                        className='photo-card-image'
                    ></iframe>
                    <div className="photo-card-content">
                      <h3>{photo.name}</h3>
                    </div>
                    <a href={photo.url} className="download-button" download>
                      <i className="fa-solid fa-download"></i>
                    </a>
                  </div>
              ))
          ) : (
              <p>No photos found.</p>
          )}
        </div>
        <Modal
            show={showModal}
            handleClose={handleCloseModal}
            photos={photos}
            setPhotos={setPhotos}
        />
      </div>
  );
};
export default Gallery;