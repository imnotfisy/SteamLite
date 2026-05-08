import os
import re
import json
import urllib.request
import customtkinter as ctk
from tkinter import colorchooser
from PIL import Image

# =========================================================
# CONFIG
# =========================================================

APP_NAME = "SteamLite"

SETTINGS_FILE = "settings.json"

STEAM_ROOT = r"C:\Program Files (x86)\Steam"
STEAM_APPS = os.path.join(STEAM_ROOT, "steamapps")
STEAM_CONFIG = os.path.join(STEAM_ROOT, "config", "loginusers.vdf")

CACHE_DIR = "cache"
os.makedirs(CACHE_DIR, exist_ok=True)

WINDOW_SIZE = "1150x700"

FONT_TITLE = ("Arial", 38, "bold")
FONT_TEXT = ("Arial", 18)

BUTTON_HEIGHT = 65
CARD_HEIGHT = 130

ctk.set_appearance_mode("dark")

app = ctk.CTk()
app.title(APP_NAME)
app.geometry(WINDOW_SIZE)
app.iconbitmap("steamlite.ico")
main_frame = None
sidebar = None

steam_user = {}
games_cache = []

# =========================================================
# SETTINGS
# =========================================================

DEFAULT_SETTINGS = {
    "version": {"major": 1, "minor": 2, "patch": 0},
    "accent": "#1f6aa5",
    "favorites": [],
    "changelog": [],
    "steam_api_key": "",
    "steamid64": ""
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

# =========================================================
# AUTO CHANGES (v1.2.0 LOG)
# =========================================================

if not settings.get("changelog"):
    settings["changelog"] = []

settings["changelog"].insert(0, {
    "version": "1.2.0",
    "text": (
        "UI scaling overhaul (bigger UI + smaller window)\n"
        "Friends system fully fixed with Steam Web API integration\n"
        "Setup screen now hides after API key is saved\n"
        "Improved navigation flow across all tabs\n"
        "General stability improvements"
    )
})

save_settings(settings)

# =========================================================
# STEAM USER
# =========================================================

def load_avatar(steamid):

    avatar_dir = os.path.join(STEAM_ROOT, "config", "avatarcache")

    if not os.path.exists(avatar_dir):
        return None

    for f in os.listdir(avatar_dir):
        if steamid[-6:] in f:
            try:
                img = Image.open(os.path.join(avatar_dir, f)).convert("RGBA")
                return ctk.CTkImage(img, img, size=(72, 72))
            except:
                pass

    return None


def get_steam_user():

    if not os.path.exists(STEAM_CONFIG):
        return {"name": "Steam User", "steamid": "", "avatar": None}

    with open(STEAM_CONFIG, "r", encoding="utf-8", errors="ignore") as f:
        data = f.read()

    users = re.findall(r'"(\d+)"\s*\{([^}]+)', data, re.DOTALL)

    for steamid, block in users:
        if '"MostRecent"' not in block:
            continue

        name = re.search(r'"PersonaName"\s*"(.+?)"', block)
        persona = name.group(1) if name else "Steam User"

        return {
            "steamid": steamid,
            "name": persona,
            "avatar": load_avatar(steamid)
        }

    return {"name": "Steam User", "steamid": "", "avatar": None}

# =========================================================
# STEAM API
# =========================================================

def steam_get(url):
    try:
        with urllib.request.urlopen(url) as r:
            return json.loads(r.read().decode())
    except:
        return None


def get_friend_list(steamid, key):

    url = (
        "https://api.steampowered.com/ISteamUser/GetFriendList/v1/"
        f"?key={key}&steamid={steamid}&relationship=friend"
    )

    data = steam_get(url)

    if not data or "friendslist" not in data:
        return []

    return data["friendslist"]["friends"]


def get_friend_details(ids, key):

    if not ids:
        return []

    url = (
        "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/"
        f"?key={key}&steamids={','.join(ids)}"
    )

    data = steam_get(url)

    if not data:
        return []

    return data["response"]["players"]

# =========================================================
# GAME SCANNER
# =========================================================

def get_game_art(appid):
    try:
        url = f"https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header.jpg"
        path = os.path.join(CACHE_DIR, f"{appid}.jpg")

        if not os.path.exists(path):
            urllib.request.urlretrieve(url, path)

        img = Image.open(path).convert("RGBA")
        img = img.resize((140, 65))

        return ctk.CTkImage(img, img, size=(140, 65))

    except:
        return None


def scan_games():

    games = []

    if not os.path.exists(STEAM_APPS):
        return games

    for f in os.listdir(STEAM_APPS):
        if not f.endswith(".acf"):
            continue

        try:
            with open(os.path.join(STEAM_APPS, f), "r", encoding="utf-8", errors="ignore") as file:
                txt = file.read()

            appid = re.search(r'"appid"\s*"(.+?)"', txt)
            name = re.search(r'"name"\s*"(.+?)"', txt)

            if appid and name:
                games.append({"appid": appid.group(1), "name": name.group(1)})

        except:
            pass

    return games

# =========================================================
# CORE UI
# =========================================================

def clear_main():
    for w in main_frame.winfo_children():
        w.destroy()

# =========================================================
# FRIENDS
# =========================================================

def show_friends():

    clear_main()

    ctk.CTkLabel(main_frame, text="Friends", font=FONT_TITLE).pack(anchor="w", padx=20, pady=15)

    container = ctk.CTkScrollableFrame(main_frame)
    container.pack(fill="both", expand=True, padx=20, pady=20)

    steamid = steam_user.get("steamid")
    key = settings.get("steam_api_key", "").strip()

    if not key:

        box = ctk.CTkFrame(container)
        box.pack(fill="x", pady=10)

        ctk.CTkLabel(
            box,
            text=(
                "Steam API Setup:\n\n"
                "1. https://steamcommunity.com/dev/apikey\n"
                "2. Login\n"
                "3. Generate API key\n"
                "4. Paste below"
            ),
            justify="left",
            font=FONT_TEXT
        ).pack(anchor="w", padx=10, pady=10)

        api_var = ctk.StringVar()

        ctk.CTkEntry(box, textvariable=api_var).pack(fill="x", padx=10, pady=5)

        def save_api():
            settings["steam_api_key"] = api_var.get().strip()
            save_settings(settings)
            show_friends()

        ctk.CTkButton(box, text="Save API Key", height=55, command=save_api).pack(pady=5)

        def open_json():
            os.startfile(os.path.abspath(SETTINGS_FILE))

        ctk.CTkButton(box, text="Open settings.json", height=55, command=open_json).pack(pady=5)

        return

    friends = get_friend_list(steamid, key)

    if not friends:
        ctk.CTkLabel(container, text="No friends found or profile is private", font=FONT_TEXT).pack(pady=20)
        return

    ids = [f["steamid"] for f in friends]
    details = get_friend_details(ids, key)

    for f in details:

        card = ctk.CTkFrame(container, height=CARD_HEIGHT)
        card.pack(fill="x", pady=6)
        card.pack_propagate(False)

        name = f.get("personaname", "Unknown")
        game = f.get("gameextrainfo", "")

        ctk.CTkLabel(card, text=name, font=("Arial", 20, "bold")).pack(anchor="w", padx=10)

        if game:
            ctk.CTkLabel(card, text=f"Playing: {game}", font=FONT_TEXT).pack(anchor="w", padx=10)

# =========================================================
# LIBRARY
# =========================================================

def launch(game):
    os.startfile(f"steam://run/{game['appid']}")


def show_library():

    clear_main()

    ctk.CTkLabel(main_frame, text="Library", font=FONT_TITLE).pack(anchor="w", padx=20, pady=10)

    container = ctk.CTkScrollableFrame(main_frame)
    container.pack(fill="both", expand=True, padx=20, pady=10)

    for g in games_cache:

        row = ctk.CTkFrame(container, height=CARD_HEIGHT)
        row.pack(fill="x", pady=6)
        row.pack_propagate(False)

        art = get_game_art(g["appid"])

        if art:
            ctk.CTkLabel(row, image=art, text="").pack(side="left", padx=10)

        ctk.CTkLabel(row, text=g["name"], font=FONT_TEXT).pack(side="left", padx=10)

        ctk.CTkButton(row, text="PLAY", height=BUTTON_HEIGHT, command=lambda x=g: launch(x)).pack(side="right", padx=10)

# =========================================================
# SETTINGS
# =========================================================

def show_settings():

    clear_main()

    ctk.CTkLabel(main_frame, text="Settings", font=FONT_TITLE).pack(anchor="w", padx=20, pady=15)

    def pick_color():
        c = colorchooser.askcolor()[1]
        if c:
            settings["accent"] = c
            save_settings(settings)

    ctk.CTkButton(main_frame, text="Accent Color", height=55, command=pick_color).pack(pady=20)

# =========================================================
# NEWS
# =========================================================

def show_news():

    clear_main()

    ctk.CTkLabel(main_frame, text="News", font=FONT_TITLE).pack(anchor="w", padx=20, pady=15)

    container = ctk.CTkScrollableFrame(main_frame)
    container.pack(fill="both", expand=True, padx=20, pady=20)

    for entry in settings.get("changelog", []):

        card = ctk.CTkFrame(container)
        card.pack(fill="x", pady=8)

        ctk.CTkLabel(card, text=f"Version {entry['version']}", font=("Arial", 22, "bold")).pack(anchor="w", padx=10)
        ctk.CTkLabel(card, text=entry["text"], font=FONT_TEXT).pack(anchor="w", padx=10)

# =========================================================
# SIDEBAR
# =========================================================

def build_sidebar():

    global sidebar

    sidebar = ctk.CTkFrame(app, width=280)
    sidebar.pack(side="left", fill="y")

    profile = ctk.CTkFrame(sidebar)
    profile.pack(fill="x", padx=10, pady=10)

    if steam_user.get("avatar"):
        ctk.CTkLabel(profile, image=steam_user["avatar"], text="").pack(pady=10)

    ctk.CTkLabel(profile, text=steam_user["name"], font=("Arial", 20, "bold")).pack()

    ctk.CTkButton(sidebar, text="News", height=60, command=show_news).pack(fill="x", padx=10, pady=6)
    ctk.CTkButton(sidebar, text="Library", height=60, command=show_library).pack(fill="x", padx=10, pady=6)
    ctk.CTkButton(sidebar, text="Friends", height=60, command=show_friends).pack(fill="x", padx=10, pady=6)
    ctk.CTkButton(sidebar, text="Settings", height=60, command=show_settings).pack(fill="x", padx=10, pady=6)

# =========================================================
# START
# =========================================================

steam_user = get_steam_user()
games_cache = scan_games()

main_frame = ctk.CTkFrame(app)
main_frame.pack(side="right", fill="both", expand=True)

build_sidebar()
show_news()

app.mainloop()
