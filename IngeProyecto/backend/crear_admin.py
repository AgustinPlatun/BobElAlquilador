from app import app
from database import db
from database.models import Usuario
from werkzeug.security import generate_password_hash

with app.app_context():
    if not Usuario.query.filter_by(email="admin@gmail.com").first():
        admin = Usuario(
            nombre="Admin",
            apellido="Principal",
            email="admin@gmail.com",
            password=generate_password_hash("Admin123"),
            rol="administrador",
            estado=True,
            fecha_nacimiento="2000-01-01", 
            dni_foto=" "  
        )
        db.session.add(admin)
        db.session.commit()
        print("Administrador creado correctamente.")
    else:
        print("Ya existe un usuario con ese email.")


with app.app_context():
    if not Usuario.query.filter_by(email="pepardo@gmail.com").first():
        admin = Usuario(
            nombre="pepardo",
            apellido="Principal",
            email="pepardo@gmail.com",
            password=generate_password_hash("Pepardo123"),
            rol="administrador",
            estado=True ,
            fecha_nacimiento="2000-01-01", 
            dni_foto=" "
        )
        db.session.add(admin)
        db.session.commit()
        print("Administrador creado correctamente.")
    else:
        print("Ya existe un usuario con ese email.")


