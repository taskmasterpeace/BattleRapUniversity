# Finalize Crowd Organization
# Uses raw mappings from crowd-audit-complete.ps1 to organize ALL sprites
# Run from: ai-battlerap/public/sprites/

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FINALIZING CROWD ORGANIZATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Source the raw mappings from the audit script
. .\crowd-audit-complete.ps1 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue | Out-Null

# Paths
$originalPath = "crowd\original"
$organizedPath = "crowd\organized"

# Ensure directories exist
New-Item -ItemType Directory -Force -Path "$organizedPath\black" | Out-Null
New-Item -ItemType Directory -Force -Path "$organizedPath\white" | Out-Null
New-Item -ItemType Directory -Force -Path "$organizedPath\mixed" | Out-Null

# Count variants per category
$categoryCounters = @{}
$processedMappings = @{}

# First pass: count and build final mappings
foreach ($key in ($rawMappings.Keys | Sort-Object)) {
    $category = $rawMappings[$key] -replace '^crowd_', ''  # Remove "crowd_" prefix

    if (-not $categoryCounters.ContainsKey($category)) {
        $categoryCounters[$category] = 1
    } else {
        $categoryCounters[$category]++
    }

    $variant = $categoryCounters[$category]
    $processedMappings[$key] = @{
        category = $category
        variant = $variant
    }
}

# Get all source directories from backup
$sourceDirs = Get-ChildItem -Path $originalPath -Directory

Write-Host "Processing $($processedMappings.Count) sprites...`n" -ForegroundColor Yellow

$copiedCount = 0
$notFoundCount = 0
$errors = @()

# Second pass: copy files
foreach ($file in $processedMappings.Keys) {
    $mapping = $processedMappings[$file]
    $category = $mapping.category
    $variant = $mapping.variant.ToString().PadLeft(3, '0')

    # Split category: "black_hype" -> demo="black", reaction="hype"
    $parts = $category -split '_', 2
    if ($parts.Count -lt 2) {
        Write-Host "  [ERR] Invalid category: $category for $file" -ForegroundColor Red
        continue
    }

    $demo = $parts[0]
    $reaction = $parts[1]
    $newName = "${reaction}_${variant}.png"
    $destPath = Join-Path $organizedPath "$demo\$newName"

    # Find source file in backup
    $found = $false
    foreach ($srcDir in $sourceDirs) {
        $srcPath = Join-Path $srcDir.FullName $file

        if (Test-Path $srcPath) {
            try {
                Copy-Item -Path $srcPath -Destination $destPath -Force -ErrorAction Stop
                Write-Host "  [OK] $file -> $demo\$newName" -ForegroundColor Green
                $copiedCount++
                $found = $true
                break
            } catch {
                Write-Host "  [ERR] Failed to copy $file : $_" -ForegroundColor Red
                $errors += "$file : $_"
            }
        }
    }

    if (-not $found) {
        Write-Host "  [MISS] $file not found in backup" -ForegroundColor Yellow
        $notFoundCount++
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ORGANIZATION COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Total sprites: $($processedMappings.Count)" -ForegroundColor Cyan
Write-Host "  Successfully copied: $copiedCount" -ForegroundColor Green
Write-Host "  Not found: $notFoundCount" -ForegroundColor Yellow
Write-Host "  Errors: $($errors.Count)" -ForegroundColor $(if ($errors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "  Location: $organizedPath\" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Show what we got
Write-Host "Counting organized sprites..." -ForegroundColor Cyan
$blackCount = (Get-ChildItem "$organizedPath\black" -File | Measure-Object).Count
$whiteCount = (Get-ChildItem "$organizedPath\white" -File | Measure-Object).Count
$mixedCount = (Get-ChildItem "$organizedPath\mixed" -File | Measure-Object).Count
$totalOrganized = $blackCount + $whiteCount + $mixedCount

Write-Host "  Black: $blackCount sprites" -ForegroundColor White
Write-Host "  White: $whiteCount sprites" -ForegroundColor White
Write-Host "  Mixed: $mixedCount sprites" -ForegroundColor White
Write-Host "  TOTAL ORGANIZED: $totalOrganized sprites" -ForegroundColor Green
Write-Host ""
Write-Host "Done!" -ForegroundColor Green
