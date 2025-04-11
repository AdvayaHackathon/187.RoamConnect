from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pymysql
from enum import Enum
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename
import openai
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize OpenAI client
openai.api_key = os.getenv('OPENAI_API_KEY')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

db_config = {
    "host":'bgs-bgsh.k.aivencloud.com',
    "port":24154,
    "user":'avnadmin',
    "password":'AVNS_ztTkfwsSwhkcf8H4sf7',
    "database":'defaultdb',
    "ssl":{'ssl': {}},
    "cursorclass": pymysql.cursors.DictCursor
}

class Badge(Enum):
    lvl0 = 'lvl0'
    lvl1 = 'lvl1'
    lvl2 = 'lvl2'
    lvl3 = 'lvl3'

def get_db_conn():
    return pymysql.connect(**db_config)


@app.route('/tourists', methods=['GET'])
def get_tourists():
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    id,
                    name,
                    email,
                    badge,
                    profile_image,
                    background_image,
                    bio
                FROM tourists
            ''')
            tourists = cursor.fetchall()
            result = {
                'status': 'success',
                'count': len(tourists),
                'data': tourists
            }
            return jsonify(result)
    finally:
        conn.close()

@app.route('/tourists', methods=['POST'])
def create_tourist():
    data = request.form
    if not all(k in data for k in ('name', 'email', 'pwd', 'badge')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        badge = Badge(data['badge'])
    except ValueError:
        return jsonify({'error': 'Invalid badge value'}), 400
    
    profile_image = None
    background_image = None
    bio = data.get('bio')
    
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        if file.filename != '' and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            profile_image = f"/uploads/{unique_filename}"
    
    if 'background_image' in request.files:
        file = request.files['background_image']
        if file.filename != '' and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            background_image = f"/uploads/{unique_filename}"
    
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                'INSERT INTO tourists (name, email, pwd, badge, profile_image, background_image, bio) VALUES (%s, %s, %s, %s, %s, %s, %s)',
                (data['name'], data['email'], data['pwd'], badge.value, profile_image, background_image, bio)
            )
            conn.commit()
            response = {'message': 'Tourist created successfully'}
            if profile_image:
                response['profile_image'] = profile_image
            if background_image:
                response['background_image'] = background_image
            if bio:
                response['bio'] = bio
            return jsonify(response), 201
    except pymysql.err.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400
    finally:
        conn.close()

@app.route('/tourists/<int:tourist_id>', methods=['PUT'])
def update_tourist(tourist_id):
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute('SELECT * FROM tourists WHERE id = %s', (tourist_id,))
            current_tourist = cursor.fetchone()
            if not current_tourist:
                return jsonify({'error': 'Tourist not found'}), 404
            
            update_fields = []
            values = []
            data = request.form
            
            # Handle text fields
            if 'name' in data:
                update_fields.append('name = %s')
                values.append(data['name'])
            if 'email' in data:
                update_fields.append('email = %s')
                values.append(data['email'])
            if 'pwd' in data:
                update_fields.append('pwd = %s')
                values.append(data['pwd'])
            if 'badge' in data:
                try:
                    badge = Badge(data['badge'])
                    update_fields.append('badge = %s')
                    values.append(badge.value)
                except ValueError:
                    return jsonify({'error': 'Invalid badge value'}), 400
            if 'bio' in data:
                update_fields.append('bio = %s')
                values.append(data['bio'])
            
            # Handle profile image
            if 'profile_image' in request.files:
                file = request.files['profile_image']
                if file.filename != '' and allowed_file(file.filename):
                    old_profile_image = current_tourist.get('profile_image')
                    if old_profile_image:
                        old_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 
                                                    old_profile_image.split('/')[-1])
                        if os.path.exists(old_image_path):
                            os.remove(old_image_path)
                    
                    filename = secure_filename(file.filename)
                    unique_filename = f"{uuid.uuid4()}_{filename}"
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                    file.save(file_path)
                    profile_image = f"/uploads/{unique_filename}"
                    update_fields.append('profile_image = %s')
                    values.append(profile_image)
            
            # Handle background image
            if 'background_image' in request.files:
                file = request.files['background_image']
                if file.filename != '' and allowed_file(file.filename):
                    old_background_image = current_tourist.get('background_image')
                    if old_background_image:
                        old_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 
                                                    old_background_image.split('/')[-1])
                        if os.path.exists(old_image_path):
                            os.remove(old_image_path)
                    
                    filename = secure_filename(file.filename)
                    unique_filename = f"{uuid.uuid4()}_{filename}"
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                    file.save(file_path)
                    background_image = f"/uploads/{unique_filename}"
                    update_fields.append('background_image = %s')
                    values.append(background_image)
            
            # If no fields to update, return error
            if not update_fields:
                return jsonify({'error': 'No valid fields to update'}), 400
            
            # Add tourist_id to values for WHERE clause
            values.append(tourist_id)
            
            # Build and execute update query
            query = f'UPDATE tourists SET {", ".join(update_fields)} WHERE id = %s'
            cursor.execute(query, values)
            
            conn.commit()
            
            # Build response
            response = {'message': 'Tourist updated successfully'}
            if 'profile_image' in update_fields:
                response['profile_image'] = values[update_fields.index('profile_image = %s')]
            if 'background_image' in update_fields:
                response['background_image'] = values[update_fields.index('background_image = %s')]
            if 'bio' in update_fields:
                response['bio'] = values[update_fields.index('bio = %s')]
            
            return jsonify(response)
    finally:
        conn.close()

@app.route('/tourists/<int:tourist_id>', methods=['DELETE'])
def delete_tourist(tourist_id):
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute('SELECT profile_image, background_image FROM tourists WHERE id = %s', (tourist_id,))
            tourist = cursor.fetchone()
            if not tourist:
                return jsonify({'error': 'Tourist not found'}), 404
            
            profile_image = tourist.get('profile_image')
            if profile_image:
                image_path = os.path.join(app.config['UPLOAD_FOLDER'], 
                                        profile_image.split('/')[-1])
                if os.path.exists(image_path):
                    os.remove(image_path)
            
            background_image = tourist.get('background_image')
            if background_image:
                image_path = os.path.join(app.config['UPLOAD_FOLDER'], 
                                        background_image.split('/')[-1])
                if os.path.exists(image_path):
                    os.remove(image_path)
            
            cursor.execute('DELETE FROM tourists WHERE id = %s', (tourist_id,))
            conn.commit()
            return jsonify({'message': 'Tourist deleted successfully'})
    finally:
        conn.close()

@app.route('/posts', methods=['GET'])
def get_posts():
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    p.id,
                    p.created_at,
                    p.created_by,
                    p.content,
                    p.loc_link,
                    p.image_url,
                    p.title,
                    t.name as creator_name 
                FROM posts p 
                JOIN tourists t ON p.created_by = t.id
            ''')
            posts = cursor.fetchall()
            result = {
                'status': 'success',
                'count': len(posts),
                'data': posts
            }
            return jsonify(result)
    finally:
        conn.close()

@app.route('/posts', methods=['POST'])
def create_post():
    data = request.form
    if not all(k in data for k in ('created_by', 'content', 'loc_link', 'title')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    image_url = None
    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '' and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            image_url = f"/uploads/{unique_filename}"
    
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                'INSERT INTO posts (created_by, content, loc_link, image_url, title) VALUES (%s, %s, %s, %s, %s)',
                (data['created_by'], data['content'], data['loc_link'], image_url, data['title'])
            )
            conn.commit()
            response = {'message': 'Post created successfully'}
            if image_url:
                response['image_url'] = image_url
            return jsonify(response), 201
    finally:
        conn.close()

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute('SELECT * FROM posts WHERE id = %s', (post_id,))
            current_post = cursor.fetchone()
            if not current_post:
                return jsonify({'error': 'Post not found'}), 404
            update_fields = []
            values = []
            data = request.form
            if 'content' in data:
                update_fields.append('content = %s')
                values.append(data['content'])
            if 'loc_link' in data:
                update_fields.append('loc_link = %s')
                values.append(data['loc_link'])
            if 'title' in data:
                update_fields.append('title = %s')
                values.append(data['title'])
            image_url = current_post.get('image_url')
            if 'image' in request.files:
                file = request.files['image']
                if file.filename != '' and allowed_file(file.filename):
                    if image_url:
                        old_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 
                                                    image_url.split('/')[-1])
                        if os.path.exists(old_image_path):
                            os.remove(old_image_path)
                    filename = secure_filename(file.filename)
                    unique_filename = f"{uuid.uuid4()}_{filename}"
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                    file.save(file_path)
                    image_url = f"/uploads/{unique_filename}"
                    update_fields.append('image_url = %s')
                    values.append(image_url)
            if not update_fields:
                return jsonify({'error': 'No valid fields to update'}), 400
            
            values.append(post_id)
            query = f'UPDATE posts SET {", ".join(update_fields)} WHERE id = %s'
            cursor.execute(query, values)
            
            conn.commit()
            response = {'message': 'Post updated successfully'}
            if image_url != current_post.get('image_url'):
                response['image_url'] = image_url
            return jsonify(response)
    finally:
        conn.close()

@app.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute('SELECT image_url FROM posts WHERE id = %s', (post_id,))
            post = cursor.fetchone()
            if not post:
                return jsonify({'error': 'Post not found'}), 404
            image_url = post.get('image_url') 
            if image_url:
                image_path = os.path.join(app.config['UPLOAD_FOLDER'], 
                                        image_url.split('/')[-1])
                if os.path.exists(image_path):
                    os.remove(image_path)
            cursor.execute('DELETE FROM posts WHERE id = %s', (post_id,))
            conn.commit()
            return jsonify({'message': 'Post deleted successfully'})
    finally:
        conn.close()

@app.route('/itinerary', methods=['POST'])
def create_ai_itinerary():
    data = request.get_json()
    if not all(k in data for k in ('budget', 'source', 'destination', 'days', 'preferences')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        budget = float(data['budget'])
        source = data['source']
        destination = data['destination']
        days = int(data['days'])
        preferences = data['preferences']
        
        print(f"Received request: {days} days from {source} to {destination} with budget {budget}")
        
        prompt = f"""Create a detailed {days}-day travel itinerary from {source} to {destination} with a budget of ₹{budget}.
        Preferences: {', '.join(preferences)}.
        
        IMPORTANT REQUIREMENTS:
        1. You MUST create activities for ALL {days} days of the trip
        2. Each day must have at least 3-4 activities
        3. Activities should be spread throughout the day (morning, afternoon, evening)
        4. Include realistic time slots and durations
        5. Ensure the total cost stays within the budget of ₹{budget}
        
        Include in your response:
        1. Daily schedule with time slots for ALL days
        2. Cost estimates for each activity
        3. Transportation details
        4. Restaurant recommendations
        5. Must-see attractions
        6. Budget breakdown
        7. Local tips and cultural notes
        8. Emergency contacts and important numbers
        
        Your response MUST be a valid JSON object with the following structure:
        {{
            "summary": "Brief overview of the trip",
            "budget_breakdown": {{
                "total": {budget},
                "categories": [
                    {{"category": "transportation", "amount": 0, "percentage": 0}},
                    {{"category": "accommodation", "amount": 0, "percentage": 0}},
                    {{"category": "activities", "amount": 0, "percentage": 0}},
                    {{"category": "food", "amount": 0, "percentage": 0}},
                    {{"category": "miscellaneous", "amount": 0, "percentage": 0}}
                ]
            }},
            "daily_itinerary": [
                {{"day": 1, "activities": []}},
                {{"day": 2, "activities": []}},
                {{"day": 3, "activities": []}}
            ],
            "restaurant_recommendations": [],
            "transportation_details": [],
            "emergency_info": {{
                "police": "number",
                "ambulance": "number",
                "fire": "number",
                "embassy": "address and number",
                "hospital": "address and number"
            }},
            "local_tips": [],
            "cultural_notes": []
        }}
        
        IMPORTANT: 
        1. You MUST include activities for ALL {days} days in the daily_itinerary array
        2. Each day must have at least 3-4 activities
        3. Do not include any text before or after the JSON object
        4. The response must be valid JSON that can be parsed directly"""
        
        print("Sending prompt to OpenAI...")
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a professional travel planner with expertise in creating detailed itineraries. You must respond with valid JSON only, with no additional text. You must include activities for all days of the trip."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=3000
        )
        
        response_content = response.choices[0].message.content.strip()
        
        try:
            if response_content.startswith("```json"):
                response_content = response_content[7:]
            if response_content.endswith("```"):
                response_content = response_content[:-3]
            response_content = response_content.strip()
            
            
            itinerary = json.loads(response_content)
            
            if len(itinerary['daily_itinerary']) != days:
                print(f"Error: Expected {days} days but got {len(itinerary['daily_itinerary'])} days")
                return jsonify({
                    'error': f'Incomplete itinerary: Expected {days} days but got {len(itinerary["daily_itinerary"])} days',
                    'raw_response': response_content
                }), 500
            
            # Store the itinerary in the database
            conn = get_db_conn()
            try:
                with conn.cursor() as cursor:
                    cursor.execute(
                        'INSERT INTO itineraries (budget, source, destination, days, preferences, itinerary_data) VALUES (%s, %s, %s, %s, %s, %s)',
                        (budget, source, destination, days, json.dumps(preferences), json.dumps(itinerary))
                    )
                    itinerary_id = cursor.lastrowid
                    conn.commit()
            finally:
                conn.close()
            
            return jsonify({
                'status': 'success',
                'id': itinerary_id,
                'data': itinerary
            })
                
        except json.JSONDecodeError as e:
            print("JSON Parse Error:", str(e))
            print("Raw AI Response:", response_content)
            return jsonify({
                'error': 'Failed to parse AI response as JSON',
                'details': str(e),
                'raw_response': response_content
            }), 500
        
    except ValueError as e:
        print("ValueError:", str(e))
        return jsonify({'error': f'Invalid input: {str(e)}'}), 400
    except Exception as e:
        print("Unexpected Error:", str(e))
        print("Error type:", type(e).__name__)
        import traceback
        print("Traceback:", traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/itinerary/<int:itinerary_id>', methods=['GET'])
def get_itinerary(itinerary_id):
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute('SELECT * FROM itineraries WHERE id = %s', (itinerary_id,))
            itinerary = cursor.fetchone()
            if not itinerary:
                return jsonify({'error': 'Itinerary not found'}), 404
            
            return jsonify({
                'status': 'success',
                'data': {
                    'id': itinerary['id'],
                    'budget': float(itinerary['budget']),
                    'source': itinerary['source'],
                    'destination': itinerary['destination'],
                    'days': itinerary['days'],
                    'preferences': json.loads(itinerary['preferences']),
                    'itinerary': json.loads(itinerary['itinerary_data']),
                    'created_at': itinerary['created_at'].isoformat() if itinerary['created_at'] else None
                }
            })
    finally:
        conn.close()

@app.route('/itinerary', methods=['GET'])
def get_all_itineraries():
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute('SELECT * FROM itineraries ORDER BY created_at DESC')
            itineraries = cursor.fetchall()
            
            result = []
            for itinerary in itineraries:
                result.append({
                    'id': itinerary['id'],
                    'budget': float(itinerary['budget']),
                    'source': itinerary['source'],
                    'destination': itinerary['destination'],
                    'days': itinerary['days'],
                    'preferences': json.loads(itinerary['preferences']),
                    'created_at': itinerary['created_at'].isoformat() if itinerary['created_at'] else None
                })
            
            return jsonify({
                'status': 'success',
                'count': len(result),
                'data': result
            })
    finally:
        conn.close()

@app.route('/er-cont', methods=['GET'])
def get_emergency_contacts():
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    e.id,
                    e.name,
                    e.phno,
                    e.loc,
                    e.latitude,
                    e.longitude,
                    e.link,
                    t.name as creator
                FROM er e
                JOIN tourists t ON e.created_by = t.id
            ''')
            contacts = cursor.fetchall()
            result = {
                'status': 'success',
                'count': len(contacts),
                'data': contacts
            }
            return jsonify(result)
    finally:
        conn.close()

@app.route('/er-cont', methods=['POST'])
def create_emergency_contact():
    data = request.get_json()
    if not all(k in data for k in ('name', 'phno', 'loc', 'created_by')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                'INSERT INTO er (name, phno, loc, created_by, latitude, longitude, link) VALUES (%s, %s, %s, %s, %s, %s, %s)',
                (
                    data['name'], 
                    data['phno'], 
                    data['loc'], 
                    data['created_by'],
                    data.get('latitude'),
                    data.get('longitude'),
                    data.get('link')
                )
            )
            conn.commit()
            return jsonify({'message': 'Emergency contact created successfully'}), 201
    except pymysql.err.IntegrityError:
        return jsonify({'error': 'Invalid created_by ID'}), 400
    finally:
        conn.close()

@app.route('/er-cont/<int:contact_id>', methods=['PUT'])
def update_emergency_contact(contact_id):
    data = request.get_json()
    if not any(k in data for k in ('name', 'phno', 'loc', 'latitude', 'longitude', 'link')):
        return jsonify({'error': 'No fields to update'}), 400
    
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            update_fields = []
            values = []
            
            if 'name' in data:
                update_fields.append('name = %s')
                values.append(data['name'])
            if 'phno' in data:
                update_fields.append('phno = %s')
                values.append(data['phno'])
            if 'loc' in data:
                update_fields.append('loc = %s')
                values.append(data['loc'])
            if 'latitude' in data:
                update_fields.append('latitude = %s')
                values.append(data['latitude'])
            if 'longitude' in data:
                update_fields.append('longitude = %s')
                values.append(data['longitude'])
            if 'link' in data:
                update_fields.append('link = %s')
                values.append(data['link'])
            
            values.append(contact_id)
            query = f'UPDATE er SET {", ".join(update_fields)} WHERE id = %s'
            cursor.execute(query, values)
            
            if cursor.rowcount == 0:
                return jsonify({'error': 'Emergency contact not found'}), 404
            
            conn.commit()
            return jsonify({'message': 'Emergency contact updated successfully'})
    finally:
        conn.close()

@app.route('/er-cont/<int:contact_id>', methods=['DELETE'])
def delete_emergency_contact(contact_id):
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute('DELETE FROM er WHERE id = %s', (contact_id,))
            if cursor.rowcount == 0:
                return jsonify({'error': 'Emergency contact not found'}), 404
            conn.commit()
            return jsonify({'message': 'Emergency contact deleted successfully'})
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))