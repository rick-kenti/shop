from app import create_app, db
from app.models.user import User

app = create_app()

with app.app_context():
    users = User.query.all()
    for u in users:
        print(f"{u.email} | role={u.role} | store_id={u.store_id} | verified={u.is_verified}")
