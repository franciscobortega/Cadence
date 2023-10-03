"""Models for Cadence app."""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    """A user."""

    __tablename__ = 'users'

    user_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True, )
    username = db.Column(db.String, unique=True)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    profile_url = db.Column(db.String)

    routes = db.relationship("Route", back_populates="user")

    def __repr__(self):
        return f'<User user_id={self.user_id} username={self.username}>'
    
class Route(db.Model):
    """A route."""

    __tablename__ = 'routes'

    route_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True, )
    title = db.Column(db.String)
    description = db.Column(db.Text)
    distance = db.Column(db.Float)
    elevation_gain = db.Column(db.Float)
    created_by = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    image_url = db.Column(db.String)

    user = db.relationship("User", back_populates="routes")
    waypoints = db.relationship("Waypoint", back_populates="route")

    def __repr__(self):
        return f'<Route route_id={self.route_id} title={self.title}>'
    
class Waypoint(db.Model):
    """A rating."""

    __tablename__ = 'waypoints'

    waypoint_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True, )
    route_id = db.Column(db.Integer, db.ForeignKey("routes.route_id"))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    elevation = db.Column(db.Float)

    route = db.relationship("Route", back_populates="waypoints")

    def __repr__(self):
        return f'<Waypoint waypoint_id={self.waypoint_id}>'

def connect_to_db(flask_app, db_uri="postgresql:///cadence", echo=True):
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    flask_app.config["SQLALCHEMY_ECHO"] = echo
    flask_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.app = flask_app
    db.init_app(flask_app)

    print("Connected to the database!")


if __name__ == "__main__":
    from server import app

    # Call connect_to_db(app, echo=False) if your program output gets
    # too annoying; this will tell SQLAlchemy not to print out every
    # query it executes.

    connect_to_db(app)