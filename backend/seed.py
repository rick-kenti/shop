from app import create_app, db
from app.models.store import Store
from app.models.product import Product
from app.models.user import User
import bcrypt

app = create_app()

with app.app_context():
    print("🌱 Seeding database...")

    # Create a store
    store = Store(name="Main Branch", location="Nairobi CBD")
    db.session.add(store)
    db.session.commit()
    print(f"✅ Store created: {store.name}")

    # Create some products
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
    print(f"✅ {len(products)} products created!")

    # Create merchant account
    existing = User.query.filter_by(role='merchant').first()
    if not existing:
        hashed = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt())
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

    print("\n🎉 Done! Your database has test data.")