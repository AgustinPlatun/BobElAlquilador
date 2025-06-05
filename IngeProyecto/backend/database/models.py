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

class Categoria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    estado = db.Column(db.String(80), nullable=False, default='activa')

class Reserva(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date, nullable=False)
    precio = db.Column(db.Float, nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    usuario = db.relationship('Usuario', backref='reservas')
    maquinaria_id = db.Column(db.Integer, db.ForeignKey('maquinaria.id'), nullable=False)
    maquinaria = db.relationship('Maquinaria', backref='reservas')