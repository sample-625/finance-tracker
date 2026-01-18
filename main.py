import os
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, BigInteger, DateTime, Boolean, Text, select, update, JSON
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo, Bot
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler

# ==================== CONFIG ====================
BOT_TOKEN = os.getenv("BOT_TOKEN", "8316242716:AAHSuHE0Wr_jeiREi9taX6uKP9cger2R28g")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/lifetracker")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-webapp-url.vercel.app") 
API_SECRET = os.getenv("API_SECRET", "your-secret-key-change-me")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== DATABASE ====================
class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    username: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    first_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="ru")
    timezone_offset: Mapped[int] = mapped_column(default=0)  # UTC offset in minutes
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

class UserData(Base):
    __tablename__ = "user_data"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, index=True)
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class HabitReminder(Base):
    __tablename__ = "habit_reminders"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, index=True)
    habit_id: Mapped[str] = mapped_column(String(255))
    habit_name: Mapped[str] = mapped_column(String(255))
    reminded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)

class MoodEntry(Base):
    __tablename__ = "mood_entries"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, index=True)
    date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow) # Stored as date at midnight
    score: Mapped[int] = mapped_column() # 1-5
    note: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

# Database engine
engine = create_async_engine(DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"))
async_session = async_sessionmaker(engine, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database initialized")

async def get_session():
    async with async_session() as session:
        yield session

# ==================== TRANSLATIONS ====================
MESSAGES = {
    "ru": {
        "welcome": "👋 Привет, {name}!\n\n🚀 Добро пожаловать в **Life Tracker** — твой персональный помощник для управления финансами, привычками и целями!\n\n✨ **Что умеет приложение:**\n💰 Отслеживание доходов и расходов\n🎯 Постановка и контроль целей\n✅ Трекер привычек с напоминаниями\n📊 Аналитика и статистика\n📝 Заметки\n\n👇 Нажми кнопку ниже, чтобы открыть приложение:",
        "open_app": "📱 Открыть Life Tracker",
        "settings": "⚙️ Настройки",
        "notifications_on": "�� Уведомления включены",
        "notifications_off": "🔕 Уведомления выключены",
        "habit_reminder": "⏰ Напоминание!\n\nТы ещё не выполнил привычку **{habit}** сегодня.\n\nОткрой приложение и отметь выполнение! 💪",
        "habit_completed": "🎉 Молодец!\n\nПривычка **{habit}** выполнена!\n\n🔥 Так держать! Твоя серия продолжается!",
        "streak_alert": "🔥 Внимание!\n\nТвоя серия в **{days}** дней по привычке **{habit}** может прерваться!\n\nНе забудь отметить выполнение сегодня!",
        "weekly_report": "📊 **Еженедельный отчёт**\n\n💰 Доходы: +{income}\n💸 Расходы: -{expense}\n📈 Баланс: {balance}\n\n✅ Привычки выполнены: {habits_done}/{habits_total}\n🔥 Лучшая серия: {best_streak} дней",
        "settings_menu": "⚙️ **Настройки**\n\nУведомления: {notif_status}\nЯзык: {lang}",
        "toggle_notifications": "🔔 Вкл/Выкл уведомления",
        "help": "📖 **Помощь**\n\n/start — Главное меню\n/app — Открыть приложение\n/settings — Настройки\n/stats — Твоя статистика\n/mood — Календарь настроения\n\nПо вопросам: @your_support",
        "ask_mood": "🎭 **Как прошёл твой день?**\n\nОтметь своё настроение:",
        "mood_saved": "✅ Настроение сохранено: {mood}\n\nСпасибо за отметку!",
        "mood_calendar_title": "📅 **Твой календарь настроения**\n\n",
        "spending_alert": "💸 **Аномалия расходов!**\n\nТы потратил **{amount}** сегодня, что значительно выше твоего среднего ({avg}).\n\nДержим руку на пульсе! ��",
    },
    "en": {
        "welcome": "👋 Hi, {name}!\n\n🚀 Welcome to **Life Tracker** — your personal assistant for managing finances, habits and goals!\n\n✨ **Features:**\n💰 Income & expense tracking\n🎯 Goals setting & tracking\n✅ Habit tracker with reminders\n📊 Analytics & statistics\n📝 Notes\n\n👇 Tap the button below to open the app:",
        "open_app": "📱 Open Life Tracker",
        "settings": "⚙️ Settings",
        "notifications_on": "🔔 Notifications enabled",
        "notifications_off": "🔕 Notifications disabled",
        "habit_reminder": "⏰ Reminder!\n\nYou haven't completed **{habit}** habit today.\n\nOpen the app and mark it done! 💪",
        "habit_completed": "🎉 Great job!\n\n**{habit}** habit completed!\n\n🔥 Keep it up! Your streak continues!",
        "streak_alert": "🔥 Alert!\n\nYour **{days}**-day streak for **{habit}** might break!\n\nDon't forget to mark it today!",
        "weekly_report": "📊 **Weekly Report**\n\n💰 Income: +{income}\n💸 Expenses: -{expense}\n📈 Balance: {balance}\n\n✅ Habits completed: {habits_done}/{habits_total}\n🔥 Best streak: {best_streak} days",
        "settings_menu": "⚙️ **Settings**\n\nNotifications: {notif_status}\nLanguage: {lang}",
        "toggle_notifications": "🔔 Toggle notifications",
        "help": "📖 **Help**\n\n/start — Main menu\n/app — Open app\n/settings — Settings\n/stats — Your stats\n/mood — Mood Calendar\n\nSupport: @your_support",
        "ask_mood": "🎭 **How was your day?**\n\nRate your mood:",
        "mood_saved": "✅ Mood saved: {mood}\n\nThanks for checking in!",
        "mood_calendar_title": "📅 **Your Mood Calendar**\n\n",
        "spending_alert": "💸 **Spending Alert!**\n\nYou spent **{amount}** today, which is significantly higher than your average ({avg}).\n\nJust keeping you posted! 📉",
    },
    "es": {
        "welcome": "👋 ¡Hola, {name}!\n\n🚀 Bienvenido a **Life Tracker** — tu asistente personal para gestionar finanzas, hábitos y metas!\n\n✨ **Funciones:**\n💰 Seguimiento de ingresos y gastos\n🎯 Establecer y controlar metas\n✅ Rastreador de hábitos con recordatorios\n📊 Análisis y estadísticas\n📝 Notas\n\n👇 Toca el botón para abrir la app:",
        "open_app": "📱 Abrir Life Tracker",
        "settings": "⚙️ Ajustes",
        "notifications_on": "🔔 Notificaciones activadas",
        "notifications_off": "🔕 Notificaciones desactivadas",
        "habit_reminder": "⏰ ¡Recordatorio!\n\nNo has completado el hábito **{habit}** hoy.\n\n¡Abre la app y márcalo! 💪",
        "habit_completed": "🎉 ¡Excelente!\n\n¡Hábito **{habit}** completado!\n\n�� ¡Sigue así! ¡Tu racha continúa!",
        "streak_alert": "🔥 ¡Alerta!\n\n¡Tu racha de **{days}** días en **{habit}** puede romperse!\n\n¡No olvides marcarlo hoy!",
        "weekly_report": "📊 **Informe Semanal**\n\n💰 Ingresos: +{income}\n💸 Gastos: -{expense}\n📈 Balance: {balance}\n\n✅ Hábitos completados: {habits_done}/{habits_total}\n🔥 Mejor racha: {best_streak} días",
        "settings_menu": "⚙️ **Ajustes**\n\nNotificaciones: {notif_status}\nIdioma: {lang}",
        "toggle_notifications": "🔔 Activar/Desactivar notificaciones",
        "help": "📖 **Ayuda**\n\n/start — Menú principal\n/app — Abrir app\n/settings — Ajustes\n/stats — Tus estadísticas\n/mood — Calendario de humor\n\nSoporte: @your_support",
        "ask_mood": "🎭 **¿Qué tal tu día?**\n\nCalifica tu estado de ánimo:",
        "mood_saved": "✅ Estado de ánimo guardado: {mood}\n\n¡Gracias!",
        "mood_calendar_title": "📅 **Tu Calendario de Humor**\n\n",
        "spending_alert": "💸 **¡Alerta de Gasto!**\n\nHas gastado **{amount}** hoy, mucho más que tu promedio ({avg}).\n\n¡Solo para avisarte! 📉",
    }
}

def get_msg(lang: str, key: str) -> str:
    return MESSAGES.get(lang, MESSAGES["ru"]).get(key, MESSAGES["ru"][key])

# ==================== BOT HANDLERS ====================
async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    
    # Save/update user in database
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == user.id)
        )
        db_user = result.scalar_one_or_none()
        
        if not db_user:
            db_user = User(
                telegram_id=user.id,
                username=user.username,
                first_name=user.first_name,
                language="ru"
            )
            session.add(db_user)
            await session.commit()
        
        lang = db_user.language
    
    # Create keyboard with WebApp button
    keyboard = [
        [InlineKeyboardButton(
            get_msg(lang, "open_app"),
            web_app=WebAppInfo(url=WEBAPP_URL)
        )],
        [InlineKeyboardButton(get_msg(lang, "settings"), callback_data="settings")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        get_msg(lang, "welcome").format(name=user.first_name or "друг"),
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )

async def app_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == user.id)
        )
        db_user = result.scalar_one_or_none()
        lang = db_user.language if db_user else "ru"
    
    keyboard = [[InlineKeyboardButton(
        get_msg(lang, "open_app"),
        web_app=WebAppInfo(url=WEBAPP_URL)
    )]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "👇 Нажми, чтобы открыть приложение:",
        reply_markup=reply_markup
    )

async def settings_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == user.id)
        )
        db_user = result.scalar_one_or_none()
        
        if not db_user:
            await update.message.reply_text("Сначала нажми /start")
            return
        
        lang = db_user.language
        notif_status = get_msg(lang, "notifications_on") if db_user.notifications_enabled else get_msg(lang, "notifications_off")
    
    keyboard = [
        [InlineKeyboardButton(get_msg(lang, "toggle_notifications"), callback_data="toggle_notif")],
        [
            InlineKeyboardButton("🇷🇺 RU", callback_data="lang_ru"),
            InlineKeyboardButton("🇬🇧 EN", callback_data="lang_en"),
            InlineKeyboardButton("🇪🇸 ES", callback_data="lang_es"),
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        get_msg(lang, "settings_menu").format(
            notif_status=notif_status,
            lang=lang.upper()
        ),
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == user.id)
        )
        db_user = result.scalar_one_or_none()
        lang = db_user.language if db_user else "ru"
    
    await update.message.reply_text(get_msg(lang, "help"), parse_mode="Markdown")

async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    user = update.effective_user
    data = query.data
    
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == user.id)
        )
        db_user = result.scalar_one_or_none()
        
        if not db_user:
            return
        
        if data == "toggle_notif":
            db_user.notifications_enabled = not db_user.notifications_enabled
            await session.commit()
            
            lang = db_user.language
            status = get_msg(lang, "notifications_on") if db_user.notifications_enabled else get_msg(lang, "notifications_off")
            await query.edit_message_text(f"✅ {status}")
        
        elif data.startswith("lang_"):
            new_lang = data.split("_")[1]
            db_user.language = new_lang
            await session.commit()
            
            await query.edit_message_text(f"✅ Language set to {new_lang.upper()}")
        
        elif data == "settings":
            lang = db_user.language
            notif_status = get_msg(lang, "notifications_on") if db_user.notifications_enabled else get_msg(lang, "notifications_off")
            
            keyboard = [
                [InlineKeyboardButton(get_msg(lang, "toggle_notifications"), callback_data="toggle_notif")],
                [
                    InlineKeyboardButton("🇷🇺 RU", callback_data="lang_ru"),
                    InlineKeyboardButton("🇬🇧 EN", callback_data="lang_en"),
                    InlineKeyboardButton("🇪🇸 ES", callback_data="lang_es"),
                ]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await query.edit_message_text(
                get_msg(lang, "settings_menu").format(
                    notif_status=notif_status,
                    lang=lang.upper()
                ),
                reply_markup=reply_markup,
                parse_mode="Markdown"
            )
        
        elif data.startswith("mood_"):
            # Format: mood_{score}
            score = int(data.split("_")[1])
            today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Save to DB
            result = await session.execute(
                select(MoodEntry).where(
                    MoodEntry.telegram_id == user.id,
                    MoodEntry.date == today
                )
            )
            existing_entry = result.scalar_one_or_none()
            
            if existing_entry:
                existing_entry.score = score
            else:
                new_entry = MoodEntry(telegram_id=user.id, date=today, score=score)
                session.add(new_entry)
            
            await session.commit()
            
            # Visual feedback
            mood_map = {1: "😫", 2: "😕", 3: "😐", 4: "🙂", 5: "🤩"}
            lang = db_user.language
            await query.edit_message_text(
                get_msg(lang, "mood_saved").format(mood=mood_map.get(score, ""))
            )

async def mood_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == user.id)
        )
        db_user = result.scalar_one_or_none()
        lang = db_user.language if db_user else "ru"
        
        # Get last 30 days of moods
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        mood_result = await session.execute(
            select(MoodEntry)
            .where(
                MoodEntry.telegram_id == user.id,
                MoodEntry.date >= thirty_days_ago
            )
            .order_by(MoodEntry.date)
        )
        moods = mood_result.scalars().all()
        
    mood_map = {1: "🟥", 2: "🟧", 3: "🟨", 4: "🟩", 5: "🌟"}
    
    # Simple text representation (can be improved to a real grid)
    calendar_text = get_msg(lang, "mood_calendar_title")
    
    if not moods:
        calendar_text += "No data yet."
    else:
        for entry in moods:
            date_str = entry.date.strftime("%d.%m")
            emoji = mood_map.get(entry.score, "❓")
            calendar_text += f"{date_str}: {emoji}\n"
            
    await update.message.reply_text(calendar_text, parse_mode="Markdown")

async def force_mood_check(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Debug command to force mood check message"""
    user = update.effective_user
    
    keyboard = [
        [
            InlineKeyboardButton("😫", callback_data="mood_1"),
            InlineKeyboardButton("😕", callback_data="mood_2"),
            InlineKeyboardButton("😐", callback_data="mood_3"),
            InlineKeyboardButton("🙂", callback_data="mood_4"),
            InlineKeyboardButton("🤩", callback_data="mood_5"),
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == user.id)
        )
        db_user = result.scalar_one_or_none()
        lang = db_user.language if db_user else "ru"

    await update.message.reply_text(
        get_msg(lang, "ask_mood"),
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )

# ==================== SCHEDULED JOBS ====================
async def send_habit_reminders(app: Application):
    """Send reminders for incomplete habits at 20:00 user local time"""
    logger.info("Running habit reminder job...")
    
    async with async_session() as session:
        # Get all users with notifications enabled
        result = await session.execute(
            select(User).where(User.notifications_enabled == True)
        )
        users = result.scalars().all()
        
        for user in users:
            try:
                # Get user's data
                data_result = await session.execute(
                    select(UserData).where(UserData.telegram_id == user.telegram_id)
                )
                user_data = data_result.scalar_one_or_none()
                
                if not user_data or not user_data.data:
                    continue
                
                data = user_data.data
                habits = data.get("habits", [])
                today = datetime.utcnow().strftime("%Y-%m-%d")
                
                for habit in habits:
                    completed_dates = habit.get("completedDates", [])
                    
                    if today not in completed_dates:
                        # Check if we already reminded today
                        reminder_result = await session.execute(
                            select(HabitReminder).where(
                                HabitReminder.telegram_id == user.telegram_id,
                                HabitReminder.habit_id == habit["id"],
                                HabitReminder.reminded_at >= datetime.utcnow().replace(hour=0, minute=0, second=0)
                            )
                        )
                        existing_reminder = reminder_result.scalar_one_or_none()
                        
                        if not existing_reminder:
                            # Send reminder
                            lang = user.language
                            await app.bot.send_message(
                                chat_id=user.telegram_id,
                                text=get_msg(lang, "habit_reminder").format(
                                    habit=f"{habit.get('emoji', '✅')} {habit['name']}"
                                ),
                                parse_mode="Markdown"
                            )
                            
                            # Save reminder record
                            reminder = HabitReminder(
                                telegram_id=user.telegram_id,
                                habit_id=habit["id"],
                                habit_name=habit["name"]
                            )
                            session.add(reminder)
                            await session.commit()
                            
                            logger.info(f"Sent reminder to {user.telegram_id} for habit {habit['name']}")
            
            except Exception as e:
                logger.error(f"Error sending reminder to {user.telegram_id}: {e}")

async def check_habit_completions(app: Application):
    """Check if habits were completed after reminder and send praise"""
    logger.info("Checking habit completions...")
    
    async with async_session() as session:
        # Get today's reminders that weren't completed
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0)
        
        result = await session.execute(
            select(HabitReminder).where(
                HabitReminder.reminded_at >= today_start,
                HabitReminder.completed == False
            )
        )
        reminders = result.scalars().all()
        
        for reminder in reminders:
            try:
                # Get user's current data
                data_result = await session.execute(
                    select(UserData).where(UserData.telegram_id == reminder.telegram_id)
                )
                user_data = data_result.scalar_one_or_none()
                
                if not user_data:
                    continue
                
                data = user_data.data
                habits = data.get("habits", [])
                today = datetime.utcnow().strftime("%Y-%m-%d")
                
                # Find the habit
                habit = next((h for h in habits if h["id"] == reminder.habit_id), None)
                
                if habit and today in habit.get("completedDates", []):
                    # Habit was completed! Send praise
                    user_result = await session.execute(
                        select(User).where(User.telegram_id == reminder.telegram_id)
                    )
                    user = user_result.scalar_one_or_none()
                    
                    if user:
                        lang = user.language
                        await app.bot.send_message(
                            chat_id=reminder.telegram_id,
                            text=get_msg(lang, "habit_completed").format(
                                habit=f"{habit.get('emoji', '✅')} {habit['name']}"
                            ),
                            parse_mode="Markdown"
                        )
                    
                    # Mark reminder as completed
                    reminder.completed = True
                    await session.commit()
                    
                    logger.info(f"Sent praise to {reminder.telegram_id} for habit {habit['name']}")
            
            except Exception as e:
                logger.error(f"Error checking completion for {reminder.telegram_id}: {e}")

async def ask_mood_checkin(app: Application):
    """Ask users for their mood at 21:00 user local time"""
    logger.info("Running mood checkin job...")
    
    async with async_session() as session:
        # Get all users with notifications enabled
        result = await session.execute(
            select(User).where(User.notifications_enabled == True)
        )
        users = result.scalars().all()
        
        keyboard = [
            [
                InlineKeyboardButton("😫", callback_data="mood_1"),
                InlineKeyboardButton("😕", callback_data="mood_2"),
                InlineKeyboardButton("😐", callback_data="mood_3"),
                InlineKeyboardButton("🙂", callback_data="mood_4"),
                InlineKeyboardButton("🤩", callback_data="mood_5"),
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        for user in users:
            try:
                lang = user.language
                await app.bot.send_message(
                    chat_id=user.telegram_id,
                    text=get_msg(lang, "ask_mood"),
                    reply_markup=reply_markup,
                    parse_mode="Markdown"
                )
                logger.info(f"Sent mood checkin to {user.telegram_id}")
            except Exception as e:
                logger.error(f"Error sending mood checkin to {user.telegram_id}: {e}")

# ==================== API MODELS ====================
class SyncData(BaseModel):
    telegram_id: int
    data: dict
    timezone_offset: Optional[int] = 0

class UserResponse(BaseModel):
    telegram_id: int
    language: str
    notifications_enabled: bool

# ==================== API ENDPOINTS ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    
    # Start bot
    bot_app = Application.builder().token(BOT_TOKEN).build()
    bot_app.add_handler(CommandHandler("start", start_command))
    bot_app.add_handler(CommandHandler("app", app_command))
    bot_app.add_handler(CommandHandler("settings", settings_command))
    bot_app.add_handler(CommandHandler("help", help_command))
    bot_app.add_handler(CommandHandler("mood", mood_command))
    bot_app.add_handler(CommandHandler("checkmood", force_mood_check)) # Debug
    bot_app.add_handler(CallbackQueryHandler(callback_handler))
    
    # Start scheduler
    scheduler = AsyncIOScheduler()
    
    # Habit reminders at 20:00 UTC (adjust based on user timezone later)
    scheduler.add_job(
        send_habit_reminders,
        CronTrigger(hour=20, minute=0),
        args=[bot_app],
        id="habit_reminders"
    )
    
    # Check completions every 30 minutes
    scheduler.add_job(
        check_habit_completions,
        CronTrigger(minute="*/30"),
        args=[bot_app],
        id="check_completions"
    )

    # Mood checkin at 21:00
    scheduler.add_job(
        ask_mood_checkin,
        CronTrigger(hour=21, minute=0),
        args=[bot_app],
        id="mood_checkin"
    )
    
    scheduler.start()
    
    # Start bot polling in background
    await bot_app.initialize()
    await bot_app.start()
    await bot_app.updater.start_polling(drop_pending_updates=True)
    
    logger.info("Bot started!")
    
    yield
    
    # Shutdown
    scheduler.shutdown()
    await bot_app.updater.stop()
    await bot_app.stop()
    await bot_app.shutdown()

app = FastAPI(lifespan=lifespan, title="Life Tracker API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "service": "Life Tracker Bot API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/sync")
async def sync_data(sync: SyncData, x_api_key: str = Header(None)):
    """Sync user data from WebApp"""
    # Simple API key validation (optional)
    # if x_api_key != API_SECRET:
    #     raise HTTPException(status_code=401, detail="Invalid API key")
    
    async with async_session() as session:
        # Update or create user data
        result = await session.execute(
            select(UserData).where(UserData.telegram_id == sync.telegram_id)
        )
        user_data = result.scalar_one_or_none()
        
        if user_data:
            user_data.data = sync.data
            user_data.updated_at = datetime.utcnow()
        else:
            user_data = UserData(
                telegram_id=sync.telegram_id,
                data=sync.data
            )
            session.add(user_data)
        
        # Update user's last sync time and timezone
        await session.execute(
            update(User)
            .where(User.telegram_id == sync.telegram_id)
            .values(last_sync=datetime.utcnow(), timezone_offset=sync.timezone_offset)
        )

        # ================= SMART SPENDER ALERT LOGIC =================
        try:
            transactions = sync.data.get("transactions", [])
            if transactions:
                today_str = datetime.utcnow().strftime("%Y-%m-%d")
                thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).timestamp()
                
                # Calculate today's spend
                today_spend = sum(
                    t.get("amount", 0) for t in transactions 
                    if t.get("date", "").startswith(today_str) and t.get("type") == "expense"
                )
                
                # Calculate average daily spend (simple approximation)
                total_past_spend = sum(
                    t.get("amount", 0) for t in transactions
                    if t.get("type") == "expense" 
                )
                # Avoid division by zero, assume at least 1 day if data exists
                days_tracked = 30 # Simplified for now, usually would be (max_date - min_date)
                avg_daily_spend = total_past_spend / days_tracked if days_tracked > 0 else 0
                
                # Thresholds
                if today_spend > 50 and today_spend > (avg_daily_spend * 1.5):
                     # Send Alert
                    # We need to get the bot app instance or use a raw bot request.
                    # Since we are in FastAPI, we don't have direct access to 'app' from lifespan easily here without globals or state.
                    # But we can use the bot token directly.
                    from telegram import Bot
                    bot = Bot(token=BOT_TOKEN)
                    
                    # Get user lang
                    user_result = await session.execute(select(User).where(User.telegram_id == sync.telegram_id))
                    db_user = user_result.scalar_one_or_none()
                    if db_user and db_user.notifications_enabled:
                        lang = db_user.language
                        await bot.send_message(
                            chat_id=sync.telegram_id,
                            text=get_msg(lang, "spending_alert").format(
                                amount=f"${today_spend:.2f}",
                                avg=f"${avg_daily_spend:.2f}"
                            ),
                            parse_mode="Markdown"
                        )
                        logger.info(f"Sent spending alert to {sync.telegram_id}")

        except Exception as e:
            logger.error(f"Error in smart spender logic: {e}")
        # =============================================================
        
        await session.commit()
    
    return {"status": "ok", "synced_at": datetime.utcnow().isoformat()}

@app.get("/api/user/{telegram_id}")
async def get_user(telegram_id: int):
    """Get user info"""
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == telegram_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            telegram_id=user.telegram_id,
            language=user.language,
            notifications_enabled=user.notifications_enabled
        )

@app.get("/api/data/{telegram_id}")
async def get_data(telegram_id: int):
    """Get user's synced data"""
    async with async_session() as session:
        result = await session.execute(
            select(UserData).where(UserData.telegram_id == telegram_id)
        )
        user_data = result.scalar_one_or_none()
        
        if not user_data:
            return {"data": None}
        
        return {"data": user_data.data, "updated_at": user_data.updated_at.isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
