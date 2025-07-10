from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from database.models import Maquinaria, Categoria, CalificacionMaquinaria, HistorialMantenimiento, Usuario
from database import db
import os
from datetime import datetime

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
            if existente.estado: 
                return jsonify({"message": "Ya existe una maquinaria con ese código."}), 400
            else:
                return jsonify({
                    "message": f"Existe una maquinaria inactiva con ese código: {existente.nombre}. ¿Desea reactivarla?",
                    "reactivar": True,
                    "nombre": existente.nombre
                }), 409

        try:
            precio = float(precio)
        except ValueError:
            return jsonify({"message": "El precio debe ser un número válido"}), 400

        # Convertir politicas_reembolso a float si se proporciona
        if politicas_reembolso:
            try:
                politicas_reembolso = float(politicas_reembolso)
            except ValueError:
                return jsonify({"message": "Las políticas de reembolso deben ser un número válido"}), 400
        else:
            politicas_reembolso = None

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

@maquinaria_bp.route("/maquinarias-todas", methods=["GET"])
def obtener_maquinarias_todas():
    try:
        maquinarias = Maquinaria.query.all()
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
                "categoria": maquinaria.categoria.nombre if maquinaria.categoria else None,
                "estado": maquinaria.estado
            }
            for maquinaria in maquinarias
        ]
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"message": "Hubo un problema al obtener todas las maquinarias", "error": str(e)}), 500

@maquinaria_bp.route('/maquinarias/<int:maquinaria_id>', methods=['GET'])
def obtener_maquinaria(maquinaria_id):
    try:
        maquinaria = Maquinaria.query.get(maquinaria_id)
        if not maquinaria:
            return jsonify({'message': 'Maquinaria no encontrada'}), 404
        return jsonify({
            'id': maquinaria.id,
            'nombre': maquinaria.nombre,
            'descripcion': maquinaria.descripcion,
            'foto': maquinaria.foto,
            'precio': maquinaria.precio,
            'codigo': maquinaria.codigo,
            'politicas_reembolso': maquinaria.politicas_reembolso,
            'categoria_id': maquinaria.categoria_id,
            'mantenimiento': maquinaria.mantenimiento
        }), 200
    except Exception as e:
        return jsonify({'message': 'Error al obtener la maquinaria', 'error': str(e)}), 500

@maquinaria_bp.route("/baja-maquinaria", methods=["PUT"])
def baja_maquinaria():
    try:
        data = request.json
        codigo = data.get("codigo")
        maquinaria = Maquinaria.query.filter_by(codigo=codigo).first()

        maquinaria.estado = False 
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
        
        # Convertir politicas_reembolso a float si se proporciona
        if politicas_reembolso:
            try:
                maquinaria.politicas_reembolso = float(politicas_reembolso)
            except ValueError:
                return jsonify({"message": "Las políticas de reembolso deben ser un número válido"}), 400
        else:
            maquinaria.politicas_reembolso = None

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

@maquinaria_bp.route("/calificar-maquinaria/<codigo>", methods=["POST"])
def calificar_maquinaria(codigo):
    try:
        data = request.json
        puntaje = data.get("puntaje")
        comentario = data.get("comentario")
        usuario_id = data.get("usuario_id")
        reserva_id = data.get("reserva_id")

        if not puntaje or not usuario_id or not reserva_id:
            return jsonify({"message": "El puntaje, usuario y reserva son obligatorios"}), 400

        if not 1 <= puntaje <= 5:
            return jsonify({"message": "El puntaje debe estar entre 1 y 5"}), 400

        maquinaria = Maquinaria.query.filter_by(codigo=codigo).first()
        if not maquinaria:
            return jsonify({"message": "Maquinaria no encontrada"}), 404

        # Verificar que la reserva existe y pertenece al usuario
        from database.models import Reserva
        reserva = Reserva.query.filter_by(id=reserva_id, usuario_id=usuario_id).first()
        if not reserva:
            return jsonify({"message": "Reserva no encontrada o no pertenece al usuario"}), 404

        # Verificar que la reserva no esté ya valorada
        if reserva.valorado:
            return jsonify({"message": "Esta reserva ya fue valorada"}), 400

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

@maquinaria_bp.route('/maquinarias-en-mantenimiento', methods=['GET'])
def maquinarias_en_mantenimiento():
    try:
        maquinarias = Maquinaria.query.filter_by(mantenimiento=True).all()
        resultado = []
        for m in maquinarias:
            resultado.append({
                'id': m.id,
                'codigo': m.codigo,
                'nombre': m.nombre,
                'descripcion': m.descripcion,
                'foto': m.foto,
                'estado': m.estado,
                'mantenimiento': m.mantenimiento,
                'categoria_id': m.categoria_id,
                'precio': m.precio
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'message': 'Error al obtener maquinarias en mantenimiento', 'error': str(e)}), 500

@maquinaria_bp.route('/sacar-de-mantenimiento/<int:maquinaria_id>', methods=['PUT'])
def sacar_de_mantenimiento(maquinaria_id):
    try:
        data = request.get_json()
        descripcion = data.get('descripcion')
        empleado_id = data.get('empleado_id')
        if not descripcion or not empleado_id:
            return jsonify({'message': 'Faltan datos requeridos'}), 400
        maquinaria = Maquinaria.query.get(maquinaria_id)
        if not maquinaria or not maquinaria.mantenimiento:
            return jsonify({'message': 'Maquinaria no encontrada o no está en mantenimiento'}), 404
        # Registrar mantenimiento
        mantenimiento = HistorialMantenimiento(
            descripcion=descripcion,
            empleado_id=empleado_id,
            maquinaria_id=maquinaria_id
        )
        maquinaria.mantenimiento = False
        db.session.add(mantenimiento)
        db.session.commit()
        return jsonify({'message': 'Maquinaria sacada de mantenimiento y mantenimiento registrado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al sacar de mantenimiento', 'error': str(e)}), 500

@maquinaria_bp.route('/maquinarias/<int:maquinaria_id>/poner-en-mantenimiento', methods=['PUT'])
def poner_en_mantenimiento(maquinaria_id):
    try:
        maquinaria = Maquinaria.query.get(maquinaria_id)
        if not maquinaria:
            return jsonify({'message': 'Maquinaria no encontrada'}), 404
        maquinaria.mantenimiento = True
        db.session.commit()
        return jsonify({'message': 'Maquinaria puesta en mantenimiento'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al poner en mantenimiento', 'error': str(e)}), 500