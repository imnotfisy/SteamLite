; SteamLite NSIS installer
; Builds a Modern-UI wizard: Welcome -> Install Mode (all users / just me,
; with upgrade detection) -> Directory -> Install -> Finish (optional launch).
; Supports silent installs via the standard NSIS /S switch, which the app's
; own self-update flow (main.dev.js restart-for-update) already uses.
;
; Build with (from this folder):
;   "C:\Program Files (x86)\NSIS\makensis.exe" /DAPP_VERSION=8.1.4 /DAPP_DIR=<staged app folder> /DOUT_FILE=<output .exe> SteamLite.nsi

!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"

!ifndef APP_VERSION
  !define APP_VERSION "0.0.0"
!endif
; APP_VERSION is the label shown to people (can be "9.0.0-beta"); VIProductVersion needs plain numbers, so APP_VERSION_NUM is used there
!ifndef APP_VERSION_NUM
  !define APP_VERSION_NUM "${APP_VERSION}"
!endif
!ifndef APP_DIR
  !error "APP_DIR must be defined (the staged Electron app folder to package)"
!endif
!ifndef OUT_FILE
  !define OUT_FILE "SteamLite.Setup.${APP_VERSION}.exe"
!endif

!define APP_NAME "SteamLite"
!define APP_EXE "SteamLite.exe"
!define UPDATER_EXE "SteamLite Updater.exe"
!define UPDATER_DIR "$LOCALAPPDATA\SteamLite Updater"
!define UPDATER_SRC "..\updater\SteamLite Updater.exe"
!define UNINSTALL_EXE "Uninstall SteamLite.exe"
; Beta builds are packaged with /DWITH_DEBUG: "SteamLite Debug.exe" (debug tools) is installed next to the app. Stable builds never include it.
!define DEBUG_EXE "SteamLite Debug.exe"
!define DEBUG_SRC "..\debugtool\SteamLite Debug.exe"
!define APP_PUBLISHER "SteamLite"
!define UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\SteamLite"
!define ICON_PATH "..\app_src\icon.ico"

; ---------- MultiUser / installer-level settings (must be defined before including MultiUser.nsh) ----------
!define MULTIUSER_EXECUTIONLEVEL Highest
!define MULTIUSER_MUI
!define MULTIUSER_INSTALLMODE_COMMANDLINE
!define MULTIUSER_INSTALLMODE_INSTDIR "${APP_NAME}"
!define MULTIUSER_INSTALLMODE_INSTDIR_REGISTRY_KEY "${UNINST_KEY}"
!define MULTIUSER_INSTALLMODE_INSTDIR_REGISTRY_VALUENAME "InstallLocation"
!define MULTIUSER_INSTALLMODE_DEFAULT_REGISTRY_KEY "${UNINST_KEY}"
!define MULTIUSER_INSTALLMODE_DEFAULT_REGISTRY_VALUENAME "InstallLocation"

!include "MultiUser.nsh"

Name "${APP_NAME}"
OutFile "${OUT_FILE}"
Unicode True
RequestExecutionLevel Highest
ShowInstDetails show
ShowUnInstDetails show

!define MUI_ICON "${ICON_PATH}"
!define MUI_UNICON "${ICON_PATH}"
!define MUI_HEADERIMAGE
!define MUI_ABORTWARNING

VIProductVersion "${APP_VERSION_NUM}.0"
VIAddVersionKey "ProductName" "${APP_NAME}"
VIAddVersionKey "ProductVersion" "${APP_VERSION}"
VIAddVersionKey "FileVersion" "${APP_VERSION_NUM}"
VIAddVersionKey "CompanyName" "${APP_PUBLISHER}"
VIAddVersionKey "FileDescription" "${APP_NAME} Setup"
VIAddVersionKey "LegalCopyright" ""

Var EditionDlg
Var RadioFull
Var RadioLite
Var Edition
Var EditionSet

Function EditionPage
  ; silent installs (the updater) keep whatever edition is already set unless /EDITION=lite|full is given
  IfSilent 0 +2
    Abort
  nsDialogs::Create 1018
  Pop $EditionDlg
  ${If} $EditionDlg == error
    Abort
  ${EndIf}
  !insertmacro MUI_HEADER_TEXT "Choose an edition" "You can switch between them any time in Settings > Advanced."
  ${NSD_CreateRadioButton} 10u 10u 100% 12u "Full - every tool and feature (recommended)"
  Pop $RadioFull
  ${NSD_CreateLabel} 24u 24u 90% 20u "Seasons, levels, statistics, wishlist tools, backups, the command palette extras and more."
  Pop $0
  ${NSD_CreateRadioButton} 10u 52u 100% 12u "Lite - just the basics to browse and launch games"
  Pop $RadioLite
  ${NSD_CreateLabel} 24u 66u 90% 20u "Much lighter on memory and CPU. Library, search, launching, tray, themes and updates."
  Pop $0
  ${If} $Edition == "lite"
    ${NSD_Check} $RadioLite
  ${Else}
    ${NSD_Check} $RadioFull
  ${EndIf}
  nsDialogs::Show
FunctionEnd

Function EditionLeave
  ${NSD_GetState} $RadioLite $0
  ${If} $0 == ${BST_CHECKED}
    StrCpy $Edition "lite"
  ${Else}
    StrCpy $Edition "full"
  ${EndIf}
  StrCpy $EditionSet "1"
FunctionEnd

; ---------- Pages ----------
!insertmacro MUI_PAGE_WELCOME
!insertmacro MULTIUSER_PAGE_INSTALLMODE
!insertmacro MUI_PAGE_DIRECTORY
Page custom EditionPage EditionLeave
!insertmacro MUI_PAGE_INSTFILES

!define MUI_FINISHPAGE_RUN "$INSTDIR\${APP_EXE}"
!define MUI_FINISHPAGE_RUN_TEXT "Launch SteamLite"
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Function .onInit
  !insertmacro MULTIUSER_INIT
  StrCpy $Edition "full"
  StrCpy $EditionSet ""
  ${GetParameters} $R0
  ${GetOptions} $R0 "/EDITION=" $R1
  ${If} $R1 == "lite"
  ${OrIf} $R1 == "full"
    StrCpy $Edition $R1
    StrCpy $EditionSet "1"
  ${EndIf}
FunctionEnd

Function un.onInit
  !insertmacro MULTIUSER_UNINIT
FunctionEnd

; ---------- Install ----------
Section "SteamLite" SEC_APP
  SectionIn RO

  ; Upgrades: make sure no SteamLite process is still holding SteamLite.exe open, otherwise
  ; the copy below fails with "file in use". (The in-app updater quits the app first; this is a backstop.)
  nsExec::Exec 'taskkill /F /T /IM "${APP_EXE}"'
  Sleep 800

  SetOutPath "$INSTDIR"
  File /r "${APP_DIR}\*.*"

  ; the app reads this once after an install that chose an edition
  ${If} $EditionSet == "1"
    FileOpen $0 "$INSTDIR\edition.txt" w
    FileWrite $0 "$Edition"
    FileClose $0
  ${EndIf}

!ifdef WITH_DEBUG
  File "${DEBUG_SRC}"
  CreateShortCut "$SMPROGRAMS\${APP_NAME} Debug Tools.lnk" "$INSTDIR\${DEBUG_EXE}" "" "$INSTDIR\${DEBUG_EXE}"
!else
  ; a stable build installed over a beta removes the debug tools
  Delete "$INSTDIR\${DEBUG_EXE}"
  Delete "$SMPROGRAMS\${APP_NAME} Debug Tools.lnk"
!endif

  WriteUninstaller "$INSTDIR\${UNINSTALL_EXE}"

  ; Shortcuts (both created, matching the previous installer's defaults)
  CreateDirectory "$SMPROGRAMS"
  CreateShortCut "$SMPROGRAMS\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\${APP_EXE}"
  CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\${APP_EXE}"
  ; The stand-alone updater lives in its own per-user folder, outside the install folder. "try" means a
  ; copy that is currently running (and so locked) is skipped instead of failing the install.
  CreateDirectory "${UPDATER_DIR}"
  SetOutPath "${UPDATER_DIR}"
  ; If the updater started this install it is running, and a running exe cannot be overwritten (the old "skip if locked"
  ; left the previous updater in place forever). Windows does allow renaming a running exe, so move the old one aside
  ; first, then write the new one; the leftover .old file is removed now or at the next reboot.
  Delete "${UPDATER_DIR}\${UPDATER_EXE}.old"
  IfFileExists "${UPDATER_DIR}\${UPDATER_EXE}" 0 +2
    Rename "${UPDATER_DIR}\${UPDATER_EXE}" "${UPDATER_DIR}\${UPDATER_EXE}.old"
  SetOverwrite try
  File "${UPDATER_SRC}"
  SetOverwrite on
  ; no /REBOOTOK here: it made Windows ask for a restart. If the old copy is locked it simply stays until the updater
  ; next starts, which deletes it.
  Delete "${UPDATER_DIR}\${UPDATER_EXE}.old"
  SetOutPath "$INSTDIR"
  CreateShortCut "$SMPROGRAMS\${APP_NAME} Updater.lnk" "${UPDATER_DIR}\${UPDATER_EXE}" "" "${UPDATER_DIR}\${UPDATER_EXE}"

  ; Add/Remove Programs entry, under the hive matching the chosen install mode
  WriteRegStr SHCTX "${UNINST_KEY}" "DisplayName" "${APP_NAME}"
  WriteRegStr SHCTX "${UNINST_KEY}" "DisplayVersion" "${APP_VERSION}"
  WriteRegStr SHCTX "${UNINST_KEY}" "Publisher" "${APP_PUBLISHER}"
  WriteRegStr SHCTX "${UNINST_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr SHCTX "${UNINST_KEY}" "UninstallString" '"$INSTDIR\${UNINSTALL_EXE}"'
  WriteRegStr SHCTX "${UNINST_KEY}" "QuietUninstallString" '"$INSTDIR\${UNINSTALL_EXE}" /S'
  WriteRegStr SHCTX "${UNINST_KEY}" "DisplayIcon" "$INSTDIR\${APP_EXE}"
  WriteRegDWORD SHCTX "${UNINST_KEY}" "NoModify" 1
  WriteRegDWORD SHCTX "${UNINST_KEY}" "NoRepair" 1

  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD SHCTX "${UNINST_KEY}" "EstimatedSize" "$0"
SectionEnd

; ---------- Uninstall ----------
Section "Uninstall"
  ; Best-effort: stop the app if it's running
  nsExec::Exec 'taskkill /F /IM "${APP_EXE}"'

  Delete "$SMPROGRAMS\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME} Updater.lnk"
  Delete "$SMPROGRAMS\${APP_NAME} Debug Tools.lnk"
  RMDir /r "${UPDATER_DIR}"
  Delete "$DESKTOP\${APP_NAME}.lnk"

  DeleteRegKey SHCTX "${UNINST_KEY}"

  RMDir /r "$INSTDIR"
SectionEnd
