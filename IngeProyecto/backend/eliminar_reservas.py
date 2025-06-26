#!/usr/bin/env python3
"""
Script simple para eliminar TODAS las reservas sin confirmación.
⚠️ CUIDADO: Este script elimina TODO inmediatamente.
"""

from app import app
from database import db
from database.models import Reserva

with app.app_context():
    try:
        # Contar reservas
        total_reservas = Reserva.query.count()
        print(f"Reservas encontradas: {total_reservas}")
        
        if total_reservas > 0:
            # Eliminar todas las reservas
            reservas_eliminadas = Reserva.query.delete()
            db.session.commit()
            print(f"✅ {reservas_eliminadas} reservas eliminadas exitosamente.")
        else:
            print("✅ No hay reservas para eliminar.")
            
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error: {str(e)}")
