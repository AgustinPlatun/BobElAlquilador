import os
import re
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash
from database.models import Usuario
from database import db
import smtplib
import random
import string
from email.mime.text import MIMEText

register_bp = Blueprint('register', __name__)

@register_bp.route("/register", methods=["POST"])
def register():
    try:
        nombre = request.form.get("nombre")
        apellido = request.form.get("apellido")
        email = request.form.get("email")
        password = request.form.get("password")
        fecha_nacimiento = request.form.get("fecha_nacimiento")
        dni_foto = request.files.get("dni_foto")
        dni_numero = request.form.get("dni_numero") 
        rol = "cliente" 
        estado = "pendiente"

        if not nombre or not apellido or not email or not password or not fecha_nacimiento or not dni_foto or not dni_numero:
            return jsonify({"message": "Faltan datos"}), 400

        if not dni_numero.isdigit():
            return jsonify({"message": "El documento solo puede contener números."}), 400

        import re
        if (
            len(password) < 5
            or not re.search(r"[A-Z]", password)
            or not re.search(r"\d", password)
        ):
            return jsonify({"message": "La contraseña debe tener al menos 5 caracteres, una mayúscula y un número."}), 400

        dni_folder = os.path.join(os.path.dirname(__file__), '../uploads/dni_clientes_fotos')
        os.makedirs(dni_folder, exist_ok=True)
        dni_filename = secure_filename(dni_foto.filename)
        dni_filepath = os.path.join(dni_folder, dni_filename)
        dni_foto.save(dni_filepath)

        usuario_existente = Usuario.query.filter_by(email=email).first()
        if usuario_existente:
            if usuario_existente.estado == "rechazado":
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
            dni_numero=dni_numero  
        )
        db.session.add(nuevo_usuario)
        db.session.commit()

        return jsonify({"message": "Usuario registrado correctamente"}), 201

    except Exception as e:
        return jsonify({"message": "Hubo un problema con el registro", "error": str(e)}), 500
    
@register_bp.route("/registrar-empleado", methods=["POST"])
def registrar_empleado():
    try:
        data = request.json
        nombre = data.get("nombre")
        apellido = data.get("apellido")
        email = data.get("email")
        fecha_nacimiento = data.get("fecha_nacimiento")
        dni_numero = data.get("dni_numero")
        rol = "empleado"
        estado = "activa"

        # Validaciones
        if not nombre or not apellido or not email or not fecha_nacimiento or not dni_numero:
            return jsonify({"message": "Faltan datos"}), 400

        if not re.fullmatch(r"\d{8}", dni_numero):
            return jsonify({"message": "El DNI debe contener exactamente 8 números y no letras."}), 400

        if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", email):
            return jsonify({"message": "El email no es válido."}), 400

        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", fecha_nacimiento):
            return jsonify({"message": "La fecha debe tener el formato YYYY-MM-DD."}), 400

        if not fecha_nacimiento.split('-')[0].isdigit() or len(fecha_nacimiento.split('-')[0]) != 4:
            return jsonify({"message": "El año de la fecha debe tener 4 dígitos."}), 400

        if Usuario.query.filter_by(email=email).first():
            return jsonify({"message": "El email ya está registrado"}), 400

        def generar_password():
            while True:
                pwd = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
                if (any(c.isupper() for c in pwd) and any(c.isdigit() for c in pwd) and len(pwd) >= 5):
                    return pwd

        password_generada = generar_password()
        hashed_password = generate_password_hash(password_generada)

        nuevo_empleado = Usuario(
            nombre=nombre,
            apellido=apellido,
            email=email,
            password=hashed_password,
            estado=estado,
            rol=rol,
            fecha_nacimiento=fecha_nacimiento,
            dni_foto=None,
            dni_numero=dni_numero
        )
        db.session.add(nuevo_empleado)
        db.session.commit()

        msg = MIMEText(
            f"¡Bienvenido/a {nombre}!\n\n"
            f"Te registraron como empleado en BobElAlquilador.\n"
            f"Tu contraseña temporal es: {password_generada}\n\n"
            f"Por favor, ingresá a la aplicación y cambiá tu contraseña desde la sección 'Mis Datos'.\n\n"
            f"Saludos,\nEl equipo de BobElAlquilador",
            _charset="utf-8"
        )
        msg["Subject"] = "Registro como empleado - BobElAlquilador"
        msg["From"] = "quantumdevsunlp@gmail.com"
        msg["To"] = email

        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login("quantumdevsunlp@gmail.com", "zuio rjmo duxk igbf")
                server.sendmail(msg["From"], [msg["To"]], msg.as_string())
        except Exception as e:
            print("Error enviando email de alta empleado:", e)

        return jsonify({"message": "Empleado registrado correctamente. Se envió la contraseña por email."}), 201

    except Exception as e:
        print("Error al registrar empleado:", e)
        return jsonify({"message": "Hubo un problema con el registro del empleado", "error": str(e)}), 500
    
@register_bp.route("/registrar-cliente", methods=["POST"])
def registrar_cliente():
    try:
        data = request.json
        nombre = data.get("nombre")
        apellido = data.get("apellido")
        email = data.get("email")
        fecha_nacimiento = data.get("fecha_nacimiento")
        dni_numero = data.get("dni_numero")
        rol = "cliente"
        estado = "activa" 

        if not nombre or not apellido or not email or not fecha_nacimiento or not dni_numero:
            return jsonify({"message": "Faltan datos"}), 400

        if Usuario.query.filter_by(email=email).first():
            return jsonify({"message": "El email ya está registrado"}), 400

        def generar_password():
            while True:
                pwd = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
                if (any(c.isupper() for c in pwd) and any(c.isdigit() for c in pwd) and len(pwd) >= 5):
                    return pwd

        password_generada = generar_password()
        hashed_password = generate_password_hash(password_generada)

        nuevo_cliente = Usuario(
            nombre=nombre,
            apellido=apellido,
            email=email,
            password=hashed_password,
            estado=estado,
            rol=rol,
            fecha_nacimiento=fecha_nacimiento,
            dni_foto=None,
            dni_numero=dni_numero
        )
        db.session.add(nuevo_cliente)
        db.session.commit()

        msg = MIMEText(
            f"¡Bienvenido/a {nombre}!\n\n"
            f"Te registraron como cliente en BobElAlquilador.\n"
            f"Tu contraseña temporal es: {password_generada}\n\n"
            f"Por favor, ingresá a la aplicación y cambiá tu contraseña desde la sección 'Mis Datos'.\n\n"
            f"Saludos,\nEl equipo de BobElAlquilador",
            _charset="utf-8"
        )
        msg["Subject"] = "Registro como cliente - BobElAlquilador"
        msg["From"] = "quantumdevsunlp@gmail.com"
        msg["To"] = email

        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login("quantumdevsunlp@gmail.com", "zuio rjmo duxk igbf")
                server.sendmail(msg["From"], [msg["To"]], msg.as_string())
        except Exception as e:
            print("Error enviando email de alta cliente:", e)

        return jsonify({"message": "Cliente registrado correctamente. Se envió la contraseña por email."}), 201

    except Exception as e:
        print("Error al registrar cliente:", e)
        return jsonify({"message": "Hubo un problema con el registro del cliente", "error": str(e)}), 500
