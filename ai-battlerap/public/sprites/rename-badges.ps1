# Badge Rename Script
# Run from: ai-battlerap/public/sprites/

# Sheet 1: Negative Badges
$sheet1 = "badges/characters/image_1764193675435"
$negatives = @{
    "badge_081.png" = "recycler.png"
    "badge_082.png" = "biter.png"
    "badge_083.png" = "one_trick_pony.png"
    "badge_084.png" = "shock_value_abuser.png"
    "badge_085.png" = "lazy_writer.png"
    "badge_086.png" = "predictable.png"
    "badge_087.png" = "reach_god.png"
    "badge_088.png" = "filler_abuser.png"
    "badge_089.png" = "outdated.png"
    "badge_090.png" = "repetitive.png"
    "badge_091.png" = "weak_setups.png"
    "badge_092.png" = "gimmick_abuser.png"
    "badge_093.png" = "shallow_research.png"
    "badge_094.png" = "choker.png"
    "badge_095.png" = "one_hit_wonder.png"
    "badge_096.png" = "overhyped.png"
    "badge_097.png" = "inconsistent.png"
    "badge_098.png" = "crowd_killer.png"
    "badge_099.png" = "time_waster.png"
    "badge_100.png" = "mumbler.png"
    "badge_101.png" = "monotone.png"
    "badge_102.png" = "awkward_presence.png"
    "badge_103.png" = "energy_drainer.png"
    "badge_104.png" = "off_beat.png"
    "badge_105.png" = "sore_loser.png"
    "badge_106.png" = "canceller.png"
    "badge_107.png" = "drama_starter.png"
    "badge_108.png" = "excuse_maker.png"
    "badge_109.png" = "unreliable.png"
    "badge_110.png" = "ghost_writer.png"
    "badge_111.png" = "scammer.png"
    "badge_112.png" = "fake_tough_guy.png"
    "badge_113.png" = "clout_chaser.png"
    "badge_114.png" = "sellout.png"
    "badge_115.png" = "ego_issues.png"
    "badge_116.png" = "known_choker.png"
    "badge_117.png" = "corny_punchlines.png"
    "badge_118.png" = "inauthentic.png"
    "badge_119.png" = "trend_follower.png"
    "badge_120.png" = "poor_networking.png"
}

# Sheet 2: Positive Badges
$sheet2 = "badges/characters/image_1764193677602"
$positives = @{
    "badge_041.png" = "wordplay_wizard.png"
    "badge_042.png" = "freestyle_genius.png"
    "badge_043.png" = "creativity_beast.png"
    "badge_044.png" = "consistent_writer.png"
    "badge_045.png" = "angle_master.png"
    "badge_046.png" = "rebuttal_king.png"
    "badge_047.png" = "great_setups.png"
    "badge_048.png" = "double_entendre_expert.png"
    "badge_049.png" = "unpredictable.png"
    "badge_050.png" = "pen_game_elite.png"
    "badge_051.png" = "quotable_machine.png"
    "badge_052.png" = "hard_hitting_haymakers.png"
    "badge_053.png" = "multisyllabic_master.png"
    "badge_054.png" = "well_researched.png"
    "badge_055.png" = "well_timed_humor.png"
    "badge_056.png" = "aggressive.png"
    "badge_057.png" = "menacing.png"
    "badge_058.png" = "speed_rapping.png"
    "badge_059.png" = "slow_flow.png"
    "badge_060.png" = "smooth_flow.png"
    "badge_061.png" = "explosive.png"
    "badge_062.png" = "passionate.png"
    "badge_063.png" = "nonchalant.png"
    "badge_064.png" = "deadpan.png"
    "badge_065.png" = "rapid_fire.png"
    "badge_066.png" = "melodic.png"
    "badge_067.png" = "impassioned.png"
    "badge_068.png" = "cold.png"
    "badge_069.png" = "empathetic.png"
    "badge_070.png" = "power_stance.png"
    "badge_071.png" = "fluid_movement.png"
    "badge_072.png" = "stage_domination.png"
    "badge_073.png" = "crowd_interaction.png"
    "badge_074.png" = "dynamic_range.png"
    "badge_075.png" = "charismatic.png"
    "badge_076.png" = "crowd_favorite.png"
    "badge_077.png" = "show_stealer.png"
    "badge_078.png" = "big_stage_performer.png"
    "badge_079.png" = "clutch_performer.png"
    "badge_080.png" = "respected_veteran.png"
}

# Sheet 3: Content Badges
$sheet3 = "badges/characters/image_1764193680087"
$content = @{
    "badge_001.png" = "angles.png"
    "badge_002.png" = "personals.png"
    "badge_003.png" = "disrespect.png"
    "badge_004.png" = "comedy.png"
    "badge_005.png" = "jokes.png"
    "badge_006.png" = "sarcasm.png"
    "badge_007.png" = "self_deprecating.png"
    "badge_008.png" = "dry_humor.png"
    "badge_009.png" = "slapstick.png"
    "badge_010.png" = "concept_battles.png"
    "badge_011.png" = "gritty.png"
    "badge_012.png" = "street_talk.png"
    "badge_013.png" = "braggadocious.png"
    "badge_014.png" = "og_bars.png"
    "badge_015.png" = "metaphors.png"
    "badge_016.png" = "similes.png"
    "badge_017.png" = "wordplay.png"
    "badge_018.png" = "witty_wordplay.png"
    "badge_019.png" = "schemes.png"
    "badge_020.png" = "violent_imagery.png"
    "badge_021.png" = "multisyllabic_rhymes.png"
    "badge_022.png" = "intricate_schemes.png"
    "badge_023.png" = "sports_references.png"
    "badge_024.png" = "pop_culture_references.png"
    "badge_025.png" = "historical_references.png"
    "badge_026.png" = "locational_references.png"
    "badge_027.png" = "political_commentary.png"
    "badge_028.png" = "social_commentary.png"
    "badge_029.png" = "storytelling.png"
    "badge_030.png" = "motivational.png"
    "badge_031.png" = "punchlines.png"
    "badge_032.png" = "name_flips.png"
    "badge_033.png" = "slogan.png"
    "badge_034.png" = "controversial.png"
    "badge_035.png" = "shock_value.png"
    "badge_036.png" = "freestyles.png"
    "badge_037.png" = "rebuttals.png"
    "badge_038.png" = "punchline_king.png"
    "badge_039.png" = "scheme_specialist.png"
    "badge_040.png" = "metaphor_master.png"
}

Write-Host "Renaming badges..." -ForegroundColor Cyan

# Rename Sheet 1
foreach ($old in $negatives.Keys) {
    $oldPath = Join-Path $sheet1 $old
    $newPath = Join-Path $sheet1 $negatives[$old]
    if (Test-Path $oldPath) {
        Rename-Item $oldPath $negatives[$old]
        Write-Host "  $old -> $($negatives[$old])" -ForegroundColor Green
    }
}

# Rename Sheet 2
foreach ($old in $positives.Keys) {
    $oldPath = Join-Path $sheet2 $old
    $newPath = Join-Path $sheet2 $positives[$old]
    if (Test-Path $oldPath) {
        Rename-Item $oldPath $positives[$old]
        Write-Host "  $old -> $($positives[$old])" -ForegroundColor Green
    }
}

# Rename Sheet 3
foreach ($old in $content.Keys) {
    $oldPath = Join-Path $sheet3 $old
    $newPath = Join-Path $sheet3 $content[$old]
    if (Test-Path $oldPath) {
        Rename-Item $oldPath $content[$old]
        Write-Host "  $old -> $($content[$old])" -ForegroundColor Green
    }
}

Write-Host "`nDone! Badges renamed." -ForegroundColor Cyan
