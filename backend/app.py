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
from openai import OpenAI
import os
from PIL import Image
import base64
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import traceback

load_dotenv()

app = Flask(__name__)
app.config.update(
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=True,  # set True if using HTTPS
)
app.secret_key = os.getenv('SECRET_KEY')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# CORS configuration for Vite frontend
CORS(app, supports_credentials=True, origins=[os.getenv('FRONTEND_URL', 'http://localhost:5173')])

# API credentials
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:5000/api/callback'
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

openai_client = OpenAI(api_key=OPENAI_API_KEY)

SCOPE = 'playlist-modify-public playlist-modify-private'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def get_spotify_oauth():
    return SpotifyOAuth(
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET,
        redirect_uri=SPOTIFY_REDIRECT_URI,
        scope=SCOPE,
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
        print(session)
        print("----AFTER LOGIN-----")
        
        # Redirect back to frontend with success
        return redirect(f"{os.getenv('FRONTEND_URL')}?auth=success")
    except Exception as e:
        print(f"Auth error: {e}")
        return redirect(f"{os.getenv('FRONTEND_URL')}?error=auth_failed")

@app.route('/api/auth/status')
def auth_status():
    """Check if user is authenticated"""
    print(session)
    if 'token_info' in session:
        try:
            print(1)
            sp = spotipy.Spotify(auth=session['token_info']['access_token'])
            user = sp.current_user()
            print(2)
            return jsonify({
                'authenticated': True,
                'user': {
                    'display_name': user.get('display_name'),
                    'id': user.get('id')
                }
            })
        except:
            print(3)
            session.clear()
            return jsonify({'authenticated': False})
    print(4)
    return jsonify({'authenticated': False})

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user"""
    session.clear()
    return jsonify({'success': True})

def extract_artists_with_ai(image_path):
    """Extract artist names using OpenAI Vision"""
    try:
        with open(image_path, 'rb') as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
        
        print("querying openai")
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "This is a concert or music festival lineup poster. List ONLY the artist/DJ/band names performing, one per line. Do not include dates, venues, sponsors, or other text. Only list the actual performers/artists. Note that there might be a headliner in a different font size, or different tiers of artists in different sizes and styles. There might be different delimiters between artist names, do not include any pre or post punctuation."
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
        print(response)
        
        artists_text = response.choices[0].message.content
        artists = [line.strip() for line in artists_text.split('\n') if line.strip()]
        
        return artists[:20]  # Limit to 20 artists
        
    except Exception as e:
        print(f"Error with OpenAI Vision: {traceback.format_exc()}")
        return []

def search_artist_on_spotify(sp, artist_name):
    """Search for artist on Spotify"""
    try:
        results = sp.search(q=f'artist:{artist_name}', type='artist', limit=1)
        if results['artists']['items']:
            return results['artists']['items'][0]['id']
    except Exception as e:
        print(f"Error searching for {artist_name}: {e}")
    return None

def get_artist_top_tracks(sp, artist_id, num_tracks=3):
    """Get top tracks for an artist"""
    try:
        results = sp.artist_top_tracks(artist_id)
        return [track['uri'] for track in results['tracks'][:num_tracks]]
    except Exception as e:
        print(f"Error getting top tracks: {e}")
        return []

@app.route('/api/upload', methods=['POST'])
def upload():
    """Handle image upload and playlist creation"""
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
    print("hello")
    
    try:
        # Extract artists from image using AI
        potential_artists = extract_artists_with_ai(filepath)
        
        if not potential_artists:
            os.remove(filepath)
            return jsonify({'error': 'No artists found in image'}), 400
        
        # Initialize Spotify client
        sp = spotipy.Spotify(auth=session['token_info']['access_token'])
        user = sp.current_user()
        
        # Search for artists and collect tracks
        all_track_uris = []
        found_artists = []
        print(potential_artists)
        for artist_name in potential_artists:
            artist_id = search_artist_on_spotify(sp, artist_name)
            print(artist_name, artist_id)
            if artist_id:
                found_artists.append(artist_name)
                track_uris = get_artist_top_tracks(sp, artist_id)
                all_track_uris.extend(track_uris)
        
        if not all_track_uris:
            os.remove(filepath)
            return jsonify({'error': 'Could not find any artists on Spotify'}), 400
        
        # Create playlist
        playlist_name = 'Concert Lineup Mix'
        playlist = sp.user_playlist_create(
            user['id'],
            playlist_name,
            public=True,
            description='Created from concert lineup image'
        )
        
        # Add tracks in batches of 100
        for i in range(0, len(all_track_uris), 100):
            batch = all_track_uris[i:i+100]
            sp.playlist_add_items(playlist['id'], batch)
        
        # Clean up
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'playlist_url': playlist['external_urls']['spotify'],
            'playlist_name': playlist_name,
            'artists_found': found_artists,
            'tracks_added': len(all_track_uris)
        })
        
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
