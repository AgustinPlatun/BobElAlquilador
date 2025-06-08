from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database.models import Usuario
from database import db
import re
import smtplib
from email.mime.text import MIMEText
import os
from itsdangerous import URLSafeTimedSerializer
from flask import current_app

password_bp = Blueprint("password", __name__)

def validar_token(token, max_age=600):
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = s.loads(token, salt='recuperar-password', max_age=max_age)
    except Exception:
        return None
    return email

def generar_token(email):
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return s.dumps(email, salt='recuperar-password')

@password_bp.route("/cambiar-password", methods=["PUT"])
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

        # No permitir que la nueva contraseña sea igual a la actual
        if check_password_hash(usuario.password, nueva_password):
            return jsonify({"message": "La nueva contraseña no puede ser igual a la actual."}), 400

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



@password_bp.route("/validar-password", methods=["POST"])
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

@password_bp.route("/solicitar-recuperacion", methods=["POST"])
def solicitar_recuperacion():
    data = request.json
    email = data.get("email")
    if not email:
        return jsonify({"message": "Email requerido"}), 400

    usuario = Usuario.query.filter_by(email=email).first()
    # SIEMPRE responder igual, aunque el usuario no exista o no esté activo
    if not usuario or usuario.estado != "activa":
        # Simular el envío para no revelar si existe o no
        return jsonify({"message": "Si existe una cuenta asociada a ese email, se enviará un enlace de recuperación."}), 200

    # Si existe y está activo, enviar el mail normalmente
    token = generar_token(email)
    link = f"http://localhost:5173/recuperar-password/{token}"
    msg = MIMEText(f"Hola, nos comunicamos de Bob el alquilador! Para recuperar tu contraseña, haz clic aquí: {link}\nEste enlace es válido por 10 minutos.")
    msg["Subject"] = "Recuperación de contraseña"
    msg["From"] = "quantumdevsunlp@gmail.com"
    msg["To"] = email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login("quantumdevsunlp@gmail.com", "zuio rjmo duxk igbf")
            server.sendmail(msg["From"], [msg["To"]], msg.as_string())
    except Exception as e:
        print("Error enviando email:", e)
        # Igual responder el mensaje genérico
        return jsonify({"message": "Si existe una cuenta asociada a ese email, se enviará un enlace de recuperación."}), 200

    return jsonify({"message": "Si existe una cuenta asociada a ese email, se enviará un enlace de recuperación."}), 200



@password_bp.route("/recuperar-password/<token>", methods=["POST"])
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

    # Valida que la nueva contraseña sea distinta a la actual
    if check_password_hash(usuario.password, nueva_password):
        return jsonify({"message": "La nueva contraseña no puede ser igual a la actual."}), 400

    # Valida la contraseña como en endpoint de cambio de password
    import re
    if (
        len(nueva_password) < 5
        or not re.search(r"[A-Z]", nueva_password)
        or not re.search(r"\d", nueva_password)
    ):
        return jsonify({"message": "La nueva contraseña debe tener al menos 5 caracteres, una mayúscula y un número."}), 400

    usuario.password = generate_password_hash(nueva_password)
    from database import db
    db.session.commit()
    return jsonify({"message": "Contraseña cambiada correctamente"}), 200