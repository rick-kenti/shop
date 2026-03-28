from app import create_app, db
from app.models.user import User

app = create_app()

with app.app_context():
    admin = User.query.filter_by(email='admin@test.com').first()
    clerk = User.query.filter_by(email='clerk@test.com').first()

    if admin:
        admin.store_id = 1
        print('Admin store set to 1')

    if clerk:
        clerk.store_id = 1
        print('Clerk store set to 1')

    db.session.commit()
    print('Done!')
