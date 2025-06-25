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
                "success": "https://qcmnwmj3-5173.brs.devtunnels.ms/pago-exitoso",
                "failure": "https://qcmnwmj3-5173.brs.devtunnels.ms/pago-fallido",
                "pending": "https://qcmnwmj3-5173.brs.devtunnels.ms/pago-pendiente"
            },
            "auto_return": "approved",
            "notification_url": "https://qcmnwmj3-5000.brs.devtunnels.ms/webhook"
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
    if data.get("type") == "payment":
        payment_id = data["data"]["id"]
        sdk = get_sdk()
        payment = sdk.payment().get(payment_id)
        payment_info = payment.get('response', {})

        print("Payment info:", payment_info)

        if payment_info.get('status') == 'approved':
            metadata = payment_info.get('metadata', {})
            codigo_maquinaria = metadata.get('codigo_maquinaria')
            fecha_inicio = metadata.get('fecha_inicio')
            fecha_fin = metadata.get('fecha_fin')
            usuario_email = metadata.get('usuario_email')
            precio = payment_info.get('transaction_amount')

            usuario = Usuario.query.filter_by(email=usuario_email).first()
            maquinaria = Maquinaria.query.filter_by(codigo=codigo_maquinaria).first()

            if usuario and maquinaria and fecha_inicio and fecha_fin:
                reserva = Reserva(
                    fecha_inicio=datetime.strptime(fecha_inicio, "%Y-%m-%d").date(),
                    fecha_fin=datetime.strptime(fecha_fin, "%Y-%m-%d").date(),
                    precio=precio,
                    usuario_id=usuario.id,
                    maquinaria_id=maquinaria.id
                )
                db.session.add(reserva)
                db.session.commit()
    return '', 200


