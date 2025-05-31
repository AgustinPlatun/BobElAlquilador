from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from database.models import Maquinaria
from database import db
import os

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

        filename = secure_filename(foto.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        foto.save(filepath)

        nueva_maquinaria = Maquinaria(
            codigo=codigo,
            nombre=nombre,
            descripcion=descripcion,
            foto=filename,
            precio=precio,
            estado=True
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
                "precio": maquinaria.precio
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
        if not codigo:
            return jsonify({"message": "El código de la maquinaria es obligatorio"}), 400

        maquinaria = Maquinaria.query.filter_by(codigo=codigo).first()
        if not maquinaria:
            return jsonify({"message": "La maquinaria no existe"}), 404

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

        if not nombre or not descripcion or not precio:
            return jsonify({"message": "Todos los campos son obligatorios"}), 400

        maquinaria.nombre = nombre
        maquinaria.descripcion = descripcion
        maquinaria.precio = float(precio)
        if foto:
            filename = secure_filename(foto.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            foto.save(filepath)
            maquinaria.foto = filename

        db.session.commit()
        # Devuelve el objeto actualizado
        return jsonify({
            "message": "Maquinaria actualizada correctamente",
            "maquinaria": {
                "nombre": maquinaria.nombre,
                "codigo": maquinaria.codigo,
                "descripcion": maquinaria.descripcion,
                "precio": maquinaria.precio,
                "foto": maquinaria.foto
            }
        }), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema al editar la maquinaria", "error": str(e)}), 500

# Nuevo endpoint para reactivar maquinaria
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