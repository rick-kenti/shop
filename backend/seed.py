from app import create_app, db
from app.models.store import Store
from app.models.product import Product
from app.models.user import User
import bcrypt

app = create_app()

with app.app_context():
    print("🌱 Seeding database...")

    # Create a store
    store = Store.query.first()
    if not store:
        store = Store(name="Main Branch", location="Nairobi CBD")
        db.session.add(store)
        db.session.commit()
        print(f"✅ Store created: {store.name}")
    else:
        print(f"ℹ️  Store already exists: {store.name}")

    # Create products
    if Product.query.count() == 0:
        products = [
            Product(name="Sugar 1kg", description="White refined sugar", store_id=store.id),
            Product(name="Milk 500ml", description="Fresh whole milk", store_id=store.id),
            Product(name="Bread", description="Brown sliced bread", store_id=store.id),
            Product(name="Rice 2kg", description="Long grain white rice", store_id=store.id),
            Product(name="Cooking Oil 1L", description="Sunflower cooking oil", store_id=store.id),
        ]
        for product in products:
            db.session.add(product)
        db.session.commit()
        print(f"✅ 5 products created!")
    else:
        print("ℹ️  Products already exist, skipping.")

    hashed = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt())

    # Create merchant
    if not User.query.filter_by(email='merchant@test.com').first():
        merchant = User(
            full_name='Test Merchant',
            email='merchant@test.com',
            password_hash=hashed.decode('utf-8'),
            role='merchant',
            is_active=True,
            is_verified=True
        )
        db.session.add(merchant)
        db.session.commit()
        print("✅ Merchant created: merchant@test.com / password123")
    else:
        print("ℹ️  Merchant already exists, skipping.")

    # Create admin
    if not User.query.filter_by(email='admin@test.com').first():
        admin = User(
            full_name='Test Admin',
            email='admin@test.com',
            password_hash=hashed.decode('utf-8'),
            role='admin',
            is_active=True,
            is_verified=True,
            store_id=store.id
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin created: admin@test.com / password123")
    else:
        print("ℹ️  Admin already exists, skipping.")

    # Create clerk
    if not User.query.filter_by(email='clerk@test.com').first():
        clerk = User(
            full_name='Test Clerk',
            email='clerk@test.com',
            password_hash=hashed.decode('utf-8'),
            role='clerk',
            is_active=True,
            is_verified=True,
            store_id=store.id   # clerk must be assigned to a store!
        )
        db.session.add(clerk)
        db.session.commit()
        print("✅ Clerk created: clerk@test.com / password123")
    else:
        print("ℹ️  Clerk already exists, skipping.")

    print("\n🎉 Done! Here are your test accounts:")
    print("-----------------------------------")
    print("👑 Merchant: merchant@test.com / password123")
    print("👔 Admin:    admin@test.com    / password123")
    print("📝 Clerk:    clerk@test.com    / password123")
    print("-----------------------------------")