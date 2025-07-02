from flask import Blueprint, jsonify, request
from database.models import Reserva, Usuario, Maquinaria, Categoria
from datetime import datetime, timedelta
from sqlalchemy import and_
from database import db

reservas_bp = Blueprint("reservas", __name__)

@reservas_bp.route("/mis-reservas/<int:usuario_id>", methods=["GET"])
def obtener_mis_reservas(usuario_id):
    try:
        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return jsonify({"message": "Usuario no encontrado"}), 404
        
        reservas = Reserva.query.filter_by(usuario_id=usuario_id).order_by(Reserva.fecha_inicio.desc()).all()
        
        resultado = []
        for reserva in reservas:
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

@reservas_bp.route("/reservas-inicio-hoy", methods=["GET"])
def obtener_reservas_inicio_hoy():
    try:
        fecha_hoy = datetime.now().date()
        
        reservas = Reserva.query.join(Usuario).join(Maquinaria).join(Categoria).filter(
            Reserva.fecha_inicio == fecha_hoy
        ).order_by(Reserva.fecha_inicio.asc()).all()
        
        resultado = []
        for reserva in reservas:
            usuario = reserva.usuario
            maquinaria = reserva.maquinaria
            categoria = maquinaria.categoria
            
            resultado.append({
                "id": reserva.id,
                "fecha_inicio": reserva.fecha_inicio.strftime("%Y-%m-%d"),
                "fecha_fin": reserva.fecha_fin.strftime("%Y-%m-%d"),
                "monto_total": float(reserva.precio),
                "estado": "Confirmada",  # Puedes ajustar esto según tu lógica de estados
                "cliente_nombre": usuario.nombre,
                "cliente_apellido": usuario.apellido,
                "maquinaria_nombre": maquinaria.nombre,
                "maquinaria_marca": "",  # Campo no disponible en el modelo
                "maquinaria_modelo": "",  # Campo no disponible en el modelo
                "categoria_nombre": categoria.nombre
            })

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"message": "Error al obtener las reservas que inician hoy", "error": str(e)}), 500

@reservas_bp.route("/reservas-fin-hoy", methods=["GET"])
def obtener_reservas_fin_hoy():
    try:
        fecha_hoy = datetime.now().date()
        
        reservas = Reserva.query.join(Usuario).join(Maquinaria).join(Categoria).filter(
            Reserva.fecha_fin == fecha_hoy
        ).order_by(Reserva.fecha_fin.asc()).all()
        
        resultado = []
        for reserva in reservas:
            usuario = reserva.usuario
            maquinaria = reserva.maquinaria
            categoria = maquinaria.categoria
            
            resultado.append({
                "id": reserva.id,
                "fecha_inicio": reserva.fecha_inicio.strftime("%Y-%m-%d"),
                "fecha_fin": reserva.fecha_fin.strftime("%Y-%m-%d"),
                "monto_total": float(reserva.precio),
                "estado": "Completada",  # Las que finalizan hoy se consideran completadas
                "cliente_nombre": usuario.nombre,
                "cliente_apellido": usuario.apellido,
                "maquinaria_nombre": maquinaria.nombre,
                "maquinaria_marca": "",  # Campo no disponible en el modelo
                "maquinaria_modelo": "",  # Campo no disponible en el modelo
                "categoria_nombre": categoria.nombre
            })

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"message": "Error al obtener las reservas que finalizan hoy", "error": str(e)}), 500

@reservas_bp.route('/api/reservas/empleado-para-cliente', methods=['POST'])
def reserva_para_cliente():
    data = request.json
    email = data.get('usuario_email')
    codigo_maquinaria = data.get('codigo_maquinaria')
    fecha_inicio = data.get('fecha_inicio')
    fecha_fin = data.get('fecha_fin')
    precio = data.get('precio')
    envio = data.get('envio', False)
    direccion = data.get('direccion')

    usuario = Usuario.query.filter_by(email=email, rol='cliente').first()
    if not usuario:
        return jsonify({'error': 'El email no corresponde a un cliente válido.'}), 400
    maquinaria = Maquinaria.query.filter_by(codigo=codigo_maquinaria).first()
    if not maquinaria:
        return jsonify({'error': 'Maquinaria no encontrada.'}), 400
    try:
        reserva = Reserva(
            fecha_inicio=datetime.strptime(fecha_inicio, "%Y-%m-%d").date(),
            fecha_fin=datetime.strptime(fecha_fin, "%Y-%m-%d").date(),
            precio=precio,
            usuario_id=usuario.id,
            maquinaria_id=maquinaria.id,
            estado='esperando_retiro'
        )
        db.session.add(reserva)
        db.session.commit()
        return jsonify({'message': 'Reserva creada exitosamente para el cliente.'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al crear la reserva.', 'detalle': str(e)}), 500
