from database import db
from datetime import datetime

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
    dni_numero = db.Column(db.String(20), nullable=False)

class Maquinaria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    foto = db.Column(db.String(255), nullable=True)
    estado = db.Column(db.Boolean, nullable=False, default=True)
    precio = db.Column(db.Float, nullable=False)
    politicas_reembolso = db.Column(db.String(255), nullable=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.id'), nullable=True)
    categoria = db.relationship('Categoria', backref='maquinarias')
    calificaciones = db.relationship('CalificacionMaquinaria', backref='maquinaria', lazy=True)

class Categoria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    estado = db.Column(db.String(80), nullable=False, default='activa')

class Reserva(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date, nullable=False)
    precio = db.Column(db.Float, nullable=False)
    estado = db.Column(db.String(50), nullable=False, default='esperando_retiro')
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    usuario = db.relationship('Usuario', backref='reservas')
    maquinaria_id = db.Column(db.Integer, db.ForeignKey('maquinaria.id'), nullable=False)
    maquinaria = db.relationship('Maquinaria', backref='reservas')

class CalificacionMaquinaria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    puntaje = db.Column(db.Integer, nullable=False)  # 1-5 estrellas
    comentario = db.Column(db.Text, nullable=True)
    fecha = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    usuario = db.relationship('Usuario', backref='calificaciones')
    maquinaria_id = db.Column(db.Integer, db.ForeignKey('maquinaria.id'), nullable=False)

class PreguntaMaquinaria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pregunta = db.Column(db.Text, nullable=False)
    respuesta = db.Column(db.Text, nullable=True)
    fecha_pregunta = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    fecha_respuesta = db.Column(db.DateTime, nullable=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    usuario = db.relationship('Usuario', foreign_keys=[usuario_id], backref='preguntas')
    empleado_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    empleado = db.relationship('Usuario', foreign_keys=[empleado_id], backref='respuestas')
    maquinaria_id = db.Column(db.Integer, db.ForeignKey('maquinaria.id'), nullable=False)
    maquinaria = db.relationship('Maquinaria', backref='preguntas')

class HistorialMantenimiento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    descripcion = db.Column(db.Text, nullable=False)
    fecha = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    empleado_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    empleado = db.relationship('Usuario', backref='mantenimientos')
    maquinaria_id = db.Column(db.Integer, db.ForeignKey('maquinaria.id'), nullable=False)
    maquinaria = db.relationship('Maquinaria', backref='historial_mantenimiento')

class TicketSoporteTecnico(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contacto = db.Column(db.String(255), nullable=False)  # Email o teléfono
    asunto = db.Column(db.String(255), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    estado = db.Column(db.String(50), nullable=False, default='Pendiente')  # Pendiente, En proceso, Resuelto
    fecha_creacion = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)