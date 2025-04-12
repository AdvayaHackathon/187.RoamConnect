
import { useState } from "react";
import "./map-view.css";

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const locations = [
  {
    id: 1,
    name: "BGS College",
    type: "Hackathon Event",
    address:
      "CA Site No. 6 & 7, 3rd Main, Pipeline Road, Chord Rd, adj. to Mahalakshmi Metro Station, 2nd Phase, Stage 2, Mahalakshmipuram, Bengaluru, Karnataka 560086",
    mapsUrl: "https://maps.app.goo.gl/y57jDsKotR9uXmgUA",
    extra: "BGS College is hosting a 24-hour hackathon. Teams from across the country are competing.",
    query: "BGSCET+Bangalore+Mahalakshmipuram"
  },
  {
    id: 2,
    name: "Hotel Adithya",
    type: "Restaurant",
    address:
      "159 6th main, Mahalaxmipura, 1433, Pipeline Rd, opp. sri chaitanya techno school (old nandini theatre), West of Chord Road 2nd Stage, Nagapura, Bengaluru, Karnataka 560086",
    mapsUrl: "https://maps.app.goo.gl/WKrnFmtw6PvMnXnC7",
    extra: "Famous for North Indian cuisine. Very affordable for students and late night snacks!",
    query: "Hotel+Adithya+Mahalakshmipuram+Bangalore"
  },
  {
    id: 3,
    name: "Ibaco - Mahalakshmipuram",
    type: "Ice Cream Shop",
    address:
      "West of Chord Road, 13th Cross, No.322, 6th Main Rd, Opp. Nandini Theatre, Mahalakshmipuram, Bengaluru, Karnataka 560086",
    mapsUrl: "https://maps.app.goo.gl/VqYHviTZJXLqfSWbA",
    extra: "Perfect spot to chill after college or a long day. Try their Belgian choco scoop!",
    query: "Ibaco+Mahalakshmipuram+Bangalore"
  },
];

function MapView() {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [expandedId, setExpandedId] = useState(null);

  const handleNavigate = (location) => {
    setSelectedLocation(location);
    setExpandedId(location.id);
  };

  return (
    <div className="fixed inset-0 pt-16">
      {/* Background Map */}
      <div className="w-full h-full">
        <iframe
          title="Dynamic Map"
          className="w-full h-full border-0"
          src={`https://www.google.com/maps/embed/v1/search?key=${MAPS_API_KEY}&q=${selectedLocation.query}&zoom=20`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* Locations List */}
      <div className="fixed right-4 top-20 z-50 w-96">
        <div className="rounded-lg bg-white/95 backdrop-blur p-4 max-h-[calc(100vh-120px)] overflow-y-auto shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-left text-black">⚲ Nearby attractions</h2>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
            >
              🔍
            </button>
          </div>

          {showSearch && (
            <input
              type="text"
              placeholder="Search locations..."
              className="w-full px-4 py-2 mb-4 rounded-lg text-black bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {locations.map((location) => (
            <div
              key={location.id}
              className="bg-white mt-2 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <p className="text-lg text-left text-gray-800 font-bold">{location.name}</p>
              <p className="text-md text-left text-gray-600 font-mono">{location.type}</p>
              <p className="overflow-auto max-h-20 text-left text-sm mt-2 text-gray-700">{location.address}</p>
              <p className="text-sm text-blue-500 mt-1">
                <a 
                  href={location.mapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1 text-blue-600"
                >
                  <span>📍 Open in Google Maps</span>
                </a>
              </p>

              {expandedId === location.id && (
                <p className="text-left text-sm mt-2 text-gray-600">{location.extra}</p>
              )}

              <div className="text-center mt-3">
                <button
                  onClick={() => handleNavigate(location)}
                  className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  Navigate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MapView;
