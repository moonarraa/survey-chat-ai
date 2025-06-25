from dotenv import load_dotenv
load_dotenv()
import os

BOT_TOKEN = os.getenv('BOT_TOKEN')
print('BOT_TOKEN from env:', BOT_TOKEN)
BACKEND_URL = os.getenv('BACKEND_URL') 
print('BACKEND_URL from env:', BACKEND_URL)
BOT_API_TOKEN = os.getenv('BOT_API_TOKEN') 
print('BOT_API_TOKEN from env:', BOT_API_TOKEN) 