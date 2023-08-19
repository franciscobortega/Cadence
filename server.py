from flask import Flask, redirect, request, render_template, session
from jinja2 import StrictUndefined


app = Flask(__name__)

@app.route('/')
def display_home():
    return render_template("homepage.html")

@app.route('/login')
def display_login():
    return render_template("auth.html")

@app.route('/demo')
def display_demo():
    return render_template("demo.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
