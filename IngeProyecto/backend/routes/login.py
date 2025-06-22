import random
import smtplib
import re
from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash
from database.models import Usuario
from database import db
from email.mime.text import MIMEText

login_bp = Blueprint('login', __name__)

@login_bp.route("/login", methods=["POST"])
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

        if usuario.rol == "administrador":
            codigo = str(random.randint(10000, 99999))
            session[email] = codigo
            msg = MIMEText(
                f"""
¡Hola!

Nos comunicamos de <b>Bob el Alquilador</b>.<br><br>
Para completar tu inicio de sesión como administrador, por favor ingresa el siguiente código de verificación en la aplicación:<br><br>
<b style="font-size:1.5em;">{codigo}</b><br><br>

""",
                _subtype="html",
                _charset="utf-8"
            )
            msg["Subject"] = "Código de acceso para administrador - BobElAlquilador"
            msg["From"] = "quantumdevsunlp@gmail.com"
            msg["To"] = email
            try:
                with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                    server.login("quantumdevsunlp@gmail.com", "zuio rjmo duxk igbf")
                    server.sendmail(msg["From"], [msg["To"]], msg.as_string())
            except Exception as e:
                print("Error enviando email:", e)
            return jsonify({"require_code": True}), 200

        return jsonify({
            "message": "Inicio de sesión exitoso",
            "nombre": usuario.nombre,
            "rol": usuario.rol,
            "email": usuario.email,
            "id": usuario.id
        }), 200

    except Exception as e:
        return jsonify({"message": "Hubo un problema con el inicio de sesión", "error": str(e)}), 500

@login_bp.route("/verificar-codigo", methods=["POST"])
def verificar_codigo():
    data = request.json
    email = data.get("email")
    codigo = data.get("codigo")

    if not re.fullmatch(r"\d{5}", codigo or ""):
        return jsonify({"message": "Código inválido. Debe tener exactamente 5 dígitos numéricos."}), 400

    codigo_guardado = session.get(email)
    if not codigo_guardado:
        return jsonify({"message": "No se solicitó código para este usuario"}), 400

    if codigo_guardado == codigo:
        usuario = Usuario.query.filter_by(email=email).first()
        if not usuario:
            return jsonify({"message": "Usuario no encontrado"}), 404

        session.pop(email, None)

        return jsonify({
            "message": "Inicio de sesión exitoso",
            "nombre": usuario.nombre,
            "rol": usuario.rol,
            "email": usuario.email,
            "id": usuario.id
        }), 200
    else:
        return jsonify({"message": "Código incorrecto"}), 401