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
        nombre = request.form.get("nombre")
        descripcion = request.form.get("descripcion")
        foto = request.files.get("foto")
        precio = request.form.get("precio")

        if not nombre or not descripcion or not foto or not precio:
            return jsonify({"message": "Todos los campos son obligatorios"}), 400

        try:
            precio = float(precio)
        except ValueError:
            return jsonify({"message": "El precio debe ser un número válido"}), 400

        filename = secure_filename(foto.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        foto.save(filepath)

        nueva_maquinaria = Maquinaria(
            nombre=nombre,
            descripcion=descripcion,
            foto=filename,
            precio=precio
        )
        db.session.add(nueva_maquinaria)
        db.session.commit()

        return jsonify({"message": "Maquinaria dada de alta correctamente"}), 201

    except Exception as e:
        return jsonify({"message": "Hubo un problema al dar de alta la maquinaria", "error": str(e)}), 500

@maquinaria_bp.route("/maquinarias", methods=["GET"])
def obtener_maquinarias():
    try:
        maquinarias = Maquinaria.query.all()
        resultado = [
            {
                "id": maquinaria.id,
                "nombre": maquinaria.nombre,
                "descripcion": maquinaria.descripcion,
                "foto": maquinaria.foto,
                "precio": maquinaria.precio  # Incluir el precio en la respuesta
            }
            for maquinaria in maquinarias
        ]
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"message": "Hubo un problema al obtener las maquinarias", "error": str(e)}), 500

@maquinaria_bp.route("/baja-maquinaria", methods=["DELETE"])
def baja_maquinaria():
    try:
        data = request.json
        nombre = data.get("nombre")

        if not nombre:
            return jsonify({"message": "El nombre de la maquinaria es obligatorio"}), 400

        maquinaria = Maquinaria.query.filter_by(nombre=nombre).first()

        if not maquinaria:
            return jsonify({"message": "La maquinaria no existe"}), 404

        db.session.delete(maquinaria)
        db.session.commit()

        return jsonify({"message": "Maquinaria eliminada correctamente"}), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema al eliminar la maquinaria", "error": str(e)}), 500