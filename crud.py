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

def get_user_by_email(user_email):
    """Return user by email."""

    return User.query.filter(User.email == user_email).first()

def create_route(title, distance, elevation_gain, created_by, image_url):
    """Create and return a new route."""

    route = Route(title=title, distance=distance, elevation_gain=elevation_gain, created_by=created_by, image_url=image_url)

    return route 

def get_routes():
    """Return all routes."""

    return Route.query.all()

def get_route_by_id(route_id):
    """Return route by id."""

    return Route.query.get(route_id)

def get_routes_by_user_id(user_id):
    """Return routes by user id."""

    return Route.query.filter(Route.created_by == user_id).all()

def delete_route(route_id):
    """Delete route by id."""

    Route.query.filter(Route.route_id == route_id).delete()
    db.session.commit()

def create_waypoint(route, latitude, longitude, elevation):
    """Create and return a new waypoint."""

    waypoint = Waypoint(route=route, latitude=latitude, longitude=longitude, elevation=elevation)

    return waypoint

def get_waypoints_by_route_id(route_id):
    """Return waypoints by route id."""

    return Waypoint.query.filter(Waypoint.route_id == route_id).all()

def delete_waypoints_by_route_id(route_id):
    """Delete waypoints by route id."""

    Waypoint.query.filter(Waypoint.route_id == route_id).delete()
    db.session.commit()

if __name__ == '__main__':
    from server import app
    connect_to_db(app)