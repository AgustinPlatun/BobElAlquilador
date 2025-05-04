from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database.models import Usuario
from database import db

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        nombre = data.get("nombre")
        apellido = data.get("apellido")
        email = data.get("email")
        password = data.get("password")
        rol = data.get("rol", "cliente")

        if not nombre or not apellido or not email or not password:
            return jsonify({"message": "Faltan datos"}), 400

        if Usuario.query.filter_by(email=email).first():
            return jsonify({"message": "El email ya está registrado"}), 400

        hashed_password = generate_password_hash(password)

        nuevo_usuario = Usuario(
            nombre=nombre,
            apellido=apellido,
            email=email,
            password=hashed_password,
            rol=rol
        )
        db.session.add(nuevo_usuario)
        db.session.commit()

        return jsonify({"message": "Usuario registrado correctamente"}), 201

    except Exception as e:
        return jsonify({"message": "Hubo un problema con el registro", "error": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        usuario = Usuario.query.filter_by(email=email).first()

        if usuario and check_password_hash(usuario.password, password):
            return jsonify({"message": "Inicio de sesión exitoso", "nombre": usuario.nombre}), 200
        else:
            return jsonify({"message": "Datos incorrectos"}), 401

    except Exception as e:
        return jsonify({"message": "Hubo un problema con el inicio de sesión", "error": str(e)}), 500