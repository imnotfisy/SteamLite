' Starts the SteamLite Online server with no window. The Startup entry points here.
Dim sh, fso, dir, node
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
node = "C:\Program Files\nodejs\node.exe"
If Not fso.FileExists(node) Then node = "node"
sh.CurrentDirectory = dir
If Not fso.FolderExists(dir & "\data") Then fso.CreateFolder dir & "\data"
sh.Run "cmd /c """ & """" & node & """ server.js >> data\out.log 2>&1""", 0, False
sh.Run "cmd /c """ & """" & node & """ tunnel.js >> data\cf-out.log 2>&1""", 0, False
