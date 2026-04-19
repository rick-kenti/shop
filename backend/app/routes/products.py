from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.product import Product
from app.models.store import Store
from app.models.user import User

products_bp = Blueprint('products', __name__)


@products_bp.route('/', methods=['GET'])
@jwt_required()
def get_products():
    try:
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)
        claims = get_jwt()
        role = claims.get('role')

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 100, type=int)

        if role == 'merchant':
            products = Product.query.paginate(
                page=page, per_page=per_page, error_out=False
            )
        else:
            if not current_user or not current_user.store_id:
                products = Product.query.paginate(
                    page=page, per_page=per_page, error_out=False
                )
            else:
                products = Product.query.filter_by(
                    store_id=current_user.store_id
                ).paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'products': [p.to_dict() for p in products.items],
            'total': products.total,
            'pages': products.pages,
            'current_page': products.page
        }), 200

    except Exception as e:
        print(f"Get products error: {e}")
        return jsonify({
            'products': [],
            'total': 0,
            'pages': 0,
            'current_page': 1
        }), 200


@products_bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    try:
        claims = get_jwt()
        role = claims.get('role')
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)

        if role not in ['merchant', 'admin']:
            return jsonify({
                'error': 'Only merchants and admins can add products'
            }), 403

        data = request.get_json(silent=True)
        if not data:
            return jsonify({'error': 'No data received'}), 400

        name = data.get('name', '').strip()
        if not name:
            return jsonify({'error': 'Product name is required'}), 400

        store_id = data.get('store_id')

        if not store_id:
            if role == 'admin' and current_user and current_user.store_id:
                store_id = current_user.store_id
            else:
                first_store = Store.query.first()
                if first_store:
                    store_id = first_store.id
                else:
                    return jsonify({
                        'error': 'No stores exist. Create a store first.'
                    }), 400

        store = Store.query.get(int(store_id))
        if not store:
            return jsonify({'error': 'Store not found'}), 404

        product = Product(
            name=name,
            description=data.get('description', ''),
            image_url=data.get('image_url'),
            store_id=int(store_id)
        )

        db.session.add(product)
        db.session.commit()

        return jsonify({
            'message': f'Product created successfully',
            'product': product.to_dict()
        }), 201

    except Exception as e:
        print(f"Create product error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@products_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'product': product.to_dict()}), 200


@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    try:
        claims = get_jwt()
        if claims.get('role') not in ['merchant', 'admin']:
            return jsonify({
                'error': 'Only merchants and admins can update products'
            }), 403

        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        data = request.get_json(silent=True) or {}
        product.name = data.get('name', product.name)
        product.description = data.get('description', product.description)

        db.session.commit()
        return jsonify({
            'message': 'Product updated successfully',
            'product': product.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    try:
        claims = get_jwt()
        if claims.get('role') not in ['merchant', 'admin']:
            return jsonify({
                'error': 'Only merchants and admins can delete products'
            }), 403

        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500