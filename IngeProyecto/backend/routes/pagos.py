import mercadopago
from flask import Blueprint, request, jsonify, current_app

pagos_bp = Blueprint('pagos', __name__)

# Inicializar SDK usando el token de config
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

        preference_data = {
            "items": [
                {
                    "title": nombre,
                    "quantity": cantidad,
                    "currency_id": "ARS",
                    "unit_price": precio
                }
            ],
            "back_urls": {
                "success": "https://qcmnwmj3-5173.brs.devtunnels.ms/pago-exitoso",
                "failure": "https://qcmnwmj3-5173.brs.devtunnels.ms/pago-fallido",
                "pending": "https://qcmnwmj3-5173.brs.devtunnels.ms/pago-pendiente"
            },
            "auto_return": "approved"
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
    try:
        data = request.json
        print("🔔 Webhook recibido:", data)

        # Verificamos si es un evento de tipo 'payment'
        if data.get("type") == "payment":
            payment_id = data["data"]["id"]

            sdk = get_sdk()
            payment = sdk.payment().get(payment_id)
            payment_info = payment.get('response', {})

            print("📄 Información del pago:")
            print(f"ID: {payment_info.get('id')}")
            print(f"Estado: {payment_info.get('status')}")
            print(f"Método de pago: {payment_info.get('payment_method_id')}")
            print(f"Monto: {payment_info.get('transaction_amount')} {payment_info.get('currency_id')}")
            print(f"Nombre del comprador: {payment_info.get('payer', {}).get('first_name')} {payment_info.get('payer', {}).get('last_name')}")
            print(f"Email del comprador: {payment_info.get('payer', {}).get('email')}")
            print(f"Fecha de creación: {payment_info.get('date_created')}")
            print(f"Fecha de aprobación: {payment_info.get('date_approved')}")
        else:
            print("📌 Evento no relacionado con 'payment'.")

        return '', 200

    except Exception as e:
        print("❌ Error en el webhook:", str(e))
        return '', 500


