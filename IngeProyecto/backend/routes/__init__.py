from .maquinaria import maquinaria_bp
from .verificar_cuentas import pendientes_bp
from .pagos import pagos_bp 
from .categoria import categoria_bp
from .clientes import clientes_bp
from .empleados import empleados_bp
from .login import login_bp
from .password import password_bp
from .register import register_bp
from .usuario import usuario_bp
from .reservas import reservas_bp
from .reportes import reportes_bp
from .preguntas import preguntas_bp
from .mantenimiento import mantenimiento_bp

def register_blueprints(app):
    app.register_blueprint(maquinaria_bp)
    app.register_blueprint(pendientes_bp)
    app.register_blueprint(pagos_bp)
    app.register_blueprint(categoria_bp)
    app.register_blueprint(clientes_bp)
    app.register_blueprint(empleados_bp)
    app.register_blueprint(login_bp)
    app.register_blueprint(password_bp)
    app.register_blueprint(register_bp)
    app.register_blueprint(usuario_bp)
    app.register_blueprint(reservas_bp)
    app.register_blueprint(reportes_bp)
    app.register_blueprint(preguntas_bp)
    app.register_blueprint(mantenimiento_bp)