from flask import Flask, redirect, request, render_template, session
from jinja2 import StrictUndefined


app = Flask(__name__)

@app.route('/')
def display_home():
    return render_template("homepage.html")



if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
