import { createContext, useState, useContext, useEffect } from 'react';
import { getTourists } from '../services/api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    profilePicture: null,
    coverPhoto: null,
    badge: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getTourists();
        if (response.status === 'success' && response.data.length > 0) {
          const user = response.data[0];
          setUserData({
            name: user.name,
            email: user.email,
            phone: '', // Not provided by API
            location: '', // Not provided by API
            bio: user.bio, 
            profilePicture: "https://roamconnect.onrender.com" + user.profile_image,
            coverPhoto: "https://roamconnect.onrender.com" + user.background_image,
            badge: user.badge
          });
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 