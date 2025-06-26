from flask import Blueprint, request, jsonify
from database.models import HistorialMantenimiento, Maquinaria
from database import db

mantenimiento_bp = Blueprint("mantenimiento", __name__)

@mantenimiento_bp.route("/agregar-mantenimiento/<codigo>", methods=["POST"])
def agregar_mantenimiento(codigo):
    try:
        data = request.json
        descripcion = data.get("descripcion")
        empleado_id = data.get("empleado_id")

        if not descripcion or not empleado_id:
            return jsonify({"message": "La descripción y el empleado son obligatorios"}), 400

        maquinaria = Maquinaria.query.filter_by(codigo=codigo).first()
        if not maquinaria:
            return jsonify({"message": "Maquinaria no encontrada"}), 404

        nuevo_mantenimiento = HistorialMantenimiento(
            descripcion=descripcion,
            empleado_id=empleado_id,
            maquinaria_id=maquinaria.id
        )

        db.session.add(nuevo_mantenimiento)
        db.session.commit()

        return jsonify({"message": "Mantenimiento registrado correctamente"}), 201

    except Exception as e:
        return jsonify({"message": "Hubo un problema al registrar el mantenimiento", "error": str(e)}), 500

@mantenimiento_bp.route("/historial-mantenimiento/<codigo>", methods=["GET"])
def obtener_historial_mantenimiento(codigo):
    try:
        maquinaria = Maquinaria.query.filter_by(codigo=codigo).first()
        if not maquinaria:
            return jsonify({"message": "Maquinaria no encontrada"}), 404

        historial = HistorialMantenimiento.query.filter_by(maquinaria_id=maquinaria.id).order_by(HistorialMantenimiento.fecha.desc()).all()
        resultado = [
            {
                "id": h.id,
                "descripcion": h.descripcion,
                "fecha": h.fecha.strftime("%Y-%m-%d %H:%M:%S"),
                "empleado_id": h.empleado_id,
                "empleado_nombre": h.empleado.nombre
            }
            for h in historial
        ]

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema al obtener el historial de mantenimiento", "error": str(e)}), 500
