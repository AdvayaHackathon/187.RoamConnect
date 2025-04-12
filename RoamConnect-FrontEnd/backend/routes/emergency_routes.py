from flask import Blueprint, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

emergency_bp = Blueprint('emergency', __name__)
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

@emergency_bp.route('/api/nearby-places', methods=['GET'])
def get_nearby_places():
    try:
        # Get parameters from request
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        place_type = request.args.get('type')

        if not all([lat, lng, place_type]):
            return jsonify({
                'status': 'error',
                'message': 'Missing required parameters'
            }), 400

        # Call Google Places API
        url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
        params = {
            'location': f'{lat},{lng}',
            'radius': '5000',  # 5km radius
            'type': place_type,
            'rankby': 'distance',
            'key': GOOGLE_MAPS_API_KEY
        }

        response = requests.get(url, params=params)
        data = response.json()

        if data.get('status') == 'OK' and data.get('results'):
            # Get the nearest place
            nearest = data['results'][0]
            return jsonify({
                'status': 'success',
                'data': {
                    'name': nearest['name'],
                    'address': nearest['vicinity'],
                    'location': nearest['geometry']['location'],
                    'place_id': nearest.get('place_id')
                }
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'No places found nearby'
            }), 404

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 