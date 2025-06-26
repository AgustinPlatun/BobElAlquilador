from flask import Blueprint, request, jsonify
from database.models import PreguntaMaquinaria, Maquinaria, Usuario
from database import db
from datetime import datetime

preguntas_bp = Blueprint("preguntas", __name__)

@preguntas_bp.route("/preguntar-maquinaria/<codigo>", methods=["POST"])
def preguntar_maquinaria(codigo):
    try:
        data = request.json
        pregunta = data.get("pregunta")
        usuario_id = data.get("usuario_id")

        if not pregunta or not usuario_id:
            return jsonify({"message": "La pregunta y el usuario son obligatorios"}), 400

        # Verificar que el usuario existe y es cliente
        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return jsonify({"message": "Usuario no encontrado"}), 404
        
        if usuario.rol != "cliente":
            return jsonify({"message": "Solo los clientes pueden hacer preguntas"}), 403

        maquinaria = Maquinaria.query.filter_by(codigo=codigo).first()
        if not maquinaria:
            return jsonify({"message": "Maquinaria no encontrada"}), 404

        nueva_pregunta = PreguntaMaquinaria(
            pregunta=pregunta,
            usuario_id=usuario_id,
            maquinaria_id=maquinaria.id
        )

        db.session.add(nueva_pregunta)
        db.session.commit()

        return jsonify({"message": "Pregunta enviada correctamente"}), 201

    except Exception as e:
        return jsonify({"message": "Hubo un problema al enviar la pregunta", "error": str(e)}), 500

@preguntas_bp.route("/responder-pregunta/<int:pregunta_id>", methods=["POST"])
def responder_pregunta(pregunta_id):
    try:
        data = request.json
        respuesta = data.get("respuesta")
        empleado_id = data.get("empleado_id")

        if not respuesta or not empleado_id:
            return jsonify({"message": "La respuesta y el empleado son obligatorios"}), 400

        # Verificar que el empleado existe y es empleado o administrador
        empleado = Usuario.query.get(empleado_id)
        if not empleado:
            return jsonify({"message": "Empleado no encontrado"}), 404
        
        if empleado.rol not in ["empleado", "administrador"]:
            return jsonify({"message": "Solo los empleados pueden responder preguntas"}), 403

        pregunta = PreguntaMaquinaria.query.get(pregunta_id)
        if not pregunta:
            return jsonify({"message": "Pregunta no encontrada"}), 404

        if pregunta.respuesta:
            return jsonify({"message": "Esta pregunta ya tiene una respuesta"}), 400

        pregunta.respuesta = respuesta
        pregunta.empleado_id = empleado_id
        pregunta.fecha_respuesta = datetime.utcnow()

        db.session.commit()

        return jsonify({"message": "Respuesta enviada correctamente"}), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema al enviar la respuesta", "error": str(e)}), 500

@preguntas_bp.route("/preguntas-maquinaria/<codigo>", methods=["GET"])
def obtener_preguntas(codigo):
    try:
        maquinaria = Maquinaria.query.filter_by(codigo=codigo).first()
        if not maquinaria:
            return jsonify({"message": "Maquinaria no encontrada"}), 404

        preguntas = PreguntaMaquinaria.query.filter_by(maquinaria_id=maquinaria.id).order_by(PreguntaMaquinaria.fecha_pregunta.desc()).all()
        resultado = [
            {
                "id": p.id,
                "pregunta": p.pregunta,
                "respuesta": p.respuesta,
                "fecha_pregunta": p.fecha_pregunta.strftime("%Y-%m-%d %H:%M:%S"),
                "fecha_respuesta": p.fecha_respuesta.strftime("%Y-%m-%d %H:%M:%S") if p.fecha_respuesta else None,
                "usuario_id": p.usuario_id,
                "usuario_nombre": p.usuario.nombre,
                "empleado_id": p.empleado_id,
                "empleado_nombre": p.empleado.nombre if p.empleado else None
            }
            for p in preguntas
        ]

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema al obtener las preguntas", "error": str(e)}), 500
