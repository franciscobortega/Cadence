import base64
import json
from flask import (Flask, jsonify, render_template, request, flash, session,
                   redirect)
from jinja2 import StrictUndefined
import cloudinary.uploader
from model import connect_to_db, db
import crud
import requests
from config import Config


app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined
app.config.from_object(Config)

MAPBOX_ACCESS_TOKEN = app.config['MAPBOX_ACCESS_TOKEN']
SPOTIFY_CLIENT_ID = app.config['SPOTIFY_CLIENT_ID']
SPOTIFY_CLIENT_SECRET = app.config['SPOTIFY_CLIENT_SECRET']
CLOUDINARY_KEY = app.config['CLOUDINARY_KEY']
CLOUDINARY_SECRET= app.config['CLOUDINARY_SECRET']
CLOUD_NAME = "dk4puuzrh"

@app.route('/')
def display_home():
    """Display homepage.
    
    Logged in - display user personalization on homepage.
    
    Not logged in - display generic homepage.
    """
    if 'user_id' in session:
        user = crud.get_user_by_id(session['user_id'])
        access_token = session.get('access_token')
    else:
        user = None
        access_token = None
    
    return render_template("homepage.html", user=user, access_token=access_token, route=None, waypoints=None)

@app.route('/auth')
def display_auth():
    # if logged in, redirect to homepage
    if 'user_id' in session:
        return redirect('/')
    
    return render_template("auth.html")

@app.route('/users')
def redirect_user():
    """Get auth code and exchange for acces token."""
    
    code = request.args.get('code')

    if code:
        # exchange auth code for access token and refresh token
        response = request_access_token(code)

        access_token = response.get('access_token')
        refresh_token = response.get('refresh_token')

        session['access_token'] = access_token
        session['refresh_token'] = refresh_token

        print(session)

        flash("Your Spotify account is connected! Happy routing!")

        # Redirect to the user's page
        user_id = session.get('user_id')
        return redirect(f'/users/{user_id}')
    else:
        flash("There was an error connecting with Spotify!")
        return redirect('/auth')

def request_access_token(auth_code):
    """Exchange the authorization code for an access token."""
    
    # Spotify's token endpoint URL
    url = "https://accounts.spotify.com/api/token"

    # Spotify application credentials
    client_id = SPOTIFY_CLIENT_ID
    client_secret = SPOTIFY_CLIENT_SECRET
    redirect_uri = "http://localhost:5000/users"

    # Parameters for the token request
    form = {
        "grant_type": "authorization_code",
        "code": auth_code,
        "redirect_uri": redirect_uri,
    }

    # HTTP Basic Authentication header
    headers = {
        "Authorization": f"Basic {base64_encode(client_id, client_secret)}",
    }

    # Send the POST request to exchange the code for a token
    response = requests.post(url, data=form, headers=headers)

    # Parse the response JSON to extract the access token
    if response.status_code == 200:
        data = response.json()
        print(data)
        # access_token = token_data.get("access_token")
        return data
    else:
        # Handle errors here, e.g., log the error or return None
        print(f"Request failed. Status code: {response.status_code} Message: {response.text}")

        return None

def base64_encode(client_id, client_secret):
    """Encodes the client ID and client secret for use in auth code flow."""

    message = f"{client_id}:{client_secret}"
    message_bytes = message.encode("ascii")
    base64_bytes = base64.b64encode(message_bytes)
    base64_message = base64_bytes.decode("ascii")

    return base64_message

@app.route("/users", methods=["POST"])
def register_user():
    """Create a new user."""

    username = request.form.get("username")
    email = request.form.get("email")
    password = request.form.get("password")
    first_name = request.form.get("first_name")
    last_name = request.form.get("last_name")
    new_image = request.files['user-img-file']
    
    img_url = None

    if new_image:
        result = cloudinary.uploader.upload(new_image, 
                                                api_key=CLOUDINARY_KEY, api_secret=CLOUDINARY_SECRET,
                                                cloud_name=CLOUD_NAME)
        

        if 'secure_url' in result:
            img_url = result['secure_url']

    user = crud.get_user_by_email(email)
    if user:
        flash("Cannot create an account with that email. Try again.")
        return redirect("/auth")
    else:
        new_user = crud.create_user(username, email, password, first_name, last_name, img_url)
        db.session.add(new_user)
        db.session.commit()
        
        session['user_id'] = new_user.user_id
        session['username'] = new_user.username
        
        user_id = new_user.user_id
        flash("Account created!")
        return redirect(f"/users/{user_id}")


@app.route('/login', methods=["POST"])
def display_login():
    """log in user."""

    email = request.form.get('email')
    password = request.form.get('password')

    user = crud.get_user_by_email(email)

    if user and user.password == password:
        session['user_id'] = user.user_id
        session['username'] = user.username
        flash('Logged in!')
        print(user.user_id)
        print(session)
        print(session['user_id']) 
        return redirect(f'/users/{user.user_id}')
    else:
        flash('Wrong email or password!')
    
    return redirect('/auth')

@app.route('/logout')
def logout_user():
    """Log out user."""

    session.clear()
    flash('Logged out!')
    return redirect('/auth')

@app.route('/users/<user_id>')
def display_user(user_id):
    """Show user details."""

    current_user_id = session.get('user_id')

    user = crud.get_user_by_id(user_id)

    print(type(user_id)) # str
    print(type(current_user_id)) # int

    if not user:
        flash('User not found.')
        return redirect('/')
    
    if current_user_id != int(user_id):
        # TODO: potentially change to read-only view of other users profile
        flash('You are not authorized to view this page.')
        return redirect('/')

    user_routes = crud.get_routes_by_user_id(user_id)
    print(user_routes)

    return render_template('user.html', user=user, user_routes=user_routes, access_token=MAPBOX_ACCESS_TOKEN)

@app.route('/update-user-image', methods=['POST'])
def update_user_image():
    
    try:
        new_image = request.files['user-img-file']
        user_id = request.form.get('user_id')

        result = cloudinary.uploader.upload(new_image, 
                                            api_key=CLOUDINARY_KEY, api_secret=CLOUDINARY_SECRET,
                                            cloud_name=CLOUD_NAME)
        if 'secure_url' in result:
            img_url = result['secure_url']
            crud.update_user_profile_img(user_id, img_url)
            return jsonify({'success': True, 'message': 'User image updated successfully'}), 200
        else:
            return jsonify({'success': False, 'error': 'Image upload failed'}), 500

    except Exception as e:
        print(e)
        return jsonify({'success': False, 'error': str(e)}), 500    

@app.route('/save-route', methods=['POST'])
def save_route():
    try:
        title = request.json.get('title')
        description = None
        distance = request.json.get('distance')
        elevation_gain = request.json.get('elevation_gain')
        created_by = session.get('user_id')
        image_url = request.json.get('image_url')
        waypoints = request.json.get('waypoints')

        new_route = crud.create_route(title, description, distance, elevation_gain, created_by, image_url)

        for waypoint in waypoints:
            longitude = waypoint[0]
            latitude = waypoint[1]
            elevation = waypoint[2]

            new_waypoint = crud.create_waypoint(new_route, latitude, longitude, elevation)
            db.session.add(new_waypoint)

        db.session.add(new_route)
        db.session.commit()

        return jsonify({'message': 'Route saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete-route', methods=['POST'])
def delete_route():
    try:
        route_id = request.form.get('route_id')
        print("deleting")
        crud.delete_waypoints_by_route_id(route_id)
        crud.delete_route(route_id)

        return jsonify({'success': True, 'message': 'Route deleted successfully'}), 200
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'error': str(e)}), 500
    
@app.route('/update-route', methods=['POST'])
def update_route():
    try:
        route_id = request.form.get('route_id')
        new_title = request.form.get('route-title')
        new_description = request.form.get('route-description')

        crud.update_route(route_id, new_title, new_description)

        return jsonify({'success': True, 'message': 'Route updated successfully'}), 200
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'error': str(e)}), 500    
    
@app.route('/load-route')
def load_route():
    """Load saved route waypoints to map on homepage."""

    if 'user_id' in session:
        user = crud.get_user_by_id(session['user_id'])
        access_token = session.get('access_token')

    else:
        user = None
        access_token = None
    
    route_id = request.args.get('route_id')
    route = crud.get_route_by_id(route_id)
    waypoints = crud.get_waypoints_by_route_id(route_id)

    route_data = {
        "title": route.title,
        "distance": route.distance,
        "elevation_gain": route.elevation_gain,
    }

    waypoints_data = []
    for waypoint in waypoints:
        waypoint_data = {
            "latitude": waypoint.latitude,
            "longitude": waypoint.longitude,
            "elevation": waypoint.elevation,
        }
        waypoints_data.append(waypoint_data)

    route_json = json.dumps(route_data)
    waypoints_json = json.dumps(waypoints_data)

    return render_template('homepage.html', user=user, access_token=access_token, route=route_json, waypoints=waypoints_json)

    

if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)
