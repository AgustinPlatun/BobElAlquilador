from app import app
from database import db
from database.models import Maquinaria

with app.app_context():
    # CONFIGURACIÓN: Cambiar estos valores
    MAQUINARIA_ID = 4       # Cambiar ID de la maquinaria
    NUEVA_POLITICA = 60.0    # Cambiar política de reembolso (ejemplo: 15.0 para 15%)
    
    try:
        # Buscar la maquinaria por ID
        maquinaria = Maquinaria.query.get(MAQUINARIA_ID)
        
        if maquinaria:
            # Actualizar la política de reembolso
            maquinaria.politicas_reembolso = NUEVA_POLITICA
            db.session.commit()
            
            print(f"✅ Maquinaria ID {MAQUINARIA_ID} ({maquinaria.nombre}) actualizada:")
            print(f"   Nueva política de reembolso: {NUEVA_POLITICA}%")
        else:
            print(f"❌ No se encontró la maquinaria con ID {MAQUINARIA_ID}")
            
    except Exception as e:
        print(f"❌ Error al actualizar la política: {e}")
        db.session.rollback()
