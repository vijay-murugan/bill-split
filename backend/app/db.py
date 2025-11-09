import configparser
import os

from motor.motor_asyncio import AsyncIOMotorClient

config = configparser.ConfigParser()
config.read("app/conf/dbconn.properties")


MONGO_URI = config["DEFAULT"].get("mongo_uri")
DB_NAME = config["DEFAULT"].get("db_name")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
users_col = db["users"]
accounts_col = db["accounts"]
friends_col = db["friends"]
