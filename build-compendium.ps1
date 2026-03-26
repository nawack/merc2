# =============================================================================
# build-compendium.ps1
# Génère les packs compendium LevelDB pour le système Mercenary.
# Lit les fichiers CSV source et produit :
#   packs/weapons/   – armes (Item type: weapon)
#   packs/ammos/     – munitions (Item type: ammo)
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

# Lire la version du système depuis system.json
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
function Build-FolderMap([string[]]$rawPaths) {
  $map = @{}  # regular Hashtable: normalizedKey -> folder entry
  $paths = $rawPaths | Where-Object { $_ } | Sort-Object -Unique

  foreach ($rawPath in $paths) {
    $parts = ($rawPath -split '\\') | Where-Object { $_ -ne '' }
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
# Étape 1 – Node.js portable
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
# Étape 2 – classic-level
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

  # Nettoyer installation incomplète si elle existe
  if (Test-Path $classicLevelDir) { Remove-Item $classicLevelDir -Recurse -Force }

  $npmCliJs = [IO.Path]::Combine($ToolsDir, 'node_modules', 'npm', 'bin', 'npm-cli.js')
  Push-Location $ToolsDir
  & $NodeExe $npmCliJs install classic-level@2 --save-exact
  Pop-Location

  Write-Host "  OK classic-level installe" -ForegroundColor Green
}

# =============================================================================
# Étape 3 – Parsing du CSV Ammo  (must run before weapons so we can link IDs)
# =============================================================================
Write-Host "> Lecture des munitions..." -ForegroundColor Cyan
$acsv  = Import-Csv (Join-Path $CsvDir "merc-compendium-Ammo.csv") -Delimiter ";" -Encoding Default
$acols = $acsv[0].PSObject.Properties.Name
# Column indices (0-based):
#  0=Folder  1=Munition  2=Type de munition  3=Calibre  4=type(subtype)
#  5=Masse(g)  6=Diamètre(mm)  7=Coeff_traînée  8=Rho(kg/m³)
#  9=indice_perforation  10=Longueur_Canon_std(pouces)  11=vitesse(m/s)  12=poids_munition(g)

# Build ammo folder hierarchy from all Folder paths in the CSV
$allAFolderPaths = $acsv | ForEach-Object { $_.($acols[0]).Trim() } | Where-Object { $_ }
$ammoFolderMap = Build-FolderMap $allAFolderPaths

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
      "quantity"          = 0
      "maxQuantity"       = 0
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

# Build case-insensitive ammo name → _id and ammo system data lookups for weapon linkage
$ammoNameToId     = @{}
$ammoNameToSystem = @{}
foreach ($item in $ammoItems) {
  $ammoNameToId[$item.name.ToLower()]     = $item._id
  $ammoNameToSystem[$item.name.ToLower()] = $item.system
}

# =============================================================================
# Étape 4 – Parsing du CSV Weapons
# =============================================================================
Write-Host "> Lecture des armes..." -ForegroundColor Cyan
$wcsv  = Import-Csv (Join-Path $CsvDir "merc-compendium-Weapons.csv") -Delimiter ";" -Encoding Default
$wcols = $wcsv[0].PSObject.Properties.Name
# Column indices (0-based):
#  0=Folder  1=Nom  2=Sous-type  3=Compétence  4=Illustration  5=Munition
#  6=Calibre  7=Poids_à_vide  8=Canon(pouces)  9=Range_Short  10=Range_Med
#  11=Range_Long  12=Range_Extrem  13=Recul_C/C  14=Recul_Burst  15=Chargeur
#  16=ROF_mode  17=ROF_limited

# Build weapon folder hierarchy from all Folder paths in the CSV
$allWFolderPaths = $wcsv | ForEach-Object { $_.($wcols[0]).Trim() } | Where-Object { $_ }
$weaponFolderMap = Build-FolderMap $allWFolderPaths

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

  # Resolve default ammo by name — case-insensitive
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
# Étape 5 – Parsing du CSV Armors
# =============================================================================
Write-Host "> Lecture des armures..." -ForegroundColor Cyan
$arcsv  = Import-Csv (Join-Path $CsvDir "merc-compendium-Armors.csv") -Delimiter ";" -Encoding UTF8
$arcols = $arcsv[0].PSObject.Properties.Name
# Column indices (0-based):
#  0=Folder  1=Nom  2=Rarete  3=Prix  4=Poids(kg)  5=Description
#  6=crane  7=visage  8=cou  9=poitrine_gch  10=poitrine_dr
# 11=abdomen_gch  12=abdomen_dr  13=bas_ventre  14=bras_gch  15=bras_dr
# 16=av_bras_gch  17=av_bras_dr  18=main_gch  19=main_dr
# 20=cuisse_gch  21=cuisse_dr  22=jambe_gch  23=jambe_dr  24=pied_gch  25=pied_dr

$allARFolderPaths = $arcsv | ForEach-Object { $_.($arcols[0]).Trim() } | Where-Object { $_ }
$armorFolderMap   = Build-FolderMap $allARFolderPaths

$armorItems = [System.Collections.Generic.List[hashtable]]::new()
$sort = 0
foreach ($row in $arcsv) {
  $name = $row.($arcols[1]).Trim()
  if (-not $name) { continue }

  $folderPath  = $row.($arcols[0]).Trim()
  $rarity      = if ($row.($arcols[2]).Trim()) { $row.($arcols[2]).Trim() } else { "common" }
  $price       = TryParseDouble $row.($arcols[3])
  $weightKg    = TryParseDouble $row.($arcols[4])
  $description = $row.($arcols[5]).Trim()

  $normFolderKey = ($folderPath -split '\\' | ForEach-Object { $_.ToLower() }) -join '\'
  $itemFolderId  = if ($armorFolderMap.ContainsKey($normFolderKey)) { $armorFolderMap[$normFolderKey]['_id'] } else { $null }
  $sort++

  $armorItems.Add([ordered]@{
    "_id"    = New-FoundryId
    "name"   = $name
    "type"   = "armor"
    "img"    = "systems/merc/assets/items/armor/armor.png"
    "system" = [ordered]@{
      "rarity"      = $rarity
      "price"       = $price
      "weightKg"    = $weightKg
      "description" = $description
      "locations"   = [ordered]@{
        "crane"        = TryParseInt $row.($arcols[6])
        "visage"       = TryParseInt $row.($arcols[7])
        "cou"          = TryParseInt $row.($arcols[8])
        "poitrine_gch" = TryParseInt $row.($arcols[9])
        "poitrine_dr"  = TryParseInt $row.($arcols[10])
        "abdomen_gch"  = TryParseInt $row.($arcols[11])
        "abdomen_dr"   = TryParseInt $row.($arcols[12])
        "bas_ventre"   = TryParseInt $row.($arcols[13])
        "bras_gch"     = TryParseInt $row.($arcols[14])
        "bras_dr"      = TryParseInt $row.($arcols[15])
        "av_bras_gch"  = TryParseInt $row.($arcols[16])
        "av_bras_dr"   = TryParseInt $row.($arcols[17])
        "main_gch"     = TryParseInt $row.($arcols[18])
        "main_dr"      = TryParseInt $row.($arcols[19])
        "cuisse_gch"   = TryParseInt $row.($arcols[20])
        "cuisse_dr"    = TryParseInt $row.($arcols[21])
        "jambe_gch"    = TryParseInt $row.($arcols[22])
        "jambe_dr"     = TryParseInt $row.($arcols[23])
        "pied_gch"     = TryParseInt $row.($arcols[24])
        "pied_dr"      = TryParseInt $row.($arcols[25])
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
# Étape 6 – Parsing du CSV Equipment
# =============================================================================
Write-Host "> Lecture des équipements..." -ForegroundColor Cyan
$eqcsv  = Import-Csv (Join-Path $CsvDir "merc-compendium-Equipment.csv") -Delimiter ";" -Encoding UTF8
$eqcols = $eqcsv[0].PSObject.Properties.Name
# Column indices (0-based):
#  0=Folder  1=Nom  2=Rarete  3=Prix  4=Poids(kg)  5=Description

$allEQFolderPaths   = $eqcsv | ForEach-Object { $_.($eqcols[0]).Trim() } | Where-Object { $_ }
$equipmentFolderMap = Build-FolderMap $allEQFolderPaths

$equipmentItems = [System.Collections.Generic.List[hashtable]]::new()
$sort = 0
foreach ($row in $eqcsv) {
  $name = $row.($eqcols[1]).Trim()
  if (-not $name) { continue }

  $folderPath  = $row.($eqcols[0]).Trim()
  $rarity      = if ($row.($eqcols[2]).Trim()) { $row.($eqcols[2]).Trim() } else { "common" }
  $price       = TryParseDouble $row.($eqcols[3])
  $weightKg    = TryParseDouble $row.($eqcols[4])
  $description = $row.($eqcols[5]).Trim()

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
Write-Host "  OK $($equipmentItems.Count) équipements, $($equipmentFolderMap.Count) dossiers" -ForegroundColor Green

# =============================================================================
# Étape 7 – Sérialisation JSON
# =============================================================================
$weaponsJsonPath   = Join-Path $ToolsDir "_weapons.json"
$ammosJsonPath     = Join-Path $ToolsDir "_ammos.json"
$armorsJsonPath    = Join-Path $ToolsDir "_armors.json"
$equipmentJsonPath = Join-Path $ToolsDir "_equipment.json"

# PowerShell 5 : Set-Content -Encoding UTF8 ajoute un BOM ; JSON.parse() échoue.
# On utilise System.IO.File::WriteAllText avec UTF8 sans BOM.
$utf8NoBOM = New-Object System.Text.UTF8Encoding $false

# Export { folders: [...], items: [...] } so the packer can write !folders! entries
$weaponExport    = [ordered]@{ 'folders' = @($weaponFolderMap.Values);    'items' = @($weaponItems)    }
$ammoExport      = [ordered]@{ 'folders' = @($ammoFolderMap.Values);      'items' = @($ammoItems)      }
$armorExport     = [ordered]@{ 'folders' = @($armorFolderMap.Values);     'items' = @($armorItems)     }
$equipmentExport = [ordered]@{ 'folders' = @($equipmentFolderMap.Values); 'items' = @($equipmentItems) }
[System.IO.File]::WriteAllText($weaponsJsonPath,   ($weaponExport    | ConvertTo-Json -Depth 20), $utf8NoBOM)
[System.IO.File]::WriteAllText($ammosJsonPath,     ($ammoExport      | ConvertTo-Json -Depth 20), $utf8NoBOM)
[System.IO.File]::WriteAllText($armorsJsonPath,    ($armorExport     | ConvertTo-Json -Depth 20), $utf8NoBOM)
[System.IO.File]::WriteAllText($equipmentJsonPath, ($equipmentExport | ConvertTo-Json -Depth 20), $utf8NoBOM)

New-Item -ItemType Directory -Path $PacksDir -Force | Out-Null

# =============================================================================
# Étape 8 – Génération LevelDB
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

# =============================================================================
# Résumé
# =============================================================================
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  COMPENDIUM GENERE AVEC SUCCES" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "  Armes       : $($weaponItems.Count) items, $($weaponFolderMap.Count) dossiers -> $weaponPackDir"
Write-Host "  Munitions   : $($ammoItems.Count) items, $($ammoFolderMap.Count) dossiers -> $ammoPackDir"
Write-Host "  Armures     : $($armorItems.Count) items, $($armorFolderMap.Count) dossiers -> $armorPackDir"
Write-Host "  Equipements : $($equipmentItems.Count) items, $($equipmentFolderMap.Count) dossiers -> $equipmentPackDir"
Write-Host ""
Write-Host "-> Relancez Foundry VTT pour voir les compendiums." -ForegroundColor Yellow
