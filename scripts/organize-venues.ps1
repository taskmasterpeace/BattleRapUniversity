# Venue Organization Script
# Categorizes and renames venue sprites

$sourceDir = "C:\git\battlerapuniversity\raw images\venue\New folder"
$destBase = "C:\git\battlerapuniversity\public\sprites\venues"

# UNDERGROUND - Gritty, raw, cheap (20-50 capacity)
$underground = @{
    "888.png" = "warehouse_boxes.png"
    "333.png" = "alley_night.png"
    "s.png" = "basement_graffiti.png"
    "4545.png" = "bunker.png"
    "cdcdc.png" = "subway.png"
    "fdfd.png" = "back_alley.png"
    "33.png" = "loading_dock.png"
}

# SMALL_ROOM - Grassroots, established (50-150 capacity)
$small_room = @{
    "22.png" = "community_center.png"
    "sm.png" = "dive_bar.png"
    "ddd.png" = "sports_bar.png"
    "stu.png" = "recording_studio.png"
    "sst.png" = "photo_studio.png"
    "styu.png" = "sound_booth.png"
    "image_1764378955350.png" = "record_store.png"
    "jhjhj.png" = "rec_hall.png"
    "7676.png" = "church_hall.png"
}

# MEDIUM - More production value (150-300 capacity)
$medium = @{
    "777444.png" = "basement_club.png"
    "yyy.png" = "neon_club.png"
    "nfgdghd.png" = "cyberpunk_club.png"
    "houde.png" = "art_gallery.png"
    "ggg.png" = "loft_gallery.png"
    "5555.png" = "warehouse_clean.png"
    "666666.png" = "industrial_venue.png"
    "5655.png" = "graffiti_club.png"
    "6545.png" = "basketball_gym.png"
    "6757.png" = "graffiti_loft.png"
    "4566.png" = "modern_gallery.png"
    "999.png" = "brick_warehouse.png"
    "fdfdfdg.png" = "event_tent.png"
    "23.png" = "empty_storefront.png"
}

# OUTDOOR - Rooftops, streets (100-200 capacity)
$outdoor = @{
    "roof3.png" = "rooftop_sunset.png"
    "23333.png" = "rooftop_night.png"
    "7574.png" = "rooftop_day.png"
    "774.png" = "rooftop_door.png"
    "22122.png" = "park_pavilion.png"
    "2255.png" = "alley_day.png"
    "zz.png" = "street_night.png"
    "image_1764378990237.png" = "bodega_corner.png"
}

function Copy-Venues($mapping, $category) {
    $destDir = Join-Path $destBase $category
    foreach ($source in $mapping.Keys) {
        $sourcePath = Join-Path $sourceDir $source
        $destPath = Join-Path $destDir $mapping[$source]
        if (Test-Path $sourcePath) {
            Copy-Item $sourcePath $destPath -Force
            Write-Host "Copied: $source -> $category/$($mapping[$source])" -ForegroundColor Green
        } else {
            Write-Host "NOT FOUND: $source" -ForegroundColor Red
        }
    }
}

Write-Host "=== Organizing Venue Sprites ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "UNDERGROUND venues:" -ForegroundColor Yellow
Copy-Venues $underground "underground"
Write-Host ""

Write-Host "SMALL_ROOM venues:" -ForegroundColor Yellow
Copy-Venues $small_room "small_room"
Write-Host ""

Write-Host "MEDIUM venues:" -ForegroundColor Yellow
Copy-Venues $medium "medium"
Write-Host ""

Write-Host "OUTDOOR venues:" -ForegroundColor Yellow
Copy-Venues $outdoor "outdoor"
Write-Host ""

Write-Host "=== Done! ===" -ForegroundColor Cyan
