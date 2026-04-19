from flask import Flask, request, Response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()


def create_app():
    app = Flask(__name__)

    # Fix Render postgres URL
    database_url = os.getenv('DATABASE_URL', '')
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

    # Handle ALL OPTIONS requests before anything else
    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            res = Response('', status=200)
            res.headers['Access-Control-Allow-Origin'] = '*'
            res.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
            res.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,Accept'
            res.headers['Access-Control-Max-Age'] = '3600'
            return res

 # Add CORS headers to every single response
@app.after_request
def add_cors(response):
    allowed_origins = [
        'http://localhost:3000',
        'https://shop-29ms.vercel.app',
    ]
    origin = request.headers.get('Origin', '')
    if origin in allowed_origins or not origin:
        response.headers['Access-Control-Allow-Origin'] = origin or '*'
    else:
        response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = \
        'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = \
        'Content-Type,Authorization,Accept'
    response.headers['Access-Control-Allow-Credentials'] = 'false'
    return response

@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        res = Response('', status=200)
        res.headers['Access-Control-Allow-Origin'] = '*'
        res.headers['Access-Control-Allow-Methods'] = \
            'GET,POST,PUT,PATCH,DELETE,OPTIONS'
        res.headers['Access-Control-Allow-Headers'] = \
            'Content-Type,Authorization,Accept'
        res.headers['Access-Control-Max-Age'] = '3600'
        return res