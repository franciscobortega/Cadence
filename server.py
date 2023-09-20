import base64
from flask import (Flask, jsonify, render_template, request, flash, session,
                   redirect)
from jinja2 import StrictUndefined

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

@app.route('/')
def display_home():
    """Display homepage.
    
    Logged in - display user personalization on homepage.
    
    Not logged in - display generic homepage.
    """
    if 'user_id' in session:
        user = crud.get_user_by_id(session['user_id'])
    else:
        user = None
    
    return render_template("homepage.html", user=user)

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

        # Redirect to the user's page
        user_id = session.get('user_id')
        return redirect(f'/users/{user_id}')
    else:
        # TODO: implement error handling
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

    # Convert the client ID and client secret to Base64
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

    user = crud.get_user_by_email(email)
    if user:
        flash("Cannot create an account with that email. Try again.")
    else:
        new_user = crud.create_user(username, email, password, first_name, last_name)
        db.session.add(new_user)
        db.session.commit()
        flash("Account created! Please log in.")

    return redirect("/auth")

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
        # return redirect(f'/users/{user.user_id}')   
        return redirect('/')
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

    return render_template('user.html', user=user, user_routes=user_routes, access_token=MAPBOX_ACCESS_TOKEN)


@app.route('/save-route', methods=['POST'])
def save_route():
    try:
        title = request.json.get('title')
        distance = request.json.get('distance')
        elevation_gain = request.json.get('elevation_gain')
        created_by = session.get('user_id')
        image_url = request.json.get('image_url')

        new_route = crud.create_route(title, distance, elevation_gain, created_by, image_url)
        print(new_route)
        db.session.add(new_route)
        db.session.commit()

        return jsonify({'message': 'Route saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/load-route')
def load_route():
    """Load saved route waypoints to map on homepage."""
    
    route_id = request.args.get('route_id')
    route = crud.get_route_by_id(route_id)
    waypoints = crud.get_waypoints_by_route_id(route_id)

    print(route)
    print(waypoints)
    
    return jsonify({'route': route, 'waypoints': waypoints})

    

if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)
