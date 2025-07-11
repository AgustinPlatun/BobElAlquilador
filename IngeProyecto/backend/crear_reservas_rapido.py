from app import app
from database import db
from database.models import Reserva
from datetime import date

with app.app_context():
    reserva = Reserva(
        fecha_inicio=date(2025, 7, 10),  # Cambiar fecha
        fecha_fin=date(2025, 7, 15),     # Cambiar fecha
        precio=15.0,                    # Cambiar precio
        usuario_id=4,                     # Cambiar ID de usuario
        maquinaria_id=3,                  # Cambiar ID de maquinaria
        estado='esperando_retiro'               # Cambiar estado (Pendiente, Confirmada, En curso, Completada, Cancelada)
    )
    db.session.add(reserva)
    db.session.commit()
    print("Reserva creada correctamente.")
