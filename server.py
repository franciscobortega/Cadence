from flask import (Flask, render_template, request, flash, session,
                   redirect)
from jinja2 import StrictUndefined

from model import connect_to_db, db
import crud


app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

@app.route('/')
def display_home():
    return render_template("homepage.html")

@app.route('/auth')
def display_auth():
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

    user_exists = crud.get_user_by_email(email)

    if user_exists and user_exists.password == password:
        session['user_id'] = user_exists.user_id
        flash('Logged in!')
    else:
        flash('Wrong email or password!')
    
    return redirect('/auth')

@app.route('/demo')
def display_demo():
    return render_template("demo.html")

if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)
