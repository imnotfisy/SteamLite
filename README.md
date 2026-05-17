SteamLite
A lightweight, high-performance desktop client alternative for managing and launching your Steam library. Built with Javascript and NodeJS, Steam Lite focuses on speed, minimal resource consumption, and a sleek, modern user interface.

 Features
Ultra-Lightweight: Dramatically lower RAM and CPU footprint compared to the official Electron-based Steam client.

Modern UI: A clean, scannable dashboard featuring a premium, semi-transparent glassmorphism aesthetic.

Fast Launching: Quick access to your installed library with instant game execution.

Library Management: Seamlessly scan, filter, and organize your local Steam games.

 Tech Stack
Language: Javascript

UI Framework: NodeJS


 Preview
<img width="1286" height="794" alt="Untitled" src="https://github.com/user-attachments/assets/62ad98f1-d166-42f7-a3e5-d7a3bdcf8ef7" />

 Configuration
Steam Lite automatically attempts to detect your default Steam installation directory. If your library is installed in a custom location, you can configure the path in the application settings or update the config.json file generated upon the first launch:

JSON
{
  "steam_path": "C:\\Program Files (x86)\\Steam",
  "theme": "glassmorphism",
  "close_to_tray": true
}
 Contributing
Contributions are welcome! If you'd like to improve Steam Lite, please follow these steps:

Fork the repository.

Create a new feature branch (git checkout -b feature/AmazingFeature).

Commit your changes (git commit -m 'Add some AmazingFeature').

Push to the branch (git push origin feature/AmazingFeature).

Open a Pull Request.
