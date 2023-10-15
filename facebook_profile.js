/* components/Profile.css */
.profile-container {
    position: relative;
  }
  
  .cover-photo {
    height: 300px; /* Set your desired height for the cover photo */
    background-color: #ccc; /* Default background color */
    background-size: cover;
    background-position: center;
    position: relative;
  }
  
  .cover-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .profile-picture {
    position: absolute;
    bottom: -60px; /* Adjust this value to control the space between cover and profile picture */
    left: 50%;
    transform: translateX(-50%);
    border: 3px solid #fff; /* Add a border to the profile picture if desired */
    border-radius: 50%; /* Make it circular */
    overflow: hidden;
    width: 120px; /* Set the desired profile picture size */
    height: 120px;
    background-color: #fff; /* Add a background color for the profile picture */
  }
  
  .profile-picture img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #ddd; /* Placeholder background color */
    color: #333; /* Placeholder text color */
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
  }

  

  "use client"

import React, { useState } from 'react';

const Profile = () => {
    const [coverPhoto, setCoverPhoto] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    setCoverPhoto(URL.createObjectURL(file));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(URL.createObjectURL(file));
  };

  return (
    <div className="profile-container">
      <div className="cover-photo">
        {coverPhoto ? (
          <img src={coverPhoto} alt="Cover" />
        ) : (
          <div className="placeholder">Add Cover Photo</div>
        )}
        <input type="file" accept="image/*" onChange={handleCoverPhotoChange} />
      </div>
      <div className="profile-picture">
        {profilePicture ? (
          <img src={profilePicture} alt="Profile" />
        ) : (
          <div className="placeholder">Add Profile Picture</div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleProfilePictureChange}
        />
      </div>
    </div>
  );
};

export default Profile;









// components/Profile.js
import React, { useState } from 'react';

const Profile = () => {
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    setCoverPhoto(URL.createObjectURL(file));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(URL.createObjectURL(file));
  };

  return (
    <div className="relative">
      <div className="h-64 bg-gray-300">
        {coverPhoto ? (
          <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-400">
            Add Cover Photo
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleCoverPhotoChange} />
      </div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -mb-12">
        <div className="w-32 h-32 bg-white rounded-full border-4 border-white overflow-hidden">
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-400">
              Add Profile Picture
            </div>
          )}
        </div>
        <input type="file" accept="image/*" onChange={handleProfilePictureChange} />
      </div>
    </div>
  );
};

export default Profile;
