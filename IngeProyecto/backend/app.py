from flask import Flask
from flask_cors import CORS
from database import db
from routes import register_blueprints

app = Flask(__name__)
CORS(app)

# Configuración de la base de datos
app.config.from_object("config.Config")

# Inicializar la base de datos
db.init_app(app)

# Registrar blueprints
register_blueprints(app)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Crear tablas si no existen
    app.run(debug=True, port=5000)