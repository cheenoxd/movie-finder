import flask
from authlib.integrations.flask_client import OAuth

app = flask(__name__)
oauth = OAuth(app)


@app.route('/login')


