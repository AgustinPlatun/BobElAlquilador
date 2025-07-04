from flask import Blueprint, request, jsonify
from database.models import TicketSoporteTecnico, Usuario
from database import db
from datetime import datetime

soporte_bp = Blueprint("soporte", __name__)

@soporte_bp.route("/crear-ticket-soporte", methods=["POST"])
def crear_ticket_soporte():
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data.get('contacto') or not data.get('asunto') or not data.get('descripcion'):
            return jsonify({"message": "Todos los campos son obligatorios"}), 400
        
        # Obtener usuario_id si está en la sesión (opcional) - Ya no se usa
        
        # Crear nuevo ticket
        nuevo_ticket = TicketSoporteTecnico(
            contacto=data['contacto'],
            asunto=data['asunto'],
            descripcion=data['descripcion']
        )
        
        db.session.add(nuevo_ticket)
        db.session.commit()
        
        return jsonify({
            "message": "Ticket de soporte creado exitosamente",
            "ticket_id": nuevo_ticket.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error al crear el ticket de soporte", "error": str(e)}), 500

@soporte_bp.route("/tickets-soporte", methods=["GET"])
def obtener_tickets_soporte():
    try:
        # Solo obtener tickets con estado "Pendiente"
        tickets = TicketSoporteTecnico.query.filter_by(estado='Pendiente').order_by(TicketSoporteTecnico.fecha_creacion.desc()).all()
        
        resultado = []
        for ticket in tickets:
            resultado.append({
                "id": ticket.id,
                "contacto": ticket.contacto,
                "asunto": ticket.asunto,
                "descripcion": ticket.descripcion,
                "estado": ticket.estado,
                "fecha_creacion": ticket.fecha_creacion.strftime("%Y-%m-%d %H:%M:%S")
            })
        
        return jsonify(resultado), 200
        
    except Exception as e:
        return jsonify({"message": "Error al obtener los tickets", "error": str(e)}), 500

@soporte_bp.route("/actualizar-ticket-soporte/<int:ticket_id>", methods=["PUT"])
def actualizar_ticket_soporte(ticket_id):
    try:
        data = request.get_json()
        ticket = TicketSoporteTecnico.query.get(ticket_id)
        
        if not ticket:
            return jsonify({"message": "Ticket no encontrado"}), 404
        
        # Actualizar estado
        if 'estado' in data:
            ticket.estado = data['estado']
        
        db.session.commit()
        
        return jsonify({"message": "Ticket actualizado exitosamente"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error al actualizar el ticket", "error": str(e)}), 500
