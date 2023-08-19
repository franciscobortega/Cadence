"""CRUD operations."""

from model import db, User, Route, Waypoint, connect_to_db

def create_user(username, email, password, first_name, last_name):
    """Create and return a new user."""

    user = User(username=username, email=email, password=password, first_name=first_name, last_name=last_name)

    return user

def get_users():
    """Return all users."""

    return User.query.all()

def get_user_by_id(user_id):
    """Return user by id."""

    return User.query.get(user_id)

def create_route(title, distance, elevation_gain, created_by):
    """Create and return a new movie."""

    route = Route(title=title, distance=distance, elevation_gain=elevation_gain, created_by=created_by)

    return route 

def get_routes():
    """Return all routes."""

    return Route.query.all()

def get_route_by_id(route_id):
    """Return route by id."""

    return Route.query.get(route_id)

def create_waypoint(route, latitude, longitude, elevation):
    """Create and return a new waypoint."""

    waypoint = Waypoint(route=route, latitude=latitude, longitude=longitude, elevation=elevation)

    return waypoint

if __name__ == '__main__':
    from server import app
    connect_to_db(app)