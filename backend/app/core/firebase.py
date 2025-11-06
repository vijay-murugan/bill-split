import os
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials

def init_firebase():
    if firebase_admin._apps:
        return
    cred_path = os.path.join(os.getcwd(), "app/conf/firebase_credentials.json")
    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)

    except Exception as e:
        raise RuntimeError(f"Firebase admin init error: {e}")


def verify_id_token(token: str) -> dict:
    return firebase_auth.verify_id_token(token)