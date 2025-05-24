from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from database.models import Usuario
from database import db
import os

pendientes_bp = Blueprint("pendientes", __name__)

@pendientes_bp.route("/usuarios-pendientes", methods=["GET"])
def obtener_usuarios_pendientes():
    usuarios = Usuario.query.filter_by(estado="pendiente").all()
    resultado = [
        {
            "id": u.id,
            "nombre": u.nombre,
            "apellido": u.apellido,
            "email": u.email,
            "estado": u.estado,
            "dni_foto": u.dni_foto,
            "fecha_nacimiento": u.fecha_nacimiento
        }
        for u in usuarios
    ]
    return jsonify(resultado), 200



@pendientes_bp.route("/activar-usuario/<int:usuario_id>", methods=["PUT"])
def activar_usuario(usuario_id):
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    usuario.estado = "activa"
    db.session.commit()
    return jsonify({"message": "Usuario activado"}), 200

@pendientes_bp.route("/eliminar-usuario/<int:usuario_id>", methods=["DELETE"])
def eliminar_usuario(usuario_id):
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    if usuario.dni_foto:
        dni_path = os.path.join(os.path.dirname(__file__), '../uploads/dni_clientes_fotos', usuario.dni_foto)
        if os.path.exists(dni_path):
            os.remove(dni_path)

    db.session.delete(usuario)
    db.session.commit()

    return jsonify({"message": "Usuario eliminado"}), 200

