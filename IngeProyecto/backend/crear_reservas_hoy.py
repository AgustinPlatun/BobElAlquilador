from app import app
from database import db
from database.models import Reserva
from datetime import date, timedelta

with app.app_context():
    # Obtener la fecha de hoy
    hoy = date.today()
    ayer = hoy - timedelta(days=1)
    mañana = hoy + timedelta(days=1)
    
    # Crear reservas que inician hoy
    reservas_inicio_hoy = [
        Reserva(
            fecha_inicio=hoy,
            fecha_fin=hoy + timedelta(days=3),
            precio=250.0,
            usuario_id=1,  # Asegúrate de que estos IDs existan
            maquinaria_id=1
        ),
        Reserva(
            fecha_inicio=hoy,
            fecha_fin=hoy + timedelta(days=5),
            precio=180.0,
            usuario_id=2,
            maquinaria_id=2
        )
    ]
    
    # Crear reservas que finalizan hoy
    reservas_fin_hoy = [
        Reserva(
            fecha_inicio=hoy - timedelta(days=2),
            fecha_fin=hoy,
            precio=320.0,
            usuario_id=1,
            maquinaria_id=3
        ),
        Reserva(
            fecha_inicio=hoy - timedelta(days=7),
            fecha_fin=hoy,
            precio=450.0,
            usuario_id=2,
            maquinaria_id=1
        )
    ]
    
    # Agregar todas las reservas
    todas_reservas = reservas_inicio_hoy + reservas_fin_hoy
    
    for reserva in todas_reservas:
        db.session.add(reserva)
    
    try:
        db.session.commit()
        print(f"Se crearon {len(todas_reservas)} reservas de prueba:")
        print(f"- {len(reservas_inicio_hoy)} reservas que inician hoy ({hoy})")
        print(f"- {len(reservas_fin_hoy)} reservas que finalizan hoy ({hoy})")
    except Exception as e:
        db.session.rollback()
        print(f"Error al crear las reservas: {e}")
        print("Asegúrate de que existan usuarios y maquinarias con los IDs especificados")
