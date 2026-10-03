$ErrorActionPreference = "Stop"

Write-Host "=== Step 1: Stopping running Java/Gradle processes ==="
cmd.exe /c "taskkill /F /IM java.exe 2>nul" | Out-Null
Start-Sleep -Seconds 1

$projectRoot = "c:\Users\rv347\NIVORA-NEW"
$androidDir = "$projectRoot\android"
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$apksigner = "$env:ANDROID_HOME\build-tools\34.0.0\apksigner.bat"
$zipalign = "$env:ANDROID_HOME\build-tools\34.0.0\zipalign.exe"
$keystorePath = "$androidDir\app\debug.keystore"

Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"

Write-Host "=== Step 2: Syncing Capacitor Web Assets and Plugins ==="
Set-Location $projectRoot
node "$projectRoot\node_modules\@capacitor\cli\bin\capacitor" sync android
if ($LASTEXITCODE -ne 0) {
    Write-Error "Capacitor sync failed with exit code $LASTEXITCODE"
}

Write-Host "=== Step 3: Compiling Debug APK (clean + assembleDebug) ==="
Set-Location $androidDir
cmd.exe /c "gradlew.bat clean assembleDebug --stacktrace"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gradle build failed with exit code $LASTEXITCODE"
}

$builtApk = "$androidDir\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $builtApk)) {
    Write-Error "Built APK not found at $builtApk"
}

Write-Host "=== Step 5: Applying V1, V2, and V3 signatures with apksigner ==="
& $apksigner sign --ks "$keystorePath" --ks-pass pass:android --ks-key-alias androiddebugkey --key-pass pass:android --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true --v4-signing-enabled false "$builtApk"

Write-Host "=== Step 6: Verifying APK signatures and compatibility ==="
& $apksigner verify --verbose --print-certs "$builtApk"

Write-Host "=== Step 7: Publishing final universal APK to output locations ==="
$namedApk = "$androidDir\app\build\outputs\apk\debug\Nivora-debug.apk"
Copy-Item $builtApk $namedApk -Force
Copy-Item $builtApk "$projectRoot\Nivora-debug.apk" -Force
Copy-Item $builtApk "$projectRoot\Nivora.apk" -Force

$apkSize = (Get-Item $builtApk).Length
Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
Write-Host "Final Installable APK: $builtApk" -ForegroundColor Green
Write-Host "Named Debug APK:       $namedApk" -ForegroundColor Green
Write-Host "Root APK:              $projectRoot\Nivora-debug.apk" -ForegroundColor Green
Write-Host "Size:                  $apkSize bytes" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green

