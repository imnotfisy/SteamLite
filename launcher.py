import os
import re
import json
import urllib.request
import customtkinter as ctk
from tkinter import messagebox, colorchooser

# =========================================================
# CONFIG
# =========================================================

APP_NAME = "SteamLite"
APP_VERSION = "1.5"

STEAM_APPS = r"C:\Program Files (x86)\Steam\steamapps"

SETTINGS_FILE = "settings.json"

GITHUB_VERSION_URL = "https://raw.githubusercontent.com/YOURNAME/SteamLite/main/version.json"

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

app = ctk.CTk()
app.geometry("1400x850")
app.title(APP_NAME)

main_frame = None
sidebar = None
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
# UPDATE SYSTEM (CLEAN)
# =========================================================

def check_update():

    try:
        with urllib.request.urlopen(GITHUB_VERSION_URL) as r:
            data = json.loads(r.read().decode())

        if data["version"] != APP_VERSION:
            return data

    except:
        pass

    return None


def show_update(update):

    popup = ctk.CTkToplevel(app)
    popup.geometry("500x350")
    popup.title("Update Available")
    popup.grab_set()

    ctk.CTkLabel(
        popup,
        text=f"Version {update['version']}",
        font=("Arial", 22, "bold")
    ).pack(pady=20)

    ctk.CTkLabel(
        popup,
        text=update.get("notes", ""),
        justify="left"
    ).pack(padx=20)

    ctk.CTkButton(
        popup,
        text="OK",
        command=popup.destroy
    ).pack(pady=20)

# =========================================================
# STEAM GAME SCANNER (AppID ONLY)
# =========================================================

def scan_games():

    games = []

    if not os.path.exists(STEAM_APPS):
        return games

    try:
        for f in os.listdir(STEAM_APPS):

            if not f.startswith("appmanifest"):
                continue

            path = os.path.join(STEAM_APPS, f)

            with open(path, "r", encoding="utf-8", errors="ignore") as file:
                txt = file.read()

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
    try:
        os.startfile(f"steam://run/{game['appid']}")
    except:
        messagebox.showerror("Error", "Could not launch game")

# =========================================================
# FAVORITES SYSTEM
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
    global main_frame
    if main_frame:
        for w in main_frame.winfo_children():
            w.destroy()

# =========================================================
# HOME
# =========================================================

def show_home():

    clear()

    ctk.CTkLabel(
        main_frame,
        text="Home",
        font=("Arial", 32, "bold")
    ).pack(anchor="w", padx=20, pady=10)

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

    def pick_color():

        global ACCENT

        c = colorchooser.askcolor()[1]
        if c:
            ACCENT = c
            settings["accent"] = c
            save_settings(settings)

    ctk.CTkButton(
        main_frame,
        text="Change Accent Color",
        command=pick_color
    ).pack(pady=20)

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

# update check
update = check_update()
if update:
    show_update(update)

games_cache = scan_games()

build()
app.mainloop()
