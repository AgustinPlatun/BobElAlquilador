from flask import Flask,send_from_directory
from flask_cors import CORS
from database import db
from routes import register_blueprints
from database.models import Usuario, Maquinaria
import os

app = Flask(__name__)
CORS(app)

# Configuración de la base de datos
app.config.from_object("config.Config")

# Inicializar la base de datos
db.init_app(app)

# Registrar blueprints
register_blueprints(app)

@app.route('/uploads/<path:filename>')
def uploads(filename):
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    return send_from_directory(uploads_dir, filename)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)