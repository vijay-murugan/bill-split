import configparser
import os
from motor.motor_asyncio import AsyncIOMotorClient

config = configparser.ConfigParser()
config.read('app/conf/dbconn.properties')

username = config.get('DEFAULT', 'mongo_uri')
password = config.get('DEFAULT', 'db_name')
# # uvicorn controllers.primary_controller:app --reload
# connection = "mongodb+srv://" + username + ":" + password + "@cluster0.whlb6ym.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# connection =
MONGO_URI = config['DEFAULT'].get('mongo_uri')
DB_NAME = config['DEFAULT'].get('db_name')

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
users_col = db["users"]
