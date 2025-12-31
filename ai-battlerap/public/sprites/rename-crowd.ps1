# Crowd Sprite Rename Script
# Run from: ai-battlerap/public/sprites/
# Based on categorization in CROWD_CATEGORIZATION.md

# Define all crowd sprite mappings
$crowdMappings = @{
    # POSITIVE REACTIONS - HYPE
    "crowd_001.png" = "crowd_black_hype_001.png"
    "crowd_005.png" = "crowd_black_hype_002.png"
    "crowd_015.png" = "crowd_black_hype_003.png"
    "crowd_025.png" = "crowd_black_hype_004.png"
    "crowd_050.png" = "crowd_black_hype_005.png"
    "crowd_160.png" = "crowd_black_hype_006.png"
    "crowd_250.png" = "crowd_black_hype_007.png"
    "crowd_300.png" = "crowd_black_hype_008.png"
    "crowd_380.png" = "crowd_black_hype_009.png"
    "crowd_390.png" = "crowd_black_hype_010.png"
    "crowd_430.png" = "crowd_white_hype_001.png"
    "crowd_410.png" = "crowd_mixed_hype_001.png"
    "crowd_440.png" = "crowd_mixed_hype_002.png"

    # POSITIVE REACTIONS - CHEER
    "crowd_020.png" = "crowd_black_cheer_001.png"
    "crowd_200.png" = "crowd_black_cheer_002.png"
    "crowd_360.png" = "crowd_black_cheer_003.png"
    "crowd_475.png" = "crowd_black_cheer_004.png"

    # POSITIVE REACTIONS - LAUGH
    "crowd_065.png" = "crowd_black_laugh_001.png"

    # POSITIVE REACTIONS - STUNNED
    "crowd_450.png" = "crowd_black_stunned_001.png"
    "crowd_470.png" = "crowd_black_stunned_002.png"
    "crowd_002.png" = "crowd_white_stunned_001.png"
    "crowd_003.png" = "crowd_mixed_stunned_001.png"

    # NEUTRAL REACTIONS - WATCH
    "crowd_105.png" = "crowd_black_watch_001.png"
    "crowd_110.png" = "crowd_black_watch_002.png"
    "crowd_115.png" = "crowd_black_watch_003.png"
    "crowd_140.png" = "crowd_black_watch_004.png"
    "crowd_150.png" = "crowd_black_watch_005.png"
    "crowd_155.png" = "crowd_black_watch_006.png"
    "crowd_240.png" = "crowd_black_watch_007.png"
    "crowd_260.png" = "crowd_black_watch_008.png"
    "crowd_370.png" = "crowd_black_watch_009.png"
    "crowd_420.png" = "crowd_black_watch_010.png"

    # NEUTRAL REACTIONS - RECORD
    "crowd_190.png" = "crowd_black_record_001.png"
    "crowd_010.png" = "crowd_white_record_001.png"
    "crowd_100.png" = "crowd_white_record_002.png"
    "crowd_145.png" = "crowd_white_record_003.png"
    "crowd_280.png" = "crowd_white_record_004.png"

    # NEUTRAL REACTIONS - THINK
    "crowd_035.png" = "crowd_black_think_001.png"
    "crowd_055.png" = "crowd_black_think_002.png"
    "crowd_095.png" = "crowd_black_think_003.png"
    "crowd_390.png" = "crowd_black_think_004.png"
    "crowd_260.png" = "crowd_mixed_think_001.png"

    # NEUTRAL REACTIONS - TALK
    "crowd_030.png" = "crowd_mixed_talk_001.png"

    # NEUTRAL REACTIONS - LISTEN
    "crowd_290.png" = "crowd_mixed_listen_001.png"
    "crowd_310.png" = "crowd_mixed_listen_002.png"
}

# Get all subdirectories in crowd/
$crowdDir = "crowd"
$subdirs = Get-ChildItem -Path $crowdDir -Directory | Where-Object { $_.Name -like "image_*" }

Write-Host "Starting crowd sprite rename..." -ForegroundColor Cyan
Write-Host "Found $($subdirs.Count) subdirectories to process`n" -ForegroundColor Yellow

$renamedCount = 0
$skippedCount = 0

foreach ($subdir in $subdirs) {
    Write-Host "Processing $($subdir.Name)..." -ForegroundColor Gray

    foreach ($oldName in $crowdMappings.Keys) {
        $oldPath = Join-Path $subdir.FullName $oldName

        if (Test-Path $oldPath) {
            $newName = $crowdMappings[$oldName]
            $newPath = Join-Path $subdir.FullName $newName

            try {
                Rename-Item -Path $oldPath -NewName $newName -ErrorAction Stop
                Write-Host "  ✓ $oldName -> $newName" -ForegroundColor Green
                $renamedCount++
            }
            catch {
                Write-Host "  ✗ Failed to rename $oldName : $_" -ForegroundColor Red
            }
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Rename Complete!" -ForegroundColor Green
Write-Host "  Renamed: $renamedCount files" -ForegroundColor Green
Write-Host "  Total mapped: $($crowdMappings.Count) files" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# Show next steps
Write-Host "NEXT STEPS:" -ForegroundColor Magenta
Write-Host "1. Audit remaining sprites ($(444 - $crowdMappings.Count) uncategorized)" -ForegroundColor White
Write-Host "2. Identify negative reactions (boo, cringe, etc.)" -ForegroundColor White
Write-Host "3. Add more mappings to this script" -ForegroundColor White
Write-Host "4. Re-run script to rename remaining sprites`n" -ForegroundColor White
