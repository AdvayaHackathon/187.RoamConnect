import { useState, useEffect } from "react";
import { PhoneIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Starting point coordinates (BGSCET, Rajajinagar)
const CURRENT_LOCATION = {
  lat: 13.004661,
  lng: 77.54454
};

const defaultServices = [
  {
    id: 1,
    name: "Fortis Hospital Rajajinagar",
    type: "Hospital",
    address: "No. 202, 2nd Floor, Rashtreeya Vidyalaya Road, Rajajinagar, Bengaluru, Karnataka 560010",
    number: "108",
    location: {
      lat: 13.004543,
      lng: 77.540406
    }
  },
  {
    id: 2,
    name: "Rajajinagar Police Station",
    type: "Police Station",
    address: "1st Block, Rajajinagar, Bengaluru, Karnataka 560010",
    number: "100",
    location: {
      lat: 12.9921,
      lng: 77.5552
    }
  }
];

// Fallback emergency contacts if API fails
const fallbackEmergencyContacts = [
  {
    id: 'fb_1',
    name: 'Police',
    number: '100',
    description: 'For immediate police assistance'
  },
  {
    id: 'fb_2',
    name: 'Ambulance',
    number: '108',
    description: 'For medical emergencies'
  },
  {
    id: 'fb_3',
    name: 'Fire Department',
    number: '101',
    description: 'For fire emergencies'
  },
  {
    id: 'fb_4',
    name: 'Women Helpline',
    number: '1091',
    description: 'For women in distress'
  },
  {
    id: 'fb_5',
    name: 'Tourist Helpline',
    number: '1363',
    description: 'For tourist assistance'
  }
];

function Emergency() {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedService, setSelectedService] = useState(defaultServices[0]);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRoute, setShowRoute] = useState(false);
  const [userLocation, setUserLocation] = useState(CURRENT_LOCATION);
  const [emergencyContacts, setEmergencyContacts] = useState(fallbackEmergencyContacts);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [emergencyServices, setEmergencyServices] = useState(defaultServices);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps JavaScript API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setMapsLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (mapsLoaded) {
      findNearestPlaces();
    }
  }, [mapsLoaded]);

  const findNearestPlaces = () => {
    const services = [...defaultServices];
    const map = new google.maps.Map(document.createElement('div'));
    const service = new google.maps.places.PlacesService(map);
    
    services.forEach((serviceObj) => {
      const request = {
        location: new google.maps.LatLng(CURRENT_LOCATION.lat, CURRENT_LOCATION.lng),
        radius: 5000,
        type: serviceObj.query,
        rankBy: google.maps.places.RankBy.DISTANCE
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const nearest = results[0];
          const updatedService = {
            ...serviceObj,
            name: nearest.name,
            address: nearest.vicinity,
            placeId: nearest.place_id,
            destination: `${nearest.geometry.location.lat()},${nearest.geometry.location.lng()}`,
            mapsUrl: `https://www.google.com/maps/place/?q=place_id:${nearest.place_id}`
          };
          
          setEmergencyServices(prevServices => 
            prevServices.map(s => s.id === serviceObj.id ? updatedService : s)
          );
        } else {
          // Use fallback data
          const fallbackService = {
            ...serviceObj,
            name: `Nearest ${serviceObj.type}`,
            address: "Location not available",
            placeId: null,
            destination: null,
            mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(serviceObj.type)}`
          };
          
          setEmergencyServices(prevServices => 
            prevServices.map(s => s.id === serviceObj.id ? fallbackService : s)
          );
        }
      });
    });
  };

  useEffect(() => {
    setUserLocation(CURRENT_LOCATION);
    
    // Fetch emergency contacts
    const fetchEmergencyContacts = async () => {
      try {
        const response = await fetch('https://roamconnect.onrender.com/er-cont');
        if (!response.ok) {
          throw new Error('Failed to fetch emergency contacts');
        }
        const data = await response.json();
        if (data.status === 'success' && Array.isArray(data.data)) {
          // Combine API data with fallback data, ensuring unique IDs
          const apiContacts = data.data.map((contact, index) => ({
            id: `api_${contact.id || index}`,
            name: contact.name,
            number: contact.phno,
            description: contact.loc || 'Emergency contact'
          }));
          setEmergencyContacts([...fallbackEmergencyContacts, ...apiContacts]);
        }
      } catch (error) {
        console.error('Error fetching emergency contacts:', error);
        // Keep using fallback contacts if API fails
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchEmergencyContacts();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const matchingService = emergencyServices.find(service => 
      service.name.toLowerCase().includes(query.toLowerCase()) ||
      service.type.toLowerCase().includes(query.toLowerCase())
    );
    if (matchingService) {
      setSelectedService(matchingService);
      setExpandedId(matchingService.id);
    }
  };

  const handleNavigate = (service) => {
    setSelectedService(service);
    setExpandedId(service.id);
    setShowRoute(true);
  };

  const getMapUrl = () => {
    if (!userLocation) {
      return `https://www.google.com/maps/embed/v1/view?key=${MAPS_API_KEY}&center=${CURRENT_LOCATION.lat},${CURRENT_LOCATION.lng}&zoom=15`;
    }
    
    const service = emergencyServices.find(s => s.id === selectedService.id);
    
    if (showRoute && service.location) {
      return `https://www.google.com/maps/embed/v1/directions?key=${MAPS_API_KEY}&origin=${CURRENT_LOCATION.lat},${CURRENT_LOCATION.lng}&destination=${service.location.lat},${service.location.lng}&mode=driving`;
    }

    if (service.location) {
      return `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${service.location.lat},${service.location.lng}&zoom=15`;
    }

    return `https://www.google.com/maps/embed/v1/view?key=${MAPS_API_KEY}&center=${CURRENT_LOCATION.lat},${CURRENT_LOCATION.lng}&zoom=15`;
  };

  const getServiceMapsUrl = (service) => {
    if (!service.location) return "#";
    
    if (showRoute) {
      return `https://www.google.com/maps/dir/?api=1&origin=${CURRENT_LOCATION.lat},${CURRENT_LOCATION.lng}&destination=${service.location.lat},${service.location.lng}&travelmode=driving`;
    }
    
    return `https://www.google.com/maps/search/?api=1&query=${service.location.lat},${service.location.lng}`;
  };

  return (
    <div className="fixed inset-0 pt-16">
      {/* Background Map */}
      <div className="w-full h-full">
        <iframe
          title="Emergency Services Map"
          className="w-full h-full border-0"
          src={getMapUrl()}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* Emergency Services List */}
      <div className="fixed right-4 top-20 z-50 w-96">
        <div className="rounded-lg bg-white/95 backdrop-blur p-4 max-h-[calc(100vh-120px)] overflow-y-auto shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-left text-black">⚲ Emergency Services</h2>
          </div>

          {showSearch && (
            <input
              type="text"
              placeholder="Search emergency services..."
              className="w-full px-4 py-2 mb-4 rounded-lg text-black bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          )}

          {emergencyServices.map((service) => (
            <div
              key={service.id}
              className={`bg-white mt-2 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                selectedService.id === service.id ? 'ring-2 ring-red-500' : ''
              }`}
            >
              <p className="text-lg text-left text-gray-800 font-bold">{service.name}</p>
              <p className="text-md text-left text-gray-600 font-mono">{service.type}</p>
              <p className="overflow-auto max-h-20 text-left text-sm mt-2 text-gray-700">{service.address}</p>
              
              <div className="flex items-center justify-between mt-2">
                <a 
                  href={getServiceMapsUrl(service)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1 text-blue-600"
                >
                  <span>📍 Open in Google Maps</span>
                </a>
                <a
                  href={`tel:${service.number}`}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600"
                >
                  <PhoneIcon className="h-4 w-4" />
                  {service.number}
                </a>
              </div>

              <div className="text-center mt-3">
                <button
                  onClick={() => handleNavigate(service)}
                  className="px-4 py-2 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  {showRoute && selectedService.id === service.id ? "Show Route" : "Navigate"}
                </button>
              </div>
            </div>
          ))}

          {/* Emergency Contacts */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Emergency Contacts</h3>
            {loadingContacts ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-black font-medium">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.description}</p>
                    </div>
                    <a
                      href={`tel:${contact.number}`}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg flex items-center hover:bg-red-600"
                    >
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      {contact.number}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Emergency; 