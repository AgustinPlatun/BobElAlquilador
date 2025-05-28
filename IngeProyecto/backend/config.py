import os

class Config:
    BASEDIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASEDIR, 'BaseDeDatos.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MERCADOPAGO_ACCESS_TOKEN = "APP_USR-8954126964934958-052719-dc74ddab494739ffb3cddcf1353a7d65-2460848921"
