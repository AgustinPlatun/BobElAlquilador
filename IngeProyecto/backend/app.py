from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(80), nullable=False)
    apellido = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

with app.app_context():
    db.create_all()

@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        nombre = data.get("nombre")
        apellido = data.get("apellido")
        email = data.get("email")
        password = data.get("password")

        if not nombre or not apellido or not email or not password:
            return jsonify({"message": "Faltan datos"}), 400

        if Usuario.query.filter_by(email=email).first():
            return jsonify({"message": "El email ya está registrado"}), 400

        nuevo_usuario = Usuario(nombre=nombre, apellido=apellido, email=email, password=password)
        db.session.add(nuevo_usuario)
        db.session.commit()

        return jsonify({"message": "Usuario registrado correctamente"}), 201

    except Exception as e:
        return jsonify({"message": "Hubo un problema con el registro", "error": str(e)}), 500

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        usuario = Usuario.query.filter_by(email=email).first()

        if usuario and usuario.password == password:
            return jsonify({"message": "Inicio de sesión exitoso"}), 200
        else:
            return jsonify({"message": "Datos incorrectos"}), 401

    except Exception as e:
        return jsonify({"message": "Hubo un problema con el inicio de sesión", "error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
