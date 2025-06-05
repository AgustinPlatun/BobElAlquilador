from flask import Flask, send_from_directory
from flask_cors import CORS
from database import db
from routes import register_blueprints
from flask_migrate import Migrate
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config.from_object("config.Config")

db.init_app(app)
migrate = Migrate(app, db)

register_blueprints(app)

@app.route('/uploads/<path:filename>')
def uploads(filename):
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    return send_from_directory(uploads_dir, filename)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)

