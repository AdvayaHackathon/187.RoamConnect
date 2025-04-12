import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HomeIcon, MapIcon, CalendarIcon, PhoneIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import MapView from './pages/map-view/map-view';
import Profile from './pages/profile/profile';
import EditProfile from './pages/profile/edit-profile';
import CreatePost from './pages/post/create-post';
import PostDetail from './pages/post/post-detail';
import PostList from './pages/post/post-list';
import Itinerary from './pages/itinerary/itinerary';
import Emergency from './pages/emergency/emergency';
import CreateItinerary from './pages/itinerary/create-itinerary';
import ViewItinerary from './pages/itinerary/view-itinerary';
import { UserProvider, useUser } from './contexts/UserContext';
import { PostProvider } from './contexts/PostContext';
import RoamConnectLogo from './assets/roamconnect-logo.jpg';
import 'leaflet/dist/leaflet.css';

function Navbar() {
  const { userData } = useUser();

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="w-full px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src={RoamConnectLogo} alt="RoamConnect" className="h-8 w-8 rounded-full" />
              <span className="text-xl font-bold text-gray-800">RoamConnect</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center px-3 py-2 rounded-md text-gray-700 bg-white ">
              <HomeIcon className="h-5 w-5 mr-2" />
              Home
            </Link>
            <Link to="/map" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
              <MapIcon className="h-5 w-5 mr-2" />
              Map
            </Link>
            <Link to="/itinerary" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Itinerary
            </Link>
            <Link to="/posts" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
              <BookOpenIcon className="h-5 w-5 mr-2" />
              Posts
            </Link>
            <Link to="/emergency" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
              <PhoneIcon className="h-5 w-5 mr-2" />
              Emergency
            </Link>
            <Link to="/profile" className="flex items-center">
              <img
                className="h-8 w-8 rounded-full"
                src={userData.profilePicture || 'https://via.placeholder.com/32'}
                alt={userData.name || 'Profile'}
              />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Home() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setError(error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  }, []);

  return (
    <div className="fixed inset-0 top-16 bg-white">
      <div className="flex h-full">
        {/* Left Side - Menu Items */}
        <div className="w-[400px] bg-gray-100 overflow-y-auto">
          <div className="p-8">
            {/* Welcome Section */}
            <div className="text-left mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to RoamConnect</h1>
              <p className="text-xl text-gray-600">Your travel companion for exploring the world</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6">
              <Link to="/map" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <MapIcon className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-semibold text-gray-900">Explore Map</h3>
                <p className="text-sm text-gray-600">Find nearby attractions and services</p>
              </Link>
              <Link to="/itinerary" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <CalendarIcon className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-semibold text-gray-900">Plan Itinerary</h3>
                <p className="text-sm text-gray-600">Organize your travel schedule</p>
              </Link>
              <Link to="/posts" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <BookOpenIcon className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-semibold text-gray-900">Travel Posts</h3>
                <p className="text-sm text-gray-600">Share and read travel experiences</p>
              </Link>
              <Link to="/emergency" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <PhoneIcon className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-semibold text-gray-900">Emergency</h3>
                <p className="text-sm text-gray-600">Quick access to emergency services</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="flex-1">
          <div className="h-full">
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Your Current Location</h2>
              <Link to="/map" className="text-blue-500 hover:text-blue-600 font-medium">
                View Full Map →
              </Link>
            </div>
            {error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : location ? (
              <div className="h-[calc(100%-4rem)]">
                <iframe
                  title="Location Preview"
                  className="w-full h-full border-0"
                  src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${location.lat},${location.lng}&zoom=18`}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            ) : (
              <div className="p-4 text-gray-600">Loading your location...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <PostProvider>
        <Router>
          <div className="min-h-screen w-full">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/post/:postId" element={<PostDetail />} />
              <Route path="/posts" element={<PostList />} />
              <Route path="/itinerary" element={<Itinerary />} />
              <Route path="/itinerary/create" element={<CreateItinerary />} />
              <Route path="/itinerary/:id" element={<ViewItinerary />} />
              <Route path="/emergency" element={<Emergency />} />
            </Routes>
          </div>
        </Router>
      </PostProvider>
    </UserProvider>
  );
}

export default App;
