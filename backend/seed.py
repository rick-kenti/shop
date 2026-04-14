from app import create_app, db
from app.models.store import Store
from app.models.product import Product
from app.models.user import User
from app.models.inventory_entry import InventoryEntry
import bcrypt
from datetime import datetime, timedelta
import random

app = create_app()

with app.app_context():
    print("🌱 Seeding database with full data...\n")

    # ─── STORES ───
    existing_stores = Store.query.count()
    if existing_stores == 0:
        stores_data = [
            Store(name="Main Branch", location="Nairobi CBD"),
            Store(name="Westlands Branch", location="Westlands, Nairobi"),
            Store(name="Mombasa Branch", location="Mombasa, Kenya"),
            Store(name="Kisumu Branch", location="Kisumu, Kenya"),
        ]
        for s in stores_data:
            db.session.add(s)
        db.session.commit()
        print(f"✅ {len(stores_data)} stores created")
    else:
        print(f"ℹ️  Stores already exist ({existing_stores}), skipping")

    stores = Store.query.all()
    store1 = stores[0] if stores else None
    store2 = stores[1] if len(stores) > 1 else store1

    # ─── PRODUCTS ───
    existing_products = Product.query.count()
    if existing_products < 10:
        products_data = [
            # Groceries & Dry Foods
            Product(name="Sugar 1kg", description="White refined sugar - Mumias brand", store_id=store1.id),
            Product(name="Sugar 2kg", description="White refined sugar - bulk pack", store_id=store1.id),
            Product(name="Wheat Flour 2kg", description="Duma self-raising flour", store_id=store1.id),
            Product(name="Wheat Flour 500g", description="Duma all-purpose flour small pack", store_id=store1.id),
            Product(name="Rice 2kg", description="Long grain white rice - Pishori", store_id=store1.id),
            Product(name="Rice 5kg", description="Long grain white rice - bulk pack", store_id=store1.id),
            Product(name="Maize Flour 2kg", description="Unga wa ugali - Jogoo brand", store_id=store1.id),
            Product(name="Maize Flour 5kg", description="Unga wa ugali - bulk pack", store_id=store1.id),
            Product(name="Pasta 500g", description="Pembe spaghetti pasta", store_id=store1.id),
            Product(name="Noodles 70g", description="Indomie instant noodles - chicken flavour", store_id=store1.id),

            # Dairy & Beverages
            Product(name="Milk 500ml", description="Fresh whole milk - Brookside", store_id=store1.id),
            Product(name="Milk 1L", description="Fresh whole milk - Brookside 1 litre", store_id=store1.id),
            Product(name="Milk 250ml", description="Brookside small pack", store_id=store1.id),
            Product(name="Yoghurt 500g", description="Strawberry yoghurt - Yoplait", store_id=store1.id),
            Product(name="Butter 250g", description="Blueband margarine spread", store_id=store1.id),
            Product(name="Cooking Oil 1L", description="Golden Fry sunflower oil", store_id=store1.id),
            Product(name="Cooking Oil 2L", description="Golden Fry sunflower oil - large", store_id=store1.id),
            Product(name="Tea Leaves 250g", description="Ketepa Pride loose tea", store_id=store1.id),
            Product(name="Coffee 200g", description="Africafe instant coffee", store_id=store1.id),
            Product(name="Juice 1L", description="Minute Maid orange juice", store_id=store1.id),

            # Bread & Baked
            Product(name="White Bread", description="Broadways sliced white bread", store_id=store1.id),
            Product(name="Brown Bread", description="Broadways whole wheat bread", store_id=store1.id),
            Product(name="Mandazi Mix 500g", description="Ready mix for mandazi", store_id=store1.id),

            # Cleaning & Hygiene
            Product(name="Soap Bar 800g", description="Ushindi washing bar soap", store_id=store1.id),
            Product(name="Dish Soap 500ml", description="Fairy ultra dishwashing liquid", store_id=store1.id),
            Product(name="Bleach 1L", description="Jik bleach - white and clean", store_id=store1.id),
            Product(name="Toilet Paper 4-pack", description="Papaw soft toilet rolls", store_id=store1.id),
            Product(name="Toothpaste 100ml", description="Colgate strong teeth toothpaste", store_id=store1.id),
            Product(name="Shampoo 400ml", description="Head & Shoulders anti-dandruff", store_id=store1.id),
            Product(name="Body Lotion 400ml", description="Vaseline intensive care lotion", store_id=store1.id),

            # Canned & Packaged
            Product(name="Tomato Paste 70g", description="Kansera tomato paste sachet", store_id=store1.id),
            Product(name="Tomato Paste 400g", description="Kansera tomato paste tin", store_id=store1.id),
            Product(name="Baked Beans 400g", description="Koo baked beans in tomato sauce", store_id=store1.id),
            Product(name="Sardines 155g", description="Lucky Star pilchards in tomato", store_id=store1.id),
            Product(name="Corned Beef 340g", description="Bull Brand canned corned beef", store_id=store1.id),

            # Snacks & Confectionery
            Product(name="Biscuits 200g", description="Digestive biscuits - McVities", store_id=store1.id),
            Product(name="Crisps 100g", description="Pringles original flavour", store_id=store1.id),
            Product(name="Chocolate Bar 50g", description="Cadbury Dairy Milk", store_id=store1.id),
            Product(name="Sweets Bag 150g", description="Mixed fruit candy assorted", store_id=store1.id),
            Product(name="Chewing Gum 10-pack", description="Orbit spearmint gum", store_id=store1.id),

            # Store 2 products
            Product(name="Salt 500g", description="Kensalt iodised table salt", store_id=store2.id if store2 else store1.id),
            Product(name="Pepper 50g", description="Black pepper ground - Royco", store_id=store2.id if store2 else store1.id),
            Product(name="Royco Mchuzi Mix 75g", description="Beef flavour seasoning", store_id=store2.id if store2 else store1.id),
            Product(name="Omo 500g", description="Omo auto washing powder", store_id=store2.id if store2 else store1.id),
            Product(name="Ariel 1kg", description="Ariel colour & style washing powder", store_id=store2.id if store2 else store1.id),
            Product(name="Pampers M 24-pack", description="Pampers active baby diapers medium", store_id=store2.id if store2 else store1.id),
            Product(name="Cerelac 400g", description="Nestle cerelac wheat & honey", store_id=store2.id if store2 else store1.id),
            Product(name="Baby Wipes 80-pack", description="Pampers sensitive baby wipes", store_id=store2.id if store2 else store1.id),
        ]

        for p in products_data:
            db.session.add(p)
        db.session.commit()
        print(f"✅ {len(products_data)} products created across stores")
    else:
        print(f"ℹ️  Products already exist ({existing_products}), skipping")

    # ─── USERS ───
    hashed = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt())

    def make_user(full_name, email, role, store_id=None):
        if not User.query.filter_by(email=email).first():
            user = User(
                full_name=full_name, email=email,
                password_hash=hashed.decode('utf-8'),
                role=role, is_active=True, is_verified=True,
                store_id=store_id
            )
            db.session.add(user)
            db.session.commit()
            print(f"  ✅ {role.capitalize()}: {email}")
            return user
        else:
            print(f"  ℹ️  {email} already exists")
            return User.query.filter_by(email=email).first()

    print("\n👤 Creating users...")
    merchant = make_user("Test Merchant", "merchant@test.com", "merchant")
    admin1 = make_user("Jane Admin", "admin@test.com", "admin", store1.id if store1 else None)
    admin2 = make_user("Mark Admin", "admin2@test.com", "admin", store2.id if store2 else None)
    clerk1 = make_user("Tom Clerk", "clerk@test.com", "clerk", store1.id if store1 else None)
    clerk2 = make_user("Rita Clerk", "clerk2@test.com", "clerk", store1.id if store1 else None)
    clerk3 = make_user("James Clerk", "clerk3@test.com", "clerk", store2.id if store2 else None)

    # ─── INVENTORY ENTRIES ───
    existing_entries = InventoryEntry.query.count()
    if existing_entries < 5:
        print("\n📋 Creating inventory entries...")
        products = Product.query.filter_by(store_id=store1.id).limit(15).all()
        clerks = [clerk1, clerk2]

        entries_created = 0
        for i, product in enumerate(products):
            for day_offset in range(3):
                clerk = clerks[i % len(clerks)]
                qty_received = random.randint(20, 150)
                qty_spoilt = random.randint(0, int(qty_received * 0.1))
                qty_in_stock = qty_received - qty_spoilt
                buy_price = round(random.uniform(20, 500), 2)
                sell_price = round(buy_price * random.uniform(1.1, 1.4), 2)

                entry = InventoryEntry(
                    product_id=product.id,
                    clerk_id=clerk.id,
                    quantity_received=qty_received,
                    quantity_in_stock=qty_in_stock,
                    quantity_spoilt=qty_spoilt,
                    buying_price=buy_price,
                    selling_price=sell_price,
                    payment_status=random.choice(['paid', 'paid', 'unpaid']),
                )
                db.session.add(entry)
                entries_created += 1

        db.session.commit()
        print(f"  ✅ {entries_created} inventory entries created")
    else:
        print(f"ℹ️  Inventory entries already exist ({existing_entries}), skipping")

    print("\n" + "="*50)
    print("🎉 Seeding complete! Your test accounts:")
    print("="*50)
    print(f"👑 Merchant:  merchant@test.com  / password123")
    print(f"👔 Admin 1:   admin@test.com     / password123  (Store: {store1.name if store1 else 'N/A'})")
    print(f"👔 Admin 2:   admin2@test.com    / password123  (Store: {store2.name if store2 else 'N/A'})")
    print(f"📝 Clerk 1:   clerk@test.com     / password123  (Store: {store1.name if store1 else 'N/A'})")
    print(f"📝 Clerk 2:   clerk2@test.com    / password123  (Store: {store1.name if store1 else 'N/A'})")
    print(f"📝 Clerk 3:   clerk3@test.com    / password123  (Store: {store2.name if store2 else 'N/A'})")
    print("="*50)
    print(f"\n📦 Total products: {Product.query.count()}")
    print(f"🏪 Total stores: {Store.query.count()}")
    print(f"👥 Total users: {User.query.count()}")
    print(f"📋 Total entries: {InventoryEntry.query.count()}")
