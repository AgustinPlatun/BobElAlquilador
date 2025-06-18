import mercadopago
from flask import Blueprint, request, jsonify, current_app
from database.models import Reserva, Usuario, Maquinaria, Reserva
from database import db
from datetime import datetime


pagos_bp = Blueprint('pagos', __name__)

def get_sdk():
    token = current_app.config.get("MERCADOPAGO_ACCESS_TOKEN")
    if not token:
        raise Exception("MERCADOPAGO_ACCESS_TOKEN no configurado")
    return mercadopago.SDK(token)

@pagos_bp.route('/crear-preferencia', methods=['POST'])
def crear_preferencia():
    try:
        sdk = get_sdk()

        data = request.json
        nombre = data.get('nombre')
        precio = float(data.get('precio', 0))
        cantidad = int(data.get('cantidad', 1))
        codigo_maquinaria = data.get('codigo_maquinaria')
        fecha_inicio = data.get('fecha_inicio')
        fecha_fin = data.get('fecha_fin')
        usuario_email = data.get('usuario_email')

        preference_data = {
            "items": [
                {
                    "title": nombre,
                    "quantity": cantidad,
                    "currency_id": "ARS",
                    "unit_price": precio
                }
            ],
            "metadata": {
                "codigo_maquinaria": codigo_maquinaria,
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin,
                "usuario_email": usuario_email
            },
            "back_urls": {
                "success": "https://b8jb43k3-5173.brs.devtunnels.ms/pago-exitoso",
                "failure": "https://b8jb43k3-5173.brs.devtunnels.ms/pago-fallido",
                "pending": "https://b8jb43k3-5173.brs.devtunnels.ms/pago-pendiente"
            },
            "auto_return": "approved",
            "notification_url": "https://b8jb43k3-5000.brs.devtunnels.ms/webhook"
        }

        preference_response = sdk.preference().create(preference_data)

        print("Respuesta de MercadoPago:", preference_response)

        if "response" in preference_response and "init_point" in preference_response["response"]:
            return jsonify({"init_point": preference_response["response"]["init_point"]})
        else:
            return jsonify({"error": "Error al crear la preferencia"}), 400

    except Exception as e:
        print("Error al crear la preferencia:", str(e))
        return jsonify({"error": "Excepción en el servidor"}), 500
    
@pagos_bp.route('/webhook', methods=['POST'])
def webhook():
    data = request.json
    print("[WEBHOOK] Llamado con data:", data)
    if data.get("type") == "payment":
        try:
            payment_id = data["data"]["id"]
            sdk = get_sdk()
            payment = sdk.payment().get(payment_id)
            payment_info = payment.get('response', {})

            print("[WEBHOOK] Payment info:", payment_info)

            if payment_info.get('status') == 'approved':
                metadata = payment_info.get('metadata', {})
                print("[WEBHOOK] Metadata recibida:", metadata)
                codigo_maquinaria = metadata.get('codigo_maquinaria')
                fecha_inicio = metadata.get('fecha_inicio')
                fecha_fin = metadata.get('fecha_fin')
                usuario_email = metadata.get('usuario_email')
                precio = payment_info.get('transaction_amount')

                usuario = Usuario.query.filter_by(email=usuario_email).first()
                maquinaria = Maquinaria.query.filter_by(codigo=codigo_maquinaria).first()

                print(f"[WEBHOOK] usuario: {usuario}, maquinaria: {maquinaria}, fechas: {fecha_inicio} a {fecha_fin}, precio: {precio}")

                if usuario and maquinaria and fecha_inicio and fecha_fin:
                    # Verificar si ya existe una reserva igual
                    existe = Reserva.query.filter_by(
                        usuario_id=usuario.id,
                        maquinaria_id=maquinaria.id,
                        fecha_inicio=datetime.strptime(fecha_inicio, "%Y-%m-%d").date(),
                        fecha_fin=datetime.strptime(fecha_fin, "%Y-%m-%d").date()
                    ).first()
                    print(f"[WEBHOOK] Reserva existente: {existe}")
                    if not existe:
                        reserva = Reserva(
                            fecha_inicio=datetime.strptime(fecha_inicio, "%Y-%m-%d").date(),
                            fecha_fin=datetime.strptime(fecha_fin, "%Y-%m-%d").date(),
                            precio=precio,
                            usuario_id=usuario.id,
                            maquinaria_id=maquinaria.id
                        )
                        db.session.add(reserva)
                        db.session.commit()
                        print("[WEBHOOK] Reserva guardada correctamente")
                    else:
                        print("[WEBHOOK] Ya existe una reserva igual, no se guarda")
                else:
                    print("[WEBHOOK] Faltan datos para crear la reserva")
            else:
                print(f"[WEBHOOK] Estado de pago no aprobado: {payment_info.get('status')}")
        except Exception as e:
            print(f"[WEBHOOK] Error procesando el webhook: {e}")
    else:
        print("[WEBHOOK] Tipo de evento no es 'payment'")
    return '', 200

@pagos_bp.route('/guardar-reserva-directa', methods=['POST'])
def guardar_reserva_directa():
    data = request.json
    print("[GUARDAR RESERVA DIRECTA] Llamado con data:", data)
    usuario_email = data.get('usuario_email')
    codigo_maquinaria = data.get('codigo_maquinaria')
    fecha_inicio = data.get('fecha_inicio')
    fecha_fin = data.get('fecha_fin')
    precio = data.get('precio')

    usuario = Usuario.query.filter_by(email=usuario_email).first()
    maquinaria = Maquinaria.query.filter_by(codigo=codigo_maquinaria).first()

    print(f"[GUARDAR RESERVA DIRECTA] usuario: {usuario}, maquinaria: {maquinaria}, fechas: {fecha_inicio} a {fecha_fin}, precio: {precio}")

    if usuario and maquinaria and fecha_inicio and fecha_fin:
        existe = Reserva.query.filter_by(
            usuario_id=usuario.id,
            maquinaria_id=maquinaria.id,
            fecha_inicio=datetime.strptime(fecha_inicio, "%Y-%m-%d").date(),
            fecha_fin=datetime.strptime(fecha_fin, "%Y-%m-%d").date()
        ).first()
        print(f"[GUARDAR RESERVA DIRECTA] Reserva existente: {existe}")
        if not existe:
            reserva = Reserva(
                fecha_inicio=datetime.strptime(fecha_inicio, "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime(fecha_fin, "%Y-%m-%d").date(),
                precio=precio,
                usuario_id=usuario.id,
                maquinaria_id=maquinaria.id
            )
            db.session.add(reserva)
            db.session.commit()
            print("[GUARDAR RESERVA DIRECTA] Reserva guardada correctamente")
            return jsonify({"message": "Reserva guardada correctamente"}), 201
        else:
            print("[GUARDAR RESERVA DIRECTA] La reserva ya existe")
            return jsonify({"message": "La reserva ya existe"}), 200
    else:
        print("[GUARDAR RESERVA DIRECTA] Faltan datos o no se encontró usuario/maquinaria")
        return jsonify({"error": "Faltan datos o no se encontró usuario/maquinaria"}), 400


