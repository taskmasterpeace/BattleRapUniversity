# League Rename Script
# Run from: ai-battlerap/public/sprites/

Write-Host "Renaming leagues..." -ForegroundColor Cyan

# Define all league renames
$leagues = @{
    # Sheet 1
    "leagues/characters/image_1764195526092/league_145.png" = "gunbarz_assembly.png"
    "leagues/characters/image_1764195526092/league_146.png" = "you_got_smoked.png"
    "leagues/characters/image_1764195526092/league_147.png" = "street_cipher.png"
    "leagues/characters/image_1764195526092/league_148.png" = "angry_and_unbiased.png"
    "leagues/characters/image_1764195526092/league_149.png" = "algorithm_institute.png"
    "leagues/characters/image_1764195526092/league_150.png" = "crowd_reaction.png"
    "leagues/characters/image_1764195526092/league_151.png" = "champions_circle.png"
    "leagues/characters/image_1764195526092/league_152.png" = "royal_wordsmiths.png"

    # Sheet 2
    "leagues/characters/image_1764195528394/league_137.png" = "gunbarz_assembly_v2.png"
    "leagues/characters/image_1764195528394/league_138.png" = "you_got_smoked_v2.png"
    "leagues/characters/image_1764195528394/league_139.png" = "street_cipher_v2.png"
    "leagues/characters/image_1764195528394/league_140.png" = "angry_and_unbiased_v2.png"
    "leagues/characters/image_1764195528394/league_141.png" = "algorithm_institute_v2.png"
    "leagues/characters/image_1764195528394/league_142.png" = "crowd_reaction_v2.png"
    "leagues/characters/image_1764195528394/league_143.png" = "champions_circle_v2.png"
    "leagues/characters/image_1764195528394/league_144.png" = "the_last_mic.png"

    # Sheet 3
    "leagues/characters/image_1764195530615/league_129.png" = "mic_masters_arena.png"
    "leagues/characters/image_1764195530615/league_130.png" = "barz_supreme_league.png"
    "leagues/characters/image_1764195530615/league_131.png" = "flow_syndicate.png"
    "leagues/characters/image_1764195530615/league_132.png" = "cipher_kings_federation.png"
    "leagues/characters/image_1764195530615/league_133.png" = "battleground_circuit.png"
    "leagues/characters/image_1764195530615/league_134.png" = "verse_vendetta_league.png"
    "leagues/characters/image_1764195530615/league_135.png" = "raw_rhythm_rumble.png"
    "leagues/characters/image_1764195530615/league_136.png" = "apex_lyricist_league.png"

    # Sheet 4
    "leagues/characters/image_1764195532485/league_121.png" = "mic_masters_arena_v2.png"
    "leagues/characters/image_1764195532485/league_122.png" = "barz_supreme_league_v2.png"
    "leagues/characters/image_1764195532485/league_123.png" = "flow_syndicate_v2.png"
    "leagues/characters/image_1764195532485/league_124.png" = "cipher_kings_federation_v2.png"
    "leagues/characters/image_1764195532485/league_125.png" = "battleground_circuit_v2.png"
    "leagues/characters/image_1764195532485/league_126.png" = "verse_vendetta_league_v2.png"
    "leagues/characters/image_1764195532485/league_127.png" = "raw_rhythm_rumble_v2.png"
    "leagues/characters/image_1764195532485/league_128.png" = "apex_lyricist_league_v2.png"

    # Sheet 5
    "leagues/characters/image_1764195534646/league_113.png" = "kings_court.png"
    "leagues/characters/image_1764195534646/league_114.png" = "urban_flame_league.png"
    "leagues/characters/image_1764195534646/league_115.png" = "iron_fist_clash.png"
    "leagues/characters/image_1764195534646/league_116.png" = "sonic_boom_battles.png"
    "leagues/characters/image_1764195534646/league_117.png" = "chain_reaction_league.png"
    "leagues/characters/image_1764195534646/league_118.png" = "mic_drop_mafia.png"
    "leagues/characters/image_1764195534646/league_119.png" = "crown_jewel_league.png"
    "leagues/characters/image_1764195534646/league_120.png" = "block_buster_battles.png"

    # Sheet 6
    "leagues/characters/image_1764195537197/league_105.png" = "crown_city_battle_league.png"
    "leagues/characters/image_1764195537197/league_106.png" = "flame_flow_league.png"
    "leagues/characters/image_1764195537197/league_107.png" = "iron_chain_rhyme.png"
    "leagues/characters/image_1764195537197/league_108.png" = "boombox_brawlers.png"
    "leagues/characters/image_1764195537197/league_109.png" = "mic_drop_masters.png"
    "leagues/characters/image_1764195537197/league_110.png" = "spitfire_arena.png"
    "leagues/characters/image_1764195537197/league_111.png" = "urban_warfare_league.png"
    "leagues/characters/image_1764195537197/league_112.png" = "rhyme_kings_union.png"

    # Sheet 7
    "leagues/characters/image_1764195933542/league_097.png" = "stay_forever.png"
    "leagues/characters/image_1764195933542/league_098.png" = "bar_god.png"
    "leagues/characters/image_1764195933542/league_099.png" = "respect_the_craft.png"
    "leagues/characters/image_1764195933542/league_100.png" = "milwaukee_massacre.png"
    "leagues/characters/image_1764195933542/league_101.png" = "i_do_what_i_want.png"
    "leagues/characters/image_1764195933542/league_102.png" = "gun_gritty_underground.png"
    "leagues/characters/image_1764195933542/league_103.png" = "slap.png"
    "leagues/characters/image_1764195933542/league_104.png" = "get_it_get_it.png"

    # Sheet 8
    "leagues/characters/image_1764195938152/league_089.png" = "stay_forever_v2.png"
    "leagues/characters/image_1764195938152/league_090.png" = "bar_god_v2.png"
    "leagues/characters/image_1764195938152/league_091.png" = "respect_the_craft_v2.png"
    "leagues/characters/image_1764195938152/league_092.png" = "milwaukee_massacre_v2.png"
    "leagues/characters/image_1764195938152/league_093.png" = "i_do_what_i_want_v2.png"
    "leagues/characters/image_1764195938152/league_094.png" = "gun_v2.png"
    "leagues/characters/image_1764195938152/league_095.png" = "underground_kings.png"
    "leagues/characters/image_1764195938152/league_096.png" = "global_word_war.png"
}

foreach ($oldPath in $leagues.Keys) {
    if (Test-Path $oldPath) {
        $dir = Split-Path $oldPath -Parent
        $newName = $leagues[$oldPath]
        Rename-Item $oldPath $newName
        Write-Host "  $(Split-Path $oldPath -Leaf) -> $newName" -ForegroundColor Green
    }
}

Write-Host "`nDone! Leagues renamed." -ForegroundColor Cyan
