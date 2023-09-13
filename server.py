from flask import (Flask, jsonify, render_template, request, flash, session,
                   redirect)
from jinja2 import StrictUndefined

from model import connect_to_db, db
import crud


app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

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

@app.route('/elevation')
def display_elevation():
    return render_template("test-elevation.html")

@app.route('/playlist')
def display_playlist():
    return render_template("test-playlist.html")

@app.route('/auth')
def display_auth():
    # if logged in, redirect to homepage
    if 'user_id' in session:
        return redirect('/')
    
    return render_template("auth.html")

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

    user = crud.get_user_by_id(user_id)

    #  TODO: Fix authorization
    # if user_id not in session:
    #     flash('You are not authorized to view this page.')
    #     return redirect('/auth')
    print(user_id)

    user_routes = crud.get_routes_by_user_id(user_id)

    return render_template('user.html', user=user, user_routes=user_routes)


@app.route('/demo')
def display_demo():
    return render_template("demo.html")

@app.route('/save-route', methods=['POST'])
def save_route():
    try:
        title = request.json.get('title')
        distance = request.json.get('distance')
        elevation_gain = request.json.get('elevation_gain')
        created_by = request.json.get('created_by')

        new_route = crud.create_route(title, distance, elevation_gain, created_by)
        db.session.add(new_route)
        db.session.commit()

        return jsonify({'message': 'Route saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)
