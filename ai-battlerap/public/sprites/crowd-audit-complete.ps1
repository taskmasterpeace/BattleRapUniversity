# Complete Crowd Sprite Audit and Rename Script
# Generated from full AI audit of all 444 crowd sprites
# Run from: ai-battlerap/public/sprites/

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CROWD SPRITE RENAME - COMPLETE AUDIT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan

# All crowd sprite subdirectories
$crowdDirs = @(
    "crowd\image_1764197014144",
    "crowd\image_1764197016851",
    "crowd\image_1764197018939",
    "crowd\image_1764197021608",
    "crowd\image_1764197023878",
    "crowd\image_1764197025954",
    "crowd\image_1764197027954",
    "crowd\image_1764197030365",
    "crowd\image_1764197033721",
    "crowd\image_1764197051499",
    "crowd\image_1764197057401"
)

# RAW MAPPINGS FROM AI AUDIT
# These will be post-processed to ensure sequential variant numbering
$rawMappings = @{
    # Batch 1: crowd_001 to crowd_045
    "crowd_001.png" = "crowd_black_hype"
    "crowd_002.png" = "crowd_white_stunned"
    "crowd_003.png" = "crowd_black_boo"
    "crowd_004.png" = "crowd_black_boo"
    "crowd_005.png" = "crowd_black_hype"
    "crowd_006.png" = "crowd_black_watch"
    "crowd_007.png" = "crowd_black_watch"
    "crowd_008.png" = "crowd_black_record"
    "crowd_009.png" = "crowd_black_watch"
    "crowd_010.png" = "crowd_white_record"
    "crowd_011.png" = "crowd_black_think"
    "crowd_012.png" = "crowd_black_hype"
    "crowd_013.png" = "crowd_black_hype"
    "crowd_014.png" = "crowd_black_watch"
    "crowd_015.png" = "crowd_black_unimpressed"
    "crowd_016.png" = "crowd_white_cheer"
    "crowd_017.png" = "crowd_mixed_watch"
    "crowd_018.png" = "crowd_black_cringe"
    "crowd_019.png" = "crowd_black_watch"
    "crowd_020.png" = "crowd_black_talk"
    "crowd_021.png" = "crowd_black_cheer"
    "crowd_022.png" = "crowd_white_stunned"
    "crowd_023.png" = "crowd_black_stunned"
    "crowd_024.png" = "crowd_black_cheer"
    "crowd_025.png" = "crowd_black_hype"
    "crowd_026.png" = "crowd_black_stunned"
    "crowd_027.png" = "crowd_black_hype"
    "crowd_028.png" = "crowd_black_unimpressed"
    "crowd_029.png" = "crowd_black_stunned"
    "crowd_030.png" = "crowd_mixed_stunned"
    "crowd_031.png" = "crowd_black_hype"
    "crowd_032.png" = "crowd_black_disappointed"
    "crowd_033.png" = "crowd_black_stunned"
    "crowd_034.png" = "crowd_black_think"
    "crowd_035.png" = "crowd_mixed_think"
    "crowd_036.png" = "crowd_black_watch"
    "crowd_037.png" = "crowd_black_hype"
    "crowd_038.png" = "crowd_black_hype"
    "crowd_039.png" = "crowd_black_hype"
    "crowd_040.png" = "crowd_white_cringe"
    "crowd_041.png" = "crowd_black_stunned"
    "crowd_042.png" = "crowd_black_cheer"
    "crowd_043.png" = "crowd_black_hype"
    "crowd_044.png" = "crowd_black_cheer"
    "crowd_045.png" = "crowd_black_hype"

    # Batch 2: crowd_046 to crowd_090
    "crowd_046.png" = "crowd_black_watch"
    "crowd_047.png" = "crowd_black_hype"
    "crowd_048.png" = "crowd_black_boo"
    "crowd_049.png" = "crowd_black_stunned"
    "crowd_050.png" = "crowd_black_laugh"
    "crowd_051.png" = "crowd_black_watch"
    "crowd_052.png" = "crowd_black_record"
    "crowd_053.png" = "crowd_white_record"
    "crowd_054.png" = "crowd_black_watch"
    "crowd_055.png" = "crowd_black_watch"
    "crowd_056.png" = "crowd_black_cheer"
    "crowd_057.png" = "crowd_black_hype"
    "crowd_058.png" = "crowd_black_think"
    "crowd_059.png" = "crowd_mixed_talk"
    "crowd_060.png" = "crowd_mixed_talk"
    "crowd_061.png" = "crowd_black_hype"
    "crowd_062.png" = "crowd_black_hype"
    "crowd_063.png" = "crowd_black_cheer"
    "crowd_064.png" = "crowd_white_think"
    "crowd_065.png" = "crowd_black_hype"
    "crowd_066.png" = "crowd_black_watch"
    "crowd_067.png" = "crowd_mixed_watch"
    "crowd_068.png" = "crowd_mixed_hype"
    "crowd_069.png" = "crowd_mixed_hype"
    "crowd_070.png" = "crowd_black_cringe"
    "crowd_071.png" = "crowd_black_cringe"
    "crowd_072.png" = "crowd_black_cheer"
    "crowd_073.png" = "crowd_black_cheer"
    "crowd_074.png" = "crowd_black_watch"
    "crowd_075.png" = "crowd_white_listen"
    "crowd_076.png" = "crowd_black_listen"
    "crowd_077.png" = "crowd_black_hype"
    "crowd_078.png" = "crowd_black_watch"
    "crowd_079.png" = "crowd_black_unimpressed"
    "crowd_080.png" = "crowd_black_watch"
    "crowd_081.png" = "crowd_mixed_watch"
    "crowd_082.png" = "crowd_black_hype"
    "crowd_083.png" = "crowd_black_hype"
    "crowd_084.png" = "crowd_black_watch"
    "crowd_085.png" = "crowd_mixed_watch"
    "crowd_086.png" = "crowd_mixed_talk"
    "crowd_087.png" = "crowd_black_watch"
    "crowd_088.png" = "crowd_black_watch"
    "crowd_089.png" = "crowd_black_cheer"
    "crowd_090.png" = "crowd_black_cheer"  # Added missing from batch

    # Batch 3: crowd_091 to crowd_135 (missing 131)
    "crowd_091.png" = "crowd_black_listen"
    "crowd_092.png" = "crowd_white_watch"
    "crowd_093.png" = "crowd_black_watch"
    "crowd_094.png" = "crowd_black_think"
    "crowd_095.png" = "crowd_black_hype"
    "crowd_096.png" = "crowd_black_watch"
    "crowd_097.png" = "crowd_black_watch"
    "crowd_098.png" = "crowd_black_record"
    "crowd_099.png" = "crowd_black_watch"
    "crowd_100.png" = "crowd_white_record"
    "crowd_101.png" = "crowd_black_watch"
    "crowd_102.png" = "crowd_black_think"
    "crowd_103.png" = "crowd_white_watch"
    "crowd_104.png" = "crowd_black_watch"
    "crowd_105.png" = "crowd_black_think"
    "crowd_106.png" = "crowd_white_think"
    "crowd_107.png" = "crowd_mixed_watch"
    "crowd_108.png" = "crowd_black_watch"
    "crowd_109.png" = "crowd_black_watch"
    "crowd_110.png" = "crowd_black_hype"
    "crowd_111.png" = "crowd_black_watch"
    "crowd_112.png" = "crowd_white_watch"
    "crowd_113.png" = "crowd_black_stunned"
    "crowd_114.png" = "crowd_black_watch"
    "crowd_115.png" = "crowd_black_think"
    "crowd_116.png" = "crowd_black_stunned"
    "crowd_117.png" = "crowd_black_watch"
    "crowd_118.png" = "crowd_black_unimpressed"
    "crowd_119.png" = "crowd_black_think"
    "crowd_120.png" = "crowd_white_watch"
    "crowd_121.png" = "crowd_black_stunned"
    "crowd_122.png" = "crowd_black_think"
    "crowd_123.png" = "crowd_black_watch"
    "crowd_124.png" = "crowd_black_watch"
    "crowd_125.png" = "crowd_mixed_watch"
    "crowd_126.png" = "crowd_black_watch"
    "crowd_127.png" = "crowd_mixed_watch"
    "crowd_128.png" = "crowd_black_watch"
    "crowd_129.png" = "crowd_black_think"
    "crowd_130.png" = "crowd_black_watch"
    "crowd_132.png" = "crowd_black_think"
    "crowd_133.png" = "crowd_black_watch"
    "crowd_134.png" = "crowd_black_watch"
    "crowd_135.png" = "crowd_black_watch"

    # Batch 4: crowd_136 to crowd_180
    "crowd_136.png" = "crowd_black_listen"
    "crowd_137.png" = "crowd_white_watch"
    "crowd_138.png" = "crowd_black_talk"
    "crowd_139.png" = "crowd_black_hype"
    "crowd_140.png" = "crowd_black_watch"
    "crowd_141.png" = "crowd_mixed_watch"
    "crowd_142.png" = "crowd_black_watch"
    "crowd_143.png" = "crowd_black_record"
    "crowd_144.png" = "crowd_black_watch"
    "crowd_145.png" = "crowd_white_record"
    "crowd_146.png" = "crowd_black_think"
    "crowd_147.png" = "crowd_black_hype"
    "crowd_148.png" = "crowd_mixed_hype"
    "crowd_149.png" = "crowd_black_watch"
    "crowd_150.png" = "crowd_black_unimpressed"
    "crowd_151.png" = "crowd_white_think"
    "crowd_152.png" = "crowd_mixed_watch"
    "crowd_153.png" = "crowd_black_cringe"
    "crowd_154.png" = "crowd_black_watch"
    "crowd_155.png" = "crowd_black_unimpressed"
    "crowd_156.png" = "crowd_black_unimpressed"
    "crowd_157.png" = "crowd_white_watch"
    "crowd_158.png" = "crowd_black_stunned"
    "crowd_159.png" = "crowd_mixed_talk"
    "crowd_160.png" = "crowd_black_hype"
    "crowd_161.png" = "crowd_black_stunned"
    "crowd_162.png" = "crowd_black_watch"
    "crowd_163.png" = "crowd_black_unimpressed"
    "crowd_164.png" = "crowd_black_hype"
    "crowd_165.png" = "crowd_white_think"
    "crowd_166.png" = "crowd_black_watch"
    "crowd_167.png" = "crowd_black_stunned"
    "crowd_168.png" = "crowd_black_unimpressed"
    "crowd_169.png" = "crowd_black_cringe"
    "crowd_170.png" = "crowd_mixed_think"
    "crowd_171.png" = "crowd_black_watch"
    "crowd_172.png" = "crowd_mixed_watch"
    "crowd_173.png" = "crowd_mixed_watch"
    "crowd_174.png" = "crowd_black_watch"
    "crowd_175.png" = "crowd_black_talk"
    "crowd_176.png" = "crowd_black_watch"
    "crowd_177.png" = "crowd_black_watch"
    "crowd_178.png" = "crowd_black_watch"
    "crowd_179.png" = "crowd_black_bored"
    "crowd_180.png" = "crowd_black_watch"

    # Batch 5: crowd_181 to crowd_225
    "crowd_181.png" = "crowd_black_hype"
    "crowd_182.png" = "crowd_white_cringe"
    "crowd_183.png" = "crowd_black_boo"
    "crowd_184.png" = "crowd_black_boo"
    "crowd_185.png" = "crowd_black_think"
    "crowd_186.png" = "crowd_black_watch"
    "crowd_187.png" = "crowd_black_watch"
    "crowd_188.png" = "crowd_black_record"
    "crowd_189.png" = "crowd_black_watch"
    "crowd_190.png" = "crowd_mixed_record"
    "crowd_191.png" = "crowd_black_unimpressed"
    "crowd_192.png" = "crowd_black_hype"
    "crowd_193.png" = "crowd_black_hype"
    "crowd_194.png" = "crowd_black_watch"
    "crowd_195.png" = "crowd_black_watch"
    "crowd_196.png" = "crowd_mixed_watch"
    "crowd_197.png" = "crowd_mixed_watch"
    "crowd_198.png" = "crowd_black_cringe"
    "crowd_199.png" = "crowd_black_watch"
    "crowd_200.png" = "crowd_black_cheer"
    "crowd_201.png" = "crowd_black_cheer"
    "crowd_202.png" = "crowd_white_watch"
    "crowd_203.png" = "crowd_black_watch"
    "crowd_204.png" = "crowd_black_watch"
    "crowd_205.png" = "crowd_black_watch"
    "crowd_206.png" = "crowd_black_disappointed"
    "crowd_207.png" = "crowd_black_watch"
    "crowd_208.png" = "crowd_black_unimpressed"
    "crowd_209.png" = "crowd_black_think"
    "crowd_210.png" = "crowd_mixed_watch"
    "crowd_211.png" = "crowd_black_watch"
    "crowd_212.png" = "crowd_black_watch"
    "crowd_213.png" = "crowd_black_watch"
    "crowd_214.png" = "crowd_mixed_watch"
    "crowd_215.png" = "crowd_black_watch"
    "crowd_216.png" = "crowd_mixed_watch"
    "crowd_217.png" = "crowd_black_watch"
    "crowd_218.png" = "crowd_mixed_watch"
    "crowd_219.png" = "crowd_black_watch"
    "crowd_220.png" = "crowd_black_disappointed"
    "crowd_221.png" = "crowd_black_watch"
    "crowd_222.png" = "crowd_black_hype"
    "crowd_223.png" = "crowd_black_bored"
    "crowd_224.png" = "crowd_black_watch"
    "crowd_225.png" = "crowd_black_watch"

    # Batch 6: crowd_226 to crowd_270
    "crowd_226.png" = "crowd_black_boo"
    "crowd_227.png" = "crowd_white_unimpressed"
    "crowd_228.png" = "crowd_black_boo"
    "crowd_229.png" = "crowd_black_boo"
    "crowd_230.png" = "crowd_black_watch"
    "crowd_231.png" = "crowd_black_watch"
    "crowd_232.png" = "crowd_black_watch"
    "crowd_233.png" = "crowd_black_watch"
    "crowd_234.png" = "crowd_black_watch"
    "crowd_235.png" = "crowd_white_watch"
    "crowd_236.png" = "crowd_black_think"
    "crowd_237.png" = "crowd_black_boo"
    "crowd_238.png" = "crowd_black_hype"
    "crowd_239.png" = "crowd_black_watch"
    "crowd_240.png" = "crowd_black_watch"
    "crowd_241.png" = "crowd_white_watch"
    "crowd_242.png" = "crowd_white_watch"
    "crowd_243.png" = "crowd_black_cringe"
    "crowd_244.png" = "crowd_black_watch"
    "crowd_245.png" = "crowd_black_cheer"
    "crowd_246.png" = "crowd_black_cheer"
    "crowd_247.png" = "crowd_white_cringe"
    "crowd_248.png" = "crowd_black_stunned"
    "crowd_249.png" = "crowd_black_cheer"
    "crowd_250.png" = "crowd_black_hype"
    "crowd_251.png" = "crowd_black_laugh"
    "crowd_252.png" = "crowd_black_watch"
    "crowd_253.png" = "crowd_black_unimpressed"
    "crowd_254.png" = "crowd_black_stunned"
    "crowd_255.png" = "crowd_white_watch"
    "crowd_256.png" = "crowd_black_watch"
    "crowd_257.png" = "crowd_black_watch"
    "crowd_258.png" = "crowd_black_stunned"
    "crowd_259.png" = "crowd_black_disappointed"
    "crowd_260.png" = "crowd_black_record"
    "crowd_261.png" = "crowd_black_watch"
    "crowd_262.png" = "crowd_white_watch"
    "crowd_263.png" = "crowd_white_watch"
    "crowd_264.png" = "crowd_black_watch"
    "crowd_265.png" = "crowd_black_talk"
    "crowd_266.png" = "crowd_black_talk"
    "crowd_267.png" = "crowd_black_think"
    "crowd_268.png" = "crowd_black_bored"
    "crowd_269.png" = "crowd_black_think"
    "crowd_270.png" = "crowd_black_watch"

    # Batch 7: crowd_271 to crowd_315
    "crowd_271.png" = "crowd_black_hype"
    "crowd_272.png" = "crowd_black_hype"
    "crowd_273.png" = "crowd_white_hype"
    "crowd_274.png" = "crowd_black_hype"
    "crowd_275.png" = "crowd_black_watch"
    "crowd_276.png" = "crowd_white_cheer"
    "crowd_277.png" = "crowd_black_hype"
    "crowd_278.png" = "crowd_black_record"
    "crowd_279.png" = "crowd_black_hype"
    "crowd_280.png" = "crowd_white_record"
    "crowd_281.png" = "crowd_black_hype"
    "crowd_282.png" = "crowd_black_hype"
    "crowd_283.png" = "crowd_black_hype"
    "crowd_284.png" = "crowd_black_think"
    "crowd_285.png" = "crowd_black_watch"
    "crowd_286.png" = "crowd_mixed_cheer"
    "crowd_287.png" = "crowd_mixed_watch"
    "crowd_288.png" = "crowd_mixed_cheer"
    "crowd_289.png" = "crowd_black_watch"
    "crowd_290.png" = "crowd_white_hype"
    "crowd_291.png" = "crowd_white_hype"
    "crowd_292.png" = "crowd_black_watch"
    "crowd_293.png" = "crowd_black_talk"
    "crowd_294.png" = "crowd_black_cheer"
    "crowd_295.png" = "crowd_black_hype"
    "crowd_296.png" = "crowd_white_laugh"
    "crowd_297.png" = "crowd_black_cheer"
    "crowd_298.png" = "crowd_black_stunned"
    "crowd_299.png" = "crowd_black_hype"
    "crowd_300.png" = "crowd_black_hype"
    "crowd_301.png" = "crowd_black_hype"
    "crowd_302.png" = "crowd_black_talk"
    "crowd_303.png" = "crowd_black_hype"
    "crowd_304.png" = "crowd_white_stunned"
    "crowd_305.png" = "crowd_black_record"
    "crowd_306.png" = "crowd_black_hype"
    "crowd_307.png" = "crowd_black_hype"
    "crowd_308.png" = "crowd_black_hype"
    "crowd_309.png" = "crowd_black_cheer"
    "crowd_310.png" = "crowd_black_talk"
    "crowd_311.png" = "crowd_black_talk"
    "crowd_312.png" = "crowd_black_talk"
    "crowd_313.png" = "crowd_black_hype"
    "crowd_314.png" = "crowd_black_think"
    "crowd_315.png" = "crowd_black_disappointed"

    # Batch 8: crowd_316-342 (with gaps)
    "crowd_316.png" = "crowd_black_hype"
    "crowd_317.png" = "crowd_black_stunned"
    "crowd_324.png" = "crowd_black_watch"
    "crowd_325.png" = "crowd_black_watch"
    "crowd_326.png" = "crowd_black_stunned"
    "crowd_332.png" = "crowd_white_watch"
    "crowd_333.png" = "crowd_black_watch"
    "crowd_334.png" = "crowd_black_watch"
    "crowd_340.png" = "crowd_black_watch"
    "crowd_341.png" = "crowd_black_stunned"
    "crowd_342.png" = "crowd_black_cheer"

    # Batch 9: crowd_356-395 (missing 396)
    "crowd_356.png" = "crowd_black_hype"
    "crowd_357.png" = "crowd_white_stunned"
    "crowd_358.png" = "crowd_black_boo"
    "crowd_359.png" = "crowd_black_boo"
    "crowd_360.png" = "crowd_black_hype"
    "crowd_361.png" = "crowd_black_watch"
    "crowd_362.png" = "crowd_black_watch"
    "crowd_363.png" = "crowd_black_record"
    "crowd_364.png" = "crowd_black_watch"
    "crowd_365.png" = "crowd_white_record"
    "crowd_366.png" = "crowd_black_think"
    "crowd_367.png" = "crowd_black_hype"
    "crowd_368.png" = "crowd_black_hype"
    "crowd_369.png" = "crowd_black_watch"
    "crowd_370.png" = "crowd_black_unimpressed"
    "crowd_371.png" = "crowd_white_cheer"
    "crowd_372.png" = "crowd_mixed_watch"
    "crowd_373.png" = "crowd_black_cringe"
    "crowd_374.png" = "crowd_black_watch"
    "crowd_375.png" = "crowd_black_cheer"
    "crowd_376.png" = "crowd_black_cheer"
    "crowd_377.png" = "crowd_white_stunned"
    "crowd_378.png" = "crowd_black_stunned"
    "crowd_379.png" = "crowd_mixed_cheer"
    "crowd_380.png" = "crowd_black_hype"
    "crowd_381.png" = "crowd_black_stunned"
    "crowd_382.png" = "crowd_black_hype"
    "crowd_383.png" = "crowd_black_watch"
    "crowd_384.png" = "crowd_black_stunned"
    "crowd_385.png" = "crowd_mixed_stunned"
    "crowd_386.png" = "crowd_black_stunned"
    "crowd_387.png" = "crowd_black_disappointed"
    "crowd_388.png" = "crowd_black_stunned"
    "crowd_389.png" = "crowd_black_cringe"
    "crowd_390.png" = "crowd_mixed_cringe"
    "crowd_391.png" = "crowd_black_watch"
    "crowd_392.png" = "crowd_mixed_hype"
    "crowd_393.png" = "crowd_black_hype"
    "crowd_394.png" = "crowd_black_hype"
    "crowd_395.png" = "crowd_black_boo"

    # Batch 10: crowd_401-440 (not 397-440)
    "crowd_401.png" = "crowd_white_hype"
    "crowd_402.png" = "crowd_black_hype"
    "crowd_403.png" = "crowd_black_stunned"
    "crowd_404.png" = "crowd_black_hype"
    "crowd_405.png" = "crowd_mixed_record"
    "crowd_406.png" = "crowd_black_hype"
    "crowd_407.png" = "crowd_black_hype"
    "crowd_408.png" = "crowd_black_cheer"
    "crowd_409.png" = "crowd_black_hype"
    "crowd_410.png" = "crowd_white_hype"
    "crowd_411.png" = "crowd_white_stunned"
    "crowd_412.png" = "crowd_black_hype"
    "crowd_413.png" = "crowd_white_hype"
    "crowd_414.png" = "crowd_black_hype"
    "crowd_415.png" = "crowd_black_stunned"
    "crowd_416.png" = "crowd_mixed_hype"
    "crowd_417.png" = "crowd_black_hype"
    "crowd_418.png" = "crowd_white_hype"
    "crowd_419.png" = "crowd_black_cheer"
    "crowd_420.png" = "crowd_black_watch"
    "crowd_421.png" = "crowd_white_watch"
    "crowd_422.png" = "crowd_black_hype"
    "crowd_423.png" = "crowd_black_cheer"
    "crowd_424.png" = "crowd_black_cheer"
    "crowd_425.png" = "crowd_black_stunned"
    "crowd_426.png" = "crowd_white_hype"
    "crowd_427.png" = "crowd_black_stunned"
    "crowd_428.png" = "crowd_white_cheer"
    "crowd_429.png" = "crowd_black_stunned"
    "crowd_430.png" = "crowd_white_cheer"
    "crowd_431.png" = "crowd_black_watch"
    "crowd_432.png" = "crowd_black_cheer"
    "crowd_433.png" = "crowd_black_hype"
    "crowd_434.png" = "crowd_white_cheer"
    "crowd_435.png" = "crowd_black_hype"
    "crowd_436.png" = "crowd_black_hype"
    "crowd_437.png" = "crowd_black_hype"
    "crowd_438.png" = "crowd_black_hype"
    "crowd_439.png" = "crowd_black_cheer"
    "crowd_440.png" = "crowd_black_hype"

    # Batch 11: crowd_441-478 (with gaps)
    "crowd_441.png" = "crowd_black_hype"
    "crowd_442.png" = "crowd_white_hype"
    "crowd_443.png" = "crowd_black_hype"
    "crowd_444.png" = "crowd_black_watch"
    "crowd_445.png" = "crowd_white_hype"
    "crowd_446.png" = "crowd_black_stunned"
    "crowd_447.png" = "crowd_black_cheer"
    "crowd_448.png" = "crowd_black_record"
    "crowd_449.png" = "crowd_black_record"
    "crowd_450.png" = "crowd_black_stunned"
    "crowd_451.png" = "crowd_white_stunned"
    "crowd_452.png" = "crowd_white_stunned"
    "crowd_453.png" = "crowd_black_stunned"
    "crowd_454.png" = "crowd_black_cheer"
    "crowd_456.png" = "crowd_black_stunned"
    "crowd_457.png" = "crowd_black_cheer"
    "crowd_458.png" = "crowd_black_record"
    "crowd_459.png" = "crowd_black_hype"
    "crowd_460.png" = "crowd_black_stunned"
    "crowd_461.png" = "crowd_white_watch"
    "crowd_464.png" = "crowd_black_stunned"
    "crowd_465.png" = "crowd_black_cheer"
    "crowd_466.png" = "crowd_mixed_cheer"
    "crowd_467.png" = "crowd_mixed_stunned"
    "crowd_468.png" = "crowd_white_cheer"
    "crowd_469.png" = "crowd_black_hype"
    "crowd_470.png" = "crowd_black_cheer"
    "crowd_472.png" = "crowd_black_hype"
    "crowd_473.png" = "crowd_black_hype"
    "crowd_474.png" = "crowd_black_cheer"
    "crowd_475.png" = "crowd_black_cheer"
    "crowd_476.png" = "crowd_white_cheer"
    "crowd_477.png" = "crowd_mixed_stunned"
    "crowd_478.png" = "crowd_white_boo"
}

# Count occurrences and assign sequential variant numbers
$categoryCounters = @{}
$finalMappings = @{}

foreach ($key in ($rawMappings.Keys | Sort-Object)) {
    $category = $rawMappings[$key]

    if (-not $categoryCounters.ContainsKey($category)) {
        $categoryCounters[$category] = 1
    } else {
        $categoryCounters[$category]++
    }

    $variant = $categoryCounters[$category].ToString().PadLeft(3, '0')
    $finalMappings[$key] = "$category_$variant.png"
}

# Execute renames
Write-Host "Starting rename operation..." -ForegroundColor Yellow
Write-Host "" -ForegroundColor Yellow

$successCount = 0
$errorCount = 0
$notFoundCount = 0

foreach ($dir in $crowdDirs) {
    $dirPath = Join-Path (Get-Location) $dir

    if (-not (Test-Path $dirPath)) {
        Write-Host "  Skipping missing directory: $dir" -ForegroundColor Gray
        continue
    }

    foreach ($oldName in $finalMappings.Keys) {
        $oldPath = Join-Path $dirPath $oldName

        if (Test-Path $oldPath) {
            $newName = $finalMappings[$oldName]

            try {
                Rename-Item -Path $oldPath -NewName $newName -ErrorAction Stop
                Write-Host "  [OK] $oldName -> $newName" -ForegroundColor Green
                $successCount++
            }
            catch {
                Write-Host "  [ERR] Failed: $oldName - $_" -ForegroundColor Red
                $errorCount++
            }
        }
    }
}

Write-Host "" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RENAME COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Success: $successCount files renamed" -ForegroundColor Green
Write-Host "  Errors: $errorCount failures" -ForegroundColor Red
Write-Host "  Total categories: $($categoryCounters.Count)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan

# Show category statistics
Write-Host "CATEGORY BREAKDOWN:" -ForegroundColor Magenta
$categoryCounters.GetEnumerator() | Sort-Object Name | ForEach-Object {
    Write-Host "  $($_.Key): $($_.Value) variants" -ForegroundColor White
}

Write-Host "" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Cyan
