Stop-Process -Name java -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

$dest = "c:\Users\rv347\NIVORA-NEW\android\app\src\main\assets\public"
if (Test-Path $dest) {
    Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Force -Path $dest | Out-Null

Copy-Item "c:\Users\rv347\NIVORA-NEW\mobile-shell\*" $dest -Recurse -Force

Write-Host "Running Capacitor Android Sync..."
node "c:\Users\rv347\NIVORA-NEW\node_modules\@capacitor\cli\bin\capacitor" sync android

Write-Host "Assets synced successfully. Files in $dest :"
Get-ChildItem $dest | Select-Object Name, Length
