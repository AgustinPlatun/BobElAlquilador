from .auth import auth_bp
from .maquinaria import maquinaria_bp
from .verificar_cuentas import pendientes_bp
from .pagos import pagos_bp 

def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(maquinaria_bp)
    app.register_blueprint(pendientes_bp)
    app.register_blueprint(pagos_bp)