from flask import Blueprint, jsonify, request
from database.models import Reserva, Usuario, Maquinaria, Categoria
from datetime import datetime, timedelta
from sqlalchemy import and_
from database import db
import smtplib
from email.mime.text import MIMEText

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
                "estado": reserva.estado if hasattr(reserva, 'estado') and reserva.estado else ("Completada" if reserva.fecha_fin < datetime.now().date() else "Activa")
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

@reservas_bp.route("/reservas-esperando-retiro", methods=["GET"])
def obtener_reservas_esperando_retiro():
    try:
        fecha_hoy = datetime.now().date()
        
        # Buscar reservas con estado 'esperando_retiro' y fecha fin posterior a hoy
        reservas = Reserva.query.join(Usuario).join(Maquinaria).join(Categoria).filter(
            and_(
                Reserva.estado == 'esperando_retiro',
                Reserva.fecha_fin > fecha_hoy
            )
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
                "estado": reserva.estado,
                "cliente_nombre": usuario.nombre,
                "cliente_apellido": usuario.apellido,
                "cliente_email": usuario.email,
                "maquinaria_nombre": maquinaria.nombre,
                "maquinaria_marca": "",  # Campo no disponible en el modelo
                "maquinaria_modelo": "",  # Campo no disponible en el modelo
                "categoria_nombre": categoria.nombre
            })

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"message": "Error al obtener las reservas esperando retiro", "error": str(e)}), 500

@reservas_bp.route("/confirmar-retiro/<int:reserva_id>", methods=["PUT"])
def confirmar_retiro(reserva_id):
    try:
        # Buscar la reserva
        reserva = Reserva.query.get(reserva_id)
        if not reserva:
            return jsonify({"message": "Reserva no encontrada"}), 404
        
        # Verificar que la reserva esté en estado esperando_retiro
        if reserva.estado != 'esperando_retiro':
            return jsonify({"message": "La reserva no está en estado esperando retiro"}), 400
        
        # Cambiar el estado a esperando_devolucion
        reserva.estado = 'esperando_devolucion'
        db.session.commit()
        
        return jsonify({"message": "Retiro confirmado exitosamente"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error al confirmar el retiro", "error": str(e)}), 500

@reservas_bp.route("/reservas-esperando-devolucion", methods=["GET"])
def obtener_reservas_esperando_devolucion():
    try:
        # Buscar reservas con estado 'esperando_devolucion'
        reservas = Reserva.query.join(Usuario).join(Maquinaria).join(Categoria).filter(
            Reserva.estado == 'esperando_devolucion'
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
                "estado": reserva.estado,
                "cliente_nombre": usuario.nombre,
                "cliente_apellido": usuario.apellido,
                "cliente_email": usuario.email,
                "maquinaria_nombre": maquinaria.nombre,
                "maquinaria_marca": "",  # Campo no disponible en el modelo
                "maquinaria_modelo": "",  # Campo no disponible en el modelo
                "categoria_nombre": categoria.nombre
            })

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"message": "Error al obtener las reservas esperando devolución", "error": str(e)}), 500

@reservas_bp.route("/confirmar-devolucion/<int:reserva_id>", methods=["PUT"])
def confirmar_devolucion(reserva_id):
    try:
        # Buscar la reserva
        reserva = Reserva.query.get(reserva_id)
        if not reserva:
            return jsonify({"message": "Reserva no encontrada"}), 404
        
        # Verificar que la reserva esté en estado esperando_devolucion
        if reserva.estado != 'esperando_devolucion':
            return jsonify({"message": "La reserva no está en estado esperando devolución"}), 400
        
        # Cambiar el estado a terminada
        reserva.estado = 'terminada'
        db.session.commit()
        
        # Enviar email invitando a puntuar la maquinaria
        usuario = reserva.usuario
        email = usuario.email
        nombre = usuario.nombre
        maquinaria = reserva.maquinaria
        codigo_maquinaria = maquinaria.codigo
        asunto = "¡Contanos tu experiencia con Bob el Alquilador!"
        link_puntuar = f"http://localhost:5173/detalle-maquinaria/{codigo_maquinaria}?calificar=1"
        cuerpo = f"""
Hola {nombre},

¡Gracias por confiar en Bob el Alquilador! Queremos saber tu opinión sobre la maquinaria '{maquinaria.nombre}' que devolviste recientemente.

Por favor, hacé clic en el siguiente enlace para dejar tu calificación y comentario:
{link_puntuar}

Tu opinión nos ayuda a mejorar y a otros usuarios a elegir mejor.

¡Esperamos verte pronto de nuevo!
El equipo de Bob el Alquilador
"""
        msg = MIMEText(cuerpo, _charset="utf-8")
        msg["Subject"] = asunto
        msg["From"] = "quantumdevsunlp@gmail.com"
        msg["To"] = email
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login("quantumdevsunlp@gmail.com", "zuio rjmo duxk igbf")
                server.sendmail(msg["From"], [msg["To"]], msg.as_string())
        except Exception as e:
            pass
        return jsonify({"message": "Devolución confirmada exitosamente"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error al confirmar la devolución", "error": str(e)}), 500

@reservas_bp.route("/cancelar-reserva/<int:reserva_id>", methods=["PUT"])
def cancelar_reserva(reserva_id):
    try:
        reserva = Reserva.query.get(reserva_id)
        if not reserva:
            return jsonify({"message": "Reserva no encontrada"}), 404
        
        # Verificar que la reserva se pueda cancelar (más de 1 día antes del retiro)
        from datetime import date
        hoy = date.today()
        diferencia_dias = (reserva.fecha_inicio - hoy).days
        
        if diferencia_dias <= 1:
            return jsonify({"message": "No se puede cancelar la reserva. Debe hacerlo con más de 1 día de anticipación"}), 400
        
        # Verificar que la reserva esté en un estado cancelable
        if reserva.estado not in ['esperando_retiro', 'Activa']:
            return jsonify({"message": "La reserva no se puede cancelar en su estado actual"}), 400
        
        # Cambiar el estado a cancelada
        reserva.estado = 'cancelada'
        db.session.commit()
        
        # Calcular monto a devolver según política de reembolso
        monto_total = reserva.precio
        politica = float(reserva.maquinaria.politicas_reembolso) if reserva.maquinaria.politicas_reembolso is not None else 0
        monto_reembolso = monto_total * (politica / 100)
        # Enviar email al usuario
        usuario = reserva.usuario
        email = usuario.email
        nombre = usuario.nombre
        asunto = "Cancelación de reserva registrada - Bob el Alquilador"
        cuerpo = f"""
Hola {nombre},

Te contactamos de Bob el Alquilador para informarte que se registró la cancelación de tu reserva de la maquinaria '{reserva.maquinaria.nombre}'.

De acuerdo a nuestra política de cancelación, se te reembolsará el monto de ${monto_reembolso:.2f}.

Por favor, comunicate con nosotros para coordinar cómo se realizará el reembolso:
Dirección: Carlos Pelegrini 123, Buenos Aires
📞 Teléfono: (011) 1234-5678
✉️ Email: bobelalquilador@gmail.com

¡Gracias por confiar en nosotros!
El equipo de Bob el Alquilador
"""
        msg = MIMEText(cuerpo, _charset="utf-8")
        msg["Subject"] = asunto
        msg["From"] = "quantumdevsunlp@gmail.com"
        msg["To"] = email
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login("quantumdevsunlp@gmail.com", "zuio rjmo duxk igbf")
                server.sendmail(msg["From"], [msg["To"]], msg.as_string())
        except Exception as e:
            pass
        return jsonify({
            "message": "Reserva cancelada exitosamente",
            "maquinaria_nombre": reserva.maquinaria.nombre,
            "politica_reembolso": politica,
            "monto_reembolso": monto_reembolso
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error al cancelar la reserva", "error": str(e)}), 500

@reservas_bp.route("/info-cancelacion/<int:reserva_id>", methods=["GET"])
def obtener_info_cancelacion(reserva_id):
    try:
        reserva = Reserva.query.get(reserva_id)
        if not reserva:
            return jsonify({"message": "Reserva no encontrada"}), 404
        
        # Verificar que la reserva se pueda cancelar (más de 1 día antes del retiro)
        from datetime import date
        hoy = date.today()
        diferencia_dias = (reserva.fecha_inicio - hoy).days
        
        if diferencia_dias <= 1:
            return jsonify({"message": "No se puede cancelar la reserva. Debe hacerlo con más de 1 día de anticipación"}), 400
        
        # Verificar que la reserva esté en un estado cancelable
        if reserva.estado not in ['esperando_retiro', 'Activa']:
            return jsonify({"message": "La reserva no se puede cancelar en su estado actual"}), 400
        
        return jsonify({
            "maquinaria_nombre": reserva.maquinaria.nombre,
            "politica_reembolso": reserva.maquinaria.politicas_reembolso if reserva.maquinaria.politicas_reembolso is not None else 0
        }), 200

    except Exception as e:
        return jsonify({"message": "Error al obtener información de cancelación", "error": str(e)}), 500

@reservas_bp.route("/reservas-futuras-maquinaria/<int:maquinaria_id>", methods=["GET"])
def reservas_futuras_maquinaria(maquinaria_id):
    try:
        from datetime import date
        hoy = date.today()
        reservas = Reserva.query.filter(
            Reserva.maquinaria_id == maquinaria_id,
            Reserva.fecha_fin >= hoy
        ).join(Usuario).order_by(Reserva.fecha_inicio.asc()).all()
        resultado = []
        for reserva in reservas:
            usuario = reserva.usuario
            resultado.append({
                "id": reserva.id,
                "fecha_inicio": reserva.fecha_inicio.strftime("%Y-%m-%d"),
                "fecha_fin": reserva.fecha_fin.strftime("%Y-%m-%d"),
                "usuario_nombre": usuario.nombre,
                "usuario_apellido": usuario.apellido,
                "usuario_email": usuario.email,
                "estado": reserva.estado
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener reservas futuras de la maquinaria", "error": str(e)}), 500

@reservas_bp.route("/cancelar-reserva-empleado/<int:reserva_id>", methods=["PUT"])
def cancelar_reserva_empleado(reserva_id):
    try:
        reserva = Reserva.query.get(reserva_id)
        if not reserva:
            return jsonify({"message": "Reserva no encontrada"}), 404
        from datetime import date
        hoy = date.today()
        diferencia_dias = (reserva.fecha_inicio - hoy).days
        if diferencia_dias < 1:
            return jsonify({"message": "No se puede cancelar la reserva. Debe hacerlo al menos 1 día antes"}), 400
        if reserva.estado not in ['esperando_retiro', 'Activa']:
            return jsonify({"message": "La reserva no se puede cancelar en su estado actual"}), 400
        reserva.estado = 'cancelada'
        db.session.commit()
        monto_total = reserva.precio
        politica = float(reserva.maquinaria.politicas_reembolso) if reserva.maquinaria.politicas_reembolso is not None else 0
        monto_reembolso = monto_total * (politica / 100)
        usuario = reserva.usuario
        email = usuario.email
        nombre = usuario.nombre
        asunto = "Cancelación de reserva por inconvenientes - Bob el Alquilador"
        cuerpo = f"""
Hola {nombre},

Lamentamos informarte que, por problemas internos de la empresa, tuvimos que cancelar tu reserva de la maquinaria '{reserva.maquinaria.nombre}'.

De acuerdo a nuestra política de cancelación, se te reembolsará el monto de ${monto_reembolso:.2f}.

Por favor, comunicate con nosotros para coordinar cómo se realizará el reembolso:
Dirección: Carlos Pelegrini 123, Buenos Aires
📞 Teléfono: (011) 1234-5678
✉️ Email: bobelalquilador@gmail.com

Pedimos disculpas por los inconvenientes ocasionados.
El equipo de Bob el Alquilador
"""
        msg = MIMEText(cuerpo, _charset="utf-8")
        msg["Subject"] = asunto
        msg["From"] = "quantumdevsunlp@gmail.com"
        msg["To"] = email
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login("quantumdevsunlp@gmail.com", "zuio rjmo duxk igbf")
                server.sendmail(msg["From"], [msg["To"]], msg.as_string())
        except Exception as e:
            pass
        return jsonify({
            "message": "Reserva cancelada exitosamente por empleado",
            "maquinaria_nombre": reserva.maquinaria.nombre,
            "politica_reembolso": politica,
            "monto_reembolso": monto_reembolso
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error al cancelar la reserva por empleado", "error": str(e)}), 500
