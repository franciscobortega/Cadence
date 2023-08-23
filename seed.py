"""Script to seed database."""

import os
import json
from random import choice, randint
from datetime import datetime

import crud
import model
import server

os.system("dropdb cadence")
os.system('createdb cadence')

model.connect_to_db(server.app)
model.db.create_all()

username = 'bryanortega'
email = 'bryanortega@email.com'
password = '1234'
first_name = 'bryan'
last_name = 'ortega'


# create and add new user to db
new_user = crud.create_user(username, email, password, first_name, last_name)
model.db.session.add(new_user)

model.db.session.commit()