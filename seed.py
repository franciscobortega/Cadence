"""Script to seed database."""

import os
import json


import crud
import model
import server

os.system("dropdb cadence")
os.system('createdb cadence')

model.connect_to_db(server.app)
model.db.create_all()


# --------------- Seed user --------------- #
username = 'bryanortega'
email = 'bryanortega@email.com'
password = '1234'
first_name = 'bryan'
last_name = 'ortega'

# create and add new user to db
new_user = crud.create_user(username, email, password, first_name, last_name)
model.db.session.add(new_user)

model.db.session.commit()


# --------------- Seed route --------------- #
with open("static/data/routes.json") as json_file:
    route_data = json.load(json_file)

    for route in route_data:
         # Get the title, distance, elevation_gain and created_by from route dict
        title = route['title']
        description = route['description']
        distance = route['distance']
        elevation_gain = route['elevation_gain']
        created_by = route['created_by']
        image_url = route['image_url']

        # Then, get the waypoints by removing it from the dict
        waypoints_data = route.pop("waypoints")
        
        # create and add new route to db
        new_route = crud.create_route(title, description, distance, elevation_gain, created_by, image_url)
        model.db.session.add(new_route)
        
        # This ensures the route_id is available for waypoints
        model.db.session.flush()  
        
        for waypoint in waypoints_data:
            # Get the lat, long, and elevation from each waypoint dict  
            latitude = waypoint['latitude']
            longitude = waypoint['longitude']
            elevation = waypoint['elevation']

            # create and add new waypoint to db
            new_waypoint = crud.create_waypoint(new_route, latitude, longitude, elevation)

            model.db.session.add(new_waypoint)
        
    model.db.session.commit()