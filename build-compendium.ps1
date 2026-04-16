# =============================================================================
# build-compendium.ps1
# GÃ©nÃ¨re les packs compendium LevelDB pour le systÃ¨me Mercenary.
# Lit les fichiers CSV source et produit :
#   packs/weapons/    â€“ armes (Item type: weapon)
#   packs/ammos/      â€“ munitions (Item type: ammo)
#   packs/armors/     â€“ armures (Item type: armor)
#   packs/equipments/ â€“ Ã©quipements (Item type: equipment)
#   packs/features/   â€“ accessoires (Item type: feature)
#   packs/storages/   â€“ stockage (Item type: storage)
#
# Usage : .\build-compendium.ps1
#         .\build-compendium.ps1 -CsvDir "C:\mon\dossier"
# =============================================================================
param(
  [string]$CsvDir   = "$PSScriptRoot\sources\compendium",
  [string]$ToolsDir = "$PSScriptRoot\_tools",
  [string]$PacksDir = "$PSScriptRoot\packs"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Lire la version du systÃ¨me depuis system.json
$_sysJson = Get-Content (Join-Path $PSScriptRoot "system.json") -Raw | ConvertFrom-Json
$SystemVersion = $_sysJson.version

$NodeExe    = Join-Path $ToolsDir "node.exe"
$PackerScript = Join-Path $ToolsDir "pack-leveldb.cjs"

# =============================================================================
# Helpers
# =============================================================================
$script:_cryptoRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
function New-FoundryId {
  $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  $bytes = New-Object byte[] 16
  $script:_cryptoRng.GetBytes($bytes)
  -join ($bytes | ForEach-Object { $chars[$_ % $chars.Length] })
}

function TryParseDouble([string]$s) {
  # Replace European decimal comma with dot before parsing
  $d = 0.0
  [double]::TryParse($s.Trim().Replace(',', '.'), [System.Globalization.NumberStyles]::Any,
      [System.Globalization.CultureInfo]::InvariantCulture, [ref]$d) | Out-Null
  return $d
}

function TryParseInt([string]$s) {
  $i = 0
  [int]::TryParse($s.Trim(), [ref]$i) | Out-Null
  return $i
}

# Build folder entries from CSV Folder path strings.
# Returns ordered hashtable: normalizedKey -> folder entry
function New-FolderMap([string[]]$rawPaths) {
  $map = @{}  # regular Hashtable: normalizedKey -> folder entry
  $paths = $rawPaths | Where-Object { $_ } | Sort-Object -Unique

  foreach ($rawPath in $paths) {
    $parts = @(($rawPath -split '\\') | Where-Object { $_ -ne '' })
    if ($parts.Count -lt 1) { continue }

    for ($i = 0; $i -lt $parts.Count; $i++) {
      $subParts  = $parts[0..$i]
      $normKey   = ($subParts | ForEach-Object { $_.ToLower() }) -join '\'

      if (-not $map.ContainsKey($normKey)) {
        $parentNormKey = $null
        if ($i -gt 0) {
          $parentNormKey = ($parts[0..($i-1)] | ForEach-Object { $_.ToLower() }) -join '\'
        }
        $map[$normKey] = [ordered]@{
          '_id'            = New-FoundryId
          'name'           = $parts[$i]
          'type'           = 'Item'
          'folder'         = $null
          '_parentNormKey' = $parentNormKey
          'sorting'        = 'a'
          'sort'           = 0
          'color'          = $null
          'flags'          = [ordered]@{}
          '_stats'         = [ordered]@{
            'systemId'       = 'merc'
            'systemVersion'  = $SystemVersion
            'coreVersion'    = '13.351'
            'createdTime'    = $null
            'modifiedTime'   = $null
            'lastModifiedBy' = $null
          }
        }
      }
    }
  }

  # Resolve parent normalised keys to actual _ids
  foreach ($entry in $map.Values) {
    $pk = $entry['_parentNormKey']
    if ($pk -and $map.ContainsKey($pk)) {
      $entry['folder'] = $map[$pk]['_id']
    }
    $entry.Remove('_parentNormKey')
  }
  return $map
}

# Supprime les diacritiques et met en minuscules â€“ Ã©vite tout problÃ¨me d'encodage
# entre les littÃ©raux du PS1 (page de code Windows) et les chaÃ®nes lues en UTF-8.
function Remove-Diacritics([string]$s) {
  $nfd = $s.Normalize([System.Text.NormalizationForm]::FormD)
  [string]::new(($nfd.ToCharArray() | Where-Object {
    [System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne
    [System.Globalization.UnicodeCategory]::NonSpacingMark
  })).ToLower()
}

function Get-ArmorImage([string]$folderPath) {
  $leaf = ($folderPath -split '\\')[-1].Trim()
  switch -Exact ($leaf) {
    'Gilets'   { return 'systems/merc/assets/items/armor/armor.png' }
    'Casques'  { return 'systems/merc/assets/items/armor/helmet.png' }
    'Membres'  { return 'systems/merc/assets/items/armor/parts.png' }
    'Completes'{ return 'systems/merc/assets/items/armor/full.png' }
    default    { return 'systems/merc/assets/items/armor/armor.png' }
  }
}

function Get-WeaponImage([string]$subtype) {
  switch -Wildcard ($subtype.ToLower()) {
    "*pistolet mitrailleur*"  { return "systems/merc/assets/items/weapons/mitraillette.png" }
    "*pistolet auto*"         { return "systems/merc/assets/items/weapons/gun.png" }
    "*pistolet*"              { return "systems/merc/assets/items/weapons/gun.png" }
    "*revolver*"              { return "systems/merc/assets/items/weapons/revolver.png" }
    "*fusil sniper*"          { return "systems/merc/assets/items/weapons/sniper.png" }
    "*sniper*"                { return "systems/merc/assets/items/weapons/sniper.png" }
    "*pompe*"                 { return "systems/merc/assets/items/weapons/pompe.png" }
    "*mitrailleuse*"          { return "systems/merc/assets/items/weapons/mitrailleuse.png" }
    "*fusil*"                 { return "systems/merc/assets/items/weapons/fusil.png" }
    "*fusil d'assaut*"        { return "systems/merc/assets/items/weapons/fusil.png" }
    default                   { return "systems/merc/assets/items/weapons/gun.png" }
  }
}

# =============================================================================
# Ã‰tape 1 â€“ Node.js portable
# =============================================================================
if (-not (Test-Path $NodeExe)) {
  Write-Host "> Telechargement de Node.js 20 LTS portable..." -ForegroundColor Cyan
  New-Item -ItemType Directory -Path $ToolsDir -Force | Out-Null

  $nodeZip = Join-Path $env:TEMP "node-v20-win-x64.zip"
  $nodeUrl = "https://nodejs.org/dist/v20.18.3/node-v20.18.3-win-x64.zip"

  Write-Host "  Download: $nodeUrl" -ForegroundColor Gray
  Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeZip -UseBasicParsing

  Write-Host "  Extraction..." -ForegroundColor Gray
  $extractDir = Join-Path $env:TEMP "node-v20-extract"
  if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force }
  Expand-Archive -Path $nodeZip -DestinationPath $extractDir -Force

  $nodeRoot = Get-ChildItem $extractDir -Directory | Select-Object -First 1
  # Copie minimale : node.exe + node_modules/npm
  Copy-Item (Join-Path $nodeRoot.FullName "node.exe") $ToolsDir
  $npmSrc = Join-Path $nodeRoot.FullName "node_modules"
  if (Test-Path $npmSrc) {
    Copy-Item $npmSrc $ToolsDir -Recurse -Force
  }
  # Copie npm.cmd / npx.cmd
  foreach ($f in @("npm", "npm.cmd", "npx", "npx.cmd")) {
    $src = Join-Path $nodeRoot.FullName $f
    if (Test-Path $src) { Copy-Item $src $ToolsDir }
  }

  Remove-Item $nodeZip -Force
  Remove-Item $extractDir -Recurse -Force
  Write-Host "  OK Node.js $(& $NodeExe --version)" -ForegroundColor Green
}

# =============================================================================
# Ã‰tape 2 â€“ classic-level
# =============================================================================
$classicLevelDir = [IO.Path]::Combine($ToolsDir, 'node_modules', 'classic-level')
if (-not (Test-Path $classicLevelDir)) {
  Write-Host "> Installation de classic-level@2..." -ForegroundColor Cyan

  $pkgJson = Join-Path $ToolsDir "package.json"
  if (-not (Test-Path $pkgJson)) {
    '{"name":"merc-pack-tools","version":"1.0.0","private":true}' |
      Set-Content $pkgJson -Encoding UTF8
  }

  # Mettre node.exe dans le PATH pour que node-gyp-build puisse le trouver
  $env:PATH = "$ToolsDir;" + $env:PATH

  # Nettoyer installation incomplÃ¨te si elle existe
  if (Test-Path $classicLevelDir) { Remove-Item $classicLevelDir -Recurse -Force }

  $npmCliJs = [IO.Path]::Combine($ToolsDir, 'node_modules', 'npm', 'bin', 'npm-cli.js')
  Push-Location $ToolsDir
  & $NodeExe $npmCliJs install classic-level@2 --save-exact
  Pop-Location

  Write-Host "  OK classic-level installe" -ForegroundColor Green
}

# =============================================================================
# Ã‰tape 3 â€“ Parsing du CSV Ammo  (must run before weapons so we can link IDs)
# =============================================================================
Write-Host "> Lecture des munitions..." -ForegroundColor Cyan
$acsv  = Import-Csv (Join-Path $CsvDir "merc-compendium-Ammo.csv") -Delimiter ";" -Encoding UTF8
$acols = $acsv[0].PSObject.Properties.Name
# Column indices (0-based):
#  0=Folder  1=Munition  2=Type de munition  3=Calibre  4=type(subtype)
#  5=Masse(g)  6=DiamÃ¨tre(mm)  7=Coeff_traÃ®nÃ©e  8=Rho(kg/mÂ³)
#  9=indice_perforation  10=Longueur_Canon_std(pouces)  11=vitesse(m/s)  12=poids_munition(g)

# Build ammo folder hierarchy from all Folder paths in the CSV
$allAFolderPaths = $acsv | ForEach-Object { $_.($acols[0]).Trim() } | Where-Object { $_ }
$ammoFolderMap = New-FolderMap $allAFolderPaths

$ammoItems = [System.Collections.Generic.List[hashtable]]::new()
$sort = 0
foreach ($row in $acsv) {
  $name = $row.($acols[1]).Trim()
  if (-not $name) { continue }

  $folderPath        = $row.($acols[0]).Trim()
  $ammoType          = $row.($acols[2]).Trim()
  $caliber           = $row.($acols[3]).Trim()
  $subType           = $row.($acols[4]).Trim()
  $mass              = TryParseDouble $row.($acols[5])
  $diameter          = TryParseDouble $row.($acols[6])
  $coeff_trainee     = TryParseDouble $row.($acols[7])
  $rho               = TryParseDouble $row.($acols[8])
  $perforation_index = TryParseDouble $row.($acols[9])
  $barrel_length_std = TryParseDouble $row.($acols[10])
  $velocity          = TryParseInt    $row.($acols[11])
  $weight            = TryParseDouble $row.($acols[12])

  # Compute derived ballistic properties
  $surface           = [Math]::PI * $diameter * $diameter / 4e6
  $braking_index     = 0.5 * $surface * $coeff_trainee * $rho
  $area_m2           = [Math]::PI * ($diameter / 1000) * ($diameter / 1000) / 4
  $sectional_density = if ($area_m2 -gt 0) { ($mass / 1000) / $area_m2 } else { 0 }

  # Resolve folder _id (case-insensitive lookup)
  $normFolderKey = ($folderPath -split '\\' | ForEach-Object { $_.ToLower() }) -join '\'
  $itemFolderId  = if ($ammoFolderMap.ContainsKey($normFolderKey)) { $ammoFolderMap[$normFolderKey]['_id'] } else { $null }
  $sort++

  $ammoItems.Add([ordered]@{
    "_id"    = New-FoundryId
    "name"   = $name
    "type"   = "ammo"
    "img"    = "systems/merc/assets/items/ammo/ammo.png"
    "system" = [ordered]@{
      "ammoType"          = $ammoType
      "caliber"           = $caliber
      "magCapacity"       = 0
      "inMag"             = 0
      "magFull"           = 0
      "magTotal"          = 0
      "stock"             = 0
      "mass"              = $mass
      "diameter"          = $diameter
      "coeff_trainee"     = $coeff_trainee
      "rho"               = $rho
      "perforation_index" = $perforation_index
      "barrel_length_std" = $barrel_length_std
      "velocity"          = $velocity
      "weight"            = $weight
      "braking_index"     = $braking_index
      "sectional_density" = $sectional_density
      "price"             = 0
      "rarity"            = "common"
      "description"       = $subType
      "parentWeaponId"    = ""
    }
    "effects" = @()
    "folder"  = $itemFolderId
    "sort"    = $sort
    "flags"   = [ordered]@{}
    "_stats"  = [ordered]@{
      "systemId"       = "merc"
      "systemVersion"  = $SystemVersion
      "coreVersion"    = "13.351"
      "createdTime"    = $null
      "modifiedTime"   = $null
      "lastModifiedBy" = $null
    }
  })
}
Write-Host "  OK $($ammoItems.Count) munitions, $($ammoFolderMap.Count) dossiers" -ForegroundColor Green

# Build case-insensitive ammo name â†’ _id and ammo system data lookups for weapon linkage
$ammoNameToId     = @{}
$ammoNameToSystem = @{}
foreach ($item in $ammoItems) {
  $ammoNameToId[$item.name.ToLower()]     = $item._id
  $ammoNameToSystem[$item.name.ToLower()] = $item.system
}

# =============================================================================
# Ã‰tape 4 â€“ Parsing du CSV Weapons
# =============================================================================
Write-Host "> Lecture des armes..." -ForegroundColor Cyan
$wcsv  = Import-Csv (Join-Path $CsvDir "merc-compendium-Weapons.csv") -Delimiter ";" -Encoding UTF8
$wcols = $wcsv[0].PSObject.Properties.Name
# Column indices (0-based):
#  0=Folder  1=Nom  2=Sous-type  3=CompÃ©tence  4=Illustration  5=Munition
#  6=Calibre  7=Poids_Ã _vide  8=Canon(pouces)  9=Range_Short  10=Range_Med
#  11=Range_Long  12=Range_Extrem  13=Recul_C/C  14=Recul_Burst  15=Chargeur
#  16=ROF_mode  17=ROF_limited  18=AnnÃ©e

# Build weapon folder hierarchy from all Folder paths in the CSV
$allWFolderPaths = $wcsv | ForEach-Object { $_.($wcols[0]).Trim() } | Where-Object { $_ }
$weaponFolderMap = New-FolderMap $allWFolderPaths

$weaponItems = [System.Collections.Generic.List[hashtable]]::new()
$sort = 0
foreach ($row in $wcsv) {
  $name = $row.($wcols[1]).Trim()
  if (-not $name) { continue }

  $folderPath    = $row.($wcols[0]).Trim()
  $fpParts       = $folderPath -split '\\'
  $folderSubtype = if ($fpParts.Count -gt 1) { $fpParts[-1] } else { $folderPath }
  $subtype      = $row.($wcols[2]).Trim()
  $skill        = $row.($wcols[3]).Trim()
  $illustration = $row.($wcols[4]).Trim()
  $munitionName = $row.($wcols[5]).Trim()
  $caliber      = $row.($wcols[6]).Trim()
  $weightKg     = TryParseDouble $row.($wcols[7])
  $barrelLength = TryParseDouble $row.($wcols[8])
  $rangeShort   = TryParseInt $row.($wcols[9])
  $rangeMed     = TryParseInt $row.($wcols[10])
  $rangeLng     = TryParseInt $row.($wcols[11])
  $rangeExt     = TryParseInt $row.($wcols[12])
  $recoilCC     = $row.($wcols[13]).Trim()
  $recoilBurst  = $row.($wcols[14]).Trim()
  $magazine     = TryParseInt $row.($wcols[15])
  $rofMode      = $row.($wcols[16]).Trim()
  $rofLimited   = TryParseInt $row.($wcols[17])
  $itemYear     = TryParseInt $row.($wcols[18])

  # Resolve default ammo by name â€” case-insensitive
  $defaultAmmoId = if ($ammoNameToId.ContainsKey($munitionName.ToLower())) { $ammoNameToId[$munitionName.ToLower()] } else { "" }

  # Select weapon icon: prefer Illustration column, fall back to folder-based lookup
  $imgPath = if ($illustration) {
    "systems/merc/assets/items/weapons/$illustration.jpg"
  } else {
    Get-WeaponImage $folderSubtype
  }

  # Resolve folder _id (case-insensitive lookup)
  $normFolderKey = ($folderPath -split '\\' | ForEach-Object { $_.ToLower() }) -join '\'
  $itemFolderId  = if ($weaponFolderMap.ContainsKey($normFolderKey)) { $weaponFolderMap[$normFolderKey]['_id'] } else { $null }
  $sort++

  $weaponItems.Add([ordered]@{
    "_id"    = New-FoundryId
    "name"   = $name
    "type"   = "weapon"
    "img"    = $imgPath
    "system" = [ordered]@{
      "damage"          = ""          # computed at runtime from ammo data
      "rarity"          = "common"
      "price"           = 0
      "weightKg"        = $weightKg
      "year"            = $itemYear
      "weaponSubtype"   = $subtype
      "weaponSkill"     = if ($skill) { $skill } else { "powder_projectiles" }
      "proficiency"     = 0
      "range"           = [ordered]@{
        "short"   = $rangeShort
        "medium"  = $rangeMed
        "long"    = $rangeLng
        "extreme" = $rangeExt
      }
      "recoil"          = [ordered]@{
        "singleShot" = $recoilCC
        "burst"      = $recoilBurst
      }
      "magazine"        = $magazine
      "rofMode"         = $rofMode
      "rofLimited"      = $rofLimited
      "caliber"         = $caliber
      "barrelLength"    = $barrelLength
      "defaultAmmoName" = $munitionName
      "defaultAmmoId"   = $defaultAmmoId
    }
    "effects" = @()
    "folder"  = $itemFolderId
    "sort"    = $sort
    "flags"   = [ordered]@{}
    "_stats"  = [ordered]@{
      "systemId"       = "merc"
      "systemVersion"  = $SystemVersion
      "coreVersion"    = "13.351"
      "createdTime"    = $null
      "modifiedTime"   = $null
      "lastModifiedBy" = $null
    }
  })
}
Write-Host "  OK $($weaponItems.Count) armes, $($weaponFolderMap.Count) dossiers" -ForegroundColor Green

# =============================================================================
# Ã‰tape 5 â€“ Parsing du CSV Armors
# =============================================================================
Write-Host "> Lecture des armures..." -ForegroundColor Cyan
$arcsv  = Import-Csv (Join-Path $CsvDir "merc-compendium-Armors.csv") -Delimiter ";" -Encoding UTF8
$arcols = $arcsv[0].PSObject.Properties.Name
# Column indices (0-based):
#  0=Folder  1=Nom  2=Rarete  3=Prix  4=Poids(kg)  5=AnnÃ©e  6=Description
#  7=crane  8=visage  9=cou  10=poitrine_gch  11=poitrine_dr
# 12=abdomen_gch  13=abdomen_dr  14=bas_ventre  15=bras_gch  16=bras_dr
# 17=av_bras_gch  18=av_bras_dr  19=main_gch  20=main_dr
# 21=cuisse_gch  22=cuisse_dr  23=jambe_gch  24=jambe_dr  25=pied_gch  26=pied_dr

$allARFolderPaths = $arcsv | ForEach-Object { $_.($arcols[0]).Trim() } | Where-Object { $_ }
$armorFolderMap   = New-FolderMap $allARFolderPaths

$armorItems = [System.Collections.Generic.List[hashtable]]::new()
$sort = 0
foreach ($row in $arcsv) {
  $name = ([string]$row.($arcols[1])).Trim()
  if (-not $name) { continue }

  $folderPath  = ([string]$row.($arcols[0])).Trim()
  $rarity      = if (([string]$row.($arcols[2])).Trim()) { ([string]$row.($arcols[2])).Trim() } else { "common" }
  $price       = TryParseDouble $row.($arcols[3])
  $weightKg    = TryParseDouble $row.($arcols[4])
  $itemYear    = TryParseInt $row.($arcols[5])
  $description = ([string]$row.($arcols[6])).Trim()

  $normFolderKey = ($folderPath -split '\\' | ForEach-Object { $_.ToLower() }) -join '\'
  $itemFolderId  = if ($armorFolderMap.ContainsKey($normFolderKey)) { $armorFolderMap[$normFolderKey]['_id'] } else { $null }
  $sort++

  $armorItems.Add([ordered]@{
    "_id"    = New-FoundryId
    "name"   = $name
    "type"   = "armor"
    "img"    = Get-ArmorImage $folderPath
    "system" = [ordered]@{
      "rarity"      = $rarity
      "price"       = $price
      "weightKg"    = $weightKg
      "year"        = $itemYear
      "description" = $description
      "locations"   = [ordered]@{
        "crane"        = TryParseInt $row.($arcols[7])
        "visage"       = TryParseInt $row.($arcols[8])
        "cou"          = TryParseInt $row.($arcols[9])
        "poitrine_gch" = TryParseInt $row.($arcols[10])
        "poitrine_dr"  = TryParseInt $row.($arcols[11])
        "abdomen_gch"  = TryParseInt $row.($arcols[12])
        "abdomen_dr"   = TryParseInt $row.($arcols[13])
        "bas_ventre"   = TryParseInt $row.($arcols[14])
        "bras_gch"     = TryParseInt $row.($arcols[15])
        "bras_dr"      = TryParseInt $row.($arcols[16])
        "av_bras_gch"  = TryParseInt $row.($arcols[17])
        "av_bras_dr"   = TryParseInt $row.($arcols[18])
        "main_gch"     = TryParseInt $row.($arcols[19])
        "main_dr"      = TryParseInt $row.($arcols[20])
        "cuisse_gch"   = TryParseInt $row.($arcols[21])
        "cuisse_dr"    = TryParseInt $row.($arcols[22])
        "jambe_gch"    = TryParseInt $row.($arcols[23])
        "jambe_dr"     = TryParseInt $row.($arcols[24])
        "pied_gch"     = TryParseInt $row.($arcols[25])
        "pied_dr"      = TryParseInt $row.($arcols[26])
      }
    }
    "effects" = @()
    "folder"  = $itemFolderId
    "sort"    = $sort
    "flags"   = [ordered]@{}
    "_stats"  = [ordered]@{
      "systemId"       = "merc"
      "systemVersion"  = $SystemVersion
      "coreVersion"    = "13.351"
      "createdTime"    = $null
      "modifiedTime"   = $null
      "lastModifiedBy" = $null
    }
  })
}
Write-Host "  OK $($armorItems.Count) armures, $($armorFolderMap.Count) dossiers" -ForegroundColor Green

# =============================================================================
# Ã‰tape 6 â€“ Parsing du CSV Equipment
# =============================================================================
Write-Host "> Lecture des equipements..." -ForegroundColor Cyan
$eqcsv  = Import-Csv (Join-Path $CsvDir "merc-compendium-Equipment.csv") -Delimiter ";" -Encoding UTF8
$eqcols = $eqcsv[0].PSObject.Properties.Name
# Column indices (0-based):
#  0=Folder  1=Nom  2=Rarete  3=Prix  4=Poids(kg)  5=Description  6=AnnÃ©e

$allEQFolderPaths   = $eqcsv | ForEach-Object { ([string]$_.($eqcols[0])).Trim() } | Where-Object { $_ }
$equipmentFolderMap = New-FolderMap $allEQFolderPaths

$equipmentItems = [System.Collections.Generic.List[hashtable]]::new()
$sort = 0
foreach ($row in $eqcsv) {
  $name = ([string]$row.($eqcols[1])).Trim()
  if (-not $name) { continue }

  $folderPath  = ([string]$row.($eqcols[0])).Trim()
  $rarity      = if (([string]$row.($eqcols[2])).Trim()) { ([string]$row.($eqcols[2])).Trim() } else { "common" }
  $price       = TryParseDouble $row.($eqcols[3])
  $weightKg    = TryParseDouble $row.($eqcols[4])
  $description = ([string]$row.($eqcols[5])).Trim()
  $itemYear    = TryParseInt $row.($eqcols[6])

  $normFolderKey = ($folderPath -split '\\' | ForEach-Object { $_.ToLower() }) -join '\'
  $itemFolderId  = if ($equipmentFolderMap.ContainsKey($normFolderKey)) { $equipmentFolderMap[$normFolderKey]['_id'] } else { $null }
  $sort++

  $equipmentItems.Add([ordered]@{
    "_id"    = New-FoundryId
    "name"   = $name
    "type"   = "equipment"
    "img"    = "systems/merc/assets/items/equipment/equipment.png"
    "system" = [ordered]@{
      "rarity"      = $rarity
      "price"       = $price
      "weightKg"    = $weightKg
      "year"        = $itemYear
      "description" = $description
    }
    "effects" = @()
    "folder"  = $itemFolderId
    "sort"    = $sort
    "flags"   = [ordered]@{}
    "_stats"  = [ordered]@{
      "systemId"       = "merc"
      "systemVersion"  = $SystemVersion
      "coreVersion"    = "13.351"
      "createdTime"    = $null
      "modifiedTime"   = $null
      "lastModifiedBy" = $null
    }
  })
}
Write-Host "  OK $($equipmentItems.Count) Ã©quipements, $($equipmentFolderMap.Count) dossiers" -ForegroundColor Green

# =============================================================================
# Ã‰tape 7 â€“ Parsing du CSV Feature
# =============================================================================
# Colonnes CSV (0-based) :
#  0=Folder  1=type feature  2=nom  3=Bonus tir courte  4=Bonus tir moyenne
#  5=Bonus tir longue  6=Bonus tir extrÃªme  7=Reduction de bruit
#  8=Reduction de bruit LatÃ©rale  9=Augmentation de longueur
# 10=Rarete  11=Prix  12=Poids (kg)  13=Description
Write-Host "> Lecture des accessoires..." -ForegroundColor Cyan
# Le CSV Feature a des colonnes dupliquÃ©es â†’ lecture manuelle ligne par ligne
$featureCsvPath = Join-Path $CsvDir "merc-compendium-Feature.csv"
$featureRawLines = [System.IO.File]::ReadAllLines($featureCsvPath, [System.Text.Encoding]::UTF8)
# Ignorer la ligne d'en-tÃªte (index 0), traiter les lignes suivantes
$featureDataLines = $featureRawLines | Select-Object -Skip 1

$allFFolderPaths = $featureDataLines | ForEach-Object {
  $cols = $_ -split ';'
  if ($cols.Count -gt 0) { $cols[0].Trim() }
} | Where-Object { $_ }
$featureFolderMap = New-FolderMap $allFFolderPaths

# ClÃ©s en ASCII pur (sans accents, minuscules) pour Ã©viter tout problÃ¨me d'encodage PS1/UTF-8
$featureIconMap = @{
  'silencieux'         = 'systems/merc/assets/items/features/suppressor.png'
  'visee lunette'      = 'systems/merc/assets/items/features/crosshair.png'
  'visee rudimentaire' = 'systems/merc/assets/items/features/aim.png'
  'addons'             = 'systems/merc/assets/items/features/addons.svg'
}
$featureIconDefault = 'systems/merc/assets/items/features/addons.svg'

$featureItems = [System.Collections.Generic.List[hashtable]]::new()
$sort = 0
foreach ($line in $featureDataLines) {
  $cols = $line -split ';'
  $name = if ($cols.Count -gt 2) { $cols[2].Trim() } else { "" }
  if (-not $name) { continue }

  $folderPath            = if ($cols.Count -gt 0)  { $cols[0].Trim()  } else { "" }
  $featureType           = if ($cols.Count -gt 1)  { $cols[1].Trim()  } else { "" }
  $bonusShortRange       = if ($cols.Count -gt 3)  { TryParseInt    $cols[3]  } else { 0 }
  $bonusMediumRange      = if ($cols.Count -gt 4)  { TryParseInt    $cols[4]  } else { 0 }
  $bonusLongRange        = if ($cols.Count -gt 5)  { TryParseInt    $cols[5]  } else { 0 }
  $bonusExtremeRange     = if ($cols.Count -gt 6)  { TryParseInt    $cols[6]  } else { 0 }
  $noiseReduction        = if ($cols.Count -gt 7)  { TryParseDouble $cols[7]  } else { 0 }
  $lateralNoiseReductionRaw = if ($cols.Count -gt 8) { $cols[8].Trim() } else { "" }
  $lateralNoiseReduction = if ($lateralNoiseReductionRaw -and $lateralNoiseReductionRaw -ne "0") { $lateralNoiseReductionRaw } else { "" }
  $lengthIncreaseCm      = if ($cols.Count -gt 9)  { TryParseDouble $cols[9]  } else { 0 }
  $rarity                = if ($cols.Count -gt 10 -and $cols[10].Trim()) { $cols[10].Trim() } else { "common" }
  $price                 = if ($cols.Count -gt 11) { TryParseDouble $cols[11] } else { 0 }
  $weightKg              = if ($cols.Count -gt 12) { TryParseDouble $cols[12] } else { 0 }
  $description           = if ($cols.Count -gt 13) { $cols[13].Trim()         } else { "" }
  $itemYear              = if ($cols.Count -gt 14) { TryParseInt $cols[14]    } else { 0 }

  $normFolderKey = ($folderPath -split '\\' | ForEach-Object { $_.ToLower() }) -join '\'
  $itemFolderId  = if ($featureFolderMap.ContainsKey($normFolderKey)) { $featureFolderMap[$normFolderKey]['_id'] } else { $null }
  $sort++

  $ftKey = Remove-Diacritics $featureType
  $featureImg = if ($featureIconMap.ContainsKey($ftKey)) { $featureIconMap[$ftKey] } else { $featureIconDefault }

  $featureItems.Add([ordered]@{
    "_id"    = New-FoundryId
    "name"   = $name
    "type"   = "feature"
    "img"    = $featureImg
    "system" = [ordered]@{
      "featureType"           = $featureType
      "bonusShortRange"       = $bonusShortRange
      "bonusMediumRange"      = $bonusMediumRange
      "bonusLongRange"        = $bonusLongRange
      "bonusExtremeRange"     = $bonusExtremeRange
      "noiseReduction"        = $noiseReduction
      "lateralNoiseReduction" = $lateralNoiseReduction
      "lengthIncreaseCm"      = $lengthIncreaseCm
      "rarity"                = $rarity
      "price"                 = $price
      "weightKg"              = $weightKg
      "year"                  = $itemYear
      "description"           = $description
      "parentWeaponId"        = ""
    }
    "effects" = @()
    "folder"  = $itemFolderId
    "sort"    = $sort
    "flags"   = [ordered]@{}
    "_stats"  = [ordered]@{
      "systemId"       = "merc"
      "systemVersion"  = $SystemVersion
      "coreVersion"    = "13.351"
      "createdTime"    = $null
      "modifiedTime"   = $null
      "lastModifiedBy" = $null
    }
  })
}
Write-Host "  OK $($featureItems.Count) accessoires, $($featureFolderMap.Count) dossiers" -ForegroundColor Green

# =============================================================================
# Ã‰tape 7.5 â€“ Parsing du CSV Storage
# =============================================================================
Write-Host "> Lecture du stockage..." -ForegroundColor Cyan
$stcsv  = Import-Csv (Join-Path $CsvDir "merc-compendium-Storage.csv") -Delimiter ";" -Encoding UTF8
$stcols = $stcsv[0].PSObject.Properties.Name
# Column indices (0-based):
#  0=Folder  1=Nom  2=Rarete  3=Prix  4=Poids(kg)  5=Capacite_L  6=Capacite_Kg  7=Description

$allSTFolderPaths = $stcsv | ForEach-Object { ([string]$_.($stcols[0])).Trim() } | Where-Object { $_ }
$storageFolderMap = New-FolderMap $allSTFolderPaths

$storageItems = [System.Collections.Generic.List[hashtable]]::new()
$sort = 0
foreach ($row in $stcsv) {
  $name = ([string]$row.($stcols[1])).Trim()
  if (-not $name) { continue }

  $folderPath  = ([string]$row.($stcols[0])).Trim()
  $rarity      = if (([string]$row.($stcols[2])).Trim()) { ([string]$row.($stcols[2])).Trim() } else { "common" }
  $price       = TryParseDouble $row.($stcols[3])
  $weightKg    = TryParseDouble $row.($stcols[4])
  $capacityL   = TryParseDouble $row.($stcols[5])
  $capacityKg  = TryParseDouble $row.($stcols[6])
  $description = ([string]$row.($stcols[7])).Trim()

  $normFolderKey = ($folderPath -split '\\' | ForEach-Object { $_.ToLower() }) -join '\'
  $itemFolderId  = if ($storageFolderMap.ContainsKey($normFolderKey)) { $storageFolderMap[$normFolderKey]['_id'] } else { $null }
  $sort++

  $storageItems.Add([ordered]@{
    "_id"    = New-FoundryId
    "name"   = $name
    "type"   = "storage"
    "img"    = "systems/merc/assets/items/equipment/equipment.png"
    "system" = [ordered]@{
      "rarity"          = $rarity
      "price"           = $price
      "weightKg"        = $weightKg
      "capacityL"       = $capacityL
      "capacityKg"      = $capacityKg
      "description"     = $description
      "parentStorageId" = ""
      "isCargo"         = $false
    }
    "effects" = @()
    "folder"  = $itemFolderId
    "sort"    = $sort
    "flags"   = [ordered]@{}
    "_stats"  = [ordered]@{
      "systemId"       = "merc"
      "systemVersion"  = $SystemVersion
      "coreVersion"    = "13.351"
      "createdTime"    = $null
      "modifiedTime"   = $null
      "lastModifiedBy" = $null
    }
  })
}
Write-Host "  OK $($storageItems.Count) stockages, $($storageFolderMap.Count) dossiers" -ForegroundColor Green

# =============================================================================
# Ã‰tape 7b â€“ Parsing du CSV Tables
# =============================================================================
Write-Host "> Lecture des tables alÃ©atoires..." -ForegroundColor Cyan
$tcsv = Import-Csv (Join-Path $CsvDir "merc-compendium-Tables.csv") -Delimiter ";" -Encoding UTF8

# Group rows by TableId to build table + results
$tableGroups = $tcsv | Group-Object { $_.TableId }
$tableItems  = [System.Collections.Generic.List[hashtable]]::new()

foreach ($g in $tableGroups) {
  $firstRow = $g.Group[0]
  $results  = [System.Collections.Generic.List[hashtable]]::new()

  foreach ($row in $g.Group) {
    $results.Add([ordered]@{
      "_id"          = $row.ResultId
      "type"         = "text"
      "name"         = $row.ResultName
      "img"          = "icons/svg/d20-grey.svg"
      "documentUuid" = $null
      "weight"       = [int]$row.Weight
      "range"        = @([int]$row.RangeLow, [int]$row.RangeHigh)
      "drawn"        = $false
      "flags"        = [ordered]@{}
    })
  }

  $tableItems.Add([ordered]@{
    "_id"         = $firstRow.TableId
    "name"        = $firstRow.TableName
    "img"         = $firstRow.Img
    "description" = $firstRow.TableDescription
    "formula"     = $firstRow.Formula
    "replacement" = $true
    "displayRoll" = $true
    "results"     = @($results)
    "folder"      = $null
    "sort"        = 0
    "flags"       = [ordered]@{}
    "_stats"      = [ordered]@{
      "systemId"       = "merc"
      "systemVersion"  = $SystemVersion
      "coreVersion"    = "13.351"
      "createdTime"    = $null
      "modifiedTime"   = $null
      "lastModifiedBy" = $null
    }
  })
}
Write-Host "  OK $($tableItems.Count) tables" -ForegroundColor Green

# =============================================================================
# Ã‰tape 8 â€“ SÃ©rialisation JSON
# =============================================================================
$weaponsJsonPath   = Join-Path $ToolsDir "_weapons.json"
$ammosJsonPath     = Join-Path $ToolsDir "_ammos.json"
$armorsJsonPath    = Join-Path $ToolsDir "_armors.json"
$equipmentJsonPath = Join-Path $ToolsDir "_equipment.json"
$featuresJsonPath  = Join-Path $ToolsDir "_features.json"
$storageJsonPath   = Join-Path $ToolsDir "_storages.json"
$tablesJsonPath    = Join-Path $ToolsDir "_tables.json"

# PowerShell 5 : Set-Content -Encoding UTF8 ajoute un BOM ; JSON.parse() Ã©choue.
# On utilise System.IO.File::WriteAllText avec UTF8 sans BOM.
$utf8NoBOM = New-Object System.Text.UTF8Encoding $false

# Export { folders: [...], items: [...] } so the packer can write !folders! entries
$weaponExport    = [ordered]@{ 'folders' = @($weaponFolderMap.Values);    'items' = @($weaponItems)    }
$ammoExport      = [ordered]@{ 'folders' = @($ammoFolderMap.Values);      'items' = @($ammoItems)      }
$armorExport     = [ordered]@{ 'folders' = @($armorFolderMap.Values);     'items' = @($armorItems)     }
$equipmentExport = [ordered]@{ 'folders' = @($equipmentFolderMap.Values); 'items' = @($equipmentItems) }
$featureExport   = [ordered]@{ 'folders' = @($featureFolderMap.Values);   'items' = @($featureItems)   }
$storageExport   = [ordered]@{ 'folders' = @($storageFolderMap.Values);   'items' = @($storageItems)   }
$tablesExport    = [ordered]@{ 'folders' = @();                           'items' = @($tableItems)     }
[System.IO.File]::WriteAllText($weaponsJsonPath,   ($weaponExport    | ConvertTo-Json -Depth 20), $utf8NoBOM)
[System.IO.File]::WriteAllText($ammosJsonPath,     ($ammoExport      | ConvertTo-Json -Depth 20), $utf8NoBOM)
[System.IO.File]::WriteAllText($armorsJsonPath,    ($armorExport     | ConvertTo-Json -Depth 20), $utf8NoBOM)
[System.IO.File]::WriteAllText($equipmentJsonPath, ($equipmentExport | ConvertTo-Json -Depth 20), $utf8NoBOM)
[System.IO.File]::WriteAllText($featuresJsonPath,  ($featureExport   | ConvertTo-Json -Depth 20), $utf8NoBOM)
[System.IO.File]::WriteAllText($storageJsonPath,   ($storageExport   | ConvertTo-Json -Depth 20), $utf8NoBOM)
[System.IO.File]::WriteAllText($tablesJsonPath,    ($tablesExport    | ConvertTo-Json -Depth 20), $utf8NoBOM)

New-Item -ItemType Directory -Path $PacksDir -Force | Out-Null

# =============================================================================
# Ã‰tape 9 â€“ GÃ©nÃ©ration LevelDB
# =============================================================================
Write-Host "> Generation pack Armes..." -ForegroundColor Cyan
$weaponPackDir = Join-Path $PacksDir "weapons"
Push-Location $ToolsDir
& $NodeExe $PackerScript $weaponsJsonPath $weaponPackDir
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "Erreur packing weapons" }
Pop-Location

Write-Host "> Generation pack Munitions..." -ForegroundColor Cyan
$ammoPackDir = Join-Path $PacksDir "ammos"
Push-Location $ToolsDir
& $NodeExe $PackerScript $ammosJsonPath $ammoPackDir
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "Erreur packing ammos" }
Pop-Location

Write-Host "> Generation pack Armures..." -ForegroundColor Cyan
$armorPackDir = Join-Path $PacksDir "armors"
Push-Location $ToolsDir
& $NodeExe $PackerScript $armorsJsonPath $armorPackDir
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "Erreur packing armors" }
Pop-Location

Write-Host "> Generation pack Equipements..." -ForegroundColor Cyan
$equipmentPackDir = Join-Path $PacksDir "equipments"
Push-Location $ToolsDir
& $NodeExe $PackerScript $equipmentJsonPath $equipmentPackDir
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "Erreur packing equipments" }
Pop-Location

Write-Host "> Generation pack Accessoires..." -ForegroundColor Cyan
$featurePackDir = Join-Path $PacksDir "features"
Push-Location $ToolsDir
& $NodeExe $PackerScript $featuresJsonPath $featurePackDir
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "Erreur packing features" }
Pop-Location

Write-Host "> Generation pack Stockage..." -ForegroundColor Cyan
$storagePackDir = Join-Path $PacksDir "storages"
Push-Location $ToolsDir
& $NodeExe $PackerScript $storageJsonPath $storagePackDir
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "Erreur packing storages" }
Pop-Location

Write-Host "> Generation pack Tables AlÃ©atoires..." -ForegroundColor Cyan
$tablesPackDir  = Join-Path $PacksDir "tables"
Push-Location $ToolsDir
& $NodeExe $PackerScript $tablesJsonPath $tablesPackDir RollTable
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "Erreur packing tables" }
Pop-Location

# =============================================================================
# RÃ©sumÃ©
# =============================================================================
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  COMPENDIUM GENERE AVEC SUCCES" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "  Armes        : $($weaponItems.Count) items, $($weaponFolderMap.Count) dossiers -> $weaponPackDir"
Write-Host "  Munitions    : $($ammoItems.Count) items, $($ammoFolderMap.Count) dossiers -> $ammoPackDir"
Write-Host "  Armures      : $($armorItems.Count) items, $($armorFolderMap.Count) dossiers -> $armorPackDir"
Write-Host "  Equipements  : $($equipmentItems.Count) items, $($equipmentFolderMap.Count) dossiers -> $equipmentPackDir"
Write-Host "  Accessoires  : $($featureItems.Count) items, $($featureFolderMap.Count) dossiers -> $featurePackDir"
Write-Host "  Stockage     : $($storageItems.Count) items, $($storageFolderMap.Count) dossiers -> $storagePackDir"
  Write-Host "  Tables       : $($tableItems.Count) tables -> $tablesPackDir"
Write-Host ""
Write-Host "-> Relancez Foundry VTT pour voir les compendiums." -ForegroundColor Yellow
