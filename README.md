# <a name="summary"> <img src="https://github.com/franciscobortega/Cadence/blob/main/static/images/cadence-logo.png" width="40%" alt="Cadence Logo">

Cadence is an app that builds a tailored music playlist based on the users’ music preferences and running session. Users plot their desired running route using the Mapbox API and select their run goals (e.g., target pace, target time, target intensity) for their session. The Graphhopper API is then used to retrieve elevation data along the specified running route. The Spotify API is leveraged to dynamically generate a playlist based on the user's goals and preferences.

</br>

**Table Of Contents**

- [Summary](#summary)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation](#installation)
- [About Me](#about-me)

## <a name="tech-stack"></a>Tech Stack

**Frontend:** HTML5, CSS, Javascript <br/>
**Backend:** Python, Flask, PostgreSQL, SQLAlchemy <br/>
**APIs:** Mapbox, Graphhopper, Spotify <br/>

## <a name="features"></a> Features

TODO: add features

## <a name="installation"></a> Installation

#### Requirements:

- PostgreSQL
- Python 3.7.3
- Mapbox, Graphhopper, and Spotify API keys

Follow the following steps to run on your local computer:

Clone repository:

```
$ git clone https://github.com/franciscobortega/Cadence.git
```

Create and activate a virtual environment:

```
$ pip3 install virtualenv
$ virtualenv env
$ source env/bin/activate
```

Install dependencies:

```
(env) $ pip3 install -r requirements.txt
```

Run the database seeding script:

```
(env) $ python3 seed.py
```

Start the backend server:

```
(env) $ python3 server.py
```

Navigate to `localhost:5000` in your browser to see the web app

## <a name="about-me"></a> About me

TODO: Add about section
