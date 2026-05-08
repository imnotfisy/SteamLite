import os
import re
import json
import sys
import urllib.request
import customtkinter as ctk
from tkinter import colorchooser, messagebox

# =========================================================
# APP CONFIG
# =========================================================

APP_NAME = "SteamLite v1.5"
APP_VERSION = "1.5"

STEAM_ROOT = r"C:\Program Files (x86)\Steam"
STEAM_APPS = os.path.join(STEAM_ROOT, "steamapps")

SETTINGS_FILE = "settings.json"
LOCAL_VERSION_FILE = "version.json"

GITHUB_VERSION_URL = "https://raw.githubusercontent.com/YOURNAME/SteamLite/main/version.json"

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

app = ctk.CTk()
app.geometry("1500x900")
app.title(APP_NAME)

main_frame = None
sidebar = None

steam_user = {}
games_cache = []

# =========================================================
# SETTINGS
# =========================================================

DEFAULT_SETTINGS = {
    "last_seen_version": None,
    "accent": "#1f6aa5",
    "favorites": [],
    "changelog_history": []
}


def load_settings():
    if not os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, "w") as f:
            json.dump(DEFAULT_SETTINGS, f, indent=4)
        return DEFAULT_SETTINGS.copy()

    with open(SETTINGS_FILE, "r") as f:
        return json.load(f)


def save_settings(data):
    with open(SETTINGS_FILE, "w") as f:
        json.dump(data, f, indent=4)


settings = load_settings()
ACCENT = settings.get("accent", "#1f6aa5")

# =========================================================
# AUTO version.json GENERATOR (LOCAL MIRROR)
# =========================================================

def write_local_version_json():

    data = {
        "version": APP_VERSION,
        "name": APP_NAME,
        "notes": settings["changelog_history"][0]["notes"] if settings["changelog_history"] else "",
    }

    with open(LOCAL_VERSION_FILE, "w") as f:
        json.dump(data, f, indent=4)

# =========================================================
# VERSION HISTORY SYSTEM
# =========================================================

UPDATE_NOTES = """
• GitHub auto-update system added 🌐
• Local version.json generator 📄
• Favorites system restored ⭐
• Accent color system 🎨
• Steam AppID launcher improved
"""


def register_version():

    history = settings.get("changelog_history", [])

    if not any(v["version"] == APP_VERSION for v in history):

        history.insert(0, {
            "version": APP_VERSION,
            "notes": UPDATE_NOTES.strip()
        })

        settings["changelog_history"] = history
        save_settings(settings)


register_version()
write_local_version_json()

# =========================================================
# GITHUB UPDATE SYSTEM
# =========================================================

def check_for_update():

    try:
        with urllib.request.urlopen(GITHUB_VERSION_URL) as r:
            data = json.loads(r.read().decode())

        if data["version"] != APP_VERSION:
            return data

    except:
        pass

    return None


def apply_update(update):

    popup = ctk.CTkToplevel(app)
    popup.geometry("520x420")
    popup.title("Update Available")
    popup.grab_set()

    ctk.CTkLabel(
        popup,
        text=f"Version {update['version']} available",
        font=("Arial", 22, "bold")
    ).pack(pady=20)

    ctk.CTkLabel(
        popup,
        text=update.get("notes", ""),
        justify="left"
    ).pack(padx=20)

    def download():

        try:
            with urllib.request.urlopen(update["url"]) as r:
                code = r.read().decode()

            with open(sys.argv[0], "w", encoding="utf-8") as f:
                f.write(code)

            messagebox.showinfo("Updated", "Restart launcher to apply update")
            popup.destroy()

        except Exception as e:
            messagebox.showerror("Error", str(e))

    ctk.CTkButton(popup, text="Update", command=download).pack(pady=10)
    ctk.CTkButton(popup, text="Later", command=popup.destroy).pack()

# =========================================================
# STEAM USER
# =========================================================

def get_steam_user():
    return {"name": "Steam User", "steamid": "", "avatar": None}

# =========================================================
# GAME SCANNER
# =========================================================

def scan_games():

    games = []

    if not os.path.exists(STEAM_APPS):
        return games

    for file in os.listdir(STEAM_APPS):

        if not file.startswith("appmanifest"):
            continue

        path = os.path.join(STEAM_APPS, file)

        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                txt = f.read()

            appid = re.search(r'"appid"\s*"(.+?)"', txt)
            name = re.search(r'"name"\s*"(.+?)"', txt)

            if appid and name:
                games.append({
                    "appid": appid.group(1),
                    "name": name.group(1)
                })

        except:
            pass

    return games

# =========================================================
# LAUNCH GAME
# =========================================================

def launch(game):
    os.startfile(f"steam://run/{game['appid']}")

# =========================================================
# FAVORITES
# =========================================================

def toggle_fav(appid):

    favs = settings["favorites"]

    if appid in favs:
        favs.remove(appid)
    else:
        favs.append(appid)

    save_settings(settings)
    show_library()


def is_fav(appid):
    return appid in settings["favorites"]

# =========================================================
# UI HELPERS
# =========================================================

def clear():
    for w in main_frame.winfo_children():
        w.destroy()

# =========================================================
# HOME
# =========================================================

def show_home():

    clear()

    ctk.CTkLabel(main_frame, text="Home", font=("Arial", 32, "bold")).pack(anchor="w", padx=20)

    container = ctk.CTkScrollableFrame(main_frame)
    container.pack(fill="both", expand=True, padx=20, pady=20)

    for g in games_cache[:10]:

        row = ctk.CTkFrame(container)
        row.pack(fill="x", pady=5)

        ctk.CTkLabel(row, text=g["name"]).pack(side="left", padx=10)

        ctk.CTkButton(
            row,
            text="PLAY",
            fg_color=ACCENT,
            command=lambda x=g: launch(x)
        ).pack(side="right", padx=10)

# =========================================================
# LIBRARY
# =========================================================

def show_library():

    clear()

    container = ctk.CTkScrollableFrame(main_frame)
    container.pack(fill="both", expand=True, padx=20, pady=20)

    for g in games_cache:

        row = ctk.CTkFrame(container)
        row.pack(fill="x", pady=5)

        star = "⭐" if is_fav(g["appid"]) else "☆"

        ctk.CTkButton(
            row,
            text=star,
            width=40,
            command=lambda a=g["appid"]: toggle_fav(a)
        ).pack(side="right")

        ctk.CTkLabel(row, text=g["name"]).pack(side="left", padx=10)

        ctk.CTkButton(
            row,
            text="PLAY",
            fg_color=ACCENT,
            command=lambda x=g: launch(x)
        ).pack(side="right", padx=10)

# =========================================================
# SETTINGS
# =========================================================

def show_settings():

    clear()

    def pick():

        global ACCENT

        c = colorchooser.askcolor()[1]
        if not c:
            return

        ACCENT = c
        settings["accent"] = c
        save_settings(settings)

        build()

    ctk.CTkButton(main_frame, text="Pick Accent Color", command=pick).pack(pady=20)

# =========================================================
# SIDEBAR
# =========================================================

def build_sidebar():

    global sidebar

    sidebar = ctk.CTkFrame(app, width=250)
    sidebar.pack(side="left", fill="y")

    ctk.CTkButton(sidebar, text="Home", command=show_home).pack(fill="x", pady=5)
    ctk.CTkButton(sidebar, text="Library", command=show_library).pack(fill="x", pady=5)
    ctk.CTkButton(sidebar, text="Settings", command=show_settings).pack(fill="x", pady=5)

# =========================================================
# MAIN UI
# =========================================================

def build():

    global main_frame

    for w in app.winfo_children():
        w.destroy()

    build_sidebar()

    main_frame = ctk.CTkFrame(app)
    main_frame.pack(side="right", fill="both", expand=True)

    show_home()

# =========================================================
# STARTUP
# =========================================================

update = check_for_update()
if update:
    apply_update(update)

steam_user = get_steam_user()
games_cache = scan_games()

build()
app.mainloop()
