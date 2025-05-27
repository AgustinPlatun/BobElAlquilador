from database import db

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(80), nullable=False)
    apellido = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(50), nullable=False)
    estado = db.Column(db.String(80), nullable=False)
    fecha_nacimiento = db.Column(db.String(10), nullable=False)
    dni_foto = db.Column(db.String(255), nullable=True)

class Maquinaria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    foto = db.Column(db.String(255), nullable=True)
    estado = db.Column(db.Boolean, nullable=False, default=True)
    cantDisponible = db.Column(db.Integer, nullable=False, default=1)
    precio = db.Column(db.Float, nullable=False)