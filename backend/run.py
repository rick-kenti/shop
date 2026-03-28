from app import create_app

app = create_app()

@app.route('/')
def home():
    return "Welcome to the inventory 🚀"

if __name__ == '__main__':
    app.run(debug=True)