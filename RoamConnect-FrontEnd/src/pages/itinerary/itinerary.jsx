import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

function Itinerary() {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://roamconnect.onrender.com/itinerary');
        if (!response.ok) {
          throw new Error('Failed to fetch itineraries');
        }
        const result = await response.json();
        if (result.status === 'success' && Array.isArray(result.data)) {
          setItineraries(result.data);
        } else {
          console.error('Invalid data format received:', result);
          setItineraries([]);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching itineraries:', err);
        setItineraries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`https://roamconnect.onrender.com/itinerary/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete itinerary');
      }

      setItineraries(prevItineraries => prevItineraries.filter(itinerary => itinerary.id !== id));
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      alert('Failed to delete itinerary. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 top-16 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 top-16 bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 top-16 bg-gray-50 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Itineraries</h1>
          <button
            onClick={() => navigate('/itinerary/create')}
            className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center hover:bg-blue-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Create New
          </button>
        </div>

        <div className="space-y-4">
          {itineraries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">No itineraries yet</p>
              <button
                onClick={() => navigate('/itinerary/create')}
                className="bg-blue-500 text-white px-4 py-2 rounded-full inline-flex items-center hover:bg-blue-600 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Create Your First Itinerary
              </button>
            </div>
          ) : (
            itineraries.map((itinerary) => (
              <div
                key={itinerary.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div onClick={() => navigate(`/itinerary/${itinerary.id}`)}>
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        {itinerary.source} to {itinerary.destination}
                      </h2>
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span>{new Date(itinerary.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{itinerary.days} days</span>
                          <span>•</span>
                          <span>₹{itinerary.budget.toLocaleString()}</span>
                        </div>
                        {itinerary.preferences && (
                          <div className="mt-1 text-blue-600">
                            Preferences: {itinerary.preferences}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleDelete(itinerary.id, e)}
                        disabled={deletingId === itinerary.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        {deletingId === itinerary.id ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <TrashIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Itinerary; 