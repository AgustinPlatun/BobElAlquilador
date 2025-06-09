from flask import Blueprint, request, jsonify
from database.models import Categoria, db

categoria_bp = Blueprint('categoria', __name__)

@categoria_bp.route('/categoria', methods=['POST'])
def crear_categoria():
    data = request.get_json()
    nombre = data.get('nombre')
    estado = data.get('estado', 'activa')

    if not nombre:
        return jsonify({'error': 'El nombre es obligatorio.'}), 400

    categoria = Categoria.query.filter_by(nombre=nombre).first()
    if categoria:
        if categoria.estado == 'desactivada':
            categoria.estado = 'activa'
            db.session.commit()
            return jsonify({'message': 'Categoría reactivada exitosamente.', 'categoria': {'id': categoria.id, 'nombre': categoria.nombre, 'estado': categoria.estado}}), 200
        else:
            return jsonify({'error': 'La categoría ya existe.'}), 400

    nueva_categoria = Categoria(nombre=nombre, estado=estado)
    db.session.add(nueva_categoria)
    db.session.commit()

    return jsonify({'message': 'Categoría creada exitosamente.', 'categoria': {'id': nueva_categoria.id, 'nombre': nueva_categoria.nombre, 'estado': nueva_categoria.estado}}), 201

@categoria_bp.route('/categoria/baja', methods=['PUT'])
def baja_categoria():
    data = request.get_json()
    nombre = data.get('nombre')

    categoria = Categoria.query.filter_by(nombre=nombre).first()
    categoria.estado = 'desactivada'
    db.session.commit()
    return jsonify({'message': 'Categoría dada de baja correctamente.'}), 200

@categoria_bp.route('/categorias-activas', methods=['GET'])
def categorias_activas():
    categorias = Categoria.query.filter_by(estado='activa').all()
    return jsonify([
        {"id": c.id, "nombre": c.nombre}
        for c in categorias
    ]), 200