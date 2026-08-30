$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$failures = 0
Get-ChildItem -LiteralPath (Join-Path $root 'js') -Filter '*.js' | ForEach-Object {
  node --check $_.FullName
  if ($LASTEXITCODE -ne 0) { $failures++ }
}
$missing = @()
Get-ChildItem -LiteralPath $root -Filter '*.html' | ForEach-Object {
  $page = $_
  $html = Get-Content -LiteralPath $page.FullName -Raw
  [regex]::Matches($html, '(?:src|href)="([^"]+)"') | ForEach-Object {
    $reference = $_.Groups[1].Value.Split('?')[0]
    if ($reference -notmatch '^(https?:|#|mailto:|tel:|data:|javascript:)' -and -not (Test-Path -LiteralPath (Join-Path $root $reference))) {
      $missing += "$($page.Name): $reference"
    }
  }
}
if ($missing.Count) { $missing | ForEach-Object { Write-Error "Missing reference: $_" }; $failures += $missing.Count }
node (Join-Path $root 'tests\system-core.test.js')
if ($LASTEXITCODE -ne 0) { $failures++ }
if ($failures) { throw "Project verification failed with $failures issue(s)." }
Write-Output 'Project verification passed.'
