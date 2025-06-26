from flask import Blueprint, jsonify
from database.models import Reserva, Usuario, Maquinaria
from datetime import datetime, timedelta

reservas_bp = Blueprint("reservas", __name__)

@reservas_bp.route("/mis-reservas/<int:usuario_id>", methods=["GET"])
def obtener_mis_reservas(usuario_id):
    try:
        # Verificar que el usuario existe
        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return jsonify({"message": "Usuario no encontrado"}), 404

        # Obtener todas las reservas del usuario
        reservas = Reserva.query.filter_by(usuario_id=usuario_id).order_by(Reserva.fecha_inicio.desc()).all()
        
        resultado = []
        for reserva in reservas:
            # Calcular duración en días
            duracion_dias = (reserva.fecha_fin - reserva.fecha_inicio).days + 1
            
            resultado.append({
                "id": reserva.id,
                "maquinaria_id": reserva.maquinaria_id,
                "maquinaria_codigo": reserva.maquinaria.codigo,
                "maquinaria_nombre": reserva.maquinaria.nombre,
                "maquinaria_foto": reserva.maquinaria.foto,
                "fecha_inicio": reserva.fecha_inicio.strftime("%Y-%m-%d"),
                "fecha_fin": reserva.fecha_fin.strftime("%Y-%m-%d"),
                "duracion_dias": duracion_dias,
                "precio_total": reserva.precio,
                "precio_por_dia": round(reserva.precio / duracion_dias, 2) if duracion_dias > 0 else 0,
                "estado": "Completada" if reserva.fecha_fin < datetime.now().date() else "Activa"
            })

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema al obtener las reservas", "error": str(e)}), 500

@reservas_bp.route("/fechas-reservadas/<codigo>", methods=["GET"])
def fechas_reservadas(codigo):
    maquinaria = Maquinaria.query.filter_by(codigo=codigo).first()
    if not maquinaria:
        return jsonify([])

    reservas = Reserva.query.filter_by(maquinaria_id=maquinaria.id).all()
    fechas = []
    for reserva in reservas:
        dia = reserva.fecha_inicio
        while dia <= reserva.fecha_fin:
            fechas.append(dia.strftime("%Y-%m-%d"))
            dia += timedelta(days=1)
    return jsonify(fechas)
