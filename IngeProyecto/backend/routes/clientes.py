import smtplib
from email.mime.text import MIMEText
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash
from database.models import Usuario
from database import db

clientes_bp = Blueprint('clientes', __name__)

@clientes_bp.route("/rechazar-usuario/<int:usuario_id>", methods=["POST"])
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

@clientes_bp.route("/activar-usuario/<int:usuario_id>", methods=["PUT"])
def activar_usuario(usuario_id):
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    usuario.estado = "activa"
    db.session.commit()

    # Enviar mail de activación
    msg = MIMEText(
        f"Hola, nos comunicamos de Bob El Alquilador.\n\n"
        "¡Tu cuenta fue activada! Ya podés ingresar al sistema y disfrutar de nuestros servicios.\n\n"
        "Saludos,\nEl equipo de Bob El Alquilador",
        _charset="utf-8"
    )
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
