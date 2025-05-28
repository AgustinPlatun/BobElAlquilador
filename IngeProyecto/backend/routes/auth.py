from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from database.models import Usuario
from database import db
import os
import re


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
        estado = "activa"

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

        if not usuario or not check_password_hash(usuario.password, password) or usuario.estado.lower() == "desactivada":
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
        estado = "activa"

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
    
@auth_bp.route("/registrar-cliente", methods=["POST"])
def registrar_cliente():
    try:
        data = request.json
        nombre = data.get("nombre")
        apellido = data.get("apellido")
        email = data.get("email")
        password = data.get("password")
        fecha_nacimiento = data.get("fecha_nacimiento")
        rol = "cliente"
        estado = "activa"

        if not nombre or not apellido or not email or not password or not fecha_nacimiento:
            return jsonify({"message": "Faltan datos"}), 400

        if Usuario.query.filter_by(email=email).first():
            return jsonify({"message": "El email ya está registrado"}), 400

        hashed_password = generate_password_hash(password)

        nuevo_cliente = Usuario(
            nombre=nombre,
            apellido=apellido,
            email=email,
            password=hashed_password,
            estado=estado,
            rol=rol,
            fecha_nacimiento=fecha_nacimiento,
            dni_foto=None
        )
        db.session.add(nuevo_cliente)
        db.session.commit()

        return jsonify({"message": "Cliente registrado correctamente"}), 201

    except Exception as e:
        print("Error al registrar cliente:", e)
        return jsonify({"message": "Hubo un problema con el registro del cliente", "error": str(e)}), 500

@auth_bp.route("/baja-cuenta", methods=["PUT"])
def baja_usuario():
    try:
        data = request.json
        email = data.get("email")

        if not email:
            return jsonify({"message": "Email requerido"}), 400

        usuario = Usuario.query.filter_by(email=email).first()

        if not usuario:
            return jsonify({"message": "Cuenta no encontrada"}), 404

        if usuario.rol.lower() == "administrador":
            return jsonify({"message": "No se puede desactivar una cuenta de administrador"}), 403

        if usuario.estado.lower() != "activa":
            return jsonify({"message": "Solo se pueden desactivar cuentas activas"}), 400

        usuario.estado = "desactivada"
        db.session.commit()

        return jsonify({"message": "Cuenta desactivada correctamente"}), 200

    except Exception as e:
        return jsonify({"message": "Error al desactivar cuenta", "error": str(e)}), 500
    
@auth_bp.route("/usuario", methods=["GET"])
def obtener_usuario():
    email = request.args.get("email")
    if not email:
        return jsonify({"message": "Email requerido"}), 400

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    return jsonify({
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "email": usuario.email
    }), 200

@auth_bp.route("/cambiar-password", methods=["PUT"])
def cambiar_password():
    try:
        data = request.json
        email = data.get("email")
        password_actual = data.get("password_actual")
        nueva_password = data.get("nueva_password")

        if not email or not password_actual or not nueva_password:
            return jsonify({"message": "Faltan datos"}), 400

        usuario = Usuario.query.filter_by(email=email).first()

        if not usuario:
            return jsonify({"message": "Usuario no encontrado"}), 404

        if not check_password_hash(usuario.password, password_actual):
            return jsonify({"message": "Contraseña actual incorrecta"}), 401

        # Validar nueva contraseña
        if (
            len(nueva_password) < 5
            or not re.search(r"[A-Z]", nueva_password)
            or not re.search(r"\d", nueva_password)
        ):
            return jsonify({"message": "La nueva contraseña debe tener al menos 5 caracteres, una mayúscula y un número."}), 400

        usuario.password = generate_password_hash(nueva_password)
        db.session.commit()

        return jsonify({"message": "Contraseña actualizada correctamente"}), 200

    except Exception as e:
        return jsonify({"message": "Error al cambiar contraseña", "error": str(e)}), 500

from werkzeug.security import check_password_hash

@auth_bp.route("/validar-password", methods=["POST"])
def validar_password():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email y contraseña requeridos"}), 400

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    if check_password_hash(usuario.password, password):
        return jsonify({"valid": True}), 200
    else:
        return jsonify({"valid": False}), 200





