Set-Location "c:\Users\rv347\NIVORA-NEW\android"
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$gradleBin = "$env:USERPROFILE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\bin\gradle.bat"

Write-Host "Running Gradle assembleDebug..."
& $gradleBin assembleDebug --console=plain --stacktrace 2>&1 | Tee-Object -FilePath "c:\Users\rv347\NIVORA-NEW\gradle-output.txt"

Write-Host "Gradle finished with exit code: $LASTEXITCODE"

$builtApk = "c:\Users\rv347\NIVORA-NEW\android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $builtApk) {
    Copy-Item $builtApk "c:\Users\rv347\NIVORA-NEW\Nivora-debug.apk" -Force
    Copy-Item $builtApk "c:\Users\rv347\NIVORA-NEW\Nivora.apk" -Force
    Write-Host "SUCCESS: Generated Nivora-debug.apk at c:\Users\rv347\NIVORA-NEW\Nivora-debug.apk"
    Write-Host "SUCCESS: Generated Nivora.apk at c:\Users\rv347\NIVORA-NEW\Nivora.apk"
} else {
    Write-Host "APK not found at $builtApk"
}
