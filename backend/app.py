from dotenv import load_dotenv
import os

load_dotenv()

SPOTIPY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIPY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

from flask import Flask, request, jsonify, session, redirect
from flask_cors import CORS
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from spotipy.cache_handler import CacheHandler
from openai import OpenAI
import os
from PIL import Image
import base64
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import traceback
from datetime import datetime, timedelta
import logging

load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO').upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.update(
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_NAME='soundcheck_session',
    PERMANENT_SESSION_LIFETIME=timedelta(days=7)
)
app.secret_key = os.getenv('SECRET_KEY')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# CORS configuration for Vite frontend
CORS(app, supports_credentials=True, origins=[os.getenv('FRONTEND_URL', 'http://localhost:5173')])

# API credentials
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
SPOTIFY_REDIRECT_URI = os.getenv('SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:5000/api/callback')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

openai_client = OpenAI(api_key=OPENAI_API_KEY)

SCOPE = 'playlist-modify-public playlist-modify-private'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Custom cache handler that uses Flask session instead of file
class FlaskSessionCacheHandler(CacheHandler):
    def __init__(self, session):
        self.session = session

    def get_cached_token(self):
        return self.session.get('spotify_token_info')

    def save_token_to_cache(self, token_info):
        self.session['spotify_token_info'] = token_info

def get_spotify_oauth():
    cache_handler = FlaskSessionCacheHandler(session)
    return SpotifyOAuth(
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET,
        redirect_uri=SPOTIFY_REDIRECT_URI,
        scope=SCOPE,
        cache_handler=cache_handler,
        show_dialog=True
    )

@app.route('/api/auth/login')
def login():
    """Initiate Spotify OAuth flow"""
    sp_oauth = get_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return jsonify({'auth_url': auth_url})

@app.route('/api/callback')
def callback():
    """Handle Spotify OAuth callback"""
    sp_oauth = get_spotify_oauth()
    code = request.args.get('code')

    if not code:
        return redirect(f"{os.getenv('FRONTEND_URL')}?error=auth_failed")

    try:
        token_info = sp_oauth.get_access_token(code)
        session['token_info'] = token_info
        logger.info("User successfully authenticated with Spotify")
        logger.debug(f"Session data: {session}")

        # Redirect back to frontend with success
        return redirect(f"{os.getenv('FRONTEND_URL')}?auth=success")
    except Exception as e:
        logger.error(f"Spotify OAuth error: {e}")
        return redirect(f"{os.getenv('FRONTEND_URL')}?error=auth_failed")

@app.route('/api/auth/status')
def auth_status():
    """Check if user is authenticated"""
    logger.debug(f"Checking auth status, session: {session}")
    if 'token_info' in session:
        try:
            sp = spotipy.Spotify(auth=session['token_info']['access_token'])
            user = sp.current_user()
            logger.info(f"User {user.get('display_name')} authenticated")
            return jsonify({
                'authenticated': True,
                'user': {
                    'display_name': user.get('display_name'),
                    'id': user.get('id')
                }
            })
        except Exception as e:
            logger.warning(f"Auth token invalid or expired: {e}")
            session.clear()
            return jsonify({'authenticated': False})
    logger.debug("No auth token found in session")
    return jsonify({'authenticated': False})

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user"""
    session.clear()
    return jsonify({'success': True})

def extract_artists_with_ai(image_path):
    """Extract event name and artist names using OpenAI Vision"""
    try:
        with open(image_path, 'rb') as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')

        logger.info("Querying OpenAI Vision API to extract event name and artists")
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """This is a concert or music festival lineup poster.

Extract TWO pieces of information:
1. The event/festival name (usually the largest or most prominent text)
2. The artist/DJ/band names performing

Return your response in this exact format:
EVENT: [event name here]
ARTISTS:
[artist 1]
[artist 2]
[artist 3]
...

Important notes:
- For artists: Do not include dates, venues, sponsors, or other text. Only list the actual performers/artists.
- There might be a headliner in a different font size, or different tiers of artists in different sizes and styles.
- There might be different delimiters between artist names, do not include any pre or post punctuation.
- If you cannot find a clear event name, use "Music Festival" as the event name."""
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=500
        )
        logger.debug(f"OpenAI response: {response}")

        content = response.choices[0].message.content

        # Parse the response
        event_name = "Music Festival"  # Default
        artists = []

        lines = content.split('\n')
        in_artists_section = False

        for line in lines:
            line = line.strip()
            if line.startswith('EVENT:'):
                event_name = line.replace('EVENT:', '').strip()
            elif line == 'ARTISTS:':
                in_artists_section = True
            elif in_artists_section and line:
                artists.append(line)

        return {
            'event_name': event_name,
            'artists': artists[:20]  # Limit to 20 artists
        }

    except Exception as e:
        logger.error(f"Error with OpenAI Vision: {traceback.format_exc()}")
        return {'event_name': 'Music Festival', 'artists': []}

def search_artist_on_spotify(sp, artist_name):
    """Search for artist on Spotify"""
    try:
        results = sp.search(q=f'artist:{artist_name}', type='artist', limit=1)
        if results['artists']['items']:
            return results['artists']['items'][0]['id']
    except Exception as e:
        logger.warning(f"Error searching for artist '{artist_name}': {e}")
    return None

def get_artist_top_tracks(sp, artist_id, num_tracks=3):
    """Get top tracks for an artist"""
    try:
        results = sp.artist_top_tracks(artist_id)
        return [track['uri'] for track in results['tracks'][:num_tracks]]
    except Exception as e:
        logger.warning(f"Error getting top tracks: {e}")
        return []

@app.route('/api/extract-artists', methods=['POST'])
def extract_artists():
    """Handle image upload and extract artists + event name"""
    if 'token_info' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        # Extract event name and artists from image using AI
        extraction_result = extract_artists_with_ai(filepath)

        # Clean up uploaded file
        os.remove(filepath)

        if not extraction_result['artists']:
            return jsonify({'error': 'No artists found in image'}), 400

        # Store extraction results in session for later use
        session['extraction_data'] = extraction_result

        return jsonify({
            'success': True,
            'event_name': extraction_result['event_name'],
            'artists': extraction_result['artists']
        })

    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        logger.error(f"Error extracting artists: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/create-playlist', methods=['POST'])
def create_playlist():
    """Create Spotify playlist from approved artists"""
    if 'token_info' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    data = request.json
    artists = data.get('artists', [])
    event_name = data.get('event_name', 'Music Festival')

    if not artists:
        return jsonify({'error': 'No artists provided'}), 400

    try:
        # Initialize Spotify client
        sp = spotipy.Spotify(auth=session['token_info']['access_token'])
        user = sp.current_user()

        # Search for artists and collect tracks
        all_track_uris = []
        found_artists = []

        logger.info(f"Searching Spotify for {len(artists)} artists")
        for artist_name in artists:
            artist_id = search_artist_on_spotify(sp, artist_name)
            logger.debug(f"Artist lookup: {artist_name} -> {artist_id}")
            if artist_id:
                found_artists.append(artist_name)
                track_uris = get_artist_top_tracks(sp, artist_id, num_tracks=3)
                all_track_uris.extend(track_uris)

        if not all_track_uris:
            return jsonify({'error': 'Could not find any artists on Spotify'}), 400

        # Create playlist name with event name and date
        today = datetime.now().strftime('%m/%d/%Y')
        playlist_name = f"{event_name} - {today}"

        # Create playlist
        playlist = sp.user_playlist_create(
            user['id'],
            playlist_name,
            public=True,
            description=f'Created from {event_name} lineup'
        )

        # Add tracks in batches of 100
        for i in range(0, len(all_track_uris), 100):
            batch = all_track_uris[i:i+100]
            sp.playlist_add_items(playlist['id'], batch)

        logger.info(f"Playlist created: '{playlist_name}' with {len(all_track_uris)} tracks from {len(found_artists)} artists")

        return jsonify({
            'success': True,
            'playlist_url': playlist['external_urls']['spotify'],
            'playlist_name': playlist_name,
            'artists_found': found_artists,
            'tracks_added': len(all_track_uris)
        })

    except Exception as e:
        logger.error(f"Error creating playlist: {e}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Railway needs host='0.0.0.0' and uses PORT environment variable
    # For local development, you can set FLASK_HOST=127.0.0.1 in your .env
    debug_mode = os.getenv('FLASK_DEBUG', 'False') == 'True'
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    app.run(debug=debug_mode, host=host, port=port)
