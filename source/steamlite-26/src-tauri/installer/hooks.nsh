; SteamLite installer steps that keep updating working with the stand-alone "SteamLite Updater".
; The updater (and the older Electron installers) run:  <installer> /S [/AllUsers | /CurrentUser]

!macro NSIS_HOOK_PREINSTALL
  ; Update in place: an earlier SteamLite (9.x or an earlier 10 beta) is replaced where it lives instead of being installed a second time.
  ReadRegStr $R0 SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\SteamLite" "InstallLocation"
  ${If} $R0 != ""
    StrCpy $R1 $R0 1
    ${If} $R1 == '"'            ; some entries wrap the path in quotes
      StrLen $R2 $R0
      IntOp $R2 $R2 - 2
      StrCpy $R0 $R0 $R2 1
    ${EndIf}
    ${If} ${FileExists} "$R0\*.*"
      StrCpy $INSTDIR $R0
    ${EndIf}
  ${EndIf}

  ; Stop anything still running from that folder so its files can be replaced (the old Electron app, and the core of this one).
  nsExec::Exec `taskkill /F /IM SteamLite.exe`
  nsExec::Exec `powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Process node -ErrorAction SilentlyContinue | Where-Object { $$_.Path -like '$INSTDIR\*' } | Stop-Process -Force"`
  Sleep 800

  ; A 9.x install is an Electron app. The new SteamLite does not use those files, so they are removed. Settings and data live elsewhere and are kept.
  ${If} ${FileExists} "$INSTDIR\resources\app.asar"
    Delete "$INSTDIR\*.pak"
    Delete "$INSTDIR\*.dll"
    Delete "$INSTDIR\*.bin"
    Delete "$INSTDIR\icudtl.dat"
    Delete "$INSTDIR\LICENSE*"
    Delete "$INSTDIR\version"
    Delete "$INSTDIR\Uninstall SteamLite.exe"
    RMDir /r "$INSTDIR\locales"
    RMDir /r "$INSTDIR\resources"
  ${EndIf}
!macroend

!macro NSIS_HOOK_POSTINSTALL
  ; The updater lives in its own folder, so a SteamLite update never has to replace a running updater.
  CreateDirectory "$LOCALAPPDATA\SteamLite Updater"
  CopyFiles /SILENT "$INSTDIR\updater\SteamLite Updater.exe" "$LOCALAPPDATA\SteamLite Updater"
  ; The updater reads the install folder from the registry as a plain path (the installer writes it in quotes).
  WriteRegStr SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\SteamLite" "InstallLocation" "$INSTDIR"
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  nsExec::Exec `powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Process node -ErrorAction SilentlyContinue | Where-Object { $$_.Path -like '$INSTDIR\*' } | Stop-Process -Force"`
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  RMDir /r "$LOCALAPPDATA\SteamLite Updater"
!macroend
