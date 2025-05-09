from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from database.models import Usuario
from database.models import Maquinaria
from database import db
import os

auth_bp = Blueprint("auth", __name__)
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

@auth_bp.route("/alta-maquinaria", methods=["POST"])
def alta_maquinaria():
    try:
        nombre = request.form.get("nombre")
        descripcion = request.form.get("descripcion")
        foto = request.files.get("foto")

        if not nombre or not descripcion or not foto:
            return jsonify({"message": "Todos los campos son obligatorios"}), 400

        # Guardar la foto en el servidor
        filename = secure_filename(foto.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        foto.save(filepath)

        # Crear una nueva maquinaria en la base de datos
        nueva_maquinaria = Maquinaria(
            nombre=nombre,
            descripcion=descripcion,
            foto=filename
        )
        db.session.add(nueva_maquinaria)
        db.session.commit()

        return jsonify({"message": "Maquinaria dada de alta correctamente"}), 201

    except Exception as e:
        return jsonify({"message": "Hubo un problema al dar de alta la maquinaria", "error": str(e)}), 500
    
@auth_bp.route("/maquinarias", methods=["GET"])
def obtener_maquinarias():
    try:
        maquinarias = Maquinaria.query.all()
        resultado = [
            {
                "id": maquinaria.id,
                "nombre": maquinaria.nombre,
                "descripcion": maquinaria.descripcion,
                "foto": maquinaria.foto,
            }
            for maquinaria in maquinarias
        ]
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"message": "Hubo un problema al obtener las maquinarias", "error": str(e)}), 500