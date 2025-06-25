import asyncio
from aiogram import Bot, Dispatcher
from .config import BOT_TOKEN
from .handlers import router

async def main():
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()
    dp.include_router(router)
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        import traceback
        print("=== ERROR OCCURRED ===")
        traceback.print_exc() 