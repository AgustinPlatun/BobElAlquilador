from app import app
from database import db
from database.models import Reserva
from datetime import date

with app.app_context():
    reserva = Reserva(
        fecha_inicio=date(2023, 10, 20),  # Cambiar fecha
        fecha_fin=date(2023, 11, 2),     # Cambiar fecha
        precio=15.0,                    # Cambiar precio
        usuario_id=4,                     # Cambiar ID de usuario
        maquinaria_id=3                   # Cambiar ID de maquinaria
    )
    db.session.add(reserva)
    db.session.commit()
    print("Reserva creada correctamente.")
