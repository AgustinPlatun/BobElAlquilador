import os
import re
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash
from database.models import Usuario
from database import db

empleados_bp = Blueprint('empleados', __name__)

@empleados_bp.route("/baja-empleado", methods=["PUT"])
def baja_empleado():
    try:
        data = request.json
        email = data.get("email")
        if not email:
            return jsonify({"message": "Email requerido"}), 400

        usuario = Usuario.query.filter_by(email=email).first()
        if not usuario:
            return jsonify({"message": "Empleado no encontrado"}), 404

        if usuario.rol != "empleado":
            return jsonify({"message": "El usuario no tiene rol de empleado."}), 400

        if usuario.estado != "activa":
            return jsonify({"message": "Solo se puede dar de baja a empleados activos."}), 400

        usuario.rol = "cliente"
        db.session.commit()
        return jsonify({"message": "Empleado dado de baja correctamente (rol cambiado a cliente)."}), 200

    except Exception as e:
        return jsonify({"message": "Error al dar de baja el empleado", "error": str(e)}), 500

@empleados_bp.route("/alta-empleado", methods=["PUT"])
def alta_empleado():
    try:
        data = request.json
        email = data.get("email")
        usuario = Usuario.query.filter_by(email=email).first()
        usuario.rol = "empleado"
        db.session.commit()
        return jsonify({"message": "Usuario promovido a empleado correctamente."}), 200

    except Exception as e:
        return jsonify({"message": "Error al dar de alta empleado", "error": str(e)}), 500

@empleados_bp.route("/empleados-activos", methods=["GET"])
def empleados_activos():
    empleados = Usuario.query.filter_by(rol="empleado", estado="activa").all()
    resultado = [
        {"id": e.id, "email": e.email, "nombre": e.nombre, "apellido": e.apellido}
        for e in empleados
    ]
    return jsonify(resultado), 200
