import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

function ViewItinerary() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedDay, setSelectedDay] = useState(1);
  const [itineraryData, setItineraryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      console.log('Fetching itinerary with ID:', id);
      try {
        setLoading(true);
        const response = await fetch(`https://roamconnect.onrender.com/itinerary/${id}`);
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Failed to fetch itinerary');
        }
        
        const result = await response.json();
        console.log('API Response data:', result);
        
        if (result.status === 'success' && result.data) {
          setItineraryData(result.data);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Error details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItinerary();
    } else {
      console.error('No itinerary ID provided');
      setError('No itinerary ID provided');
      setLoading(false);
    }
  }, [id]);

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

  if (!itineraryData) {
    return (
      <div className="absolute inset-0 top-16 bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">No itinerary data found</div>
      </div>
    );
  }

  // Extract data from either root level or nested itinerary object
  const details = itineraryData.itinerary || {};
  const basicInfo = {
    source: itineraryData.source || 'N/A',
    destination: itineraryData.destination || 'N/A',
    days: itineraryData.days || 0,
    budget: typeof itineraryData.budget === 'number' ? itineraryData.budget : 0,
    preferences: itineraryData.preferences || 'None specified',
    created_at: itineraryData.created_at || new Date().toISOString()
  };

  // Helper function to safely format currency
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0';
    return amount.toLocaleString();
  };

  // Helper function to get any value from an object with fallback
  const getValue = (obj, key, fallback = '') => {
    if (!obj) return fallback;
    return obj[key] ?? fallback;
  };

  // Helper function to get activity details
  const getActivityDetails = (activity) => {
    if (!activity) return { details: '', time: 'Time not specified', cost: 0 };
    
    // Try different possible time field names
    const time = activity.time_slot || activity.time || activity.timing || activity.schedule || 'Time not specified';
    
    // Try different possible detail field names
    const details = activity.details || activity.description || activity.note || '';
    
    // Try different possible cost field names
    const cost = typeof activity.cost === 'number' ? activity.cost : 
                typeof activity.price === 'number' ? activity.price :
                typeof activity.amount === 'number' ? activity.amount : 0;
    
    return { details, time, cost };
  };

  // Helper function to get transportation details
  const getTransportationDetails = (transport) => {
    if (!transport) return 'Transportation details not available';
    
    if (typeof transport === 'string') return transport;
    
    // Handle different possible transportation object structures
    const type = transport.type || transport.mode || transport.method || 'Transport';
    const from = transport.from || transport.origin || transport.start || 'Origin';
    const to = transport.to || transport.destination || transport.end || 'Destination';
    const cost = transport.cost || transport.price || transport.amount || 0;
    const duration = transport.duration || transport.time || '';
    
    let details = `${type}`;
    if (from && to) details += ` from ${from} to ${to}`;
    if (duration) details += ` (${duration})`;
    if (cost) details += ` - ₹${formatCurrency(cost)}`;
    
    return details;
  };

  // Helper function to get restaurant details
  const getRestaurantDetails = (restaurant) => {
    if (!restaurant) return { name: 'Unknown Restaurant', details: '' };
    
    if (typeof restaurant === 'string') return { name: restaurant, details: '' };
    
    const name = restaurant.name || restaurant.title || restaurant.label || 'Unknown Restaurant';
    const cuisine = restaurant.cuisine || restaurant.type || '';
    const cost = restaurant.average_cost || restaurant.cost || restaurant.price || 0;
    
    let details = '';
    if (cuisine) details += cuisine;
    if (cost) details += ` (₹${formatCurrency(cost)})`;
    
    return { name, details };
  };

  // Helper function to render list items
  const renderListItems = (items, key) => {
    if (!Array.isArray(items)) return null;
    
    return items.map((item, index) => {
      if (typeof item === 'string') {
        return <li key={`${key}-${index}`}>{item}</li>;
      }
      
      // Handle object items
      const title = item.title || item.name || item.label || `Item ${index + 1}`;
      const description = item.description || item.details || item.note || '';
      
      return (
        <li key={`${key}-${index}`} className="space-y-1">
          <div className="font-medium">{title}</div>
          {description && <div className="text-sm text-gray-600">{description}</div>}
        </li>
      );
    });
  };

  // Helper function to render budget categories
  const renderBudgetCategories = (categories) => {
    if (!Array.isArray(categories)) return null;
    
    return categories.map((category, index) => {
      const name = category.category || category.name || category.label || 'Other';
      const amount = typeof category.amount === 'number' ? category.amount : 0;
      const percentage = typeof category.percentage === 'number' ? category.percentage : 0;
      
      return (
        <div key={index} className="flex items-center">
          <div className="w-1/3 text-gray-600 capitalize">{name}</div>
          <div className="w-1/3">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-500 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
          <div className="w-1/3 pl-4">
            <span className="text-gray-900 font-medium">₹{formatCurrency(amount)}</span>
            <span className="text-gray-500 text-sm ml-1">({percentage}%)</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="absolute inset-0 top-16 bg-gray-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/itinerary')}
            className="text-gray-600 hover:text-gray-900 p-2 -ml-2 rounded-full flex items-center"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 ml-2">
            {basicInfo.source} to {basicInfo.destination}
          </h1>
        </div>

        {/* Main Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Duration</h2>
              <p className="text-black mt-1 text-lg font-semibold">{basicInfo.days} days</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Budget</h2>
              <p className="text-black mt-1 text-lg font-semibold">₹{formatCurrency(basicInfo.budget)}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Preferences</h2>
              <p className="text-black mt-1 text-lg font-semibold">{basicInfo.preferences || 'None specified'}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        {details.summary && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Trip Summary</h2>
            <p className="text-gray-600">{details.summary}</p>
          </div>
        )}

        {/* Budget Breakdown */}
        {details.budget_breakdown?.categories?.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Breakdown</h2>
            <div className="space-y-3">
              {renderBudgetCategories(details.budget_breakdown.categories)}
              {details.budget_breakdown.total && (
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total Budget:</span>
                    <span className="font-semibold text-gray-900">₹{formatCurrency(details.budget_breakdown.total)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Daily Itinerary */}
        {Array.isArray(details.daily_itinerary) && details.daily_itinerary.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Itinerary</h2>
            <div className="space-y-4">
              {details.daily_itinerary.map((day, index) => (
                <div key={index} className="border rounded-lg">
                  <button
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
                    onClick={() => setSelectedDay(selectedDay === day.day ? null : day.day)}
                  >
                    <span className="text-white font-medium text-gray-900">Day {day.day || index + 1}</span>
                    <ChevronDownIcon
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        selectedDay === day.day ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {selectedDay === day.day && Array.isArray(day.activities) && (
                    <div className="px-4 py-3">
                      <div className="space-y-3">
                        {day.activities.map((activity, actIndex) => {
                          const { details, time, cost } = getActivityDetails(activity);
                          return (
                            <div key={actIndex} className="flex justify-between items-start">
                              <div>
                                <div className="text-gray-900">{activity.activity || 'Unnamed Activity'}</div>
                                <div className="text-sm text-gray-500">{time}</div>
                                {details && <div className="text-sm text-gray-600 mt-1">{details}</div>}
                              </div>
                              {cost > 0 && (
                                <div className="text-gray-600">₹{formatCurrency(cost)}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Restaurant Recommendations */}
        {Array.isArray(details.restaurant_recommendations) && details.restaurant_recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.restaurant_recommendations.map((restaurant, index) => {
                const { name, details } = getRestaurantDetails(restaurant);
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="font-medium text-gray-900">{name}</div>
                    {details && <div className="text-sm text-gray-600 mt-1">{details}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transportation Details */}
        {Array.isArray(details.transportation_details) && details.transportation_details.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transportation Options</h2>
            <div className="space-y-3">
              {details.transportation_details.map((transport, index) => (
                <div key={index} className="flex justify-between items-center border-b last:border-0 pb-3 last:pb-0">
                  <div className="font-medium text-gray-900">{getTransportationDetails(transport)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cultural Notes */}
          {Array.isArray(details.cultural_notes) && details.cultural_notes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cultural Notes</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {renderListItems(details.cultural_notes, 'cultural')}
              </ul>
            </div>
          )}

          {/* Local Tips */}
          {Array.isArray(details.local_tips) && details.local_tips.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Local Tips</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {renderListItems(details.local_tips, 'tips')}
              </ul>
            </div>
          )}
        </div>

        {/* Emergency Information */}
        {details.emergency_info && typeof details.emergency_info === 'object' && Object.keys(details.emergency_info).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(details.emergency_info).map(([key, value]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="text-sm text-gray-500 capitalize">{key}</div>
                  <div className="font-medium text-gray-900 mt-1">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewItinerary; 