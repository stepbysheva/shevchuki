import React, {useEffect, useRef, useState} from 'react';
import './Gallery.css';
import { useDropzone } from "react-dropzone";
import {enqueueSnackbar} from "notistack";
import CustomSnackbarContent from "../components/snackbar";
import {useNavigate} from "react-router-dom";

const Modal = ({ show, handleClose, videos, setVideos }) => {
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null); // Track which dropdown is open
  const dropdownRef = useRef(null); // Ref for dropdown container

  // Define hashtags by category
  const hashtagCategories = {
    Person: ['Stepan', 'Taras', 'Karina', 'Andrey', 'Oksana', 'Family', 'Friends', 'Pets'],
    Place: ['Great Britain', 'Kiev', 'Glevaha', 'England', 'Abroad trip', 'Ukraine trip'],
    Action: ['Walk', 'Eating', 'Chilling', 'We are guests', 'We have guests'],
    Year: ['2006-2010', '2010-2014', '2014-2016', '2017-2019', '2020', '2021', '2022', '2023', '2024']
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setVideos((prevVideos) =>
        [...prevVideos, ...acceptedFiles.map(file => ({ file, name: '', hashtags: [] }))]
      );
    },
    accept: 'video/*' // Accept video files
  });

  const handleHashtagChange = (index, hashtag) => {
    setVideos((prevVideos) =>
      prevVideos.map((video, i) =>
        i === index
          ? {
              ...video,
              hashtags: video.hashtags.includes(hashtag)
                ? video.hashtags.filter((h) => h !== hashtag)
                : [...video.hashtags, hashtag]
            }
          : video
      )
    );
  };

  const toggleDropdown = (index) => {
    setOpenDropdownIndex((prevIndex) => (prevIndex === index ? null : index)); // Toggle dropdown for specific video
  };

  const removeVideo = (index) => {
    setVideos((prevVideos) => prevVideos.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const formData = new FormData();
    videos.forEach((video) => {
      formData.append('files', video.file);
      formData.append('hashtags', video.hashtags.join(',')); // Send hashtags as a comma-separated string
    });

    try {
      const response = await fetch('http://127.0.0.1:5000/upload_video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      enqueueSnackbar('Successfully uploaded!', {
        content: (key) => <CustomSnackbarContent message="Videos were uploaded!" />,
      });
      setVideos([]);
      handleClose();
    } catch (error) {
      enqueueSnackbar('Failed to upload', {
        content: (key) => <CustomSnackbarContent message="Failed to upload" />,
      });
    }
  };

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
        <div className="modal-overlay" onClick={handleClose} style={{ overflowY: 'auto', overflowX: 'auto' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Upload Videos</h2>
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
                <p>Drop the videos here ...</p>
              ) : (
                <p>Drag & drop videos here, or click to select videos</p>
              )}
            </div>
            <div style={{ marginTop: '20px' }}>
              {videos.map((video, index) => (
                <div key={index} style={{ display: 'inline-block', marginRight: '10px', position: 'relative' }}>
                  <button
                    onClick={() => removeVideo(index)}
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
                  {video.file && video.file instanceof File ? (
                    <video
                      src={URL.createObjectURL(video.file)}
                      alt={`Preview ${index}`}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                      }}
                      controls
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
                      {video.hashtags.length > 0 ? `${video.hashtags.join(', ')}` : 'Filter by hashtags'}
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
                                    checked={video.hashtags.includes(hashtag)}
                                    onChange={() => handleHashtagChange(index, hashtag)}
                                    style={{ marginRight: '10px' }}
                                  />
                                  <label htmlFor={`hashtag-${index}-${i}`} style={{ cursor: 'pointer' }}>
                                    {video.hashtags.includes(hashtag) ? '✔ ' : ''}{hashtag}
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
              Upload Videos
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};
const Videos = () => {
  const [showModal, setShowModal] = useState(false);
  const [videos, setVideos] = useState([]); // All photos fetched from the backend
  const [displayVideos, setDisplayVideos] = useState([]); // Photos to be displayed
  const [error, setError] = useState(null);
  const [hashtags, setHashtags] = useState(['Stepan', 'Taras', 'Shevchuki', 'Atos', 'Karina', 'Oksana', 'Andrey', 'Sea', 'Forest']);
  const [selectedHashtags, setSelectedHashtags] = useState([]); // Array to hold selected hashtags
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Toggle for dropdown
  const dropdownRef = useRef(null);

  const hashtagCategories = {
    Person: ['Stepan', 'Taras', 'Karina', 'Andrey', 'Oksana', 'Family', 'Friends', 'Pets'],
    Place: ['Great Britain', 'Kiev', 'Glevaha', 'England', 'Abroad trip', 'Ukraine trip'],
    Action: ['Walk', 'Eating', 'Chilling', 'we are guests', 'we have guests'],
    Year: ['2006-2010', '2010-2014','2014-2016', '2017-2019','2020', '2021','2022', '2023', '2024']
  };

  // Function to fetch all photos initially
  const fetchAllVideos = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load photos');
      }

      const data = await response.json();
      setDisplayVideos(data); // Display all photos initially
    } catch (err) {
      setError('Failed to load photos');
    }
  };

  // Function to fetch filtered photos based on selected hashtags
  const fetchFilteredVideos = async (hashtags) => {
    try {
      let url = 'http://127.0.0.1:5000/videos';
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
        throw new Error('Failed to load videos');
      }

      const data = await response.json();
      console.log(data)
      if (data.length === 0) {
        setDisplayVideos([])
      } else {
        setDisplayVideos(data)
      }

    } catch (err) {
      setError('Failed to load videos');
    }
  };

  useEffect(() => {
    fetchAllVideos(); // Fetch all photos when the component mounts
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
    fetchFilteredVideos(selectedHashtags);
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
          {displayVideos.length > 0 ? (
              displayVideos.map((video, index) => (
                  <div key={index} className="photo-card">
                    <iframe
                        src={`https://drive.google.com/file/d/${video.id}/preview`}
                        title="Google Drive Image"
                        className='photo-card-image'
                    ></iframe>
                    <div className="photo-card-content">
                      <h3>{video.name}</h3>
                    </div>
                    <a href={`https://drive.google.com/uc?export=download&id=${video.id}`} className="download-button" download>
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
            videos={videos}
            setVideos={setVideos}
        />
      </div>
  );
};
export default Videos;