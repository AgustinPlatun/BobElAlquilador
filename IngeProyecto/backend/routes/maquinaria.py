from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from database.models import Maquinaria, Categoria, Reserva, CalificacionMaquinaria, PreguntaMaquinaria
from database import db
import os
from datetime import timedelta, datetime

maquinaria_bp = Blueprint("maquinaria", __name__)
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../uploads/maquinarias_fotos')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@maquinaria_bp.route("/alta-maquinaria", methods=["POST"])
def alta_maquinaria():
    try:
        codigo = request.form.get("codigo")
        nombre = request.form.get("nombre")
        descripcion = request.form.get("descripcion")
        foto = request.files.get("foto")
        precio = request.form.get("precio")
        politicas_reembolso = request.form.get("politicas_reembolso")
        categoria_id = request.form.get("categoria_id")

        if not codigo or not nombre or not descripcion or not foto or not precio:
            return jsonify({"message": "Todos los campos son obligatorios"}), 400

        existente = Maquinaria.query.filter_by(codigo=codigo).first()
        if existente:
            if existente.estado:  # Si está activa
                return jsonify({"message": "Ya existe una maquinaria con ese código."}), 400
            else:  # Si está inactiva
                return jsonify({
                    "message": f"Existe una maquinaria inactiva con ese código: {existente.nombre}. ¿Desea reactivarla?",
                    "reactivar": True,
                    "nombre": existente.nombre
                }), 409

        try:
            precio = float(precio)
        except ValueError:
            return jsonify({"message": "El precio debe ser un número válido"}), 400

        # Validar categoría si se envía
        if categoria_id:
            categoria = Categoria.query.get(categoria_id)
            if not categoria:
                return jsonify({"message": "La categoría no existe"}), 400
        else:
            categoria_id = None

        filename = secure_filename(foto.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        foto.save(filepath)

        nueva_maquinaria = Maquinaria(
            codigo=codigo,
            nombre=nombre,
            descripcion=descripcion,
            foto=filename,
            precio=precio,
            estado=True,
            politicas_reembolso=politicas_reembolso,
            categoria_id=categoria_id
        )
        db.session.add(nueva_maquinaria)
        db.session.commit()

        return jsonify({"message": "Maquinaria dada de alta correctamente"}), 201

    except Exception as e:
        return jsonify({"message": "Hubo un problema al dar de alta la maquinaria", "error": str(e)}), 500

@maquinaria_bp.route("/maquinarias", methods=["GET"])
def obtener_maquinarias():
    try:
        maquinarias = Maquinaria.query.filter_by(estado=True).all()
        resultado = [
            {
                "id": maquinaria.id,
                "codigo": maquinaria.codigo,
                "nombre": maquinaria.nombre,
                "descripcion": maquinaria.descripcion,
                "foto": maquinaria.foto,
                "precio": maquinaria.precio,
                "politicas_reembolso": maquinaria.politicas_reembolso,
                "categoria_id": maquinaria.categoria_id,
                "categoria": maquinaria.categoria.nombre if maquinaria.categoria else None
            }
            for maquinaria in maquinarias
        ]
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"message": "Hubo un problema al obtener las maquinarias", "error": str(e)}), 500

@maquinaria_bp.route("/baja-maquinaria", methods=["PUT"])
def baja_maquinaria():
    try:
        data = request.json
        codigo = data.get("codigo")
        maquinaria = Maquinaria.query.filter_by(codigo=codigo).first()

        maquinaria.estado = False  # Baja lógica
        db.session.commit()

        return jsonify({"message": "Maquinaria dada de baja correctamente", "nombre": maquinaria.nombre}), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema al dar de baja la maquinaria", "error": str(e)}), 500

@maquinaria_bp.route("/editar-maquinaria/<codigo>", methods=["PUT"])
def editar_maquinaria(codigo):
    try:
        maquinaria = Maquinaria.query.filter_by(codigo=codigo).first()
        if not maquinaria:
            return jsonify({"message": "Maquinaria no encontrada"}), 404

        nombre = request.form.get("nombre")
        descripcion = request.form.get("descripcion")
        precio = request.form.get("precio")
        foto = request.files.get("foto")
        politicas_reembolso = request.form.get("politicas_reembolso")
        categoria_id = request.form.get("categoria_id")

        if not nombre or not descripcion or not precio:
            return jsonify({"message": "Todos los campos son obligatorios"}), 400

        maquinaria.nombre = nombre
        maquinaria.descripcion = descripcion
        maquinaria.precio = float(precio)
        maquinaria.politicas_reembolso = politicas_reembolso

        # Validar categoría si se envía
        if categoria_id:
            categoria = Categoria.query.get(categoria_id)
            if not categoria:
                return jsonify({"message": "La categoría no existe"}), 400
            maquinaria.categoria_id = categoria_id

        if foto:
            filename = secure_filename(foto.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            foto.save(filepath)
            maquinaria.foto = filename

        db.session.commit()
        return jsonify({
            "message": "Maquinaria actualizada correctamente",
            "maquinaria": {
                "nombre": maquinaria.nombre,
                "codigo": maquinaria.codigo,
                "descripcion": maquinaria.descripcion,
                "precio": maquinaria.precio,
                "foto": maquinaria.foto,
                "politicas_reembolso": maquinaria.politicas_reembolso,
                "categoria_id": maquinaria.categoria_id
            }
        }), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema al editar la maquinaria", "error": str(e)}), 500

@maquinaria_bp.route("/reactivar-maquinaria", methods=["PUT"])
def reactivar_maquinaria():
    try:
        codigo = request.form.get("codigo")
        if not codigo:
            return jsonify({"message": "El código es obligatorio"}), 400

        maquinaria = Maquinaria.query.filter_by(codigo=codigo).first()
        if not maquinaria:
            return jsonify({"message": "No existe una maquinaria con ese código"}), 404

        maquinaria.estado = True
        db.session.commit()
        return jsonify({"message": "Maquinaria reactivada correctamente"}), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema al reactivar la maquinaria", "error": str(e)}), 500

@maquinaria_bp.route("/fechas-reservadas/<codigo>", methods=["GET"])
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

@maquinaria_bp.route("/calificar-maquinaria/<codigo>", methods=["POST"])
def calificar_maquinaria(codigo):
    try:
        data = request.json
        puntaje = data.get("puntaje")
        comentario = data.get("comentario")
        usuario_id = data.get("usuario_id")

        if not puntaje or not usuario_id:
            return jsonify({"message": "El puntaje y el usuario son obligatorios"}), 400

        if not 1 <= puntaje <= 5:
            return jsonify({"message": "El puntaje debe estar entre 1 y 5"}), 400

        maquinaria = Maquinaria.query.filter_by(codigo=codigo).first()
        if not maquinaria:
            return jsonify({"message": "Maquinaria no encontrada"}), 404

        nueva_calificacion = CalificacionMaquinaria(
            puntaje=puntaje,
            comentario=comentario,
            usuario_id=usuario_id,
            maquinaria_id=maquinaria.id
        )

        db.session.add(nueva_calificacion)
        db.session.commit()

        return jsonify({"message": "Calificación agregada correctamente"}), 201

    except Exception as e:
        return jsonify({"message": "Hubo un problema al calificar la maquinaria", "error": str(e)}), 500

@maquinaria_bp.route("/calificaciones-maquinaria/<codigo>", methods=["GET"])
def obtener_calificaciones(codigo):
    try:
        maquinaria = Maquinaria.query.filter_by(codigo=codigo).first()
        if not maquinaria:
            return jsonify({"message": "Maquinaria no encontrada"}), 404

        calificaciones = CalificacionMaquinaria.query.filter_by(maquinaria_id=maquinaria.id).all()
        resultado = [
            {
                "id": cal.id,
                "puntaje": cal.puntaje,
                "comentario": cal.comentario,
                "fecha": cal.fecha.strftime("%Y-%m-%d %H:%M:%S"),
                "usuario_id": cal.usuario_id,
                "usuario_nombre": cal.usuario.nombre
            }
            for cal in calificaciones
        ]

        # Calcular promedio
        promedio = sum(cal.puntaje for cal in calificaciones) / len(calificaciones) if calificaciones else 0

        return jsonify({
            "calificaciones": resultado,
            "promedio": round(promedio, 1),
            "total_calificaciones": len(calificaciones)
        }), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema al obtener las calificaciones", "error": str(e)}), 500

@maquinaria_bp.route("/preguntar-maquinaria/<codigo>", methods=["POST"])
def preguntar_maquinaria(codigo):
    try:
        data = request.json
        pregunta = data.get("pregunta")
        usuario_id = data.get("usuario_id")

        if not pregunta or not usuario_id:
            return jsonify({"message": "La pregunta y el usuario son obligatorios"}), 400

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

@maquinaria_bp.route("/responder-pregunta/<int:pregunta_id>", methods=["POST"])
def responder_pregunta(pregunta_id):
    try:
        data = request.json
        respuesta = data.get("respuesta")
        empleado_id = data.get("empleado_id")

        if not respuesta or not empleado_id:
            return jsonify({"message": "La respuesta y el empleado son obligatorios"}), 400

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

@maquinaria_bp.route("/preguntas-maquinaria/<codigo>", methods=["GET"])
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