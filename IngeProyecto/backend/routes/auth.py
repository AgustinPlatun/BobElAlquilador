from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from database.models import Usuario
from database import db
import os

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        nombre = request.form.get("nombre")
        apellido = request.form.get("apellido")
        email = request.form.get("email")
        password = request.form.get("password")
        fecha_nacimiento = request.form.get("fecha_nacimiento")
        dni_foto = request.files.get("dni_foto")
        rol = "cliente"
        estado = "pendiente"

        if not nombre or not apellido or not email or not password or not fecha_nacimiento or not dni_foto:
            return jsonify({"message": "Faltan datos"}), 400

        if Usuario.query.filter_by(email=email).first():
            return jsonify({"message": "El email ya está registrado"}), 400

        dni_folder = os.path.join(os.path.dirname(__file__), '../uploads/dni_clientes_fotos')
        os.makedirs(dni_folder, exist_ok=True)
        dni_filename = secure_filename(dni_foto.filename)
        dni_filepath = os.path.join(dni_folder, dni_filename)
        dni_foto.save(dni_filepath)

        hashed_password = generate_password_hash(password)

        nuevo_usuario = Usuario(
            nombre=nombre,
            apellido=apellido,
            email=email,
            password=hashed_password,
            estado=estado,
            rol=rol,
            fecha_nacimiento=fecha_nacimiento,
            dni_foto=dni_filename,
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

        if not usuario:
            return jsonify({"message": "Datos incorrectos"}), 401

        if not check_password_hash(usuario.password, password):
            return jsonify({"message": "Datos incorrectos"}), 401

        if usuario.estado.lower() == "pendiente":
            return jsonify({"message": "Tu cuenta aún no ha sido activada."}), 403

        return jsonify({
            "message": "Inicio de sesión exitoso",
            "nombre": usuario.nombre,
            "rol": usuario.rol
        }), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema con el inicio de sesión", "error": str(e)}), 500




@auth_bp.route("/registrar-empleado", methods=["POST"])
def registrar_empleado():
    try:
        data = request.json
        nombre = data.get("nombre")
        apellido = data.get("apellido")
        email = data.get("email")
        password = data.get("password")
        fecha_nacimiento = data.get("fecha_nacimiento")
        rol = "empleado"
        estado = "activo"

        if not nombre or not apellido or not email or not password or not fecha_nacimiento:
            return jsonify({"message": "Faltan datos"}), 400

        if Usuario.query.filter_by(email=email).first():
            return jsonify({"message": "El email ya está registrado"}), 400

        hashed_password = generate_password_hash(password)

        nuevo_empleado = Usuario(
            nombre=nombre,
            apellido=apellido,
            email=email,
            password=hashed_password,
            estado=estado,
            rol=rol,
            fecha_nacimiento=fecha_nacimiento,
            dni_foto=None 
        )
        db.session.add(nuevo_empleado)
        db.session.commit()

        return jsonify({"message": "Empleado registrado correctamente"}), 201

    except Exception as e:
        print("Error al registrar empleado:", e)
        return jsonify({"message": "Hubo un problema con el registro del empleado", "error": str(e)}), 500


