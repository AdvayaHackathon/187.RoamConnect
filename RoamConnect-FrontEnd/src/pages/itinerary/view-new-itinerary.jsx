import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChevronDownIcon, TrashIcon } from '@heroicons/react/24/outline';

function ViewNewItinerary({ data }) {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract data from the new response format
  const itineraryData = data?.data || data;
  const itineraryId = data?.id;

  // Helper function to safely format currency
  const formatCurrency = (amount) => {
    if (!amount) return '0';
    if (typeof amount === 'string') {
      amount = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
    }
    if (typeof amount !== 'number' || isNaN(amount)) return '0';
    return amount.toLocaleString('en-IN');
  };

  // Helper function to safely get nested values
  const getValue = (obj, path, defaultValue = '') => {
    if (!obj) return defaultValue;
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return value !== undefined ? value : defaultValue;
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
    if (!Array.isArray(categories)) {
      // If categories is not an array, try to create categories from the budget breakdown object
      if (typeof categories === 'object') {
        const total = Object.values(categories).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
        return Object.entries(categories).map(([name, amount], index) => {
          if (typeof amount !== 'number') return null;
          const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900">₹{formatCurrency(amount)}</span>
                  <span className="text-gray-500 text-sm">({percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        }).filter(Boolean);
      }
      return null;
    }
    
    return categories.map((category, index) => {
      const name = category.category || category.name || category.label || 'Other';
      const amount = typeof category.amount === 'number' ? category.amount : 0;
      const percentage = typeof category.percentage === 'number' ? category.percentage : 0;
      
      return (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{name}</span>
            <div className="flex items-center space-x-2">
              <span className="text-gray-900">₹{formatCurrency(amount)}</span>
              <span className="text-gray-500 text-sm">({percentage}%)</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    });
  };

  const handleDelete = async () => {
    if (!itineraryId) return;
    
    if (!window.confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`https://roamconnect.onrender.com/itinerary/${itineraryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete itinerary');
      }

      navigate('/itinerary');
    } catch (error) {
      alert('Failed to delete itinerary. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!itineraryData) {
    return (
      <div className="absolute inset-0 top-16 bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">No itinerary data available</div>
      </div>
    );
  }

  // Extract basic info from the response
  const basicInfo = {
    source: getValue(itineraryData, 'source', 'N/A'),
    destination: getValue(itineraryData, 'destination', 'N/A'),
    days: getValue(itineraryData, 'days', 0),
    budget: getValue(itineraryData, 'budget', 0),
    preferences: getValue(itineraryData, 'preferences', 'None specified'),
    summary: getValue(itineraryData, 'summary', '')
  };

  return (
    <div className="absolute inset-0 top-16 bg-gray-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/itinerary')}
              className="text-gray-600 hover:text-gray-900 p-2 -ml-2 rounded-full flex items-center"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Back
            </button>
          </div>
          {itineraryId && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <TrashIcon className="h-5 w-5 mr-1" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>

        {/* Trip Summary */}
        {basicInfo.summary && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Trip Summary</h2>
            <p className="text-gray-600">{basicInfo.summary}</p>
          </div>
        )}

        {/* Budget Breakdown */}
        {itineraryData.itinerary?.budget_breakdown?.categories && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Breakdown</h2>
            <div className="space-y-4">
              {itineraryData.itinerary.budget_breakdown.categories.map((category, index) => {
                if (!category.amount && category.amount !== 0) return null;
                
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-1/4">
                      <span className="text-gray-700">
                        {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                      </span>
                    </div>
                    <div className="w-1/2 flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-1/4 flex items-center">
                      <span className="text-gray-900">₹{formatCurrency(category.amount)}</span>
                      <span className="text-gray-500 text-sm ml-2">({category.percentage}%)</span>
                    </div>
                  </div>
                );
              })}

              {/* Total Budget */}
              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">Total Budget:</span>
                  <span className="text-gray-900 font-medium">
                    ₹{formatCurrency(itineraryData.itinerary.budget_breakdown.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Daily Itinerary */}
        {Array.isArray(itineraryData.daily_itinerary) && itineraryData.daily_itinerary.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Itinerary</h2>
            <div className="space-y-4">
              {itineraryData.daily_itinerary.map((day, index) => (
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
        {Array.isArray(itineraryData.restaurant_recommendations) && itineraryData.restaurant_recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {itineraryData.restaurant_recommendations.map((restaurant, index) => {
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
        {Array.isArray(itineraryData.transportation_details) && itineraryData.transportation_details.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transportation Options</h2>
            <div className="space-y-3">
              {itineraryData.transportation_details.map((transport, index) => (
                <div key={index} className="flex justify-between items-center border-b last:border-0 pb-3 last:pb-0">
                  <div className="font-medium text-gray-900">{getTransportationDetails(transport)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cultural Notes */}
          {Array.isArray(itineraryData.cultural_notes) && itineraryData.cultural_notes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cultural Notes</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {renderListItems(itineraryData.cultural_notes, 'cultural')}
              </ul>
            </div>
          )}

          {/* Local Tips */}
          {Array.isArray(itineraryData.local_tips) && itineraryData.local_tips.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Local Tips</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {renderListItems(itineraryData.local_tips, 'tips')}
              </ul>
            </div>
          )}
        </div>

        {/* Emergency Information */}
        {itineraryData.emergency_info && typeof itineraryData.emergency_info === 'object' && Object.keys(itineraryData.emergency_info).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(itineraryData.emergency_info).map(([key, value]) => (
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

export default ViewNewItinerary; 