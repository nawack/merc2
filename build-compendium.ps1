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

function Parse-PenValue([string]$v) {
  # Return the raw text value (e.g. "1+2", "0+2", "0") — it is a game notation, not a math expression
  return $v.Trim()
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
            'systemVersion'  = '1.0.11'
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
# Index: 0=Folder 1=Munition 2=Type 3=Calibre-type 4=Calibre 5=type
#        6=poids projectile 7=vitesse 8=PenCourte 9=PenMoy 10=PenLong
#        11=PenExtreme 12=poids munition

# Build ammo folder hierarchy from all Folder paths in the CSV
$allAFolderPaths = $acsv | ForEach-Object { $_.($acols[0]).Trim() } | Where-Object { $_ }
$ammoFolderMap = Build-FolderMap $allAFolderPaths

$ammoItems = [System.Collections.Generic.List[hashtable]]::new()
$sort = 0
foreach ($row in $acsv) {
  $name = $row.($acols[1]).Trim()
  if (-not $name) { continue }

  $folderPath  = $row.($acols[0]).Trim()
  $caliber     = $row.($acols[4]).Trim()
  $ammoType    = $row.($acols[2]).Trim()   # "Type de munition" (ex: "Balle")
  $subType     = $row.($acols[5]).Trim()   # "type" (ex: BO, AP, Expansion)
  $weight      = TryParseDouble $row.($acols[6])
  $weightAmmo  = TryParseDouble $row.($acols[12])
  $velocity    = TryParseInt    $row.($acols[7])
  $penShort    = Parse-PenValue $row.($acols[8])
  $penMedium   = Parse-PenValue $row.($acols[9])
  $penLong     = Parse-PenValue $row.($acols[10])
  $penExtreme  = Parse-PenValue $row.($acols[11])

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
      "ammoType"       = $ammoType
      "caliber"        = $caliber
      "quantity"       = 0
      "maxQuantity"    = 0
      "weight"         = $weight
      "weightAmmo"     = $weightAmmo
      "velocity"       = $velocity
      "penetration"    = [ordered]@{
        "short"   = $penShort
        "medium"  = $penMedium
        "long"    = $penLong
        "extreme" = $penExtreme
      }
      "damage"         = ""
      "price"          = 0
      "rarity"         = "common"
      "description"    = $subType
      "parentWeaponId" = ""
    }
    "effects" = @()
    "folder"  = $itemFolderId
    "sort"    = $sort
    "flags"   = [ordered]@{}
    "_stats"  = [ordered]@{
      "systemId"       = "merc"
      "systemVersion"  = "1.0.11"
      "coreVersion"    = "13.351"
      "createdTime"    = $null
      "modifiedTime"   = $null
      "lastModifiedBy" = $null
    }
  })
}
Write-Host "  OK $($ammoItems.Count) munitions, $($ammoFolderMap.Count) dossiers" -ForegroundColor Green

# Build case-insensitive ammo name → _id lookup for weapon linkage
$ammoNameToId = @{}
foreach ($item in $ammoItems) {
  $ammoNameToId[$item.name.ToLower()] = $item._id
}

# =============================================================================
# Étape 4 – Parsing du CSV Weapons
# =============================================================================
Write-Host "> Lecture des armes..." -ForegroundColor Cyan
$wcsv  = Import-Csv (Join-Path $CsvDir "merc-compendium-Weapons.csv") -Delimiter ";" -Encoding Default
$wcols = $wcsv[0].PSObject.Properties.Name
# Index: 0=Folder  1=Nom  2=Sous-type d'arme  3=Compétence associée  4=Munition
#        5=Calibre  6=Poids à vide  7=dégat
#        8=Range Short  9=Range Med  10=Range Long  11=Range Extrem
#        12=Recul C/C  13=Recul Burst  14=Chargeur  15=ROF mode  16=ROF limited  17=Nom photo

# Build weapon folder hierarchy from all Folder paths in the CSV
$allWFolderPaths = $wcsv | ForEach-Object { $_.($wcols[0]).Trim() } | Where-Object { $_ }
$weaponFolderMap = Build-FolderMap $allWFolderPaths

$weaponItems = [System.Collections.Generic.List[hashtable]]::new()
$sort = 0
foreach ($row in $wcsv) {
  $name = $row.($wcols[1]).Trim()
  if (-not $name) { continue }

  $folderPath    = $row.($wcols[0]).Trim()
  # Folder last segment used for icon selection only
  $fpParts       = $folderPath -split '\\'
  $folderSubtype = if ($fpParts.Count -gt 1) { $fpParts[-1] } else { $folderPath }
  # "Sous-type d'arme" column (index 2) used for the weaponSubtype field
  $subtype      = $row.($wcols[2]).Trim()
  $skill        = $row.($wcols[3]).Trim()
  $weightKg     = TryParseDouble $row.($wcols[6])
  $damage       = $row.($wcols[7]).Trim()
  $rangeShort   = TryParseInt $row.($wcols[8])
  $rangeMed     = TryParseInt $row.($wcols[9])
  $rangeLng     = TryParseInt $row.($wcols[10])
  $rangeExt     = TryParseInt $row.($wcols[11])
  $recoilCC     = $row.($wcols[12]).Trim()
  $recoilBurst  = $row.($wcols[13]).Trim()
  $magazine     = TryParseInt $row.($wcols[14])
  $rofMode      = $row.($wcols[15]).Trim()
  $rofLimited   = TryParseInt $row.($wcols[16])

  # Resolve default ammo by name (Munition col) — case-insensitive
  $munitionName  = $row.($wcols[4]).Trim()
  $caliber       = $row.($wcols[5]).Trim()
  $defaultAmmoId = if ($ammoNameToId.ContainsKey($munitionName.ToLower())) { $ammoNameToId[$munitionName.ToLower()] } else { "" }

  # Resolve folder _id (case-insensitive lookup)
  $normFolderKey = ($folderPath -split '\\' | ForEach-Object { $_.ToLower() }) -join '\'
  $itemFolderId  = if ($weaponFolderMap.ContainsKey($normFolderKey)) { $weaponFolderMap[$normFolderKey]['_id'] } else { $null }
  $sort++

  $weaponItems.Add([ordered]@{
    "_id"    = New-FoundryId
    "name"   = $name
    "type"   = "weapon"
    "img"    = Get-WeaponImage $folderSubtype
    "system" = [ordered]@{
      "damage"          = $damage
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
      "defaultAmmoName" = $munitionName
      "defaultAmmoId"   = $defaultAmmoId
    }
    "effects" = @()
    "folder"  = $itemFolderId
    "sort"    = $sort
    "flags"   = [ordered]@{}
    "_stats"  = [ordered]@{
      "systemId"       = "merc"
      "systemVersion"  = "1.0.11"
      "coreVersion"    = "13.351"
      "createdTime"    = $null
      "modifiedTime"   = $null
      "lastModifiedBy" = $null
    }
  })
}
Write-Host "  OK $($weaponItems.Count) armes, $($weaponFolderMap.Count) dossiers" -ForegroundColor Green

# =============================================================================
# Étape 5 – Sérialisation JSON
# =============================================================================
$weaponsJsonPath = Join-Path $ToolsDir "_weapons.json"
$ammosJsonPath   = Join-Path $ToolsDir "_ammos.json"

# PowerShell 5 : Set-Content -Encoding UTF8 ajoute un BOM ; JSON.parse() échoue.
# On utilise System.IO.File::WriteAllText avec UTF8 sans BOM.
$utf8NoBOM = New-Object System.Text.UTF8Encoding $false

# Export { folders: [...], items: [...] } so the packer can write !folders! entries
$weaponExport = [ordered]@{ 'folders' = @($weaponFolderMap.Values); 'items' = @($weaponItems) }
$ammoExport   = [ordered]@{ 'folders' = @($ammoFolderMap.Values);   'items' = @($ammoItems)   }
[System.IO.File]::WriteAllText($weaponsJsonPath, ($weaponExport | ConvertTo-Json -Depth 20), $utf8NoBOM)
[System.IO.File]::WriteAllText($ammosJsonPath,   ($ammoExport   | ConvertTo-Json -Depth 20), $utf8NoBOM)

New-Item -ItemType Directory -Path $PacksDir -Force | Out-Null

# =============================================================================
# Étape 6 – Génération LevelDB
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

# =============================================================================
# Résumé
# =============================================================================
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  COMPENDIUM GENERE AVEC SUCCES" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "  Armes     : $($weaponItems.Count) items, $($weaponFolderMap.Count) dossiers -> $weaponPackDir"
  Write-Host "  Munitions : $($ammoItems.Count) items, $($ammoFolderMap.Count) dossiers -> $ammoPackDir"
Write-Host ""
Write-Host "-> Relancez Foundry VTT pour voir les compendiums." -ForegroundColor Yellow
