# Builds "SteamLite Updater.exe" with the .NET Framework compiler that ships with Windows (C# 5, no SDK needed).
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$csc = "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$out = Join-Path $here "SteamLite Updater.exe"
& $csc /nologo /target:winexe /optimize+ /platform:anycpu "/out:$out" `
    "/win32icon:$here\..\app\icon.ico" "/win32manifest:$here\app.manifest" `
    /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.Web.Extensions.dll `
    "$here\Updater.cs"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Get-Item $out | Select-Object Name, Length
