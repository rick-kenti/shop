from flask import Flask, request, Response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()


def create_app():
    app = Flask(__name__)

    # ── Configuration ──
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

    # ── Fix DATABASE_URL for SQLAlchemy ──
    # Render gives postgres:// but SQLAlchemy needs postgresql://
    database_url = os.getenv('DATABASE_URL', '')
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url

    # ── Initialize extensions ──
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

    # ── CORS — allow all origins ──
    CORS(app,
         origins='*',
         allow_headers=['Content-Type', 'Authorization', 'Accept'],
         methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
         supports_credentials=False)

    # ── Handle OPTIONS preflight for every route ──
    @app.before_request
    def handle_preflight():
        if request.method == 'OPTIONS':
            res = Response()
            res.headers['Access-Control-Allow-Origin'] = '*'
            res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept'
            res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            res.headers['Access-Control-Max-Age'] = '86400'
            return res

    # ── Add CORS headers to every response ──
    @app.after_request
    def add_cors_headers(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        return response

    # ── Import models ──
    from app.models import User, Store, Product, InventoryEntry, SupplyRequest

    # ── Register blueprints ──
    from app.routes.auth import auth_bp
    from app.routes.stores import stores_bp
    from app.routes.products import products_bp
    from app.routes.inventory import inventory_bp
    from app.routes.supply_requests import supply_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(stores_bp, url_prefix='/api/stores')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
    app.register_blueprint(supply_bp, url_prefix='/api/supply-requests')

    # ── Swagger docs ──
    try:
        from app.utils.swagger import setup_swagger
        setup_swagger(app)
    except Exception as e:
        print(f"Swagger setup skipped: {e}")

    return app