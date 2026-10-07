param([string]$Action = '', [string]$Source = 'spotify', [double]$Seek = 0, [int]$Loops = 0)
$ErrorActionPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Runtime.WindowsRuntime
[void][Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime]
[void][Windows.Storage.Streams.IRandomAccessStreamWithContentType, Windows.Storage.Streams, ContentType = WindowsRuntime]
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Await($op, $type) { $t = $asTask.MakeGenericMethod($type).Invoke($null, @($op)); [void]$t.Wait(6000); return $t.Result }

$mgrType = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]
$mgr = Await ($mgrType::RequestAsync()) $mgrType

function Pick {
    $all = @($mgr.GetSessions())
    if ($Source -ne 'any') { foreach ($s in $all) { if ($s.SourceAppUserModelId -match 'Spotify') { return $s } }; return $null }
    foreach ($s in $all) { if ($s.GetPlaybackInfo().PlaybackStatus.ToString() -eq 'Playing') { return $s } }
    if ($all.Count -gt 0) { return $all[0] }
    return $null
}

[void][Windows.Storage.Streams.IInputStream, Windows.Storage.Streams, ContentType = WindowsRuntime]
$asStream = [System.IO.WindowsRuntimeStreamExtensions].GetMethod('AsStreamForRead', [Type[]]@([Windows.Storage.Streams.IInputStream]))
function Thumb($props) {
    try {
        $ref = $props.Thumbnail; if (-not $ref) { return '' }
        $st = Await ($ref.OpenReadAsync()) ([Windows.Storage.Streams.IRandomAccessStreamWithContentType])
        if (-not $st) { return '' }
        $net = $asStream.Invoke($null, @($st))
        $ms = New-Object System.IO.MemoryStream; $net.CopyTo($ms)
        if ($ms.Length -le 0 -or $ms.Length -gt 3000000) { return '' }
        $bytes = $ms.ToArray()
        $mime = if ($bytes[0] -eq 0x89) { 'image/png' } else { 'image/jpeg' }
        return 'data:' + $mime + ';base64,' + [Convert]::ToBase64String($bytes)
    } catch { return '' }
}

if ($Action -ne '') {
    $s = Pick; if (-not $s) { 'none'; exit }
    switch ($Action) {
        'next'   { $r = Await ($s.TrySkipNextAsync()) ([bool]) }
        'prev'   { $r = Await ($s.TrySkipPreviousAsync()) ([bool]) }
        'toggle' { $r = Await ($s.TryTogglePlayPauseAsync()) ([bool]) }
        'play'   { $r = Await ($s.TryPlayAsync()) ([bool]) }
        'pause'  { $r = Await ($s.TryPauseAsync()) ([bool]) }
        'seek'   { $r = Await ($s.TryChangePlaybackPositionAsync([long]($Seek * 10000000))) ([bool]) }
    }
    "ok $r"; exit
}

$lastKey = ''; $art = ''; $n = 0
while ($true) {
    $s = Pick
    if (-not $s) { $out = @{ none = $true } }
    else {
        $props = Await ($s.TryGetMediaPropertiesAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties])
        $info = $s.GetPlaybackInfo(); $tl = $s.GetTimelineProperties()
        $key = $s.SourceAppUserModelId + '|' + $props.Title + '|' + $props.Artist + '|' + $props.AlbumTitle
        $newTrack = $key -ne $lastKey
        if ($newTrack) { $art = Thumb $props; $lastKey = $key }
        $out = @{ app = [string]$s.SourceAppUserModelId; title = [string]$props.Title; artist = [string]$props.Artist; album = [string]$props.AlbumTitle
                  status = $info.PlaybackStatus.ToString(); pos = [math]::Round($tl.Position.TotalSeconds, 1); dur = [math]::Round(($tl.EndTime - $tl.StartTime).TotalSeconds, 1)
                  canNext = [bool]$info.Controls.IsNextEnabled; canPrev = [bool]$info.Controls.IsPreviousEnabled; canSeek = [bool]$info.Controls.IsPlaybackPositionEnabled
                  track = $key }
        if ($newTrack) { $out.art = $art }
    }
    [Console]::Out.WriteLine(($out | ConvertTo-Json -Compress)); [Console]::Out.Flush()
    $n++; if ($Loops -gt 0 -and $n -ge $Loops) { break }
    Start-Sleep -Milliseconds 1000
}
