from app.models.store import Store
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.user import User
from app.utils.validators import validate_email, validate_password, validate_required_fields
from app.utils.email import send_invite_email
import bcrypt
import secrets
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)


# -----------------------------------------------
# HEALTH CHECK
# -----------------------------------------------
@auth_bp.route('/health', methods=['GET'])
def health():
    return jsonify({'message': 'Auth routes working! ✅'}), 200


# -----------------------------------------------
# REGISTER FIRST MERCHANT (only once, on setup)
# -----------------------------------------------
@auth_bp.route('/setup', methods=['POST'])
def setup_merchant():
    """Create the very first merchant account"""

    # Check if a merchant already exists
    existing = User.query.filter_by(role='merchant').first()
    if existing:
        return jsonify({'error': 'Merchant already exists'}), 400

    data = request.get_json()

    # Validate required fields
    missing = validate_required_fields(data, ['full_name', 'email', 'password'])
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    # Validate email
    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email address'}), 400

    # Validate password
    if not validate_password(data['password']):
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    # Hash the password (never store plain passwords!)
    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

    merchant = User(
        full_name=data['full_name'],
        email=data['email'],
        password_hash=hashed.decode('utf-8'),
        role='merchant',
        is_active=True,
        is_verified=True
    )

    db.session.add(merchant)
    db.session.commit()

    return jsonify({
        'message': 'Merchant account created successfully! ✅',
        'user': merchant.to_dict()
    }), 201


# -----------------------------------------------
# LOGIN
# -----------------------------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Validate required fields
    missing = validate_required_fields(data, ['email', 'password'])
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    # Find user by email
    user = User.query.filter_by(email=data['email']).first()

    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401

    # Check if account is active
    if not user.is_active:
        return jsonify({'error': 'Your account has been deactivated. Contact your admin.'}), 403

    # Check if account is verified
    if not user.is_verified:
        return jsonify({'error': 'Please verify your account first via the invite link sent to your email.'}), 403

    # Check password
    if user.password_hash == 'pending' or user.password_hash == '':
        return jsonify({'error': 'Account not activated yet. Please use the invite link to set your password.'}), 403

    password_correct = bcrypt.checkpw(
        data['password'].encode('utf-8'),
        user.password_hash.encode('utf-8')
    )
    if not password_correct:
        return jsonify({'error': 'Invalid email or password'}), 401

    # Create JWT token
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role}
    )

    return jsonify({
        'message': f'Welcome back, {user.full_name}! 👋',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


# -----------------------------------------------
# INVITE A NEW USER (merchant invites admin, admin invites clerk)
# -----------------------------------------------

@auth_bp.route('/invite', methods=['POST'])
@jwt_required()
def invite_user():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))

    if not current_user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()

    missing = validate_required_fields(data, ['email', 'role'])
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    if current_user.role == 'merchant' and data['role'] not in ['admin', 'clerk']:
        return jsonify({'error': 'Merchants can only invite admins or clerks'}), 403
    if current_user.role == 'admin' and data['role'] != 'clerk':
        return jsonify({'error': 'Admins can only invite clerks'}), 403
    if current_user.role == 'clerk':
        return jsonify({'error': 'Clerks cannot invite anyone'}), 403

    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email address'}), 400

    existing = User.query.filter_by(email=data['email']).first()
    if existing:
        return jsonify({'error': f'A user with email {data["email"]} already exists'}), 400

    invite_token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(hours=24)

    new_user = User(
        full_name='',
        email=data['email'],
        password_hash='pending',
        role=data['role'],
        is_active=True,
        is_verified=False,
        invite_token=invite_token,
        invite_token_expiry=expiry,
        store_id=data.get('store_id')
    )

    db.session.add(new_user)
    db.session.commit()

    # Try to send email but don't fail if email isn't configured
    try:
        invite_link = f"http://localhost:3000/register?token={invite_token}"
        send_invite_email(data['email'], invite_link, data['role'])
    except Exception as e:
        print(f"Email not sent (not configured): {e}")

    return jsonify({
        'message': f'User invited successfully ✅',
        'invite_token': invite_token,
        'invite_link': f'http://localhost:3000/register?token={invite_token}',
        'note': 'Share this link with the user to complete registration'
    }), 200

# -----------------------------------------------
# COMPLETE REGISTRATION (after clicking invite link)
# -----------------------------------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    missing = validate_required_fields(data, ['token', 'full_name', 'password'])
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    user = User.query.filter_by(invite_token=data['token']).first()

    if not user:
        return jsonify({'error': 'Invalid or expired invite link'}), 400

    if datetime.utcnow() > user.invite_token_expiry:
        return jsonify({'error': 'Invite link has expired. Ask for a new one.'}), 400

    if not validate_password(data['password']):
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

    user.full_name = data['full_name']
    user.password_hash = hashed.decode('utf-8')
    user.is_verified = True
    user.invite_token = None
    user.invite_token_expiry = None

    # If user has no store assigned, assign the first available store
    if not user.store_id:
        first_store = Store.query.first()
        if first_store:
            user.store_id = first_store.id

    db.session.commit()

    return jsonify({
        'message': f'Welcome, {user.full_name}! Registration complete 🎉',
        'user': user.to_dict()
    }), 200


# -----------------------------------------------
# GET CURRENT LOGGED IN USER
# -----------------------------------------------
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()

    # Always return success even if email not found (security best practice)
    if user:
        token = secrets.token_urlsafe(32)
        user.invite_token = token
        user.invite_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()

        reset_link = f"http://localhost:3000/reset-password?token={token}"
        send_invite_email(user.email, reset_link, 'password reset')

    return jsonify({'message': 'If that email exists, a reset link has been sent'}), 200

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200

# GET ALL USERS (merchant only)
@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    claims = get_jwt()
    role = claims.get('role')

    # Both merchant AND admin can view users
    if role not in ['merchant', 'admin']:
        return jsonify({'error': 'Not authorized'}), 403

    try:
        if role == 'merchant':
            # Merchant sees all non-merchant users
            users = User.query.filter(User.role != 'merchant').all()
        else:
            # Admin sees only clerks in their store
            current_user_id = get_jwt_identity()
            current_user = User.query.get(int(current_user_id))
            users = User.query.filter_by(
                role='clerk',
                store_id=current_user.store_id
            ).all()

        return jsonify({'users': [u.to_dict() for u in users]}), 200
    except Exception as e:
        print(f"GET /users error: {e}")
        return jsonify({'error': str(e)}), 500


# DELETE A USER (merchant only)
@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    claims = get_jwt()
    if claims.get('role') != 'merchant':
        return jsonify({'error': 'Only merchants can delete users'}), 403
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.role == 'merchant':
        return jsonify({'error': 'Cannot delete merchant account'}), 403
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': f'{user.full_name} deleted successfully'}), 200


# TOGGLE USER ACTIVE STATUS (merchant only)
@auth_bp.route('/users/<int:user_id>/toggle', methods=['PATCH'])
@jwt_required()
def toggle_user(user_id):
    claims = get_jwt()
    if claims.get('role') != 'merchant':
        return jsonify({'error': 'Only merchants can do this'}), 403
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    data = request.get_json()
    user.is_active = data.get('is_active', user.is_active)
    db.session.commit()
    return jsonify({'message': 'User updated', 'user': user.to_dict()}), 200

