import re
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from database.models import Usuario
from database import db
import smtplib
from email.mime.text import MIMEText

usuario_bp = Blueprint("usuario", __name__)

@usuario_bp.route("/baja-cuenta", methods=["PUT"])
def baja_usuario():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Email y contraseña requeridos"}), 400

        usuario = Usuario.query.filter_by(email=email).first()

        if not usuario:
            return jsonify({"message": "Cuenta no encontrada"}), 404

        if usuario.rol.lower() == "administrador":
            return jsonify({"message": "No se puede desactivar una cuenta de administrador"}), 403

        if usuario.estado.lower() != "activa":
            return jsonify({"message": "Solo se pueden desactivar cuentas activas"}), 400
        
        if not check_password_hash(usuario.password, password):
            return jsonify({"message": "Contraseña incorrecta"}), 401

        usuario.estado = "desactivada"
        db.session.commit()

        return jsonify({"message": "Cuenta desactivada correctamente"}), 200

    except Exception as e:
        return jsonify({"message": "Error al desactivar cuenta", "error": str(e)}), 500


@usuario_bp.route("/usuario", methods=["GET"])
def obtener_usuario():
    email = request.args.get("email")
    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    return jsonify({
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "email": usuario.email,
        "rol": usuario.rol,
        "fecha_nacimiento": usuario.fecha_nacimiento,
        "dni_numero": usuario.dni_numero
    }), 200


@usuario_bp.route("/dni-numero-fecha-nacimiento", methods=["POST"])
def dni_numero_fecha_nacimiento():
    try:
        data = request.json
        email = data.get("email")
        dni_numero = data.get("dni_numero")
        fecha_nacimiento = data.get("fecha_nacimiento")

        if not email or not dni_numero or not fecha_nacimiento:
            return jsonify({"message": "Faltan datos"}), 400

        usuario = Usuario.query.filter_by(email=email).first()

        if not usuario:
            return jsonify({"message": "Usuario no encontrado"}), 404

        usuario.dni_numero = dni_numero
        usuario.fecha_nacimiento = fecha_nacimiento
        db.session.commit()

        return jsonify({"message": "Datos actualizados correctamente"}), 200

    except Exception as e:
        return jsonify({"message": "Error al actualizar datos", "error": str(e)}), 500

@usuario_bp.route("/dni-numero/<email>", methods=["GET"])
def obtener_dni_numero(email):
    try:
        usuario = Usuario.query.filter_by(email=email).first()

        if not usuario:
            return jsonify({"message": "Usuario no encontrado"}), 404

        return jsonify({
            "dni_numero": usuario.dni_numero,
            "fecha_nacimiento": usuario.fecha_nacimiento
        }), 200

    except Exception as e:
        return jsonify({"message": "Error al obtener datos", "error": str(e)}), 500

@usuario_bp.route("/actualizar-rol/<int:usuario_id>", methods=["PUT"])
def actualizar_rol(usuario_id):
    try:
        data = request.json
        nuevo_rol = data.get("rol")

        if not nuevo_rol:
            return jsonify({"message": "Rol requerido"}), 400

        usuario = Usuario.query.get(usuario_id)

        if not usuario:
            return jsonify({"message": "Usuario no encontrado"}), 404

        usuario.rol = nuevo_rol
        db.session.commit()

        return jsonify({"message": "Rol actualizado correctamente"}), 200

    except Exception as e:
        return jsonify({"message": "Error al actualizar rol", "error": str(e)}), 500

@usuario_bp.route("/datos-usuario/<email>", methods=["GET"])
def datos_usuario(email):
    try:
        usuario = Usuario.query.filter_by(email=email).first()

        if not usuario:
            return jsonify({"message": "Usuario no encontrado"}), 404

        return jsonify({
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "email": usuario.email,
            "rol": usuario.rol,
            "dniNumero": usuario.dni_numero,
            "fechaNacimiento": usuario.fecha_nacimiento
        }), 200

    except Exception as e:
        return jsonify({"message": "Error al obtener datos del usuario", "error": str(e)}), 500


