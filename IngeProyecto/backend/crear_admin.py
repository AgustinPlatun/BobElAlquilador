from app import app
from database import db
from database.models import Usuario
from werkzeug.security import generate_password_hash

with app.app_context():
    if not Usuario.query.filter_by(email="agusplatun@hotmail.com").first():
        admin = Usuario(
            nombre="Agustin",
            apellido="Platun",
            email="agusplatun@hotmail.com",
            password=generate_password_hash("Agus123"),
            rol="administrador",
            estado="activa",  
            fecha_nacimiento="2000-01-01",
            dni_foto=" ",
            dni_numero="12365378"
        )
        db.session.add(admin)
        db.session.commit()
        print("Administrador creado correctamente.")
    else:
        print("Ya existe un usuario con ese email.")






