$envContent = Get-Content apps\web\.env.local
$dbUrlLine = $envContent | Select-String -Pattern "^DATABASE_URL="
if ($dbUrlLine) {
    $dbUrl = $dbUrlLine.Line.Split('=', 2)[1].Trim('"', "'")
    $env:DATABASE_URL = $dbUrl
    pnpm --filter @solscribe/db push
} else {
    Write-Host "DATABASE_URL not found in .env.local"
}
