import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ViewNewItinerary from './view-new-itinerary';

function CreateItinerary() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    days: '',
    budget: '',
    preferences: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdItinerary, setCreatedItinerary] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://roamconnect.onrender.com/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create itinerary');
      }

      const data = await response.json();
      setCreatedItinerary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (createdItinerary) {
    return <ViewNewItinerary data={createdItinerary} />;
  }

  return (
    <div className="absolute inset-0 top-16 bg-gray-50 overflow-y-auto absolute min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Create New Itinerary</div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                  Source
                </label>
                <input
                  type="text"
                  name="source"
                  id="source"
                  required
                  value={formData.source}
                  onChange={handleChange}
                  className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                  Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  id="destination"
                  required
                  value={formData.destination}
                  onChange={handleChange}
                  className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="days" className="block text-sm font-medium text-gray-700">
                  Number of Days
                </label>
                <input
                  type="number"
                  name="days"
                  id="days"
                  required
                  min="1"
                  value={formData.days}
                  onChange={handleChange}
                  className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                  Budget (₹)
                </label>
                <input
                  type="number"
                  name="budget"
                  id="budget"
                  required
                  min="0"
                  value={formData.budget}
                  onChange={handleChange}
                  className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="preferences" className="block text-sm font-medium text-gray-700">
                  Preferences
                </label>
                <textarea
                  name="preferences"
                  id="preferences"
                  rows="3"
                  value={formData.preferences}
                  onChange={handleChange}
                  className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter your preferences (e.g., vegetarian food, adventure activities, etc.)"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Itinerary'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateItinerary; 