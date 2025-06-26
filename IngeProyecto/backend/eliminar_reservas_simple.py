"""
Script para eliminar todas las reservas
Útil para limpiar la base de datos antes de crear nuevos datos de prueba
"""
from app import app
from database import db
from database.models import Reserva

def eliminar_todas_las_reservas():
    """Elimina todas las reservas de la base de datos"""
    with app.app_context():
        try:
            # Contar reservas existentes
            count_inicial = Reserva.query.count()
            print(f"📊 Reservas actuales: {count_inicial}")
            
            if count_inicial == 0:
                print("ℹ️ No hay reservas para eliminar")
                return
            
            # Confirmar eliminación
            confirmar = input(f"¿Está seguro que desea eliminar {count_inicial} reservas? (sí/no): ")
            if confirmar.lower() not in ['sí', 'si', 'yes', 'y', 's']:
                print("❌ Operación cancelada")
                return
            
            # Eliminar todas las reservas
            Reserva.query.delete()
            db.session.commit()
            
            print(f"✅ Se eliminaron {count_inicial} reservas exitosamente!")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error al eliminar reservas: {e}")

if __name__ == "__main__":
    print("🗑️ Script de eliminación de reservas")
    eliminar_todas_las_reservas()
