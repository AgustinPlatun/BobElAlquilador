from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from database.models import Usuario
from database import db
from werkzeug.security import check_password_hash
import os
import re
from itsdangerous import URLSafeTimedSerializer
from flask import current_app
import smtplib
from email.mime.text import MIMEText

auth_bp = Blueprint("auth", __name__)

def generar_token(email):
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return s.dumps(email, salt='recuperar-password')

def validar_token(token, max_age=600):
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = s.loads(token, salt='recuperar-password', max_age=max_age)
    except Exception:
        return None
    return email

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        nombre = request.form.get("nombre")
        apellido = request.form.get("apellido")
        email = request.form.get("email")
        password = request.form.get("password")
        fecha_nacimiento = request.form.get("fecha_nacimiento")
        dni_foto = request.files.get("dni_foto")
        rol = "cliente" 
        estado = "pendiente"

        if not nombre or not apellido or not email or not password or not fecha_nacimiento or not dni_foto:
            return jsonify({"message": "Faltan datos"}), 400

        # Guardar la foto y definir dni_filename ANTES de actualizar usuario existente
        dni_folder = os.path.join(os.path.dirname(__file__), '../uploads/dni_clientes_fotos')
        os.makedirs(dni_folder, exist_ok=True)
        dni_filename = secure_filename(dni_foto.filename)
        dni_filepath = os.path.join(dni_folder, dni_filename)
        dni_foto.save(dni_filepath)

        usuario_existente = Usuario.query.filter_by(email=email).first()
        if usuario_existente:
            if usuario_existente.estado == "rechazado":
                # Permitir re-registro: actualizar datos y poner estado en pendiente
                usuario_existente.nombre = nombre
                usuario_existente.apellido = apellido
                usuario_existente.password = generate_password_hash(password)
                usuario_existente.fecha_nacimiento = fecha_nacimiento
                usuario_existente.dni_foto = dni_filename
                usuario_existente.estado = "pendiente"
                usuario_existente.rol = "cliente"
                db.session.commit()
                return jsonify({"message": "Registro actualizado correctamente. Tu cuenta será revisada nuevamente."}), 200
            else:
                return jsonify({"message": "El email ya está registrado"}), 400

        hashed_password = generate_password_hash(password)

        nuevo_usuario = Usuario(
            nombre=nombre,
            apellido=apellido,
            email=email,
            password=hashed_password,
            estado=estado,
            rol=rol,
            fecha_nacimiento=fecha_nacimiento,
            dni_foto=dni_filename,
        )
        db.session.add(nuevo_usuario)
        db.session.commit()

        return jsonify({"message": "Usuario registrado correctamente"}), 201

    except Exception as e:
        return jsonify({"message": "Hubo un problema con el registro", "error": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        usuario = Usuario.query.filter_by(email=email).first()

        if not usuario or not check_password_hash(usuario.password, password) or usuario.estado.lower() == "desactivada":
            return jsonify({"message": "Datos incorrectos"}), 401

        if usuario.estado.lower() == "pendiente":
            return jsonify({"message": "Tu cuenta aún no ha sido activada."}), 403

        return jsonify({
            "message": "Inicio de sesión exitoso",
            "nombre": usuario.nombre,
            "rol": usuario.rol
        }), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema con el inicio de sesión", "error": str(e)}), 500

@auth_bp.route("/registrar-empleado", methods=["POST"])
def registrar_empleado():
    try:
        data = request.json
        nombre = data.get("nombre")
        apellido = data.get("apellido")
        email = data.get("email")
        password = data.get("password")
        fecha_nacimiento = data.get("fecha_nacimiento")
        rol = "empleado"
        estado = "activa"

        if not nombre or not apellido or not email or not password or not fecha_nacimiento:
            return jsonify({"message": "Faltan datos"}), 400

        if Usuario.query.filter_by(email=email).first():
            return jsonify({"message": "El email ya está registrado"}), 400

        hashed_password = generate_password_hash(password)

        nuevo_empleado = Usuario(
            nombre=nombre,
            apellido=apellido,
            email=email,
            password=hashed_password,
            estado=estado,
            rol=rol,
            fecha_nacimiento=fecha_nacimiento,
            dni_foto=None 
        )
        db.session.add(nuevo_empleado)
        db.session.commit()

        return jsonify({"message": "Empleado registrado correctamente"}), 201

    except Exception as e:
        print("Error al registrar empleado:", e)
        return jsonify({"message": "Hubo un problema con el registro del empleado", "error": str(e)}), 500
    
@auth_bp.route("/registrar-cliente", methods=["POST"])
def registrar_cliente():
    try:
        data = request.json
        nombre = data.get("nombre")
        apellido = data.get("apellido")
        email = data.get("email")
        password = data.get("password")
        fecha_nacimiento = data.get("fecha_nacimiento")
        rol = "cliente"
        estado = "pendiente"

        if not nombre or not apellido or not email or not password or not fecha_nacimiento:
            return jsonify({"message": "Faltan datos"}), 400

        if Usuario.query.filter_by(email=email).first():
            return jsonify({"message": "El email ya está registrado"}), 400

        hashed_password = generate_password_hash(password)

        nuevo_cliente = Usuario(
            nombre=nombre,
            apellido=apellido,
            email=email,
            password=hashed_password,
            estado=estado,
            rol=rol,
            fecha_nacimiento=fecha_nacimiento,
            dni_foto=None
        )
        db.session.add(nuevo_cliente)
        db.session.commit()

        return jsonify({"message": "Cliente registrado correctamente"}), 201

    except Exception as e:
        print("Error al registrar cliente:", e)
        return jsonify({"message": "Hubo un problema con el registro del cliente", "error": str(e)}), 500





@auth_bp.route("/baja-cuenta", methods=["PUT"])
def baja_usuario():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")  # Nuevo: obtener contraseña

        if not email or not password:
            return jsonify({"message": "Email y contraseña requeridos"}), 400

        usuario = Usuario.query.filter_by(email=email).first()

        if not usuario:
            return jsonify({"message": "Cuenta no encontrada"}), 404

        if usuario.rol.lower() == "administrador":
            return jsonify({"message": "No se puede desactivar una cuenta de administrador"}), 403

        if usuario.estado.lower() != "activa":
            return jsonify({"message": "Solo se pueden desactivar cuentas activas"}), 400

        # Validar contraseña
        if not check_password_hash(usuario.password, password):
            return jsonify({"message": "Contraseña incorrecta"}), 401

        usuario.estado = "desactivada"
        db.session.commit()

        return jsonify({"message": "Cuenta desactivada correctamente"}), 200

    except Exception as e:
        return jsonify({"message": "Error al desactivar cuenta", "error": str(e)}), 500



""""
@auth_bp.route("/baja-cuenta", methods=["PUT"])
def baja_usuario():
    try:
        data = request.json
        email = data.get("email")

        if not email:
            return jsonify({"message": "Email requerido"}), 400

        usuario = Usuario.query.filter_by(email=email).first()

        if not usuario:
            return jsonify({"message": "Cuenta no encontrada"}), 404

        if usuario.rol.lower() == "administrador":
            return jsonify({"message": "No se puede desactivar una cuenta de administrador"}), 403

        if usuario.estado.lower() != "activa":
            return jsonify({"message": "Solo se pueden desactivar cuentas activas"}), 400

        usuario.estado = "desactivada"
        db.session.commit()

        return jsonify({"message": "Cuenta desactivada correctamente"}), 200

    except Exception as e:
        return jsonify({"message": "Error al desactivar cuenta", "error": str(e)}), 500
    
"""

@auth_bp.route("/usuario", methods=["GET"])
def obtener_usuario():
    email = request.args.get("email")
    if not email:
        return jsonify({"message": "Email requerido"}), 400

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    return jsonify({
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "email": usuario.email
    }), 200

@auth_bp.route("/cambiar-password", methods=["PUT"])
def cambiar_password():
    try:
        data = request.json
        email = data.get("email")
        password_actual = data.get("password_actual")
        nueva_password = data.get("nueva_password")

        if not email or not password_actual or not nueva_password:
            return jsonify({"message": "Faltan datos"}), 400

        usuario = Usuario.query.filter_by(email=email).first()

        if not usuario:
            return jsonify({"message": "Usuario no encontrado"}), 404

        if not check_password_hash(usuario.password, password_actual):
            return jsonify({"message": "Contraseña actual incorrecta"}), 401

        # Validar nueva contraseña
        if (
            len(nueva_password) < 5
            or not re.search(r"[A-Z]", nueva_password)
            or not re.search(r"\d", nueva_password)
        ):
            return jsonify({"message": "La nueva contraseña debe tener al menos 5 caracteres, una mayúscula y un número."}), 400

        usuario.password = generate_password_hash(nueva_password)
        db.session.commit()

        return jsonify({"message": "Contraseña actualizada correctamente"}), 200

    except Exception as e:
        return jsonify({"message": "Error al cambiar contraseña", "error": str(e)}), 500

from werkzeug.security import check_password_hash

@auth_bp.route("/validar-password", methods=["POST"])
def validar_password():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email y contraseña requeridos"}), 400

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    if check_password_hash(usuario.password, password):
        return jsonify({"valid": True}), 200
    else:
        return jsonify({"valid": False}), 200

@auth_bp.route("/baja-empleado", methods=["PUT"])
def baja_empleado():
    try:
        data = request.json
        email = data.get("email")
        if not email:
            return jsonify({"message": "Email requerido"}), 400

        usuario = Usuario.query.filter_by(email=email, rol="empleado").first()
        if not usuario:
            return jsonify({"message": "Empleado no encontrado"}), 404

        usuario.rol = "cliente"
        db.session.commit()
        return jsonify({"message": "Empleado dado de baja correctamente (rol cambiado a cliente)."}), 200

    except Exception as e:
        return jsonify({"message": "Error al dar de baja el empleado", "error": str(e)}), 500

@auth_bp.route("/alta-empleado", methods=["PUT"])
def alta_empleado():
    try:
        data = request.json
        email = data.get("email")
        if not email:
            return jsonify({"message": "Email requerido"}), 400

        usuario = Usuario.query.filter_by(email=email).first()
        if not usuario:
            return jsonify({"message": "No existe un usuario con ese email."}), 404

        if usuario.rol == "administrador":
            return jsonify({"message": "El usuario ya es administrador."}), 400

        if usuario.rol == "empleado":
            return jsonify({"message": "El usuario ya es empleado."}), 400

        usuario.rol = "empleado"
        db.session.commit()
        return jsonify({"message": "Usuario promovido a empleado correctamente."}), 200

    except Exception as e:
        return jsonify({"message": "Error al dar de alta empleado", "error": str(e)}), 500

@auth_bp.route("/solicitar-recuperacion", methods=["POST"])
def solicitar_recuperacion():
    data = request.json
    email = data.get("email")
    if not email:
        return jsonify({"message": "Email requerido"}), 400

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario or usuario.estado != "activa":
        return jsonify({"message": "No existe un usuario con ese email."}), 404

    token = generar_token(email)
    link = f"http://localhost:5173/recuperar-password/{token}"
    msg = MIMEText(f"Hola, nos comunicamos de Bob el alquilador! Para recuperar tu contraseña, haz clic aquí: {link}\nEste enlace es válido por 10 minutos.")
    msg["Subject"] = "Recuperación de contraseña"
    msg["From"] = "quantumdevsunlp@gmail.com"
    msg["To"] = email

    print("Preparando envío de mail a", email)
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login("quantumdevsunlp@gmail.com", "zuio rjmo duxk igbf")
            print("Login SMTP exitoso")
            server.sendmail(msg["From"], [msg["To"]], msg.as_string())
            print("Mail enviado correctamente")
    except Exception as e:
        print("Error enviando email:", e)
        return jsonify({"message": "No se pudo enviar el correo"}), 500

    return jsonify({"message": "Se envió correctamente el enlace de recuperación al correo."}), 200

from werkzeug.security import generate_password_hash

@auth_bp.route("/recuperar-password/<token>", methods=["POST"])
def recuperar_password(token):
    data = request.json
    nueva_password = data.get("nueva_password")
    if not nueva_password:
        return jsonify({"message": "Nueva contraseña requerida"}), 400

    email = validar_token(token)
    if not email:
        return jsonify({"message": "Token inválido o expirado"}), 400

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    # Valida la contraseña como en tu endpoint de cambio de password
    import re
    if (
        len(nueva_password) < 5
        or not re.search(r"[A-Z]", nueva_password)
        or not re.search(r"\d", nueva_password)
    ):
        return jsonify({"message": "La nueva contraseña debe tener al menos 5 caracteres, una mayúscula y un número."}), 400

    usuario.password = generate_password_hash(nueva_password)
    # No necesitas guardar nada más
    from database import db
    db.session.commit()
    return jsonify({"message": "Contraseña cambiada correctamente"}), 200

@auth_bp.route("/rechazar-usuario/<int:usuario_id>", methods=["POST"])
def rechazar_usuario(usuario_id):
    data = request.json
    motivo = data.get("motivo", "")
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    usuario.estado = "rechazado"
    db.session.commit()

    # Enviar mail con motivo
    msg = MIMEText(
        f"Hola, nos comunicamos de Bob el alquilador ! Le informamos que su cuenta fue rechazada por el siguiente motivo:\n\n{motivo}\n\nSaludos,\nEl equipo de Bob el alquilador",
        _charset="utf-8"
    )
    msg["Subject"] = "Cuenta rechazada"
    msg["From"] = "quantumdevsunlp@gmail.com"
    msg["To"] = usuario.email

    print("Motivo recibido:", motivo)  # Nuevo: imprimir motivo en el servidor

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login("quantumdevsunlp@gmail.com", "zuio rjmo duxk igbf")
            server.sendmail(msg["From"], [msg["To"]], msg.as_string())
    except Exception as e:
        print("Error enviando email de rechazo:", e)

    return jsonify({"message": "Usuario rechazado y notificado por email."}), 200

@auth_bp.route("/activar-usuario/<int:usuario_id>", methods=["PUT"])
def activar_usuario(usuario_id):
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    usuario.estado = "activa"
    db.session.commit()

    # Enviar mail de activación
    msg = MIMEText("¡Su cuenta ha sido activada! Ya puede ingresar al sistema.", _charset="utf-8")
    msg["Subject"] = "Cuenta activada"
    msg["From"] = "quantumdevsunlp@gmail.com"
    msg["To"] = usuario.email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login("quantumdevsunlp@gmail.com", "zuio rjmo duxk igbf")
            server.sendmail(msg["From"], [msg["To"]], msg.as_string())
    except Exception as e:
        print("Error enviando email de activación:", e)

    return jsonify({"message": "Usuario activado y notificado por email."}), 200





