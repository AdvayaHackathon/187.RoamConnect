import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { CameraIcon } from '@heroicons/react/24/outline';
import { updateTourist } from '../../services/api';

function EditProfile() {
  const navigate = useNavigate();
  const { userData, setUserData } = useUser();
  const [formData, setFormData] = useState({
    name: userData.name || '',
    email: userData.email || '',
    badge: userData.badge || '',
    profile_image: null,
    background_image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('badge', formData.badge);
      if (formData.profile_image) {
        formDataToSend.append('profile_image', formData.profile_image);
      }
      if (formData.background_image) {
        formDataToSend.append('background_image', formData.background_image);
      }

      const response = await updateTourist(formDataToSend);
      
      if (response.status === 'success') {
        setUserData(prev => ({
          ...prev,
          name: formData.name,
          email: formData.email,
          badge: formData.badge,
          profilePicture: formData.profile_image ? URL.createObjectURL(formData.profile_image) : prev.profilePicture,
          coverPhoto: formData.background_image ? URL.createObjectURL(formData.background_image) : prev.coverPhoto
        }));
        navigate('/profile');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 top-16 bg-gray-50 flex items-center justify-center">
      <div className="w-[800px] bg-white rounded-lg shadow-lg p-8 m-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Photo</label>
            <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
              {userData.coverPhoto && !formData.background_image && (
                <img
                  src={userData.coverPhoto}
                  alt="Cover"
                  className="text-black w-full h-full object-cover"
                />
              )}
              {formData.background_image && (
                <img
                  src={URL.createObjectURL(formData.background_image)}
                  alt="New Cover"
                  className="w-full h-full object-cover"
                />
              )}
              <label className="text-black absolute bottom-4 right-4 bg-white bg-opacity-75 px-4 py-2 rounded-lg cursor-pointer hover:bg-opacity-100">
                <CameraIcon className="text-black h-5 w-5 inline-block mr-2" />
                Change Cover
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'background_image')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">Profile Picture</label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                  {userData.profilePicture && !formData.profile_image ? (
                    <img
                      src={userData.profilePicture}
                      alt="Profile"
                      className="text-black w-full h-full object-cover"
                    />
                  ) : formData.profile_image ? (
                    <img
                      src={URL.createObjectURL(formData.profile_image)}
                      alt="New Profile"
                      className="text-black w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500">No photo</span>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow cursor-pointer">
                  <CameraIcon className="text-black h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'profile_image')}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-sm text-gray-500">
                Click the camera icon to change your profile picture
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="text-gray-700 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="text-gray-700 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="text-white px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile; 