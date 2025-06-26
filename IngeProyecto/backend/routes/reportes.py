from flask import Blueprint, jsonify, request
from database.models import Reserva, Maquinaria
from database import db
from datetime import datetime
from sqlalchemy import extract, func

reportes_bp = Blueprint("reportes", __name__)

@reportes_bp.route("/ingresos-mensuales/<int:anio>", methods=["GET"])
def obtener_ingresos_mensuales(anio):
    try:
        # Obtener parámetro de categoría opcional
        categoria_id = request.args.get('categoria_id', type=int)
        
        # Base query
        query = db.session.query(
            extract('month', Reserva.fecha_inicio).label('mes'),
            func.sum(Reserva.precio).label('total'),
            func.count(Reserva.id).label('cantidad_reservas')
        ).filter(
            extract('year', Reserva.fecha_inicio) == anio
        )
        
        # Agregar filtro por categoría si se especifica
        if categoria_id:
            query = query.join(Maquinaria).filter(Maquinaria.categoria_id == categoria_id)
        
        ingresos_mensuales = query.group_by(
            extract('month', Reserva.fecha_inicio)
        ).order_by(
            extract('month', Reserva.fecha_inicio)
        ).all()
        
        # Crear diccionario con todos los meses (incluso los que no tienen ingresos)
        meses = {
            1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril', 5: 'Mayo', 6: 'Junio',
            7: 'Julio', 8: 'Agosto', 9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
        }
        
        resultado = []
        for mes_num in range(1, 13):
            mes_data = next((item for item in ingresos_mensuales if item.mes == mes_num), None)
            resultado.append({
                "mes": mes_num,
                "mes_nombre": meses[mes_num],
                "total": float(mes_data.total) if mes_data else 0,
                "cantidad_reservas": int(mes_data.cantidad_reservas) if mes_data else 0
            })
        
        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema al obtener los ingresos mensuales", "error": str(e)}), 500

@reportes_bp.route("/ingresos-anuales", methods=["GET"])
def obtener_ingresos_anuales():
    try:
        # Obtener parámetro de categoría opcional
        categoria_id = request.args.get('categoria_id', type=int)
        
        # Base query
        query = db.session.query(
            extract('year', Reserva.fecha_inicio).label('anio'),
            func.sum(Reserva.precio).label('total'),
            func.count(Reserva.id).label('cantidad_reservas')
        )
        
        # Agregar filtro por categoría si se especifica
        if categoria_id:
            query = query.join(Maquinaria).filter(Maquinaria.categoria_id == categoria_id)
        
        ingresos_anuales = query.group_by(
            extract('year', Reserva.fecha_inicio)
        ).order_by(
            extract('year', Reserva.fecha_inicio).desc()
        ).all()
        
        resultado = []
        for item in ingresos_anuales:
            resultado.append({
                "anio": int(item.anio),
                "total": float(item.total),
                "cantidad_reservas": int(item.cantidad_reservas)
            })
        
        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema al obtener los ingresos anuales", "error": str(e)}), 500

@reportes_bp.route("/anios-disponibles", methods=["GET"])
def obtener_anios_disponibles():
    """Obtiene el rango de años desde la reserva más antigua hasta el año actual"""
    try:
        # Obtener el año de la reserva más antigua y más reciente
        resultado = db.session.query(
            func.min(func.extract('year', Reserva.fecha_inicio)).label('anio_minimo'),
            func.max(func.extract('year', Reserva.fecha_inicio)).label('anio_maximo')
        ).first()

        if resultado.anio_minimo is None:
            # No hay reservas, retornar solo el año actual
            anio_actual = datetime.now().year
            return jsonify({
                "anio_minimo": anio_actual,
                "anio_maximo": anio_actual
            })

        return jsonify({
            "anio_minimo": int(resultado.anio_minimo),
            "anio_maximo": max(int(resultado.anio_maximo), datetime.now().year)
        })

    except Exception as e:
        return jsonify({"message": "Hubo un problema al obtener los años disponibles", "error": str(e)}), 500
