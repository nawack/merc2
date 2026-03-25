/**
 * Initialize portrait image selection functionality
 * Uses Foundry's native FilePicker API to browse the image library
 */
function initPortraitSelection(actor, html) {
  const browseBtn = html.querySelector('.portrait-browse-btn');
  const portraitImg = html.querySelector('.character-portrait');
  
  if (!browseBtn) return;
  
  // Click button to open Foundry's FilePicker
  browseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    new foundry.applications.apps.FilePicker.implementation({
      type: "image",
      callback: (path) => {
        // Update the image source
        portraitImg.src = path;
        // Update the actor's image
        if (actor) {
          actor.update({ img: path });
        }
      },
      top: 100,
      left: 100
    }).browse();
  });
  
  // Also allow clicking directly on the image to browse
  portraitImg.addEventListener('click', (e) => {
    e.preventDefault();
    new foundry.applications.apps.FilePicker.implementation({
      type: "image",
      callback: (path) => {
        portraitImg.src = path;
        if (actor) {
          actor.update({ img: path });
        }
      },
      top: 100,
      left: 100
    }).browse();
  });
}

/**
 * Check if an ammo item is linked to a given weapon ID.
 * For embedded items (on actors): parentWeaponId is a single ID string.
 * For world-level items: parentWeaponId can be a comma-separated list of IDs.
 */
function ammoIsLinkedToWeapon(ammoItem, weaponId) {
  const raw = ammoItem?.system?.parentWeaponId || "";
  if (!raw || !weaponId) return false;
  // Fast path: single ID (most common, especially for embedded items)
  if (raw === weaponId) return true;
  // Multi-weapon path: comma-separated IDs
  return raw.split(",").includes(weaponId);
}

/**
 * Add a weapon ID to an ammo item's parentWeaponId (comma-separated list).
 * Returns the new string value. Does not duplicate existing IDs.
 */
function addWeaponIdToAmmo(currentParentWeaponId, weaponIdToAdd) {
  if (!weaponIdToAdd) return currentParentWeaponId || "";
  const ids = (currentParentWeaponId || "").split(",").filter(id => id);
  if (ids.includes(weaponIdToAdd)) return ids.join(",");
  ids.push(weaponIdToAdd);
  return ids.join(",");
}

/**
 * Remove a weapon ID from an ammo item's parentWeaponId (comma-separated list).
 * Returns the new string value.
 */
function removeWeaponIdFromAmmo(currentParentWeaponId, weaponIdToRemove) {
  if (!currentParentWeaponId || !weaponIdToRemove) return currentParentWeaponId || "";
  const ids = currentParentWeaponId.split(",").filter(id => id && id !== weaponIdToRemove);
  return ids.join(",");
}

/**
 * Calculate weapon damage string from kinetic energy (Joules).
 * Dégats = SI(ENT(SQRT(E)/12)=0; MOD(ENT(SQRT(E)/4);3); ENT(SQRT(E)/12)&"D6"&bonus_str)
 * Returns a dice formula string like "3D6+1", "2D6", or a plain number.
 */
function calcDamageFromEnergy(energy) {
  if (!energy || energy <= 0) return "";
  const sqrtE = Math.sqrt(energy);
  const d6 = Math.floor(sqrtE / 12);
  const bonus = Math.floor(sqrtE / 4) % 3;
  if (d6 === 0) {
    return String(bonus);
  }
  if (bonus === 0) {
    return `${d6}D6`;
  }
  return `${d6}D6+${bonus}`;
}

/**
 * Calculate blindage malus formula string for a given energy and penetration value.
 * Returns "-" if penetration >= 7 (no penalty), otherwise returns a dice formula string.
 */
function calcBlindageMalus(energy, pen) {
  if (!energy || !pen || pen <= 0) return "-";
  const sqrtE = Math.sqrt(energy);
  const effective = sqrtE * (7 / pen);
  if (effective >= sqrtE) return "-";
  const d6 = Math.floor(effective / 12);
  const bonus = Math.floor(effective / 4) % 3;
  if (d6 === 0) {
    return String(bonus);
  }
  if (bonus === 0) {
    return `${d6}D6`;
  }
  return `${d6}D6+${bonus}`;
}

/**
 * Calculate all ballistic values for a weapon given its barrel length and ammo data.
 * @param {number} barrelLength - weapon barrel length in inches
 * @param {Object} ammoSystem  - ammo item's system data
 * @param {Object} ranges      - weapon ranges {short, medium, long, extreme}
 * @returns {Object} ballistics data object
 */
function calcWeaponBallistics(barrelLength, ammoSystem, ranges) {
  const mass        = Number(ammoSystem?.mass ?? 0);
  const velocity    = Number(ammoSystem?.velocity ?? 0);
  const barrelStd   = Number(ammoSystem?.barrel_length_std ?? 0);
  const brakingIdx  = Number(ammoSystem?.braking_index ?? 0);
  const sectDens    = Number(ammoSystem?.sectional_density ?? 0);
  const perfIdx     = Number(ammoSystem?.perforation_index ?? 1);

  if (!mass || !velocity || !barrelStd) return null;

  const mass_kg = mass / 1000;
  const canon   = Number(barrelLength) || barrelStd;

  // Vitesse initiale arme
  const v0 = velocity * Math.pow(canon / barrelStd, 0.25);

  // Energie arme (J)
  const energy = 0.5 * mass_kg * v0 * v0;

  // Pénétrations
  const penMuzzle = 0.0000001 * sectDens * (2 * energy / mass_kg) * perfIdx;

  const expFactor = (range) => {
    if (!brakingIdx) return 1;
    return Math.exp(-(2 * brakingIdx / mass_kg) * range);
  };

  const penAtRange = (range) =>
    0.0000001 * sectDens * (2 * energy * expFactor(range) / mass_kg) * perfIdx;

  const rs = Number(ranges?.short ?? 0);
  const rm = Number(ranges?.medium ?? 0);
  const rl = Number(ranges?.long ?? 0);
  const re = Number(ranges?.extreme ?? 0);

  const penShort   = penAtRange(rs);
  const penMedium  = penAtRange(rm);
  const penLong    = penAtRange(rl);
  const penExtreme = penAtRange(re);

  const round2 = (v) => Math.round(v * 100) / 100;

  return {
    hasData:       true,
    initialVelocity: Math.round(v0),
    energy:        Math.round(energy),
    damage:        calcDamageFromEnergy(energy),
    pen: {
      muzzle:  round2(penMuzzle),
      short:   round2(penShort),
      medium:  round2(penMedium),
      long:    round2(penLong),
      extreme: round2(penExtreme)
    },
    blindage: {
      short:   calcBlindageMalus(energy, penMuzzle),
      medium:  calcBlindageMalus(energy, penMedium),
      long:    calcBlindageMalus(energy, penLong),
      extreme: calcBlindageMalus(energy, penExtreme)
    }
  };
}

/**
 * Compute ammo derived values: braking_index and sectional_density.
 */
function calcAmmoDerived(mass, diameter, coeff_trainee, rho) {
  if (!diameter) return { braking_index: 0, sectional_density: 0 };
  const surface          = Math.PI * diameter * diameter / 4e6;
  const braking_index    = 0.5 * surface * (coeff_trainee || 0) * (rho || 1.225);
  const mass_kg          = (mass || 0) / 1000;
  const diam_m           = diameter / 1000;
  const area_m2          = Math.PI * diam_m * diam_m / 4;
  const sectional_density = area_m2 > 0 ? mass_kg / area_m2 : 0;
  return { braking_index, sectional_density };
}

/**
 * @deprecated Use calcDamageFromEnergy() for new formula.
 * Calculate ammunition damage from projectile weight (grams) and velocity (m/s).
 * muzzle_energy = 0.5 * (weight/1000) * velocity^2
 * Returns a dice formula string like "3D6+1" or "2D6".
 */
function calculateAmmoDamage(weight, velocity) {
  if (!weight || !velocity) return "";
  const muzzleEnergy = 0.5 * (weight / 1000) * Math.pow(velocity, 2);
  return calcDamageFromEnergy(muzzleEnergy);
}

// Index to Degree conversion table
// Index 0 = degree -7, index 1 = degree -6, ..., index 7 = degree 0, ..., index 40 = degree 33
const INDEX_TO_DEGREE = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33];

// Combat & Movement Tables
// These correspond to attribute indices from -11 to 20
const STATS_TABLES = {
  taille: [49, 57, 65, 73, 81, 89, 97, 105, 113, 121, 129, 137, 145, 153, 161, 169, 177, 186, 195, 206, 219, 235, 253, 275, 301, 332, 367, 408, 455, 509, 569, 600],
  poids: [1.6, 2.5, 3.7, 5.3, 7, 9, 12, 15, 19, 24, 29, 34, 41, 48, 56, 64, 74, 85, 99, 116, 140, 172, 216, 277, 363, 485, 658, 904, 1253, 1749, 2449, 3000],
  reptation: [0.5, 1, 1, 1, 1, 1, 1, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2, 2, 2, 2, 2, 2, 2.5, 2.5, 2.5, 3, 3, 3.5, 3.5, 4, 4.5, 4.5, 5, 5.5, 6.5],
  marche: [2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 9, 10, 11, 12, 13, 15, 16, 18, 20, 23, 25],
  course: [10, 11, 13, 15, 16, 18, 19, 21, 23, 24, 26, 27, 29, 31, 32, 34, 35, 37, 39, 41, 44, 47, 51, 55, 60, 66, 73, 82, 91, 102, 114, 128],
  dissimulation: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12, -13, -14, -15],
  discretion: [10, 9, 9, 8, 7, 7, 6, 5, 5, 4, 3, 3, 2, 1, 1, 0, 0, 0, -1, -1, -2, -3, -3, -4, -5, -5, -6, -7, -7, -8, -9, -9],
  ajustementPC: [-3, -3, -3, -3, -3, -3, -3, -2, -2, -2, -2, -2, -2, -1, -1, -1, 0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 7, 8]
};

// Base melee damage table (Force 1-10 x Degree -7 to 19)
const BASE_DAMAGE_TABLE = [
  ["1", "1", "1", "1", "1", "1", "2", "2", "2", "2", "1d6", "1d6", "1d6", "1d6", "1d6+1", "1d6+1", "1d6+1", "1d6+1", "1d6+2", "1d6+2", "1d6+2", "1d6+2", "2d6", "2d6", "2d6", "2d6", "2d6+1"],
  ["1", "1", "1", "1", "1", "2", "2", "2", "2", "1d6", "1d6", "1d6", "1d6", "1d6+1", "1d6+1", "1d6+1", "1d6+1", "1d6+2", "1d6+2", "1d6+2", "1d6+2", "2d6", "2d6", "2d6", "2d6", "2d6+1", "2d6+1"],
  ["1", "1", "1", "1", "2", "2", "2", "2", "1d6", "1d6", "1d6", "1d6", "1d6+1", "1d6+1", "1d6+1", "1d6+1", "1d6+2", "1d6+2", "1d6+2", "1d6+2", "2d6", "2d6", "2d6", "2d6", "2d6+1", "2d6+1", "2d6+1"],
  ["1", "1", "1", "2", "2", "2", "2", "1d6", "1d6", "1d6", "1d6", "1d6+1", "1d6+1", "1d6+1", "1d6+1", "1d6+2", "1d6+2", "1d6+2", "1d6+2", "2d6", "2d6", "2d6", "2d6", "2d6+1", "2d6+1", "2d6+1", "2d6+1"],
  ["1", "1", "2", "2", "2", "2", "1d6", "1d6", "1d6", "1d6", "1d6+1", "1d6+1", "1d6+1", "1d6+1", "1d6+2", "1d6+2", "1d6+2", "1d6+2", "2d6", "2d6", "2d6", "2d6", "2d6+1", "2d6+1", "2d6+1", "2d6+1", "2d6+2"],
  ["1", "2", "2", "2", "2", "1d6", "1d6", "1d6", "1d6", "1d6+1", "1d6+1", "1d6+1", "1d6+1", "1d6+2", "1d6+2", "1d6+2", "1d6+2", "2d6", "2d6", "2d6", "2d6", "2d6+1", "2d6+1", "2d6+1", "2d6+1", "2d6+2", "2d6+2"],
  ["2", "2", "2", "2", "1d6", "1d6", "1d6", "1d6", "1d6+1", "1d6+1", "1d6+1", "1d6+1", "1d6+2", "1d6+2", "1d6+2", "1d6+2", "2d6", "2d6", "2d6", "2d6", "2d6+1", "2d6+1", "2d6+1", "2d6+1", "2d6+2", "2d6+2", "2d6+2"],
  ["2", "2", "2", "1d6", "1d6", "1d6", "1d6", "1d6+1", "1d6+1", "1d6+1", "1d6+1", "1d6+2", "1d6+2", "1d6+2", "1d6+2", "2d6", "2d6", "2d6", "2d6", "2d6+1", "2d6+1", "2d6+1", "2d6+1", "2d6+2", "2d6+2", "2d6+2", "2d6+2"],
  ["2", "2", "1d6", "1d6", "1d6", "1d6", "1d6+1", "1d6+1", "1d6+1", "1d6+1", "1d6+2", "1d6+2", "1d6+2", "1d6+2", "2d6", "2d6", "2d6", "2d6", "2d6+1", "2d6+1", "2d6+1", "2d6+1", "2d6+2", "2d6+2", "2d6+2", "2d6+2", "3d6"],
  ["2", "1d6", "1d6", "1d6", "1d6", "1d6+1", "1d6+1", "1d6+1", "1d6+1", "1d6+2", "1d6+2", "1d6+2", "1d6+2", "2d6", "2d6", "2d6", "2d6", "2d6+1", "2d6+1", "2d6+1", "2d6+1", "2d6+2", "2d6+2", "2d6+2", "2d6+2", "3d6", "3d6"]
];

// Degree calculation table: rows are Base values (4-28), columns are cumulative XP thresholds
const DEGREE_TABLE = {
  4: [0, 0, 0, 1, 1, 2, 3, 4, 5, 7, 10, 12, 16, 19, 23, 28, 32, 38, 43, 49, 56, 62, 70, 77, 85, 94, 102, 112, 121, 131, 142, 152, 164, 175, 187, 200, 212, 226, 239, 253, 268],
  5: [0, 0, 0, 1, 1, 2, 3, 5, 7, 9, 12, 16, 20, 24, 29, 35, 41, 47, 54, 62, 70, 78, 87, 97, 107, 117, 128, 140, 152, 164, 177, 191, 205, 219, 234, 250, 266, 282, 299, 317, 335],
  6: [0, 0, 1, 1, 2, 3, 4, 6, 8, 11, 15, 19, 24, 29, 35, 42, 49, 57, 65, 74, 84, 94, 105, 116, 128, 141, 154, 168, 182, 197, 213, 229, 246, 263, 281, 300, 319, 339, 359, 380, 402],
  7: [0, 0, 1, 1, 2, 3, 5, 7, 9, 13, 17, 22, 28, 34, 41, 49, 57, 66, 76, 86, 98, 109, 122, 135, 149, 164, 179, 196, 212, 230, 248, 267, 287, 307, 328, 350, 372, 395, 419, 443, 469],
  8: [0, 0, 1, 1, 2, 4, 6, 8, 11, 15, 20, 25, 32, 39, 47, 56, 65, 76, 87, 99, 112, 125, 140, 155, 171, 188, 205, 224, 243, 263, 284, 305, 328, 351, 375, 400, 425, 452, 479, 507, 536],
  9: [0, 1, 1, 2, 3, 4, 6, 9, 12, 17, 22, 28, 36, 44, 53, 63, 73, 85, 98, 111, 126, 141, 157, 174, 192, 211, 231, 252, 273, 296, 319, 343, 369, 395, 422, 450, 478, 508, 539, 570, 603],
  10: [0, 1, 1, 2, 3, 5, 7, 10, 14, 19, 25, 32, 40, 49, 59, 70, 82, 95, 109, 124, 140, 157, 175, 194, 214, 235, 257, 280, 304, 329, 355, 382, 410, 439, 469, 500, 532, 565, 599, 634, 670],
  11: [0, 1, 1, 2, 3, 5, 8, 11, 15, 20, 27, 35, 44, 53, 64, 77, 90, 104, 119, 136, 154, 172, 192, 213, 235, 258, 282, 308, 334, 361, 390, 420, 451, 482, 515, 550, 585, 621, 658, 697, 737],
  12: [0, 1, 1, 2, 4, 6, 9, 12, 16, 22, 30, 38, 48, 58, 70, 84, 98, 114, 130, 148, 168, 188, 210, 232, 256, 282, 308, 336, 364, 394, 426, 458, 492, 526, 562, 600, 638, 678, 718, 760, 804],
  13: [0, 1, 1, 2, 4, 6, 9, 13, 18, 24, 32, 41, 52, 63, 76, 91, 106, 123, 141, 161, 182, 204, 227, 252, 278, 305, 334, 364, 395, 427, 461, 496, 533, 570, 609, 650, 691, 734, 778, 824, 871],
  14: [0, 1, 1, 2, 4, 7, 10, 14, 19, 26, 35, 44, 56, 68, 82, 98, 114, 133, 152, 173, 196, 219, 245, 271, 299, 329, 359, 392, 425, 460, 497, 534, 574, 614, 656, 700, 744, 791, 838, 887, 938],
  15: [0, 1, 2, 3, 5, 7, 11, 15, 21, 28, 37, 48, 60, 73, 88, 105, 123, 142, 163, 186, 210, 235, 262, 291, 321, 352, 385, 420, 456, 493, 532, 573, 615, 658, 703, 750, 798, 847, 898, 951, 1005],
  16: [0, 1, 2, 3, 5, 8, 12, 16, 22, 30, 40, 51, 64, 78, 94, 112, 131, 152, 174, 198, 224, 251, 280, 310, 342, 376, 411, 448, 486, 526, 568, 611, 656, 702, 750, 800, 851, 904, 958, 1014, 1072],
  17: [0, 1, 2, 3, 5, 8, 12, 17, 23, 32, 42, 54, 68, 83, 100, 119, 139, 161, 185, 210, 238, 266, 297, 329, 363, 399, 436, 476, 516, 559, 603, 649, 697, 746, 797, 850, 904, 960, 1018, 1077, 1139],
  18: [0, 1, 2, 3, 6, 9, 13, 18, 25, 34, 45, 57, 72, 88, 106, 126, 147, 171, 196, 223, 252, 282, 315, 349, 385, 423, 462, 504, 547, 592, 639, 687, 738, 790, 844, 900, 957, 1017, 1078, 1141, 1206],
  19: [0, 1, 2, 3, 6, 9, 14, 19, 26, 36, 47, 60, 76, 93, 112, 133, 155, 180, 207, 235, 266, 298, 332, 368, 406, 446, 488, 532, 577, 625, 674, 725, 779, 834, 891, 950, 1010, 1073, 1178, 1204, 1273],
  20: [0, 1, 2, 3, 6, 10, 15, 20, 28, 38, 50, 64, 80, 98, 118, 140, 164, 190, 218, 248, 280, 314, 350, 388, 428, 470, 514, 560, 608, 658, 710, 764, 820, 878, 938, 1000, 1064, 1130, 1198, 1268, 1340],
  21: [0, 1, 2, 4, 7, 10, 15, 21, 29, 39, 52, 67, 84, 102, 123, 147, 172, 199, 228, 260, 294, 329, 367, 407, 449, 493, 539, 588, 638, 690, 745, 802, 861, 921, 984, 1050, 1117, 1186, 1257, 1331, 1407],
  22: [0, 1, 2, 4, 7, 11, 16, 22, 30, 41, 55, 70, 88, 107, 129, 154, 180, 209, 239, 272, 308, 345, 385, 426, 470, 517, 565, 616, 668, 723, 781, 840, 902, 965, 1031, 1100, 1170, 1243, 1317, 1394, 1474],
  23: [0, 1, 2, 4, 7, 11, 17, 23, 32, 43, 57, 73, 92, 112, 135, 161, 188, 218, 250, 285, 322, 361, 402, 446, 492, 540, 591, 644, 699, 756, 816, 878, 943, 1009, 1078, 1150, 1223, 1299, 1377, 1458, 1541],
  24: [0, 2, 3, 4, 8, 12, 18, 24, 33, 45, 60, 76, 96, 117, 141, 168, 196, 228, 261, 297, 336, 376, 420, 465, 513, 564, 616, 672, 729, 789, 852, 916, 984, 1053, 1125, 1200, 1276, 1356, 1437, 1521, 1608],
  25: [0, 2, 3, 4, 8, 12, 18, 25, 35, 47, 62, 80, 100, 122, 147, 175, 205, 237, 272, 310, 350, 392, 437, 485, 535, 587, 642, 700, 760, 822, 887, 955, 1025, 1097, 1172, 1250, 1330, 1412, 1497, 1585, 1675],
  26: [0, 2, 3, 4, 8, 13, 19, 26, 36, 49, 65, 83, 104, 127, 153, 182, 213, 247, 283, 322, 364, 408, 455, 504, 556, 611, 668, 728, 790, 855, 923, 993, 1066, 1141, 1219, 1300, 1383, 1469, 1557, 1648, 1742],
  27: [0, 2, 3, 5, 9, 13, 20, 27, 37, 51, 67, 86, 108, 132, 159, 189, 221, 256, 294, 334, 378, 423, 472, 523, 577, 634, 693, 756, 820, 888, 958, 1031, 1107, 1185, 1266, 1350, 1436, 1525, 1617, 1711, 1809],
  28: [0, 2, 3, 5, 9, 14, 21, 28, 39, 53, 70, 89, 112, 137, 165, 196, 229, 266, 305, 347, 392, 439, 490, 543, 599, 658, 719, 784, 851, 921, 994, 1069, 1148, 1229, 1313, 1400, 1489, 1582, 1677, 1775, 1876]
};

// Skill prerequisites: defines which skills unlock others
// Each key is a skill key, value is an array of required skills (must have degree >= 0)
const SKILL_PREREQUISITES = {
  "illegality": ["bureaucracy"],
  "metallurgy": ["mathematics"],
  "engineering": ["mathematics"],
  "electricity_electronics": ["mathematics"],
  "computer_science": ["mathematics"],
  "geography": ["mathematics"],
  "meteorology": ["mathematics"],
  "navigation": ["mathematics", "geography"],
  "history_politics": ["geography", "bureaucracy"],
  "chemistry": ["mathematics"],
  "geology": ["mathematics"],
  "human_medicine": ["chemistry", "mathematics"],
  "surgery": ["human_medicine"]
};

const SEGMENT_MIN = 1;
const SEGMENT_MAX = 6;
const SEGMENT_ORDER = {
  6: [6, 5],
  5: [6, 5, 4, 3],
  4: [6, 4, 2],
  3: [6, 5, 3, 1],
  2: [6, 5, 4],
  1: [6, 5, 4, 3, 2]
};

const clampSegment = (value) => Math.min(SEGMENT_MAX, Math.max(SEGMENT_MIN, Number(value) || SEGMENT_MAX));

const getReactionDegreeFromCombatant = (combatant) => {
  const actor = combatant?.actor;
  const system = actor?.system;
  if (!system) return 0;
  const skillData = {
    abilities: CONFIG.MERC?.skills?.reaction?.abilities || [],
    ...(system.skills?.reaction || {})
  };
  return computeSkillDegreeFromSystem(system, "reaction", skillData);
};

const getSegmentOrderLabel = (segment) => {
  const order = SEGMENT_ORDER[segment] || [];
  return order.map((value) => (value === 6 ? "6+" : String(value))).join(" > ");
};

const buildSegmentEntries = (combat, segment) => {
  const order = SEGMENT_ORDER[segment] || [];
  const allowHigh = order.includes(6);
  const allowedExact = new Set(order.filter((value) => value !== 6));
  const combatants = Array.from(combat?.combatants ?? []);

  return combatants
    .map((combatant) => ({
      combatant,
      degree: getReactionDegreeFromCombatant(combatant),
      name: combatant?.name || combatant?.token?.name || ""
    }))
    .filter((entry) => {
      if (allowHigh && entry.degree >= 6) return true;
      return allowedExact.has(entry.degree);
    })
    .sort((a, b) => {
      if (b.degree !== a.degree) return b.degree - a.degree;
      return a.name.localeCompare(b.name, "fr");
    });
};

const getEligibleIdsForSegment = (combat, segment) => {
  const entries = buildSegmentEntries(combat, segment);
  return new Set(entries.map((entry) => entry.combatant.id));
};

const buildSegmentTurns = (combat, segment) => {
  const combatants = Array.from(combat?.combatants ?? [])
    .map((combatant) => ({
      combatant,
      degree: getReactionDegreeFromCombatant(combatant),
      name: combatant?.name || combatant?.token?.name || ""
    }))
    .sort((a, b) => {
      if (b.degree !== a.degree) return b.degree - a.degree;
      return a.name.localeCompare(b.name, "fr");
    })
    .map((entry) => entry.combatant);

  return combatants;
};

class MercCombat extends Combat {
  get currentSegment() {
    return clampSegment(this.flags?.merc?.segment ?? SEGMENT_MAX);
  }

  getTurns() {
    return buildSegmentTurns(this, this.currentSegment);
  }

  get turns() {
    return this.getTurns();
  }

  async setSegment(segment) {
    const clamped = clampSegment(segment);
    if (clamped === this.currentSegment) return this;
    const turns = buildSegmentTurns(this, clamped);
    const eligibleIds = getEligibleIdsForSegment(this, clamped);
    let firstEligible = turns.findIndex((combatant) => eligibleIds.has(combatant.id));
    if (firstEligible === -1) firstEligible = 0;
    return this.update({
      "flags.merc.segment": clamped,
      turn: firstEligible
    }, { mercSegmentUpdate: true });
  }

  async nextTurn() {
    const turns = this.turns ?? [];
    if (!turns.length) return this;
    const eligibleIds = getEligibleIdsForSegment(this, this.currentSegment);
    const startIndex = Number.isInteger(this.turn) ? this.turn : 0;
    let nextIndex = -1;
    for (let i = startIndex + 1; i < turns.length; i++) {
      if (eligibleIds.has(turns[i].id)) {
        nextIndex = i;
        break;
      }
    }

    if (nextIndex !== -1) {
      return this.update({ turn: nextIndex }, { mercSegmentUpdate: true });
    }
    ui.notifications?.info(game.i18n.localize("MERC.UI.combat.segments.endOfSegment"));
    return this;
  }
}

/**
 * Calculates the degree value based on base and dev
 * Uses a lookup table where each base row contains cumulative values
 * The degree is determined by finding the largest value <= dev in that row
 * @param {number} base - The base value (4-28)
 * @param {number} dev - The development/experience points to lookup
 * @returns {number} The degree from -7 to 33
 */
function getDegreeFromTable(base, dev) {
  const baseRow = DEGREE_TABLE[base];
  if (!baseRow) return -7; // Default to minimum degree if base not found
  
  // Find the rightmost (largest) value that is <= dev
  let foundIndex = -1;
  for (let i = baseRow.length - 1; i >= 0; i--) {
    if (baseRow[i] <= dev) {
      foundIndex = i;
      break;
    }
  }
  
  // If no value found (dev is smaller than all), return -7 (minimum)
  if (foundIndex === -1) return -7;
  
  // Convert index to degree using the conversion table
  return INDEX_TO_DEGREE[foundIndex];
}

/**
 * Get the next dev threshold from DEGREE_TABLE to reach the next degree
 * @param {number} base - The base value (4-28)
 * @param {number} dev - Current dev value
 * @returns {number|null} The next dev threshold, or null if already max or base invalid
 */
function getNextDevThreshold(base, dev) {
  const baseRow = DEGREE_TABLE[base];
  if (!baseRow) return null;

  let currentIndex = -1;
  for (let i = baseRow.length - 1; i >= 0; i--) {
    if (baseRow[i] <= dev) {
      currentIndex = i;
      break;
    }
  }

  const nextIndex = currentIndex + 1;
  if (nextIndex < 0) return baseRow[0] ?? null;
  if (nextIndex >= baseRow.length) return null;
  return baseRow[nextIndex];
}

/**
 * Build tooltip text for base calculation showing attributes and their values
 * @param {Object} actor - The actor document
 * @param {Object} skillData - Skill data including abilities
 * @param {number} baseValue - Computed base value
 * @param {boolean} isCustomSpec - Whether this is a custom specialization
 * @returns {string}
 */
function buildBaseTooltip(actor, skillData, baseValue, isCustomSpec = false) {
  const attrs = actor?.system?.attributes ?? {};
  const abilities = skillData?.abilities || [];

  if (!abilities.length) {
    return game.i18n.format("MERC.Labels.tooltipBase", { value: baseValue });
  }

  const parts = abilities.map((abilityKey) => {
    const label = game.i18n.localize(CONFIG.MERC.abilities?.[abilityKey]) || abilityKey;
    const raw = attrs[abilityKey];
    const value = typeof raw === "object" ? (raw.current ?? 0) : (raw ?? 0);
    return `${label} (${value})`;
  });

  const attrsText = parts.join(abilities.length === 2 ? " + " : ", ");
  const attrsLine = game.i18n.format("MERC.Labels.tooltipAttributes", { attrs: attrsText });
  const baseLine = isCustomSpec
    ? game.i18n.format("MERC.Labels.tooltipBaseSpec", { value: baseValue })
    : game.i18n.format("MERC.Labels.tooltipBase", { value: baseValue });
  return `${attrsLine}\n${baseLine}`;
}

/**
 * Build tooltip text for dev field showing next degree threshold
 * @param {number} base - The base value (4-28)
 * @param {number} dev - Current dev value
 * @returns {string}
 */
function buildDevTooltip(base, dev) {
  if (!DEGREE_TABLE[base]) return game.i18n.localize("MERC.Labels.tooltipBaseOutOfTable");
  const next = getNextDevThreshold(base, dev);
  if (next === null) return game.i18n.localize("MERC.Labels.tooltipMaxDegree");
  return game.i18n.format("MERC.Labels.tooltipNextDegree", { threshold: next });
}

// Resolve attribute values from either {origin,current} or plain numbers.
function getAttributeValueFromSystem(system, attrKey) {
  const attrs = system?.attributes ?? {};
  const attr = attrs[attrKey];
  return typeof attr === "object" ? (attr.current ?? 0) : (attr ?? 0);
}

// Compute the base value for a skill from system data only (no actor instance required).
function computeSkillBaseFromSystem(system, skillKey, skillData) {
  if (!system || !skillData) return 0;

  const abilities = skillData.abilities || [];
  if (abilities.length === 0) return 0;

  const isCustomSpec = typeof skillKey === "string" && skillKey.startsWith("custom_spec_");

  if (abilities.length === 1) {
    const attrValue = getAttributeValueFromSystem(system, abilities[0]);
    const base = 30 - (attrValue * 2);
    return isCustomSpec ? Math.floor(base / 2) : base;
  }

  if (abilities.length === 2) {
    const attr1Value = getAttributeValueFromSystem(system, abilities[0]);
    const attr2Value = getAttributeValueFromSystem(system, abilities[1]);
    const base = 30 - (attr1Value + attr2Value);
    return isCustomSpec ? Math.floor(base / 2) : base;
  }

  return 0;
}

// Compute degree from base/dev for any skill (system-only, no actor instance required).
function computeSkillDegreeFromSystem(system, skillKey, skillData) {
  if (!system || !skillData) return 0;

  const base = computeSkillBaseFromSystem(system, skillKey, skillData);
  const isCustomSpec = typeof skillKey === "string" && skillKey.startsWith("custom_spec_");
  const baseForDegree = isCustomSpec ? Math.floor(base) : base;
  const dev = Number(skillData.dev ?? 0);
  const devForDegree = skillKey === "reaction" ? dev + baseForDegree : dev;

  return getDegreeFromTable(baseForDegree, devForDegree);
}

// Roll 1d20 with a second roll on 20 (add) or 1 (subtract).
async function rollD20WithSecond() {
  const firstRoll = new Roll("1d20");
  await firstRoll.evaluate();

  let secondRoll = null;
  let adjustedTotal = firstRoll.total;
  let secondRollDirection = null;

  if (firstRoll.total === 20 || firstRoll.total === 1) {
    secondRoll = new Roll("1d20");
    await secondRoll.evaluate();
    if (firstRoll.total === 20) {
      adjustedTotal += secondRoll.total;
      secondRollDirection = "added";
    } else {
      adjustedTotal -= secondRoll.total;
      secondRollDirection = "subtracted";
    }
  }

  return {
    firstRoll,
    secondRoll,
    adjustedTotal,
    secondRollDirection
  };
}

function formatRollBreakdown(roll) {
  if (!roll?.terms?.length) return `${roll?.total ?? ""}`.trim();

  const parts = [];
  for (const term of roll.terms) {
    if (term?.results && Array.isArray(term.results)) {
      const results = term.results
        .map(r => (typeof r === "number" ? r : r?.result))
        .filter(r => r !== undefined && r !== null);
      if (results.length) {
        parts.push(results.join(" + "));
        continue;
      }
    }

    if (term?.operator) {
      parts.push(term.operator);
      continue;
    }

    if (term?.number !== undefined) {
      parts.push(String(term.number));
      continue;
    }

    if (typeof term?.total === "number") {
      parts.push(String(term.total));
    }
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Get base damage formula from Force and Degree using lookup table
 * Force is clamped to 1-10, Degree is clamped to -7 to 19
 * @param {number} forceValue
 * @param {number} degreeValue
 * @returns {string} Dice formula (e.g., "1d6+1")
 */
function getBaseDamageFromTable(forceValue, degreeValue) {
  const force = Math.min(10, Math.max(1, Number(forceValue) || 1));
  const degree = Math.min(19, Math.max(-7, Number(degreeValue) || -7));
  const rowIndex = force - 1;
  const colIndex = degree + 7;
  return BASE_DAMAGE_TABLE[rowIndex]?.[colIndex] ?? "1";
}

/**
 * Checks if a skill is unlocked (all prerequisites met)
 * @param {Object} actor - The actor document
 * @param {string} skillKey - The skill key to check
 * @returns {Object} { unlocked: boolean, missingPrereqs: string[] }
 */
function checkSkillUnlocked(actor, skillKey) {
  const prerequisites = SKILL_PREREQUISITES[skillKey];
  
  // If no prerequisites defined, skill is always unlocked
  if (!prerequisites || prerequisites.length === 0) {
    return { unlocked: true, missingPrereqs: [] };
  }
  
  const skills = actor?.system?.skills;
  if (!skills) return { unlocked: false, missingPrereqs: prerequisites };
  
  const missingPrereqs = [];
  
  for (const prereqKey of prerequisites) {
    const prereqSkill = skills[prereqKey];
    if (!prereqSkill) {
      missingPrereqs.push(prereqKey);
      continue;
    }
    
    // Calculate base for the prerequisite skill
    const attrs = actor?.system?.attributes;
    if (!attrs) {
      missingPrereqs.push(prereqKey);
      continue;
    }
    
    const getAttrValue = (attrKey) => {
      const attr = attrs[attrKey];
      return typeof attr === 'object' ? (attr.current ?? 0) : (attr ?? 0);
    };
    
    const abilities = CONFIG.MERC.skills[prereqKey]?.abilities || [];
    let base = 0;
    
    if (abilities.length === 1) {
      const attrValue = getAttrValue(abilities[0]);
      base = 30 - (attrValue * 2);
    } else if (abilities.length === 2) {
      const attr1Value = getAttrValue(abilities[0]);
      const attr2Value = getAttrValue(abilities[1]);
      base = 30 - (attr1Value + attr2Value);
    }
    
    const prereqDev = Number(prereqSkill.dev ?? 0);
    const prereqDegree = getDegreeFromTable(base, prereqDev);
    
    // Skill is missing if its degree is < 0
    if (prereqDegree < 0) {
      missingPrereqs.push(prereqKey);
    }
  }
  
  return {
    unlocked: missingPrereqs.length === 0,
    missingPrereqs: missingPrereqs
  };
}

/**
 * Migrate actor and item data to new schema versions.
 * Uses getActorMigrationData for actors to avoid duplication.
 */
async function migrateWorld() {
  console.log("MERC System Migration: Starting migration");
  
  for (const actor of game.actors) {
    try {
      const updateData = getActorMigrationData(actor);
      if (Object.keys(updateData).length > 0) {
        await actor.update(updateData, { render: false });
      }
    } catch (err) {
      console.error(`Error migrating actor ${actor.name}:`, err);
    }
  }
  
  // Migrate items (weapons, ammo, etc.)
  for (const actor of game.actors) {
    for (const item of actor.items) {
      try {
        await migrateItem(item, actor);
      } catch (err) {
        console.error(`Error migrating item ${item.name}:`, err);
      }
    }
  }
  for (const item of game.items) {
    try {
      await migrateItem(item);
    } catch (err) {
      console.error(`Error migrating world item ${item.name}:`, err);
    }
  }
  
  console.log("MERC System Migration: Complete");
}

/**
 * Migrate item to new data structure.
 * Handles both weapon and ammo item types.
 */
async function migrateItem(item, actor = null) {
  if (!item.system) return;
  
  const updateData = {};

  // --- Weapon migration ---
  if (item.type === "weapon") {
    // Ensure proficiency field exists (default to 0)
    if (item.system.proficiency === undefined || item.system.proficiency === null) {
      updateData["system.proficiency"] = 0;
    }
    // Ensure weaponSkill exists
    if (!item.system.weaponSkill) {
      updateData["system.weaponSkill"] = "";
    }

    // Ensure weaponSubtype exists (infer from weaponSkill if possible)
    if (!item.system.weaponSubtype) {
      const skillToSubtype = {
        melee: "melee",
        bladed_weapons: "bladed_weapons",
        throwing: "throwing",
        powder_projectiles: "powder_projectiles",
        mechanical_projectiles: "mechanical_projectiles",
        heavy_weapons: "heavy_weapons",
        electronic_weapons: "electronic_weapons"
      };
      let skillKey = item.system.weaponSkill || "";
      if (skillKey.startsWith("custom_spec_")) {
        const specName = skillKey.replace("custom_spec_", "");
        const baseSkill = actor?.system?.customSpecializations?.[specName]?.baseSkill || "";
        if (baseSkill) skillKey = baseSkill;
      }
      const inferredSubtype = skillToSubtype[skillKey];
      if (inferredSubtype) {
        updateData["system.weaponSubtype"] = inferredSubtype;
      }
    }
    
    // Ensure weightKg exists
    if (item.system.weightKg === undefined || item.system.weightKg === null) {
      updateData["system.weightKg"] = 0;
    }

    // Ensure rarity and price exist
    if (item.system.rarity === undefined || item.system.rarity === null) {
      updateData["system.rarity"] = "common";
    }
    if (item.system.price === undefined || item.system.price === null) {
      updateData["system.price"] = 0;
    }

    // Ensure damage exists
    if (item.system.damage === undefined || item.system.damage === null) {
      updateData["system.damage"] = "";
    }
    // Ensure range sub-fields exist
    if (!item.system.range) {
      updateData["system.range"] = { short: 0, medium: 0, long: 0, extreme: 0 };
    } else {
      for (const key of ["short", "medium", "long", "extreme"]) {
        if (item.system.range[key] === undefined) {
          updateData[`system.range.${key}`] = 0;
        }
      }
    }

    // Ensure barrelLength exists
    if (item.system.barrelLength === undefined || item.system.barrelLength === null) {
      updateData["system.barrelLength"] = 0;
    }

    // Ensure defaultAmmo fields exist
    if (item.system.defaultAmmoName === undefined) updateData["system.defaultAmmoName"] = "";
    if (item.system.defaultAmmoId   === undefined) updateData["system.defaultAmmoId"]   = "";

    // New default ammo stock fields (added when magazine was moved out of tactical)
    const weaponStockDefaults = {
      defaultAmmoMagCapacity: 0,
      defaultAmmoInMag:       0,
      defaultAmmoMagFull:     0,
      defaultAmmoMagTotal:    0,
      defaultAmmoStock:       0
    };
    for (const [key, val] of Object.entries(weaponStockDefaults)) {
      if (item.system[key] === undefined || item.system[key] === null) {
        updateData[`system.${key}`] = val;
      }
    }

    // Remove obsolete weapon fields
    const obsoleteWeapon = ["magazine"];
    for (const key of obsoleteWeapon) {
      if (item.system[key] !== undefined) {
        updateData[`system.-=${key}`] = null;
      }
    }
  }

  // --- Ammo migration ---
  if (item.type === "ammo") {
    const ammoDefaults = {
      ammoType: "",
      caliber: "",
      magCapacity: 0,
      inMag:       0,
      magFull:     0,
      magTotal:    0,
      stock:       0,
      mass: 0,
      diameter: 0,
      coeff_trainee: 0,
      rho: 1.225,
      perforation_index: 1,
      barrel_length_std: 0,
      velocity: 0,
      weight: 0,
      braking_index: 0,
      sectional_density: 0,
      price: 0,
      rarity: "common",
      description: "",
      parentWeaponId: ""
    };

    for (const [key, defaultValue] of Object.entries(ammoDefaults)) {
      if (item.system[key] === undefined || item.system[key] === null) {
        updateData[`system.${key}`] = defaultValue;
      }
    }

    // Migrate legacy stock fields: quantity → inMag, maxQuantity → magCapacity
    if (item.system.quantity !== undefined && !item.system.inMag) {
      updateData["system.inMag"] = item.system.quantity ?? 0;
    }
    if (item.system.maxQuantity !== undefined && !item.system.magCapacity) {
      updateData["system.magCapacity"] = item.system.maxQuantity ?? 0;
    }
    // Migrate old magazines field → magTotal
    if (item.system.magazines !== undefined && !item.system.magTotal) {
      updateData["system.magTotal"] = item.system.magazines ?? 0;
    }

    // Migrate legacy fields: old `weight` (projectile g) → `mass`, old `weightAmmo` → `weight`
    if (item.system.weightAmmo !== undefined && !item.system.weight) {
      updateData["system.weight"] = item.system.weightAmmo ?? 0;
    }
    if (item.system.weight !== undefined && !item.system.mass && item.system.weightAmmo !== undefined) {
      updateData["system.mass"] = item.system.weight ?? 0;
    }

    // Remove obsolete fields
    const obsolete = ["weightAmmo", "damage", "penetration", "quantity", "maxQuantity", "magazines", "magEmpty"];
    for (const key of obsolete) {
      if (item.system[key] !== undefined) {
        updateData[`system.-=${key}`] = null;
      }
    }
  }

  if (Object.keys(updateData).length > 0) {
    await item.update(updateData, { render: false });
  }
}

// Define MercCharacterSheet here directly
class MercCharacterSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(foundry.utils.deepClone(super.DEFAULT_OPTIONS), {
    classes: ["merc", "sheet", "actor"],
    width: 570,
    height: 900,
    resizable: true,
    minWidth: 570,
    minHeight: 800,
    parts: ["form"],
    tabs: [
      {
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial: "stats"
      }
    ]
  });

  static PARTS = {
    form: {
      template: "systems/merc/templates/actor/character-sheet.hbs"
    }
  };

  // Calculate Base: 30 - (ATTR1 + ATTR2) or 30 - (ATTR1 * 2)
  computeSkillBase(actor, skillKey, skillData) {
    if (!actor || !skillData) return 0;
    return computeSkillBaseFromSystem(actor.system, skillKey, skillData);
  }

  // Calculate Degré using the lookup table based on base and dev
  computeSkillDegree(actor, skillKey, skillData) {
    if (!actor || !skillData) return 0;
    return computeSkillDegreeFromSystem(actor.system, skillKey, skillData);
  }

  async _prepareContext(options) {
    const data = await super._prepareContext(options);
    const actorDoc = this.actor ?? this.document;

    const defaultAttributes = DEFAULT_ATTRIBUTES;

    const normalizeAttr = (value) => {
      if (value && typeof value === "object" && ("origin" in value || "current" in value)) {
        const origin = Number(value.origin ?? 0);
        const current = Number(value.current ?? value.origin ?? 0);
        return { origin, current };
      }
      const num = Number(value ?? 0);
      return { origin: num, current: num };
    };

    const normalizeNumber = (value) => {
      if (value && typeof value === "object") {
        const num = Number(value.current ?? value.origin ?? 0);
        return Number.isNaN(num) ? 0 : num;
      }
      const num = Number(value ?? 0);
      return Number.isNaN(num) ? 0 : num;
    };

    const normalizeAttributes = (attrs = {}) => ({
      intelligence: normalizeAttr(attrs.intelligence),
      will: normalizeAttr(attrs.will),
      mental: normalizeAttr(attrs.mental),
      charisma: normalizeAttr(attrs.charisma),
      chance: normalizeAttr(attrs.chance),
      adaptation: normalizeAttr(attrs.adaptation),
      strength: normalizeAttr(attrs.strength),
      dexterity: normalizeAttr(attrs.dexterity),
      speed: normalizeAttr(attrs.speed),
      constitution: normalizeAttr(attrs.constitution),
      perception: normalizeNumber(attrs.perception),
      perceptionDetail: {
        sight: normalizeNumber(attrs.perceptionDetail?.sight),
        hearing: normalizeNumber(attrs.perceptionDetail?.hearing),
        taste: normalizeNumber(attrs.perceptionDetail?.taste),
        smell: normalizeNumber(attrs.perceptionDetail?.smell),
        touch: normalizeNumber(attrs.perceptionDetail?.touch)
      }
    });

    if (actorDoc) {
      const currentAttributes = actorDoc.system?.attributes ?? {};
      const normalizedAttributes = normalizeAttributes(currentAttributes);
      // Merge defaults with existing attributes so missing values become 0 instead of undefined
      var mergedAttributes = foundry.utils.mergeObject(foundry.utils.deepClone(defaultAttributes), normalizedAttributes, { inplace: false, overwrite: true });
    }

    data.actor = actorDoc?.toObject ? actorDoc.toObject() : actorDoc;
    if (actorDoc?.items) {
      data.actor.items = actorDoc.items.map(item => item.toObject());
    }
    
    // Add system config to template
    data.config = CONFIG.MERC;
    
    // Ensure system data exists
    if (!data.actor || !data.actor.system) {
      data.actor = data.actor ?? {};
      data.actor.system = data.actor.system ?? {};
    }
    if (!data.actor.system.biography) {
      data.actor.system.biography = foundry.utils.deepClone(DEFAULT_BIOGRAPHY);
    }
    if (data.actor.system.notes === undefined) {
      data.actor.system.notes = "";
    }
    if (!data.actor.system.attributes) {
      data.actor.system.attributes = mergedAttributes || defaultAttributes;
    } else if (mergedAttributes) {
      data.actor.system.attributes = mergedAttributes;
    }
    if (!data.actor.system.combat) {
      data.actor.system.combat = {};
    }
    if (!data.actor.system.combat.specializationBaseDamage || Object.keys(data.actor.system.combat.specializationBaseDamage).length === 0) {
      const computed = computeCombatStatsFromSystem(data.actor.system);
      data.actor.system.combat.specializationBaseDamage = computed?.specializationBaseDamage || {};
    }
    // Use CONFIG.MERC.skills as single source of truth for skill definitions
    const skillDefs = CONFIG.MERC.skills;
    const defaultSkillSet = {};
    for (const [key, def] of Object.entries(skillDefs)) {
      defaultSkillSet[key] = {
        base: 0,
        dev: 0,
        bonus: 0,
        degree: 0,
        abilities: def.abilities || []
      };
    }
    if (!data.actor.system.skills) {
      data.actor.system.skills = foundry.utils.deepClone(defaultSkillSet);
    } else {
      data.actor.system.skills = foundry.utils.mergeObject(defaultSkillSet, data.actor.system.skills, {
        inplace: false,
        overwrite: true
      });
    }

    // Prepare skills list for display
    data.skillList = [];
    if (data.actor.system.skills) {
      for (const skillKey of Object.keys(skillDefs)) {
        const skillData = data.actor.system.skills[skillKey] ?? defaultSkillSet[skillKey];
        const base = this.computeSkillBase(actorDoc, skillKey, skillData);
        const dev = Number(skillData.dev ?? skillData.value ?? 0);
        const degree = this.computeSkillDegree(actorDoc, skillKey, skillData);
        const bonus = Number(skillData.bonus ?? 0);
        const baseTooltip = buildBaseTooltip(actorDoc, skillData, base, false);
        const devTooltip = buildDevTooltip(base, dev);
        
        // Check if skill is unlocked
        const unlockStatus = checkSkillUnlocked(actorDoc, skillKey);
        
        // Format missing prerequisites with localized names
        const missingPrereqsText = unlockStatus.missingPrereqs
          .map(k => game.i18n.localize(CONFIG.MERC.skills[k]?.label) || k)
          .join(", ");
        
        // Get skill prerequisites (what this skill requires to unlock)
        const skillPrereqs = SKILL_PREREQUISITES[skillKey] || [];
        const prereqsText = skillPrereqs.length > 0
          ? skillPrereqs.map(k => game.i18n.localize(CONFIG.MERC.skills[k]?.label) || k).join(", ")
          : "";
        
        // Build display label with prerequisites info
        const baseLabel = game.i18n.localize(CONFIG.MERC.skills[skillKey]?.label) || skillKey;
        const requiredText = prereqsText
          ? game.i18n.format("MERC.UI.skills.required", { prereqs: prereqsText })
          : "";
        const isNativeLanguage = skillKey === "language_native";
        const nativeLanguageName = isNativeLanguage
          ? (data.actor.system.skills?.language_native?.name ?? "")
          : "";
        let displayLabel = requiredText ? `${baseLabel} (${requiredText})` : baseLabel;
        if (isNativeLanguage && nativeLanguageName) {
          displayLabel = `${baseLabel} : ${nativeLanguageName}`;
        }
        
        data.skillList.push({
          key: skillKey,
          label: baseLabel,
          displayLabel: displayLabel,
          abilities: skillData.abilities || [],
          base,
          dev,
          bonus,
          degree,
          total: degree + bonus,
          unlocked: unlockStatus.unlocked,
          missingPrereqs: unlockStatus.missingPrereqs,
          missingPrereqsText: missingPrereqsText,
          hasPrerequisites: prereqsText.length > 0,
          prerequisitesText: prereqsText,
          isNativeLanguage,
          nativeLanguageName,
          baseTooltip,
          devTooltip
        });
      }
    }

    // Load and process custom languages (dynamic languages based on intelligence and charisma)
    const customLanguages = data.actor.system.customLanguages || {};
    const intelligenceValue = data.actor.system.attributes?.intelligence?.current ?? 0;
    const charismaValue = data.actor.system.attributes?.charisma?.current ?? 0;
    
    for (const [langName, langData] of Object.entries(customLanguages)) {
      if (!langData) continue;
      // Calculate base for custom languages: base = 30 - (intelligence + charisma)
      const base = 30 - (intelligenceValue + charismaValue);
      const dev = Number(langData.dev ?? 0);
      const degree = this.computeSkillDegree(actorDoc, `custom_lang_${langName}`, { ...langData, base, abilities: ["intelligence", "charisma"] });
      const bonus = Number(langData.bonus ?? 0);
      const baseTooltip = buildBaseTooltip(actorDoc, { abilities: ["intelligence", "charisma"] }, base, false);
      const devTooltip = buildDevTooltip(base, dev);
      
      // Add to skillList as a special skill
      data.skillList.push({
        key: `custom_lang_${langName}`,
        label: game.i18n.format("MERC.Skills.language_custom", { name: langName }),
        displayLabel: game.i18n.format("MERC.Skills.language_custom", { name: langName }),
        abilities: ["intelligence", "charisma"],
        base,
        dev,
        bonus,
        degree,
        total: degree + bonus,
        unlocked: true,
        isCustomLanguage: true,
        customLanguageName: langName,
        missingPrereqs: [],
        missingPrereqsText: "",
        hasPrerequisites: false,
        prerequisitesText: "",
        baseTooltip,
        devTooltip
      });
    }


    // Load and process custom specializations
    const customSpecializations = data.actor.system.customSpecializations || {};
    
    for (const [specName, specData] of Object.entries(customSpecializations)) {
      if (!specData) continue;
      const skillData = { ...specData, abilities: specData.abilities || [] };
      const base = this.computeSkillBase(actorDoc, `custom_spec_${specName}`, skillData);
      const dev = Number(specData.dev ?? 0);
      const degree = this.computeSkillDegree(actorDoc, `custom_spec_${specName}`, { ...skillData, base });
      const bonus = Number(specData.bonus ?? 0);
      const baseForDegree = Math.floor(base);
      const baseTooltip = buildBaseTooltip(actorDoc, skillData, base, true);
      const devTooltip = buildDevTooltip(baseForDegree, dev);
      
      // Build display label with base skill if set
      const baseSkillKey = specData.baseSkill || "";
      let displayLabel = specName;
      if (baseSkillKey) {
        const baseSkillLabel = game.i18n.localize(`MERC.Skills.${baseSkillKey}`);
        displayLabel = `${baseSkillLabel} : ${specName}`;
      }
      
      // Add to skillList as a special skill
      data.skillList.push({
        key: `custom_spec_${specName}`,
        label: specName,
        displayLabel: displayLabel,
        abilities: skillData.abilities,
        base,
        dev,
        bonus,
        degree,
        total: degree + bonus,
        unlocked: true,
        isCustomSpecialization: true,
        customSpecializationName: specName,
        customSpecializationBaseSkill: baseSkillKey,
        missingPrereqs: [],
        missingPrereqsText: "",
        hasPrerequisites: false,
        prerequisitesText: "",
        baseTooltip,
        devTooltip
      });
    }
    // Group skills by theme for tabbed display
    const skillByKey = new Map(data.skillList.map(skill => [skill.key, skill]));
    const usedKeys = new Set();
    const makeGroup = (id, label, keys) => {
      const skills = keys
        .map((key) => {
          usedKeys.add(key);
          return skillByKey.get(key);
        })
        .filter(Boolean);
      return { id, label, skills };
    };

    data.skillGroups = [
      makeGroup("combat", game.i18n.localize("MERC.SkillGroups.combat"), [
        "reaction",
        "melee",
        "bladed_weapons",
        "mechanical_projectiles",
        "powder_projectiles",
        "throwing",
        "maneuvers",
        "heavy_weapons",
        "electronic_weapons"
      ]),
      makeGroup("aptitudes", game.i18n.localize("MERC.SkillGroups.aptitudes"), [
        "running",
        "climbing",
        "swimming",
        "sliding",
        "air_sliding",
        "drive_wheeled",
        "drive_motorcycle",
        "drive_boats",
        "drive_tracked",
        "drive_planes",
        "drive_helicopters",
        "riding",
        "tracking",
        "stealth",
        "concealment",
        "pickpocket",
        "lockpicking",
        "tinkering",
        "forgery",
        "survival"
      ]),
      makeGroup("social", game.i18n.localize("MERC.SkillGroups.social"), [
        "eloquence",
        "acting",
        "interrogation",
        "command",
        "instruction"
      ]),
    ];

    // Build languages group with predefined languages + custom languages
    const languageKeys = [
      "language_native"
    ];
    // Add custom language keys
    for (const [langName, langData] of Object.entries(data.actor.system.customLanguages || {})) {
      if (!langData) continue;
      languageKeys.push(`custom_lang_${langName}`);
    }
    data.skillGroups.push(makeGroup("languages", game.i18n.localize("MERC.SkillGroups.languages"), languageKeys));
    data.skillGroups.push(makeGroup("knowledge", game.i18n.localize("MERC.SkillGroups.knowledge"), [
      "bureaucracy",
      "illegality",
      "mathematics",
      "metallurgy",
      "engineering",
      "electricity_electronics",
      "computer_science",
      "geography",
      "meteorology",
      "navigation",
      "history_politics",
      "chemistry",
      "geology",
      "nature",
      "biology",
      "human_medicine",
      "surgery"
    ]));
    data.skillGroups.push(makeGroup("construction", game.i18n.localize("MERC.SkillGroups.construction"), [
      "construction_avionics",
      "construction_vehicle",
      "construction_weaponry",
      "construction_tools"
    ]));
    const specializationKeys = [];
    for (const [specName] of Object.entries(data.actor.system.customSpecializations || {})) {
      specializationKeys.push(`custom_spec_${specName}`);
    }
    data.skillGroups.push(makeGroup("specializations", game.i18n.localize("MERC.SkillGroups.specializations"), specializationKeys));


    // Build list of all base skills for specialization base skill selector (from CONFIG.MERC.skills)
    const allBaseSkills = Object.entries(CONFIG.MERC.skills)
      .filter(([key]) => !key.startsWith("spec_"))
      .map(([key]) => ({
        key,
        label: game.i18n.localize(`MERC.Skills.${key}`)
      }));
    data.allBaseSkills = allBaseSkills;
    const remaining = data.skillList.filter(skill => !usedKeys.has(skill.key));
    if (remaining.length) {
      data.skillGroups.push({ id: "other", label: game.i18n.localize("MERC.SkillGroups.other"), skills: remaining });
    }

    // Build weapon skill labels (base combat skills + custom specializations)
    const weaponSkillLabels = {};
    const weaponBaseSkills = [
      "melee",
      "bladed_weapons",
      "mechanical_projectiles",
      "powder_projectiles",
      "throwing",
      "maneuvers",
      "heavy_weapons",
      "electronic_weapons"
    ];
    weaponBaseSkills.forEach(skillKey => {
      weaponSkillLabels[skillKey] = game.i18n.localize(`MERC.Skills.${skillKey}`);
    });
    for (const [specName, specData] of Object.entries(data.actor.system.customSpecializations || {})) {
      if (!specData) continue;
      const baseSkillKey = specData.baseSkill || "";
      const baseSkillLabel = baseSkillKey ? game.i18n.localize(`MERC.Skills.${baseSkillKey}`) : "";
      const label = baseSkillLabel ? `${baseSkillLabel} : ${specName}` : specName;
      weaponSkillLabels[`custom_spec_${specName}`] = label;
    }
    data.weaponSkillLabels = weaponSkillLabels;

    // Compute per-weapon ballistics for the combat card display
    const weaponBallisticsMap = {};
    for (const weaponItem of actorDoc.items.filter(i => i.type === "weapon")) {
      const weaponSys = weaponItem.system;
      const ranges = weaponSys.range ?? {};
      const barrelLength = Number(weaponSys.barrelLength) || 0;

      // Default ammo: search actor items, then world items, then compendium
      let defaultBallistics = null;
      let defaultAmmoName = weaponSys.defaultAmmoName || "";
      const defaultAmmoId = weaponSys.defaultAmmoId || "";
      if (defaultAmmoId) {
        let defaultAmmoDoc = actorDoc.items.get(defaultAmmoId) ?? game.items?.get(defaultAmmoId);
        if (!defaultAmmoDoc) {
          const ammoPack = game.packs?.get("merc.ammos");
          if (ammoPack) {
            try { defaultAmmoDoc = await ammoPack.getDocument(defaultAmmoId); } catch (_e) {}
          }
        }
        if (defaultAmmoDoc) {
          defaultBallistics = calcWeaponBallistics(barrelLength, defaultAmmoDoc.system, ranges);
          defaultAmmoName = defaultAmmoDoc.name;
        }
      }

      // Linked ammo on this actor
      const ammoRows = [];
      for (const ammoItem of actorDoc.items.filter(i => i.type === "ammo" && i.system?.parentWeaponId === weaponItem.id)) {
        const b = calcWeaponBallistics(barrelLength, ammoItem.system, ranges);
        ammoRows.push({
          id: ammoItem.id,
          name: ammoItem.name,
          magCapacity: ammoItem.system.magCapacity ?? 0,
          inMag:    ammoItem.system.inMag    ?? 0,
          magFull:  ammoItem.system.magFull  ?? 0,
          magTotal: ammoItem.system.magTotal ?? 0,
          stock:    ammoItem.system.stock    ?? 0,
          ballistics: b
        });
      }

      weaponBallisticsMap[weaponItem.id] = {
        defaultAmmoName,
        default: defaultBallistics,
        magazineSize: Number(weaponSys.magazine) || 0,
        defaultStock: {
          magCapacity: Number(weaponSys.defaultAmmoMagCapacity) || Number(weaponSys.magazine) || 0,
          inMag:    weaponSys.defaultAmmoInMag    ?? 0,
          magFull:  weaponSys.defaultAmmoMagFull  ?? 0,
          magTotal: weaponSys.defaultAmmoMagTotal ?? 0,
          stock:    weaponSys.defaultAmmoStock    ?? 0
        },
        ranges: {
          short:   weaponSys.range?.short   ?? "",
          medium:  weaponSys.range?.medium  ?? "",
          long:    weaponSys.range?.long    ?? "",
          extreme: weaponSys.range?.extreme ?? ""
        },
        ammo: ammoRows
      };
    }
    data.weaponBallisticsMap = weaponBallisticsMap;

    return data;
  }

  /**
   * Update the window frame with the actor's name as title
   */
  _updateFrame(options) {
    super._updateFrame(options);
    if (this.window?.title && this.actor?.name) {
      this.window.title.textContent = this.actor.name;
    }
  }

  /**
   * Handle an item dropped on the character sheet.
   * If ammo is dropped onto a weapon card, link it to that weapon.
   * Otherwise, delegate to the default handler (which creates embedded items).
   */
  async _onDropItem(event, item) {
    if (!this.actor.isOwner) return null;

    // Check if an ammo item was dropped onto a weapon card
    if (item?.type === "ammo") {
      const weaponCard = event.target.closest(".item-card[data-item-id]");
      if (weaponCard) {
        const weaponId = weaponCard.dataset.itemId;
        const weapon = this.actor.items.get(weaponId);
        if (weapon?.type === "weapon") {
          // Caliber check: reject ammo of wrong caliber
          const ammoCaliber   = item.system?.caliber || "";
          const weaponCaliber = weapon.system?.caliber || "";
          if (weaponCaliber && ammoCaliber && weaponCaliber !== ammoCaliber) {
            ui.notifications?.warn(
              game.i18n.format("MERC.UI.items.weaponSheet.wrongCaliber", { ammoCaliber, weaponCaliber })
            );
            return null;
          }
          // Create an embedded copy of the ammo linked to this weapon
          const ammoData = item.toObject();
          ammoData.system.parentWeaponId = weaponId;
          const created = await Item.create(ammoData, { parent: this.actor });
          if (created) {
            ui.notifications?.info(game.i18n.format("MERC.UI.items.weaponSheet.ammoLinked", { name: created.name }));
          }
          return created ?? null;
        }
      }
      // Ammo dropped outside a weapon card: warn and reject
      ui.notifications?.warn(game.i18n.localize("MERC.UI.items.weaponSheet.dropAmmoOnWeapon"));
      return null;
    }

    // For non-ammo items, use default behavior (create embedded item or sort)
    if (this.actor.uuid === item.parent?.uuid) {
      return (await this._onSortItem(event, item))?.length ? item : null;
    }
    const keepId = !this.actor.items.has(item.id);
    const result = await Item.implementation.create(item.toObject(), { parent: this.actor, keepId });

    // When a weapon is dropped, also copy its linked ammo items
    if (result && item.type === "weapon") {
      const oldWeaponId = item.id;
      const newWeaponId = result.id;
      // Find ammo linked to the source weapon (from its parent actor or from world items)
      let linkedAmmo = [];
      if (item.parent) {
        // Source weapon is embedded in an actor
        linkedAmmo = item.parent.items.filter(i => i.type === "ammo" && i.system?.parentWeaponId === oldWeaponId);
      } else {
        // Source weapon is a world-level item
        linkedAmmo = game.items?.filter(i => i.type === "ammo" && ammoIsLinkedToWeapon(i, oldWeaponId)) ?? [];
      }
      if (linkedAmmo.length) {
        const ammoDataArray = linkedAmmo.map(a => {
          const data = a.toObject();
          // For embedded copies, use a single weaponId
          data.system.parentWeaponId = newWeaponId;
          return data;
        });
        await Item.implementation.create(ammoDataArray, { parent: this.actor });
      }
    }

    return result ?? null;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    
    const html = this.element;
    if (!html) return;

    // Initialize portrait selection with Foundry FilePicker
    initPortraitSelection(this.actor, html);

    // Drag & Drop visual feedback: highlight weapon cards when dragging over them
    html.querySelectorAll(".item-card[data-item-id]").forEach(card => {
      card.addEventListener("dragenter", (event) => {
        const weaponId = card.dataset.itemId;
        const weapon = this.actor.items.get(weaponId);
        if (weapon?.type === "weapon") card.classList.add("drop-highlight");
      });
      card.addEventListener("dragleave", (event) => {
        if (!card.contains(event.relatedTarget)) card.classList.remove("drop-highlight");
      });
      card.addEventListener("drop", () => card.classList.remove("drop-highlight"));
    });

    // Handle tab switching
    const tabItems = html.querySelectorAll(".sheet-tabs .item");

    // Restore last active main tab
    if (this._currentTab) {
      html.querySelectorAll(".sheet-tabs .item").forEach(t => t.classList.remove("active"));
      html.querySelectorAll(".sheet-body .tab-content").forEach(c => c.classList.remove("active"));
      const tab = html.querySelector(`.sheet-tabs .item[data-tab="${this._currentTab}"]`);
      const tabContent = html.querySelector(`.sheet-body .tab-content[data-tab="${this._currentTab}"]`);
      if (tab && tabContent) {
        tab.classList.add("active");
        tabContent.classList.add("active");
      }
    }
    
    tabItems.forEach(tab => {
      tab.addEventListener("click", (event) => {
        event.preventDefault();
        const tabName = tab.dataset.tab;
        
        // Remove active class from all tabs and content
        html.querySelectorAll(".sheet-tabs .item").forEach(t => t.classList.remove("active"));
        html.querySelectorAll(".sheet-body .tab-content").forEach(c => c.classList.remove("active"));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add("active");
        const tabContent = html.querySelector(`.sheet-body .tab-content[data-tab="${tabName}"]`);
        if (tabContent) tabContent.classList.add("active");
        this._currentTab = tabName;
      });
    });

    // Handle skills tab switching
    const skillTabItems = html.querySelectorAll(".skills-tabs .item");

    // Restore last active skills tab
    if (this._currentSkillTab) {
      html.querySelectorAll(".skills-tabs .item").forEach(t => t.classList.remove("active"));
      html.querySelectorAll(".skills-tabs-body .skills-tab-content").forEach(c => c.classList.remove("active"));
      const skillTab = html.querySelector(`.skills-tabs .item[data-tab="${this._currentSkillTab}"]`);
      const skillContent = html.querySelector(`.skills-tabs-body .skills-tab-content[data-tab="${this._currentSkillTab}"]`);
      if (skillTab && skillContent) {
        skillTab.classList.add("active");
        skillContent.classList.add("active");
      }
    }
    skillTabItems.forEach(tab => {
      tab.addEventListener("click", (event) => {
        event.preventDefault();
        const tabName = tab.dataset.tab;

        html.querySelectorAll(".skills-tabs .item").forEach(t => t.classList.remove("active"));
        html.querySelectorAll(".skills-tabs-body .skills-tab-content").forEach(c => c.classList.remove("active"));

        tab.classList.add("active");
        const tabContent = html.querySelector(`.skills-tabs-body .skills-tab-content[data-tab="${tabName}"]`);
        if (tabContent) tabContent.classList.add("active");
        this._currentSkillTab = tabName;
      });
    });

    // Handle combat sub-tab switching
    const combatSubTabItems = html.querySelectorAll(".combat-subtabs .item");

    // Restore last active combat sub-tab
    if (this._currentCombatSubTab) {
      html.querySelectorAll(".combat-subtabs .item").forEach(t => t.classList.remove("active"));
      html.querySelectorAll(".combat-subtabs-body .combat-subtab-content").forEach(c => c.classList.remove("active"));
      const combatTab = html.querySelector(`.combat-subtabs .item[data-tab="${this._currentCombatSubTab}"]`);
      const combatContent = html.querySelector(`.combat-subtabs-body .combat-subtab-content[data-tab="${this._currentCombatSubTab}"]`);
      if (combatTab && combatContent) {
        combatTab.classList.add("active");
        combatContent.classList.add("active");
      }
    }
    combatSubTabItems.forEach(tab => {
      tab.addEventListener("click", (event) => {
        event.preventDefault();
        const tabName = tab.dataset.tab;
        html.querySelectorAll(".combat-subtabs .item").forEach(t => t.classList.remove("active"));
        html.querySelectorAll(".combat-subtabs-body .combat-subtab-content").forEach(c => c.classList.remove("active"));
        tab.classList.add("active");
        const tabContent = html.querySelector(`.combat-subtabs-body .combat-subtab-content[data-tab="${tabName}"]`);
        if (tabContent) tabContent.classList.add("active");
        this._currentCombatSubTab = tabName;
      });
    });

    // Handle attribute label clicks only
    const attribLabels = html.querySelectorAll(".headerActorAttribLabel");

    attribLabels.forEach(label => {
      label.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        const attribDiv = label.closest(".headerActorAttrib");
        const abilityKey = attribDiv?.dataset.ability;
        if (abilityKey) {
          this.rollAbilityCheck(abilityKey);
        }
      });
    });

    // Handle sub-attribute label clicks only (Perception details)
    const subAttribLabels = html.querySelectorAll(".headerActorSubAttribLabel");
    subAttribLabels.forEach(label => {
      label.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        const subAttrib = label.closest(".headerActorSubAttrib");
        const subKey = subAttrib?.dataset.subAbility;
        const subLabel = subAttrib?.dataset.label || subKey;
        if (subKey) {
          this.rollSubAttributeCheck(subKey, subLabel);
        }
      });
    });

    // Handle base skill roll buttons (combat tab)
    const baseSkillButtons = html.querySelectorAll(".combat-base-skill-roll");
    baseSkillButtons.forEach(btn => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        const skillKey = btn.dataset.skill;
        if (skillKey) this.rollSkillCheck(skillKey);
      });
    });

    // Handle base damage roll buttons (combat tab)
    const baseDamageButtons = html.querySelectorAll(".combat-base-damage-roll");
    baseDamageButtons.forEach(btn => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        const formula = btn.dataset.rollFormula;
        const label = btn.dataset.rollLabel;
        if (formula) {
          this.rollBaseDamage(formula, label);
        }
      });
    });

    // Endurance roll on click (value and label)
    const enduranceContainer = html.querySelector('.headerStat[data-stat="endurance"]');
    if (enduranceContainer) {
      const enduranceStat = enduranceContainer.querySelector('.stat-value-large');
      const enduranceLabel = enduranceContainer.querySelector('.headerStatLabel');

      const attachEnduranceClick = (el) => {
        if (!el) return;
        el.style.cursor = "pointer";
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          event.preventDefault();
          this.rollEnduranceCheck();
        });
      };

      attachEnduranceClick(enduranceStat);
      attachEnduranceClick(enduranceLabel);
    }

    // Persist individual field changes immediately
    const formElement = html.querySelector("form");
    if (formElement) {
      const allInputs = formElement.querySelectorAll("input, select, textarea");

      allInputs.forEach(input => {
        const saveFieldOnChange = async () => {
          const fieldPath = input.name;
          if (!fieldPath) return;

          let value = input.value;
          
          // Handle number inputs
          if (input.type === "number") {
            if (value === "" || value === null) return;
            const numberValue = Number(value);
            if (Number.isNaN(numberValue)) return;
            value = numberValue;
          }

          const currentValue = foundry.utils.getProperty(this.actor, fieldPath);
          if (value === currentValue) return;

          // Perception principale gérée par un listener dédié plus bas
          if (fieldPath === "system.attributes.perception") return;

          // Dev and bonus fields are fully handled by the skill-specific listener below
          if (fieldPath.includes(".dev") || fieldPath.includes(".bonus")) return;
          
          // Special handling for attribute current changes
          if (fieldPath.startsWith("system.attributes.") && fieldPath.endsWith(".current")) {
            await this.actor.update({ [fieldPath]: value });
            const statsUpdate = this.buildCombatStatsUpdate();
            if (statsUpdate) {
              await this.actor.update(statsUpdate, { render: false });
            }
            await this.render();
            return;
          }
          
          await this.actor.update({ [fieldPath]: value });

          // Additional combat stats recalculation for other relevant changes
          const shouldRecalcCombat =
            fieldPath.startsWith("system.biography.") ||
            fieldPath.startsWith("system.skills.") ||
            fieldPath.startsWith("system.customSpecializations.");

          if (shouldRecalcCombat) {
            const statsUpdate = this.buildCombatStatsUpdate();
            if (statsUpdate) {
              // Mettre à jour immédiatement l'affichage des bonus de discrétion/dissimulation
              const bonusDiscretionEl = html.querySelector('.headerStat[data-stat="bonusDiscretion"] .stat-value-large');
              const bonusDissimulationEl = html.querySelector('.headerStat[data-stat="bonusDissimulation"] .stat-value-large');

              if (bonusDiscretionEl && Object.prototype.hasOwnProperty.call(statsUpdate, "system.combat.bonusDiscretion")) {
                bonusDiscretionEl.textContent = statsUpdate["system.combat.bonusDiscretion"];
              }
              if (bonusDissimulationEl && Object.prototype.hasOwnProperty.call(statsUpdate, "system.combat.bonusDissimulation")) {
                bonusDissimulationEl.textContent = statsUpdate["system.combat.bonusDissimulation"];
              }

              await this.actor.update(statsUpdate, { render: false });
            }
            await this.render();
          }
        };

        if (input.type === "text" || input.tagName === "TEXTAREA") {
          input.addEventListener("blur", saveFieldOnChange);
        } else if (input.type === "number" || input.tagName === "SELECT") {
          input.addEventListener("change", saveFieldOnChange);
        } else if (input.type === "radio") {
          input.addEventListener("change", saveFieldOnChange);
        }
      });
    }

    // Ensure gender radio buttons reflect current actor data
    const genderValue = this.actor?.system?.biography?.gender || "";
    if (genderValue) {
      const genderRadios = html.querySelectorAll('input[name="system.biography.gender"]');
      genderRadios.forEach(radio => {
        radio.checked = radio.value === genderValue;
      });
    }

    // Synchronize attribute origin to current, and perception to sub-attributes
    const attributeOriginInputs = html.querySelectorAll('input[name*="system.attributes."][name*=".origin"]');
    attributeOriginInputs.forEach(input => {
      input.addEventListener("change", async (event) => {
        const originPath = input.name;
        const currentPath = originPath.replace(".origin", ".current");
        const value = Number(input.value) || 0;
        
        // Save both origin and current, then recalc combat stats
        const updateData = {
          [originPath]: value,
          [currentPath]: value
        };
        await this.actor.update(updateData, { render: false });
        const statsUpdate = this.buildCombatStatsUpdate();
        if (statsUpdate) {
          await this.actor.update(statsUpdate, { render: false });
        }
        await this.render();
      });
    });

    // Synchronize perception main value to all sub-attributes
    const perceptionMainInput = html.querySelector('input[name="system.attributes.perception"]');
    if (perceptionMainInput) {
      perceptionMainInput.addEventListener("change", async (event) => {
        const perceptionValue = Number(perceptionMainInput.value) || 0;
        const updateData = {
          "system.attributes.perception": perceptionValue,
          "system.attributes.perceptionDetail.sight": perceptionValue,
          "system.attributes.perceptionDetail.hearing": perceptionValue,
          "system.attributes.perceptionDetail.taste": perceptionValue,
          "system.attributes.perceptionDetail.smell": perceptionValue,
          "system.attributes.perceptionDetail.touch": perceptionValue
        };

        await this.actor.update(updateData);
      });
    }

    // Ensure height and weight changes are saved and recalc combat stats
    const heightInput = html.querySelector('input[name="system.biography.height"]');
    const weightInput = html.querySelector('input[name="system.biography.weight"]');
    const handleBioPhysicalChange = async (inputEl, path) => {
      if (!inputEl) return;
      inputEl.addEventListener("change", async () => {
        const value = Number(inputEl.value) || 0;
        await this.actor.update({ [path]: value }, { render: false });
        const statsUpdate = this.buildCombatStatsUpdate();
        if (statsUpdate) {
          await this.actor.update(statsUpdate, { render: false });
        }
        await this.render();
      });
    };

    await handleBioPhysicalChange(heightInput, "system.biography.height");
    await handleBioPhysicalChange(weightInput, "system.biography.weight");

    // Make skill names clickable to roll
    const skillNames = html.querySelectorAll(".skill-name");
    skillNames.forEach(skillName => {
      skillName.addEventListener("click", (event) => {
        const skillItem = skillName.closest(".skill-item");
        const skillKey = skillItem.dataset.skill;
        if (skillKey) {
          this.rollSkillCheck(skillKey);
        }
      });
    });

    // Roll buttons
    const rollBtns = html.querySelectorAll(".skill-roll-btn");
    
    // Function to update button color based on total (degree + bonus)
    const updateButtonColor = (btn) => {
      const skillItem = btn.closest(".skill-item");
      const degreeInput = skillItem?.querySelector('input[name*=".degree"]');
      const bonusInput = skillItem?.querySelector('input[name*=".bonus"]');
      
      const degree = Number(degreeInput?.value || 0);
      const bonus = Number(bonusInput?.value || 0);
      const total = degree + bonus;
      
      // Remove all color classes
      btn.classList.remove("very-negative", "negative", "neutral", "positive");
      
      // Apply appropriate class
      if (total === -7) {
        btn.classList.add("very-negative");
      } else if (total < 0) {
        btn.classList.add("negative");
      } else if (total === 0) {
        btn.classList.add("neutral");
      } else {
        btn.classList.add("positive");
      }
    };
    
    rollBtns.forEach(btn => {
      // Initial color on render
      updateButtonColor(btn);
      
      // Click to roll
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const skillItem = event.currentTarget.closest(".skill-item");
        const skillKey = skillItem?.dataset?.skill;
        if (!skillKey) {
          console.error("MERC | Skill roll button without data-skill");
          ui.notifications?.error(game.i18n.localize("MERC.Labels.skillNotFound"));
          return;
        }
        this.rollSkillCheck(skillKey);
      });
    });

    // Update button colors and displayed degree/total when skill inputs change
    const skillInputs = html.querySelectorAll(".skill-item input");
    skillInputs.forEach(input => {
      input.addEventListener("change", async (event) => {
        const skillItem = input.closest(".skill-item");
        if (!skillItem) return;
        const btn = skillItem.querySelector(".skill-roll-btn");

        const isDevField = input.name && input.name.includes(".dev");
        const skillKey = skillItem.dataset.skill;
        if (!skillKey) {
          if (btn) updateButtonColor(btn);
          return;
        }

        // Si ce n'est pas un champ dev, c'est un champ bonus : on met à jour le style ET on sauvegarde
        if (!isDevField) {
          if (btn) updateButtonColor(btn);
          if (input.name) {
            try {
              const bonusValue = Number(input.value) || 0;
              const bonusUpdateData = {};
              if (skillKey.startsWith("custom_lang_")) {
                const langName = skillKey.replace("custom_lang_", "");
                bonusUpdateData[`system.customLanguages.${langName}.bonus`] = bonusValue;
              } else if (skillKey.startsWith("custom_spec_")) {
                const specName = skillKey.replace("custom_spec_", "");
                bonusUpdateData[`system.customSpecializations.${specName}.bonus`] = bonusValue;
              } else {
                bonusUpdateData[input.name] = bonusValue;
              }
              await this.actor.update(bonusUpdateData, { render: false });
              await this.render();
            } catch (e) {
              console.error("MERC | Error saving skill bonus", e);
            }
          }
          return;
        }

        // Validate prerequisites before applying dev
        const unlockStatus = checkSkillUnlocked(this.actor, skillKey);
        if (!unlockStatus.unlocked && Number(input.value) > 0) {
          ui.notifications.warn(
            game.i18n.format("MERC.UI.skills.lockedWarning", {
              skill: game.i18n.localize(CONFIG.MERC.skills[skillKey]?.label) || skillKey,
              prereqs: unlockStatus.missingPrereqs
                .map(k => game.i18n.localize(CONFIG.MERC.skills[k]?.label) || k)
                .join(", ")
            })
          );
          input.value = 0;
          event.preventDefault();
          return;
        }

        // Sauvegarde de dev, puis recalcul + affichage via un rerender complet
        try {
          const devValue = Number(input.value) || 0;
          const updateData = {};

          if (skillKey.startsWith("custom_lang_")) {
            const langName = skillKey.replace("custom_lang_", "");
            updateData[`system.customLanguages.${langName}.dev`] = devValue;
          } else if (skillKey.startsWith("custom_spec_")) {
            const specName = skillKey.replace("custom_spec_", "");
            updateData[`system.customSpecializations.${specName}.dev`] = devValue;
          } else {
            // Compétence "normale" dans system.skills
            updateData[input.name] = devValue;
          }

          if (Object.keys(updateData).length > 0) {
            await this.actor.update(updateData, { render: false });
          }

          // Laisse _prepareContext et le rendu de la fiche recalculer base/degree/total
          await this.render();
        } catch (e) {
          console.error("MERC | Error updating skill dev", e);
        }
      });
    });

    // Custom Languages Management
    const addLanguageBtn = html.querySelector(".btn-add-language");
    if (addLanguageBtn) {
      addLanguageBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        // Generate a unique language name
        const customLanguages = this.actor.system.customLanguages || {};
        let langNum = 1;
        while (customLanguages[`Language ${langNum}`]) {
          langNum++;
        }
        const newLangName = `Language ${langNum}`;
        
        // Add new empty language
        const updateData = {
          [`system.customLanguages.${newLangName}`]: {
            base: 0,
            dev: 0,
            bonus: 0,
            degree: 0,
            abilities: ["intelligence", "charisma"]
          }
        };
        
        await this.actor.update(updateData);
        await this.render();
      });
    }

    // Handle remove language buttons
    const removeLanguageBtns = html.querySelectorAll(".btn-remove-language");
    removeLanguageBtns.forEach(btn => {
      btn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const langItem = btn.closest(".custom-language-item");
        let langName = langItem?.dataset.languageName;

        if (!langName) {
          const skillItem = btn.closest(".skill-item");
          const skillKey = skillItem?.dataset.skill;
          if (skillKey?.startsWith("custom_lang_")) {
            langName = skillKey.replace("custom_lang_", "");
          }
        }

        if (langName) {
          const updateData = {
            [`system.customLanguages.-=${langName}`]: null
          };

          await this.actor.update(updateData);
          await this.render();
        }
      });
    });

    // Handle custom language name edits
    const languageNameInputs = html.querySelectorAll(".language-name-edit");
    languageNameInputs.forEach(input => {
      input.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          input.blur();
        }
      });
      input.addEventListener("blur", async (event) => {
        const skillItem = input.closest(".skill-item");
        const oldName = skillItem?.dataset.languageName;
        const newName = input.value.trim();
        
        if (!oldName || !newName || oldName === newName) return;
        
        const customLanguages = { ...this.actor.system.customLanguages };
        if (customLanguages[newName]) {
          // Language already exists with new name
          input.value = oldName;
          ui.notifications.warn(game.i18n.localize("MERC.UI.skills.languageAlreadyExists"));
          return;
        }
        
        // Move language to new name using Foundry's deletion syntax
        const updateData = {
          [`system.customLanguages.${newName}`]: customLanguages[oldName],
          [`system.customLanguages.-=${oldName}`]: null
        };
        
        await this.actor.update(updateData);
        await this.render();
      });
    });

    // Handle native language name edits
    const nativeLanguageInputs = html.querySelectorAll(".native-language-edit");
    nativeLanguageInputs.forEach(input => {
      input.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          input.blur();
        }
      });
    });



    // Handle add specialization button
    const addSpecializationBtn = html.querySelector(".btn-add-specialization");
    if (addSpecializationBtn) {
      addSpecializationBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const customSpecializations = this.actor.system.customSpecializations || {};
        let specNum = 1;
        while (customSpecializations[`Specialization ${specNum}`]) {
          specNum++;
        }
        const newSpecName = `Specialization ${specNum}`;
        
        const updateData = {
          [`system.customSpecializations.${newSpecName}`]: {
            base: 0,
            dev: 0,
            bonus: 0,
            degree: 0,
            abilities: [],
            baseSkill: ""
          }
        };
        
        await this.actor.update(updateData);
        await this.render();
      });
    }

    // Handle remove specialization buttons
    const removeSpecializationBtns = html.querySelectorAll(".btn-remove-specialization");
    removeSpecializationBtns.forEach(btn => {
      btn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const skillItem = btn.closest(".skill-item");
        const specName = skillItem?.dataset.specializationName;

        if (specName) {
          const updateData = {
            [`system.customSpecializations.-=${specName}`]: null
          };

          await this.actor.update(updateData);
          await this.render();
        }
      });
    });

    // Handle custom specialization name edits
    const specializationNameInputs = html.querySelectorAll(".specialization-name-edit");
    specializationNameInputs.forEach(input => {
      input.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          input.blur();
        }
      });
      input.addEventListener("blur", async (event) => {
        const skillItem = input.closest(".skill-item");
        const oldName = skillItem?.dataset.specializationName;
        const newName = input.value.trim();
        
        if (!oldName || !newName || oldName === newName) return;
        
        const customSpecializations = { ...this.actor.system.customSpecializations };
        if (customSpecializations[newName]) {
          input.value = oldName;
          ui.notifications.warn(game.i18n.localize("MERC.Labels.duplicateSpecialization"));
          return;
        }
        
        const updateData = {
          [`system.customSpecializations.${newName}`]: customSpecializations[oldName],
          [`system.customSpecializations.-=${oldName}`]: null
        };
        
        await this.actor.update(updateData);
        await this.render();
      });
    });



    // Handle base skill selection for specializations
    const baseSkillSelects = html.querySelectorAll(".specialization-base-skill-select");
    baseSkillSelects.forEach(select => {
      select.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      select.addEventListener("change", async (event) => {
        const specName = select.dataset.specializationName;
        const newBaseSkill = select.value;
        
        if (!specName) return;
        
        const customSpecializations = { ...this.actor.system.customSpecializations };
        if (!customSpecializations[specName]) return;
        
        const updateData = {
          [`system.customSpecializations.${specName}.baseSkill`]: newBaseSkill
        };
        
        if (newBaseSkill) {
          const baseSkillData = this.actor.system.skills[newBaseSkill];
          if (baseSkillData?.abilities) {
            updateData[`system.customSpecializations.${specName}.abilities`] = baseSkillData.abilities;
          }
        }
        
        await this.actor.update(updateData);
        await this.render();
      });
    });
    
    // Item usage
    const createBtns = html.querySelectorAll(".item-create");
    createBtns.forEach(btn => {
      btn.addEventListener("click", (event) => {
        this.createItem(event);
      });
    });

    const deleteBtns = html.querySelectorAll(".item-delete");
    deleteBtns.forEach(btn => {
      btn.addEventListener("click", (event) => {
        this.deleteItem(event);
      });
    });

    const editBtns = html.querySelectorAll(".item-edit");
    editBtns.forEach(btn => {
      btn.addEventListener("click", (event) => {
        this.editItem(event);
      });
    });

    const weaponSkillBtns = html.querySelectorAll(".weapon-skill-roll");
    weaponSkillBtns.forEach(btn => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const itemId = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
        const item = this.actor?.items?.get(itemId);
        if (item) {
          this.rollWeaponSkillCheck(item);
        }
      });
    });

    const weaponSkillAimedBtns = html.querySelectorAll(".weapon-skill-roll-aimed");
    weaponSkillAimedBtns.forEach(btn => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const itemId = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
        const item = this.actor?.items?.get(itemId);
        if (item) {
          this.rollWeaponSkillCheck(item, 3);
        }
      });
    });

    const weaponDamageBtns = html.querySelectorAll(".weapon-damage-roll");
    weaponDamageBtns.forEach(btn => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const itemId = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
        const item = this.actor?.items?.get(itemId);
        if (item) {
          this.rollWeaponDamage(item);
        }
      });
    });

    // Calculate and display total weight (encombrement) with burden levels
    const totalWeightElement = html.querySelector("#total-weight");
    if (totalWeightElement) {
      let totalWeight = 0;
      if (this.actor?.items) {
        this.actor.items.forEach(item => {
          const weight = Number(item.system?.weightKg ?? 0);
          if (!Number.isNaN(weight)) {
            totalWeight += weight;
          }
        });
      }
      totalWeightElement.textContent = totalWeight.toFixed(1);
      
      // Calculate burden level
      const capaciteCharge = this.actor?.system?.combat?.capaciteCharge || 0;
      let burdenLevel = 1;
      
      if (totalWeight >= 0 && totalWeight <= (capaciteCharge / 2)) {
        burdenLevel = 1;
      } else if (totalWeight > (capaciteCharge / 2) && totalWeight <= capaciteCharge) {
        burdenLevel = 2;
      } else if (totalWeight > capaciteCharge && totalWeight <= capaciteCharge * 2 ) {
        burdenLevel = 3;
      } else if (totalWeight > capaciteCharge * 2) {
        burdenLevel = 4;
      }
      
      // Apply burden styling to weight display
      totalWeightElement.classList.remove('burden-level-1', 'burden-level-2', 'burden-level-3', 'burden-level-4');
      totalWeightElement.classList.add(`burden-level-${burdenLevel}`);
      
      // Calculate and apply actual movement speeds based on burden level
      const baseReptation = this.actor?.system?.movement?.reptation || 0;
      const baseMarche = this.actor?.system?.movement?.marche || 0;
      const baseCourse = this.actor?.system?.movement?.course || 0;
      
      let speedDiviseur = 1;
      if (burdenLevel === 1) speedDiviseur = 1;
      else if (burdenLevel === 2) speedDiviseur = 1.5;
      else if (burdenLevel === 3) speedDiviseur = 2;
      else if (burdenLevel === 4) speedDiviseur = 3;
      
      const actualReptation = burdenLevel === 1 ? baseReptation : Math.ceil(baseReptation / speedDiviseur);
      const actualMarche = burdenLevel === 1 ? baseMarche : Math.ceil(baseMarche / speedDiviseur);
      const actualCourse = burdenLevel === 1 ? baseCourse : Math.ceil(baseCourse / speedDiviseur);
      
      // Update actual speed displays
      const speedReptationEl = html.querySelector("#speed-reptation-actual .stat-value-large");
      const speedMarcheEl = html.querySelector("#speed-marche-actual .stat-value-large");
      const speedCourseEl = html.querySelector("#speed-course-actual .stat-value-large");
      
      if (speedReptationEl) speedReptationEl.textContent = actualReptation;
      if (speedMarcheEl) speedMarcheEl.textContent = actualMarche;
      if (speedCourseEl) speedCourseEl.textContent = actualCourse;
      
      // Apply burden styling to speed displays
      const speedElements = html.querySelectorAll(".burden-speed");
      speedElements.forEach(el => {
        el.classList.remove('burden-level-1', 'burden-level-2', 'burden-level-3', 'burden-level-4');
        el.classList.add(`burden-level-${burdenLevel}`);
      });
    }
  }

  /**
   * Build and send a d20 roll chat message.
   * @param {string} label - The display label for the roll
   * @param {number} modifier - The total modifier to add to the roll
   * @param {string} breakdownText - Optional breakdown details (e.g., "Degré 3 / Bonus 1")
   */
  async _sendD20RollMessage(label, modifier, breakdownText = "") {
    const actor = this.actor ?? this.document;
    const { firstRoll, secondRoll, adjustedTotal, secondRollDirection } = await rollD20WithSecond();
    const total = adjustedTotal + modifier;
    const rolls = secondRoll ? [firstRoll, secondRoll] : [firstRoll];
    const badgeClass = secondRollDirection === "added"
      ? " merc-roll-badge--bonus"
      : secondRollDirection === "subtracted"
        ? " merc-roll-badge--penalty"
        : "";
    const rollTextClass = secondRollDirection === "added"
      ? " merc-roll-text--bonus"
      : secondRollDirection === "subtracted"
        ? " merc-roll-text--penalty"
        : "";
    const rollDice = secondRoll
      ? `${firstRoll.total}${secondRollDirection === "added" ? " + " : " - "}${secondRoll.total}`
      : `${firstRoll.total}`;
    
    let breakdownHtml = `<span class="roll-modifier">${modifier > 0 ? ' + ' : ' - '}${Math.abs(modifier)}</span>`;
    if (breakdownText) {
      breakdownHtml += `\n          <span class="roll-modifier">(${breakdownText})</span>`;
    }
    
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      rolls,
      content: `<div class="merc-roll">
        <div class="merc-roll-header">
          <span class="merc-roll-label">${label}</span>
          <span class="merc-roll-badge${badgeClass}">${total}</span>
        </div>
        <div class="merc-roll-breakdown">
          <span class="roll-d20${rollTextClass}"><strong>${rollDice}</strong></span>
          ${breakdownHtml}
        </div>
      </div>`
    };
    await ChatMessage.create(chatData);
  }

  async rollAbilityCheck(abilityKey) {
    const actor = this.actor ?? this.document;
    const systemData = actor.system || actor._source?.system || {};
    
    if (!systemData.attributes) {
      ui.notifications.warn(game.i18n.localize("MERC.Labels.attributesInitialized"));
      return;
    }
    
    const rawAbility = systemData.attributes?.[abilityKey];
    const abilityScore = Number(typeof rawAbility === "object" ? (rawAbility.current ?? 0) : (rawAbility ?? 0));
    const abilityName = game.i18n.localize(CONFIG.MERC.abilities[abilityKey]);
    const label = `${actor.name} - ${game.i18n.localize("MERC.Labels.check")} ${abilityName}`;
    
    await this._sendD20RollMessage(label, abilityScore);
  }

  async rollSkillCheck(skillKey) {
    const actor = this.actor ?? this.document;
    const systemData = actor.system || actor._source?.system || {};
    let skillData = systemData.skills?.[skillKey];
    let isCustomLanguage = false;
    let isCustomSpecialization = false;
    let customLanguageName = null;
    let customSpecializationName = null;

    if (!skillData && skillKey?.startsWith("custom_lang_")) {
      isCustomLanguage = true;
      customLanguageName = skillKey.replace("custom_lang_", "");
      const customLangData = systemData.customLanguages?.[customLanguageName];
      if (customLangData) {
        skillData = {
          ...customLangData,
          abilities: ["intelligence", "charisma"]
        };
      }
    }

    if (!skillData && skillKey?.startsWith("custom_spec_")) {
      isCustomSpecialization = true;
      customSpecializationName = skillKey.replace("custom_spec_", "");
      const customSpecData = systemData.customSpecializations?.[customSpecializationName];
      if (customSpecData) {
        skillData = {
          ...customSpecData,
          abilities: customSpecData.abilities || []
        };
      }
    }

    if (!skillData) {
      console.error(game.i18n.localize("MERC.Labels.skillNotFound") + ":", skillKey);
      return;
    }

    const base = this.computeSkillBase(actor, skillKey, skillData);
    const dev = Number(skillData.dev ?? skillData.value ?? 0);
    const degree = this.computeSkillDegree(actor, skillKey, skillData);
    const bonus = Number(skillData.bonus ?? 0);
    
    // Apply combat bonuses for specific skills
    let combatBonus = 0;
    if (skillKey === "stealth") {
      combatBonus = Number(systemData.combat?.bonusDiscretion ?? 0);
    } else if (skillKey === "concealment") {
      combatBonus = Number(systemData.combat?.bonusDissimulation ?? 0);
    }
    
    const total_modifier = degree + bonus + combatBonus;

    let skillName;
    if (isCustomLanguage) {
      skillName = game.i18n.format("MERC.Skills.language_custom", { name: customLanguageName });
    } else if (isCustomSpecialization) {
      const baseSkillKey = skillData.baseSkill || "";
      if (baseSkillKey) {
        const baseSkillLabel = game.i18n.localize(`MERC.Skills.${baseSkillKey}`);
        skillName = `${baseSkillLabel} : ${customSpecializationName}`;
      } else {
        skillName = customSpecializationName;
      }
    } else if (skillKey === "language_native") {
      const baseLabel = game.i18n.localize(CONFIG.MERC.skills[skillKey]?.label) || skillKey;
      const nativeName = systemData.skills?.language_native?.name ?? "";
      skillName = nativeName ? `${baseLabel} : ${nativeName}` : baseLabel;
    } else {
      skillName = game.i18n.localize(CONFIG.MERC.skills[skillKey]?.label) || skillKey;
    }
    
    const label = `${actor.name} - ${skillName}`;
    const breakdown = game.i18n.format("MERC.Labels.breakdownDegree", { degree, bonus, attr: combatBonus });
    await this._sendD20RollMessage(label, total_modifier, breakdown);
  }

  async rollWeaponSkillCheck(item, aimBonus = 0) {
    const actor = this.actor ?? this.document;
    if (!actor || !item) return;

    const skillKey = item.system?.weaponSkill;
    if (!skillKey) {
      ui.notifications?.warn(game.i18n.localize("MERC.Labels.skillNotFound"));
      return;
    }

    const systemData = actor.system || actor._source?.system || {};
    let skillData = systemData.skills?.[skillKey];
    let skillName;

    if (!skillData && skillKey?.startsWith("custom_spec_")) {
      const customSpecializationName = skillKey.replace("custom_spec_", "");
      const customSpecData = systemData.customSpecializations?.[customSpecializationName];
      if (customSpecData) {
        skillData = { ...customSpecData, abilities: customSpecData.abilities || [] };
        const baseSkillKey = customSpecData.baseSkill || "";
        if (baseSkillKey) {
          const baseSkillLabel = game.i18n.localize(`MERC.Skills.${baseSkillKey}`);
          skillName = `${baseSkillLabel} : ${customSpecializationName}`;
        } else {
          skillName = customSpecializationName;
        }
      }
    }

    if (!skillData) {
      console.error(game.i18n.localize("MERC.Labels.skillNotFound") + ":", skillKey);
      return;
    }

    const base = this.computeSkillBase(actor, skillKey, skillData);
    const dev = Number(skillData.dev ?? skillData.value ?? 0);
    const degree = this.computeSkillDegree(actor, skillKey, skillData);
    const bonus = Number(skillData.bonus ?? 0);
    const proficiencyBonus = item.system?.proficiency ? 3 : 0;

    const total_modifier = degree + bonus + proficiencyBonus + aimBonus;
    if (!skillName) {
      skillName = game.i18n.localize(CONFIG.MERC.skills[skillKey]?.label) || skillKey;
    }
    const weaponName = item.name || game.i18n.localize("MERC.UI.items.weapons");

    const aimLabel = aimBonus > 0 ? ` — ${game.i18n.localize("MERC.UI.items.rollWeaponSkillAimed")}` : "";
    const label = `${actor.name} - ${weaponName} (${skillName})${aimLabel}`;
    let breakdown = game.i18n.format("MERC.Labels.breakdownProficiency", { degree, bonus, prof: proficiencyBonus });
    if (aimBonus > 0) {
      breakdown += ` / ${game.i18n.localize("MERC.UI.items.rollWeaponSkillAimed")} +${aimBonus}`;
    }
    await this._sendD20RollMessage(label, total_modifier, breakdown);
  }

  /**
   * Roll weapon damage with optional base damage bonus based on weapon skill
   * If the weapon is melee or bladed_weapons, adds the corresponding base damage
   * @param {Item} item - The weapon item to roll damage for
   */
  async rollWeaponDamage(item) {
    const actor = this.actor ?? this.document;
    if (!actor || !item) return;
    
    // Get the weapon's base damage formula
    const weaponDamageFormula = item.system?.damage;
    if (!weaponDamageFormula) {
      ui.notifications?.warn(game.i18n.localize("MERC.UI.items.weaponSheet.missingDamage"));
      return;
    }

    // Initialize base damage variables
    let baseDamageLabel = "";
    let baseDamageFormula = "";
    const weaponSkill = item.system?.weaponSkill;
    const actorSystem = actor.system || actor._source?.system || {};
    
    // Determine which base damage bonus to apply based on weapon skill
    if (weaponSkill === "melee") {
      baseDamageFormula = actorSystem.combat?.baseDamageMelee || "1";
      baseDamageLabel = game.i18n.localize("MERC.UI.combat.baseDamageMelee");
    } else if (weaponSkill === "bladed_weapons") {
      baseDamageFormula = actorSystem.combat?.baseDamageBladed || "1";
      baseDamageLabel = game.i18n.localize("MERC.UI.combat.baseDamageBladed");
    } else if (weaponSkill?.startsWith("custom_spec_")) {
      const specName = weaponSkill.replace("custom_spec_", "");
      const specData = actorSystem.customSpecializations?.[specName];
      const baseSkillKey = specData?.baseSkill || "";
      if (baseSkillKey === "melee" || baseSkillKey === "bladed_weapons") {
        const baseLabel = baseSkillKey === "melee"
          ? game.i18n.localize("MERC.UI.combat.baseDamageMelee")
          : game.i18n.localize("MERC.UI.combat.baseDamageBladed");
        baseDamageLabel = `${baseLabel} (${specName})`;
        baseDamageFormula = actorSystem.combat?.specializationBaseDamage?.[weaponSkill];
        if (!baseDamageFormula) {
          const computed = computeCombatStatsFromSystem(actorSystem);
          baseDamageFormula = computed?.specializationBaseDamage?.[weaponSkill] || "1";
        }
      }
    }

    // Roll weapon damage separately (makes it easier to display detail)
    const weaponRoll = new Roll(weaponDamageFormula);
    await weaponRoll.evaluate();
    
    // Roll base damage bonus separately if applicable
    let baseRoll = null;
    if (baseDamageFormula) {
      baseRoll = new Roll(baseDamageFormula);
      await baseRoll.evaluate();
    }
    
    // Calculate total damage (weapon damage + base damage)
    const totalDamage = weaponRoll.total + (baseRoll?.total || 0);

    // Build the detailed HTML breakdown for the chat message
    let detailsHtml = `<div style="font-size: 12px; margin-top: 8px;">`;
    
    // Display weapon damage formula and base damage bonus info
    if (baseDamageLabel) {
      detailsHtml += `<div style="margin-bottom: 6px;">
        <strong>${game.i18n.localize("MERC.Labels.damageWeaponLabel")}</strong> ${weaponDamageFormula}<br>
        <strong>${game.i18n.format("MERC.Labels.damageBonusLabel", { label: baseDamageLabel })}</strong> +${baseDamageFormula}
      </div>`;
    } else {
      detailsHtml += `<div style="margin-bottom: 6px;">
        <strong>${game.i18n.localize("MERC.Labels.damageFormulaLabel")}</strong> ${weaponDamageFormula}
      </div>`;
    }
    
    // Extract and display individual dice results from weapon roll
    detailsHtml += `<div style="border-top: 1px solid #ccc; padding-top: 6px;">
      <strong>${game.i18n.localize("MERC.Labels.damageDiceDetail")}</strong><br>
      <em>${game.i18n.localize("MERC.Labels.damageWeaponLabel")}</em><br>`;
    
    // Iterate through all terms in the weapon roll (dice and modifiers)
    for (const term of weaponRoll.terms) {
      // Check if this term contains dice results
      if (term?.results && Array.isArray(term.results) && term.results.length > 0) {
        const diceStr = term.formula || "?";
        // Extract individual die results (handling both number and object formats)
        const results = term.results
          .map(r => typeof r === "number" ? r : r?.result)
          .filter(r => r !== undefined && r !== null);
        
        // Display each dice result with its subtotal
        if (results.length > 0) {
          const resultStr = results.join(", ");
          const subtotal = results.reduce((a, b) => a + b, 0);
          detailsHtml += `&nbsp;&nbsp;${diceStr}: [${resultStr}] = <strong>${subtotal}</strong><br>`;
        }
      }
    }
    
    // Extract and display individual dice results from base damage roll
    if (baseRoll) {
      detailsHtml += `<em>${game.i18n.format("MERC.Labels.damageBonusLabel", { label: baseDamageLabel })}</em><br>`;
      
      // Iterate through all terms in the base damage roll
      for (const term of baseRoll.terms) {
        // Check if this term contains dice results
        if (term?.results && Array.isArray(term.results) && term.results.length > 0) {
          const diceStr = term.formula || "?";
          // Extract individual die results
          const results = term.results
            .map(r => typeof r === "number" ? r : r?.result)
            .filter(r => r !== undefined && r !== null);
          
          // Display each dice result with its subtotal
          if (results.length > 0) {
            const resultStr = results.join(", ");
            const subtotal = results.reduce((a, b) => a + b, 0);
            detailsHtml += `&nbsp;&nbsp;${diceStr}: [${resultStr}] = <strong>${subtotal}</strong><br>`;
          }
        }
      }
    }
    
    // Display the total damage at the bottom
    detailsHtml += `<div style="border-top: 1px solid #999; margin-top: 6px; padding-top: 6px;">
      <strong style="font-size: 13px;">${game.i18n.format("MERC.Labels.damageTotalLabel", { total: totalDamage })}</strong>
    </div></div></div>`;

    // Build display label: weapon name, or "weapon (ammo)" for ammo items
    let itemLabel = item.name || game.i18n.localize("MERC.UI.items.weapons");
    if (item.type === "ammo") {
      const parentRaw = item.system?.parentWeaponId || "";
      const parentId = parentRaw.split(",")[0] || "";
      let weaponItem = null;
      if (parentId && actor?.items) {
        weaponItem = actor.items.get(parentId) || null;
      }
      if (!weaponItem && parentId && game.items) {
        weaponItem = game.items.get(parentId) || null;
      }
      if (weaponItem?.name) {
        const ammoName = item.name || game.i18n.localize("MERC.UI.items.ammo");
        itemLabel = `${weaponItem.name} (${ammoName})`;
      }
    }

    // Prepare the chat message data
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      // Include both rolls for Foundry's roll tracking system
      rolls: [weaponRoll, ...(baseRoll ? [baseRoll] : [])],
      // Build the HTML content for the chat message
      content: `<div class="merc-roll">
        <div class="merc-roll-header">
          <span class="merc-roll-label">${actor.name} - ${itemLabel}</span>
          <span class="merc-roll-badge">${totalDamage}</span>
        </div>
        <div class="merc-roll-breakdown">
          ${detailsHtml}
        </div>
      </div>`
    };

    // Post the chat message to the game
    await ChatMessage.create(chatData);
  }

  async rollBaseDamage(formula, skillLabel) {
    const actor = this.actor ?? this.document;
    if (!formula) return;

    const roll = new Roll(formula);
    await roll.evaluate();
    const breakdown = formatRollBreakdown(roll);

    const headerLabel = game.i18n.format("MERC.UI.combat.baseDamageRoll", {
      skill: skillLabel || game.i18n.localize("MERC.UI.combat.baseDamage")
    });

    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      rolls: [roll],
      content: `<div class="merc-roll">
        <div class="merc-roll-header">
          <span class="merc-roll-label">${actor.name} - ${headerLabel}</span>
          <span class="merc-roll-badge">${roll.total}</span>
        </div>
        <div class="merc-roll-breakdown">
          <span class="roll-d20"><strong>${breakdown}</strong></span>
        </div>
      </div>`
    };

    await ChatMessage.create(chatData);
  }

  async rollSubAttributeCheck(subKey, subLabel) {
    const actor = this.actor ?? this.document;
    const systemData = actor.system || actor._source?.system || {};
    const detail = systemData.attributes?.perceptionDetail || {};
    const detailValue = detail?.[subKey];
    const subValue = Number(typeof detailValue === "object" ? (detailValue.current ?? 0) : (detailValue ?? 0));

    const perceptionName = game.i18n.localize(CONFIG.MERC.abilities.perception);
    const label = `${actor.name} - ${game.i18n.localize("MERC.Labels.check")} ${perceptionName} - ${subLabel}`;

    await this._sendD20RollMessage(label, subValue);
  }

  async rollEnduranceCheck() {
    const actor = this.actor ?? this.document;
    const systemData = actor.system || actor._source?.system || {};
    const endurance = Number(systemData.combat?.endurance ?? 0);

    const label = `${actor.name} - ${game.i18n.localize("MERC.UI.stats.endurance")}`;
    await this._sendD20RollMessage(label, endurance);
  }

  async createItem(event) {
    const type = event.currentTarget.dataset.type;
    const newItem = {
      name: `New ${type}`,
      type: type,
      system: {}
    };
    
    const item = await Item.create(newItem, { parent: this.actor });
    item.sheet.render(true);
  }

  async deleteItem(event) {
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    // Cascade: if deleting a weapon, also delete its linked ammo
    if (item?.type === "weapon") {
      const linkedAmmoIds = this.actor.items
        .filter(i => i.type === "ammo" && i.system?.parentWeaponId === itemId)
        .map(i => i.id);
      if (linkedAmmoIds.length > 0) {
        await this.actor.deleteEmbeddedDocuments("Item", linkedAmmoIds);
      }
    }
    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  async editItem(event) {
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    item.sheet.render(true);
  }

  // ===== Combat & Movement Calculations =====
  
  /**
   * Calculate combat statistics for the character
   */
  calculateCombatStats() {
    return computeCombatStatsFromSystem(this.actor?.system);
  }

  /**
   * Build an update data object for all derived combat/movement stats.
   * Returns null if no stats could be computed.
   */
  buildCombatStatsUpdate() {
    const stats = this.calculateCombatStats();
    if (!stats) return null;
    return {
      "system.combat.endurance": stats.endurance,
      "system.combat.pointCorporence": stats.pointCorporence,
      "system.combat.capaciteCharge": stats.capaciteCharge,
      "system.combat.bonusDiscretion": stats.bonusDiscretion,
      "system.combat.bonusDissimulation": stats.bonusDissimulation,
      "system.combat.corpulence": stats.corpulence,
      "system.combat.baseDamageMelee": stats.baseDamageMelee,
      "system.combat.baseDamageBladed": stats.baseDamageBladed,
      "system.combat.specializationBaseDamage": stats.specializationBaseDamage,
      "system.movement.reptation": stats.vitesses.reptation,
      "system.movement.marche": stats.vitesses.marche,
      "system.movement.course": stats.vitesses.course
    };
  }
}

class MercWeaponSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(foundry.utils.deepClone(super.DEFAULT_OPTIONS), {
    classes: ["merc", "sheet", "item", "weapon"],
    width: 520,
    height: 620,
    resizable: true,
    parts: ["form"],
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    }
  });

  static PARTS = {
    form: {
      template: "systems/merc/templates/item/weapon-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const data = await super._prepareContext(options);
    const itemDoc = this.document ?? this.item;
    const actorDoc = itemDoc?.parent ?? this.actor ?? this.document?.parent;
    if (!data.item) {
      data.item = itemDoc?.toObject?.() ?? itemDoc ?? {};
    }
    const systemData = data?.item?.system ?? itemDoc?.system ?? {};
    const defaults = {
      weightKg: 0,
      damage: "",
      weaponSubtype: "",
      range: {
        short: 0,
        medium: 0,
        long: 0,
        extreme: 0
      }
    };

    if (!data.item) data.item = {};
    data.item.system = foundry.utils.mergeObject(defaults, systemData, { inplace: false, overwrite: true });

    // Build custom specialization options from owning actor
    const customSpecializations = actorDoc?.system?.customSpecializations ?? {};
    data.customSpecializations = Object.entries(customSpecializations)
      .filter(([, specData]) => !!specData)
      .map(([specName, specData]) => {
        const baseSkillKey = specData.baseSkill || "";
        const baseSkillLabel = baseSkillKey ? game.i18n.localize(`MERC.Skills.${baseSkillKey}`) : "";
        const label = baseSkillLabel ? `${baseSkillLabel} : ${specName}` : specName;
        return {
          key: `custom_spec_${specName}`,
          label
        };
      });

    // Gather ammo items linked to this specific weapon via parentWeaponId
    // Works for both embedded items (on an actor) and world-level items
    const weaponId = itemDoc?.id || "";
    let actorAmmo = [];
    if (actorDoc) {
      actorAmmo = actorDoc.items.filter(i => i.type === "ammo" && i.system?.parentWeaponId === weaponId);
    } else {
      actorAmmo = game.items?.filter(i => i.type === "ammo" && ammoIsLinkedToWeapon(i, weaponId)) ?? [];
    }
    data.ammoItems = actorAmmo.map(a => a.toObject());
    data.hasActor = !!actorDoc;

    // Look up the default ammo (from compendium) so the sheet can display it
    const defaultAmmoId = systemData?.defaultAmmoId || "";
    let defaultAmmo = null;
    if (defaultAmmoId) {
      const onActor = actorDoc?.items?.get(defaultAmmoId);
      if (onActor) {
        defaultAmmo = onActor.toObject();
      } else {
        const worldItem = game.items?.get(defaultAmmoId);
        if (worldItem) {
          defaultAmmo = worldItem.toObject();
        } else {
          const ammoPack = game.packs?.get("merc.ammos");
          if (ammoPack) {
            try {
              const ammoDoc = await ammoPack.getDocument(defaultAmmoId);
              if (ammoDoc) defaultAmmo = ammoDoc.toObject();
            } catch (_e) { /* not found in pack */ }
          }
        }
      }
    }
    data.defaultAmmo = defaultAmmo;
    data.defaultAmmoName = systemData?.defaultAmmoName || "";

    // Compute ballistics from default ammo; fallback to first linked ammo if no default is set
    const ammoSys = defaultAmmo?.system ?? actorAmmo[0]?.system ?? null;
    const ranges = systemData?.range ?? {};
    const barrelLength = Number(systemData?.barrelLength) || 0;
    const ballisticsResult = ammoSys ? calcWeaponBallistics(barrelLength, ammoSys, ranges) : null;
    data.ballistics = ballisticsResult ?? {
      hasData: false,
      damage: systemData?.damage || "",
      initialVelocity: 0,
      energy: 0,
      pen: { muzzle: 0, short: 0, medium: 0, long: 0, extreme: 0 },
      blindage: { short: "-", medium: "-", long: "-", extreme: "-" }
    };

    return data;
  }

  _updateFrame(options) {
    super._updateFrame(options);
    const itemDoc = this.document ?? this.item;
    if (this.window?.title && itemDoc?.name) {
      this.window.title.textContent = itemDoc.name;
    }
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    const html = this.element;
    if (!html) return;
    const itemDoc = this.document ?? this.item;

    // Subtype → skill auto-mapping (prevents submitOnChange double-fire)
    const subtypeSelect = html.querySelector('select[name="system.weaponSubtype"]');
    const skillSelect = html.querySelector('select[name="system.weaponSkill"]');
    if (subtypeSelect) {
      subtypeSelect.addEventListener("change", async (event) => {
        event.stopPropagation();
        if (!itemDoc) return;
        const subtype = subtypeSelect.value || "";
        const subtypeSkillMap = {
          melee: "melee",
          bladed_weapons: "bladed_weapons",
          throwing: "throwing",
          powder_projectiles: "powder_projectiles",
          mechanical_projectiles: "mechanical_projectiles",
          heavy_weapons: "heavy_weapons",
          electronic_weapons: "electronic_weapons"
        };
        const mappedSkill = subtypeSkillMap[subtype] || "";
        const updateData = {
          "system.weaponSubtype": subtype
        };

        const currentSkill = itemDoc.system?.weaponSkill || "";
        let shouldUpdateSkill = false;

        if (mappedSkill) {
          if (!currentSkill) {
            shouldUpdateSkill = true;
          } else if (currentSkill.startsWith("custom_spec_")) {
            const specName = currentSkill.replace("custom_spec_", "");
            const baseSkill = itemDoc.actor?.system?.customSpecializations?.[specName]?.baseSkill || "";
            if (baseSkill && baseSkill !== mappedSkill) {
              shouldUpdateSkill = true;
            }
          } else if (currentSkill !== mappedSkill) {
            shouldUpdateSkill = true;
          }
        }

        if (shouldUpdateSkill) {
          updateData["system.weaponSkill"] = mappedSkill;
          if (skillSelect) skillSelect.value = mappedSkill;
        }
        await itemDoc.update(updateData);
      });
    }

    const rollBtn = html.querySelector(".weapon-damage-roll");
    if (rollBtn) {
      rollBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        const formula = event.currentTarget.dataset.rollFormula?.trim()
          || html.querySelector('input[name="system.damage"]')?.value?.trim()
          || itemDoc?.system?.damage;
        if (!formula) {
          ui.notifications?.warn(game.i18n.localize("MERC.UI.items.weaponSheet.missingDamage"));
          return;
        }

        try {
          const roll = new Roll(formula);
          await roll.evaluate();
          const label = game.i18n.format("MERC.UI.items.weaponSheet.damageRoll", { name: itemDoc?.name ?? "" });
          await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: itemDoc?.actor }),
            flavor: label
          });
        } catch (error) {
          ui.notifications?.error(game.i18n.localize("MERC.UI.items.weaponSheet.invalidDamage"));
        }
      });
    }

    // Ammo management within weapon sheet
    // Works for both embedded items (on an actor) and world-level items
    const actorDoc = itemDoc?.parent;
    const isEmbedded = !!actorDoc;

    // Add ammo
    const ammoAddBtn = html.querySelector(".weapon-ammo-add");
    if (ammoAddBtn) {
      ammoAddBtn.addEventListener("click", async (event) => {
        const type = event.currentTarget.dataset.type;
        const newItem = {
          name: `New ${type}`,
          type: type,
          system: {
            parentWeaponId: itemDoc?.id || ""
          }
        };
        let item;
        if (isEmbedded) {
          item = await Item.create(newItem, { parent: actorDoc });
        } else {
          item = await Item.create(newItem);
        }
        item.sheet.render(true);
        this.render();
      });
    }

    // Inline editing of ammo stock fields (magazines, stock)
    html.querySelectorAll(".weapon-ammo-item.item").forEach(el => {
      const ammoId = el.dataset.itemId;
      el.querySelectorAll("input.ammo-field-inline").forEach(input => {
        input.addEventListener("change", async () => {
          const ammoDoc = isEmbedded ? actorDoc.items.get(ammoId) : game.items.get(ammoId);
          if (!ammoDoc) return;
          const field = input.dataset.field;
          await ammoDoc.update({ [`system.${field}`]: Number(input.value) || 0 });
        });
      });
    });

    // Edit ammo
    html.querySelectorAll(".weapon-ammo-edit").forEach(btn => {
      btn.addEventListener("click", (event) => {
        const itemId = event.currentTarget.closest(".item")?.dataset.itemId;
        let ammo;
        if (isEmbedded) {
          ammo = actorDoc.items.get(itemId);
        } else {
          ammo = game.items.get(itemId);
        }
        if (ammo) ammo.sheet.render(true);
      });
    });

    // Delete/unlink ammo
    html.querySelectorAll(".weapon-ammo-delete").forEach(btn => {
      btn.addEventListener("click", async (event) => {
        const ammoId = event.currentTarget.closest(".item")?.dataset.itemId;
        if (ammoId) {
          if (isEmbedded) {
            // Embedded: delete the ammo item from the actor
            await actorDoc.deleteEmbeddedDocuments("Item", [ammoId]);
          } else {
            // World-level: unlink this weapon from the ammo instead of deleting
            const ammo = game.items.get(ammoId);
            if (ammo) {
              const newIds = removeWeaponIdFromAmmo(ammo.system?.parentWeaponId, itemDoc?.id || "");
              if (!newIds) {
                // No more weapon links — delete the ammo
                await ammo.delete();
              } else {
                await ammo.update({ "system.parentWeaponId": newIds });
              }
            }
          }
          this.render();
        }
      });
    });

    // Drag & Drop: accept ammo items dropped onto the weapon sheet
    const ammoSection = html.querySelector(".weapon-ammo-section");
    if (ammoSection) {
      new foundry.applications.ux.DragDrop.implementation({
        dropSelector: ".weapon-ammo-section",
        permissions: { drop: () => true },
        callbacks: {
          drop: this._onDropAmmo.bind(this),
          dragenter: (event) => event.currentTarget.classList?.add("drop-highlight"),
          dragleave: (event) => event.currentTarget.classList?.remove("drop-highlight")
        }
      }).bind(html);
    }

    // Watch linked ammo for updates so ballistics refresh automatically.
    // (e.g. user fills in ammo properties after "Add Ammo", or edits an existing ammo)
    if (this._ammoUpdateHookId !== undefined) {
      Hooks.off("updateItem", this._ammoUpdateHookId);
    }
    const weaponId = itemDoc?.id || "";
    if (weaponId) {
      this._ammoUpdateHookId = Hooks.on("updateItem", (updatedItem) => {
        if (updatedItem.type !== "ammo") return;
        const parentId = updatedItem.system?.parentWeaponId || "";
        if (parentId === weaponId || parentId.split(",").includes(weaponId)) {
          this.render();
        }
      });
    }
  }

  async close(options) {
    if (this._ammoUpdateHookId !== undefined) {
      Hooks.off("updateItem", this._ammoUpdateHookId);
      delete this._ammoUpdateHookId;
    }
    return super.close(options);
  }

  /**
   * Handle an ammo item dropped onto the weapon sheet.
   * Creates a copy linked to this weapon via parentWeaponId.
   */
  async _onDropAmmo(event) {
    event.currentTarget?.classList?.remove("drop-highlight");
    const data = TextEditor.implementation.getDragEventData(event);
    if (data?.type !== "Item") return;
    const droppedItem = await Item.implementation.fromDropData(data);
    if (!droppedItem || droppedItem.type !== "ammo") {
      ui.notifications?.warn(game.i18n.localize("MERC.UI.items.weaponSheet.dropOnlyAmmo"));
      return;
    }

    // Caliber check: reject ammo that doesn't match the weapon's caliber
    const itemDoc = this.document ?? this.item;
    const weaponCaliber = itemDoc?.system?.caliber || "";
    const ammoCaliber   = droppedItem.system?.caliber || "";
    if (weaponCaliber && ammoCaliber && weaponCaliber !== ammoCaliber) {
      ui.notifications?.warn(
        game.i18n.format("MERC.UI.items.weaponSheet.wrongCaliber", {
          ammoCaliber,
          weaponCaliber
        })
      );
      return;
    }

    const actorDoc = itemDoc?.parent;
    const isEmbedded = !!actorDoc;
    const droppedIsWorldLevel = !droppedItem.parent;

    if (isEmbedded) {
      // Weapon is on an actor: always create an embedded copy
      const ammoData = droppedItem.toObject();
      ammoData.system.parentWeaponId = itemDoc?.id || "";
      const created = await Item.create(ammoData, { parent: actorDoc });
      if (created) {
        ui.notifications?.info(game.i18n.format("MERC.UI.items.weaponSheet.ammoLinked", { name: created.name }));
        this.render();
      }
    } else if (droppedIsWorldLevel) {
      // Both weapon and ammo are world-level: add this weapon to the ammo's linked list
      const newIds = addWeaponIdToAmmo(droppedItem.system?.parentWeaponId, itemDoc?.id || "");
      const worldUpdate = { "system.parentWeaponId": newIds };
      await droppedItem.update(worldUpdate);
      ui.notifications?.info(game.i18n.format("MERC.UI.items.weaponSheet.ammoLinked", { name: droppedItem.name }));
      this.render();
    } else {
      // Weapon is world-level but ammo comes from an actor: create a world copy
      const ammoData = droppedItem.toObject();
      ammoData.system.parentWeaponId = itemDoc?.id || "";
      const created = await Item.create(ammoData);
      if (created) {
        ui.notifications?.info(game.i18n.format("MERC.UI.items.weaponSheet.ammoLinked", { name: created.name }));
        this.render();
      }
    }
  }
}


class MercAmmoSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(foundry.utils.deepClone(super.DEFAULT_OPTIONS), {
    classes: ["merc", "sheet", "item", "ammo"],
    width: 420,
    height: 400,
    resizable: true,
    parts: ["form"],
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    }
  });

  static PARTS = {
    form: {
      template: "systems/merc/templates/item/ammo-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const data = await super._prepareContext(options);
    const itemDoc = this.document ?? this.item;
    if (!data.item) {
      data.item = itemDoc?.toObject?.() ?? itemDoc ?? {};
    }
    const systemData = data?.item?.system ?? itemDoc?.system ?? {};
    const defaults = {
      ammoType: "",
      caliber: "",
      magCapacity: 0,
      inMag: 0,
      magFull: 0,
      magTotal: 0,
      stock: 0,
      mass: 0,
      diameter: 0,
      coeff_trainee: 0,
      rho: 1.225,
      perforation_index: 1,
      barrel_length_std: 0,
      velocity: 0,
      weight: 0,
      braking_index: 0,
      sectional_density: 0,
      price: 0,
      rarity: "common",
      description: "",
      parentWeaponId: ""
    };
    if (!data.item) data.item = {};
    data.item.system = foundry.utils.mergeObject(defaults, systemData, { inplace: false, overwrite: true });

    // Compute derived ballistic properties for display
    const sys = data.item.system;
    const derived = calcAmmoDerived(sys.mass, sys.diameter, sys.coeff_trainee, sys.rho);
    data.computed = {
      brakingIndex:    derived.braking_index.toFixed(6),
      sectionalDensity: derived.sectional_density.toFixed(2)
    };

    return data;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    const html = this.element;
    if (!html) return;
    // Derived fields (brakingIndex, sectionalDensity) are read-only and computed in _prepareContext.
    // No live-update listeners needed.
  }

  _updateFrame(options) {
    super._updateFrame(options);
    const itemDoc = this.document ?? this.item;
    if (this.window?.title && itemDoc?.name) {
      this.window.title.textContent = itemDoc.name;
    }
  }
}

// ============================================================
// MercVehicleSheet — Fiche d'acteur Véhicule
// ============================================================
class MercVehicleSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(foundry.utils.deepClone(super.DEFAULT_OPTIONS), {
    classes: ["merc", "sheet", "actor", "vehicle"],
    width: 560,
    height: 780,
    resizable: true,
    minWidth: 480,
    minHeight: 600,
    parts: ["form"],
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    tabs: [
      {
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial: "details"
      }
    ]
  });

  static PARTS = {
    form: {
      template: "systems/merc/templates/actor/vehicle-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const data = await super._prepareContext(options);
    const actorDoc = this.actor ?? this.document;

    data.actor = actorDoc?.toObject ? actorDoc.toObject() : actorDoc;
    if (actorDoc?.items) {
      data.actor.items = actorDoc.items.map(item => item.toObject());
    }

    // Defaults for vehicle fields
    const sys = data.actor.system ?? {};
    data.actor.system = foundry.utils.mergeObject({
      price: 0,
      rarity: "common",
      fireControlBonus: 0,
      fuelType: "diesel",
      stabilization: "none",
      load: 0,
      ptac: 0,
      crew: "",
      maintenance: "",
      nightVision: "headlights",
      nrbc: "open",
      trMov: 0,
      comMov: 0,
      fuelCap: 0,
      fuelCons: 0,
      notes: ""
    }, sys, { inplace: false, overwrite: true });

    // Labels for weapon skills (used in the template)
    const weaponSkillLabels = {};
    if (CONFIG.MERC?.skills) {
      for (const [key, cfg] of Object.entries(CONFIG.MERC.skills)) {
        weaponSkillLabels[key] = game.i18n.localize(cfg.label);
      }
    }
    data.weaponSkillLabels = weaponSkillLabels;

    return data;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    const html = this.element;
    if (!html) return;

    // Portrait selection
    initPortraitSelection(this.actor, html);

    // Drag & Drop highlight on weapon cards
    html.querySelectorAll(".item-card[data-item-id]").forEach(card => {
      card.addEventListener("dragenter", () => {
        const weapon = this.actor.items.get(card.dataset.itemId);
        if (weapon?.type === "weapon") card.classList.add("drop-highlight");
      });
      card.addEventListener("dragleave", (e) => {
        if (!card.contains(e.relatedTarget)) card.classList.remove("drop-highlight");
      });
      card.addEventListener("drop", () => card.classList.remove("drop-highlight"));
    });

    // ── Tab handling (same pattern as MercCharacterSheet) ──
    const tabItems = html.querySelectorAll(".sheet-tabs .item");

    // Restore last active tab after re-render
    if (this._currentTab) {
      html.querySelectorAll(".sheet-tabs .item").forEach(t => t.classList.remove("active"));
      html.querySelectorAll(".sheet-body .tab-content").forEach(c => c.classList.remove("active"));
      const tab = html.querySelector(`.sheet-tabs .item[data-tab="${this._currentTab}"]`);
      const tabContent = html.querySelector(`.sheet-body .tab-content[data-tab="${this._currentTab}"]`);
      if (tab && tabContent) {
        tab.classList.add("active");
        tabContent.classList.add("active");
      }
    }

    tabItems.forEach(tab => {
      tab.addEventListener("click", (event) => {
        event.preventDefault();
        const tabName = tab.dataset.tab;
        html.querySelectorAll(".sheet-tabs .item").forEach(t => t.classList.remove("active"));
        html.querySelectorAll(".sheet-body .tab-content").forEach(c => c.classList.remove("active"));
        tab.classList.add("active");
        const tabContent = html.querySelector(`.sheet-body .tab-content[data-tab="${tabName}"]`);
        if (tabContent) tabContent.classList.add("active");
        this._currentTab = tabName;
      });
    });

    // +/− buttons for numeric vehicle fields
    html.querySelectorAll(".vehicle-btn-minus, .vehicle-btn-plus").forEach(btn => {
      btn.addEventListener("click", async (event) => {
        event.preventDefault();
        const field = event.currentTarget.dataset.field;
        if (!field) return;
        const input = html.querySelector(`input[name="${field}"]`);
        if (!input) return;
        const step = parseFloat(input.step) || 1;
        let val = parseFloat(input.value) || 0;
        if (event.currentTarget.classList.contains("vehicle-btn-minus")) val -= step;
        else val += step;
        val = Math.round(val * 1000) / 1000;
        input.value = val;
        await this.actor.update({ [field]: val });
      });
    });

    // Item create
    html.querySelectorAll(".item-create").forEach(btn => {
      btn.addEventListener("click", e => this.createItem(e));
    });

    // Item delete
    html.querySelectorAll(".item-delete").forEach(btn => {
      btn.addEventListener("click", e => this.deleteItem(e));
    });

    // Item edit
    html.querySelectorAll(".item-edit").forEach(btn => {
      btn.addEventListener("click", e => this.editItem(e));
    });

    // Weapon skill roll — uses fireControlBonus as modifier
    html.querySelectorAll(".weapon-skill-roll").forEach(btn => {
      btn.addEventListener("click", async (event) => {
        event.preventDefault();
        const itemId = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
        const item = this.actor?.items?.get(itemId);
        if (item) await this.rollVehicleWeaponSkill(item);
      });
    });

    // Weapon damage roll
    html.querySelectorAll(".weapon-damage-roll").forEach(btn => {
      btn.addEventListener("click", async (event) => {
        event.preventDefault();
        const itemId = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
        const item = this.actor?.items?.get(itemId);
        if (item) await this.rollWeaponDamage(item);
      });
    });
  }

  async _onDropItem(event, item) {
    if (!this.actor.isOwner) return null;

    if (item?.type === "ammo") {
      const weaponCard = event.target.closest(".item-card[data-item-id]");
      if (weaponCard) {
        const weaponId = weaponCard.dataset.itemId;
        const weapon = this.actor.items.get(weaponId);
        if (weapon?.type === "weapon") {
          const ammoData = item.toObject();
          ammoData.system.parentWeaponId = weaponId;
          const created = await Item.create(ammoData, { parent: this.actor });
          if (created) {
            ui.notifications?.info(game.i18n.format("MERC.UI.items.weaponSheet.ammoLinked", { name: created.name }));
          }
          return created ?? null;
        }
      }
      ui.notifications?.warn(game.i18n.localize("MERC.UI.items.weaponSheet.dropAmmoOnWeapon"));
      return null;
    }

    if (this.actor.uuid === item.parent?.uuid) {
      return (await this._onSortItem(event, item))?.length ? item : null;
    }
    const keepId = !this.actor.items.has(item.id);
    const result = await Item.implementation.create(item.toObject(), { parent: this.actor, keepId });

    if (result && item.type === "weapon") {
      const oldWeaponId = item.id;
      const newWeaponId = result.id;
      let linkedAmmo = [];
      if (item.parent) {
        linkedAmmo = item.parent.items.filter(i => i.type === "ammo" && i.system?.parentWeaponId === oldWeaponId);
      }
      if (linkedAmmo.length) {
        const ammoDataArray = linkedAmmo.map(a => {
          const data = a.toObject();
          data.system.parentWeaponId = newWeaponId;
          return data;
        });
        await Item.implementation.create(ammoDataArray, { parent: this.actor });
      }
    }
    return result ?? null;
  }

  async rollVehicleWeaponSkill(item) {
    const actor = this.actor ?? this.document;
    const fireControlBonus = Number(actor.system?.fireControlBonus ?? 0);
    const proficiencyBonus = item.system?.proficiency ? 3 : 0;
    const modifier = fireControlBonus + proficiencyBonus;
    const label = `${actor.name} - ${item.name || game.i18n.localize("MERC.UI.items.weapons")}`;
    await this._sendD20RollMessage(label, modifier, `Fire Control +${fireControlBonus}`);
  }

  async rollWeaponDamage(item) {
    const actor = this.actor ?? this.document;
    if (!actor || !item) return;

    const weaponDamageFormula = item.system?.damage;
    if (!weaponDamageFormula) {
      ui.notifications?.warn(game.i18n.localize("MERC.UI.items.weaponSheet.missingDamage"));
      return;
    }

    const weaponRoll = new Roll(weaponDamageFormula);
    await weaponRoll.evaluate();
    const totalDamage = weaponRoll.total;

    // Build dice detail
    let detailsHtml = `<div style="font-size: 12px; margin-top: 8px;">`;
    detailsHtml += `<div style="margin-bottom: 6px;"><strong>${game.i18n.localize("MERC.Labels.damageFormulaLabel")}</strong> ${weaponDamageFormula}</div>`;
    detailsHtml += `<div style="border-top: 1px solid #ccc; padding-top: 6px;"><strong>${game.i18n.localize("MERC.Labels.damageDiceDetail")}</strong><br>`;
    for (const term of weaponRoll.terms) {
      if (term?.results?.length > 0) {
        const results = term.results.map(r => typeof r === "number" ? r : r?.result).filter(r => r != null);
        if (results.length > 0) {
          detailsHtml += `&nbsp;&nbsp;${term.formula}: [${results.join(", ")}] = <strong>${results.reduce((a, b) => a + b, 0)}</strong><br>`;
        }
      }
    }
    detailsHtml += `<div style="border-top: 1px solid #999; margin-top: 6px; padding-top: 6px;">
      <strong style="font-size: 13px;">${game.i18n.format("MERC.Labels.damageTotalLabel", { total: totalDamage })}</strong>
    </div></div></div>`;

    // Label: "vehicle (ammo)" if ammo item
    let itemLabel = item.name || game.i18n.localize("MERC.UI.items.weapons");
    if (item.type === "ammo") {
      const parentId = (item.system?.parentWeaponId || "").split(",")[0] || "";
      const weaponItem = parentId ? (this.actor.items.get(parentId) || null) : null;
      if (weaponItem?.name) itemLabel = `${weaponItem.name} (${item.name})`;
    }

    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      rolls: [weaponRoll],
      content: `<div class="merc-roll">
        <div class="merc-roll-header">
          <span class="merc-roll-label">${actor.name} - ${itemLabel}</span>
          <span class="merc-roll-badge">${totalDamage}</span>
        </div>
        <div class="merc-roll-breakdown">${detailsHtml}</div>
      </div>`
    };
    await ChatMessage.create(chatData);
  }

  async _sendD20RollMessage(label, modifier, breakdownText = "") {
    const actor = this.actor ?? this.document;
    const { firstRoll, secondRoll, adjustedTotal, secondRollDirection } = await rollD20WithSecond();
    const total = adjustedTotal + modifier;
    const rolls = secondRoll ? [firstRoll, secondRoll] : [firstRoll];
    const badgeClass = secondRollDirection === "added"
      ? " merc-roll-badge--bonus"
      : secondRollDirection === "subtracted"
        ? " merc-roll-badge--penalty"
        : "";
    const rollTextClass = secondRollDirection === "added"
      ? " roll-bonus"
      : secondRollDirection === "subtracted"
        ? " roll-penalty"
        : "";
    const rollsText = rolls.map(r => `<span class="roll-d20${rollTextClass}">${r.total}</span>`).join(" + ");
    const directionLabel = secondRollDirection
      ? ` (${game.i18n.localize(`MERC.Labels.roll${secondRollDirection.charAt(0).toUpperCase() + secondRollDirection.slice(1)}`)})`
      : "";

    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      rolls,
      content: `<div class="merc-roll">
        <div class="merc-roll-header">
          <span class="merc-roll-label">${label}</span>
          <span class="merc-roll-badge${badgeClass}">${total}</span>
        </div>
        <div class="merc-roll-breakdown">
          ${rollsText}${directionLabel}
          ${modifier !== 0 ? `<span class="roll-modifier"> + ${modifier}</span>` : ""}
          ${breakdownText ? `<br><span class="roll-detail">${breakdownText}</span>` : ""}
        </div>
      </div>`
    };
    await ChatMessage.create(chatData);
  }

  async createItem(event) {
    const type = event.currentTarget.dataset.type;
    const newItem = { name: `New ${type}`, type, system: {} };
    const item = await Item.create(newItem, { parent: this.actor });
    item.sheet.render(true);
  }

  async deleteItem(event) {
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item?.type === "weapon") {
      const linkedAmmoIds = this.actor.items
        .filter(i => i.type === "ammo" && i.system?.parentWeaponId === itemId)
        .map(i => i.id);
      if (linkedAmmoIds.length > 0) {
        await this.actor.deleteEmbeddedDocuments("Item", linkedAmmoIds);
      }
    }
    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  async editItem(event) {
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    item.sheet.render(true);
  }

  _updateFrame(options) {
    super._updateFrame(options);
    const actorDoc = this.document ?? this.actor;
    if (this.window?.title && actorDoc?.name) {
      this.window.title.textContent = actorDoc.name;
    }
  }
}

// Initialize the system
Hooks.once("init", () => {
  // Register migration version setting
  game.settings.register("merc", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  // Define custom config with i18n keys
  CONFIG.MERC = {
    abilities: {
      intelligence: "MERC.Abilities.intelligence",
      will: "MERC.Abilities.will",
      mental: "MERC.Abilities.mental",
      charisma: "MERC.Abilities.charisma",
      chance: "MERC.Abilities.chance",
      adaptation: "MERC.Abilities.adaptation",
      strength: "MERC.Abilities.strength",
      dexterity: "MERC.Abilities.dexterity",
      speed: "MERC.Abilities.speed",
      constitution: "MERC.Abilities.constitution",
      perception: "MERC.Abilities.perception"
    },
    skills: {
      reaction: { label: "MERC.Skills.reaction", abilities: ["adaptation", "speed"] },
      melee: { label: "MERC.Skills.melee", abilities: ["strength", "dexterity"] },
      bladed_weapons: { label: "MERC.Skills.bladed_weapons", abilities: ["strength", "dexterity"] },
      mechanical_projectiles: { label: "MERC.Skills.mechanical_projectiles", abilities: ["dexterity", "perception"] },
      powder_projectiles: { label: "MERC.Skills.powder_projectiles", abilities: ["dexterity", "perception"] },
      throwing: { label: "MERC.Skills.throwing", abilities: ["strength", "perception"] },
      maneuvers: { label: "MERC.Skills.maneuvers", abilities: ["dexterity", "speed"] },
      heavy_weapons: { label: "MERC.Skills.heavy_weapons", abilities: ["strength", "perception"] },
      electronic_weapons: { label: "MERC.Skills.electronic_weapons", abilities: ["intelligence", "dexterity"] },
      running: { label: "MERC.Skills.running", abilities: ["constitution", "speed"] },
      climbing: { label: "MERC.Skills.climbing", abilities: ["adaptation", "dexterity"] },
      swimming: { label: "MERC.Skills.swimming", abilities: ["constitution", "dexterity"] },
      sliding: { label: "MERC.Skills.sliding", abilities: ["dexterity", "speed"] },
      air_sliding: { label: "MERC.Skills.air_sliding", abilities: ["dexterity", "speed"] },
      drive_wheeled: { label: "MERC.Skills.drive_wheeled", abilities: ["dexterity", "perception"] },
      drive_motorcycle: { label: "MERC.Skills.drive_motorcycle", abilities: ["dexterity", "perception"] },
      drive_boats: { label: "MERC.Skills.drive_boats", abilities: ["dexterity", "perception"] },
      drive_tracked: { label: "MERC.Skills.drive_tracked", abilities: ["dexterity", "perception"] },
      drive_planes: { label: "MERC.Skills.drive_planes", abilities: ["speed", "perception"] },
      drive_helicopters: { label: "MERC.Skills.drive_helicopters", abilities: ["speed", "perception"] },
      riding: { label: "MERC.Skills.riding", abilities: ["charisma", "mental"] },
      tracking: { label: "MERC.Skills.tracking", abilities: ["intelligence", "perception"] },
      stealth: { label: "MERC.Skills.stealth", abilities: ["dexterity", "charisma"] },
      concealment: { label: "MERC.Skills.concealment", abilities: ["adaptation", "perception"] },
      pickpocket: { label: "MERC.Skills.pickpocket", abilities: ["dexterity", "charisma"] },
      lockpicking: { label: "MERC.Skills.lockpicking", abilities: ["dexterity", "perception"] },
      tinkering: { label: "MERC.Skills.tinkering", abilities: ["adaptation", "dexterity"] },
      forgery: { label: "MERC.Skills.forgery", abilities: ["will", "dexterity"] },
      survival: { label: "MERC.Skills.survival", abilities: ["adaptation", "speed"] },
      eloquence: { label: "MERC.Skills.eloquence", abilities: ["intelligence", "charisma"] },
      acting: { label: "MERC.Skills.acting", abilities: ["charisma", "adaptation"] },
      interrogation: { label: "MERC.Skills.interrogation", abilities: ["intelligence", "adaptation"] },
      command: { label: "MERC.Skills.command", abilities: ["will", "charisma"] },
      instruction: { label: "MERC.Skills.instruction", abilities: ["intelligence", "charisma"] },
      language_native: { label: "MERC.Skills.language_native", abilities: ["intelligence", "charisma"] },
      bureaucracy: { label: "MERC.Skills.bureaucracy", abilities: ["intelligence", "charisma"] },
      illegality: { label: "MERC.Skills.illegality", abilities: ["intelligence", "charisma"] },
      mathematics: { label: "MERC.Skills.mathematics", abilities: ["intelligence"] },
      metallurgy: { label: "MERC.Skills.metallurgy", abilities: ["intelligence"] },
      engineering: { label: "MERC.Skills.engineering", abilities: ["intelligence", "perception"] },
      electricity_electronics: { label: "MERC.Skills.electricity_electronics", abilities: ["intelligence"] },
      computer_science: { label: "MERC.Skills.computer_science", abilities: ["intelligence", "mental"] },
      geography: { label: "MERC.Skills.geography", abilities: ["intelligence", "perception"] },
      meteorology: { label: "MERC.Skills.meteorology", abilities: ["intelligence", "adaptation"] },
      navigation: { label: "MERC.Skills.navigation", abilities: ["intelligence"] },
      history_politics: { label: "MERC.Skills.history_politics", abilities: ["intelligence", "charisma"] },
      chemistry: { label: "MERC.Skills.chemistry", abilities: ["intelligence", "will"] },
      geology: { label: "MERC.Skills.geology", abilities: ["intelligence", "perception"] },
      nature: { label: "MERC.Skills.nature", abilities: ["intelligence", "adaptation"] },
      biology: { label: "MERC.Skills.biology", abilities: ["intelligence", "adaptation"] },
      human_medicine: { label: "MERC.Skills.human_medicine", abilities: ["intelligence", "will"] },
      surgery: { label: "MERC.Skills.surgery", abilities: ["will", "mental"] },
      construction_avionics: { label: "MERC.Skills.construction_avionics", abilities: ["intelligence", "dexterity"] },
      construction_vehicle: { label: "MERC.Skills.construction_vehicle", abilities: ["intelligence", "dexterity"] },
      construction_weaponry: { label: "MERC.Skills.construction_weaponry", abilities: ["intelligence", "dexterity"] },
      construction_tools: { label: "MERC.Skills.construction_tools", abilities: ["intelligence", "dexterity"] }
    }
  };

  CONFIG.Combat.documentClass = MercCombat;

  // Register Handlebars helpers
  Handlebars.registerHelper("filterItems", function(items, type) {
    if (!items) return [];
    return items.filter(item => item.type === type);
  });
  Handlebars.registerHelper("gt", function(a, b) {
    return a > b;
  });
  Handlebars.registerHelper("eq", function(a, b, options) {
    // Block helper usage: {{#eq a b}}content{{/eq}}
    if (options && typeof options.fn === "function") {
      return (a === b) ? options.fn(this) : (options.inverse ? options.inverse(this) : "");
    }
    // Inline usage: {{eq a b}} or inside {{#if (eq a b)}}
    return a === b;
  });
  Handlebars.registerHelper("mod", function(a, b) {
    return a % b;
  });
  Handlebars.registerHelper("or", function(...args) {
    const options = args.pop();
    return args.some(Boolean);
  });
  Handlebars.registerHelper("concat", function(...args) {
    return args.slice(0, -1).join("");
  });

  // Register Actor Sheets
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("merc", MercCharacterSheet, { types: ["character", "npc"], makeDefault: true });
  foundry.documents.collections.Actors.registerSheet("merc", MercVehicleSheet, { types: ["vehicle"], makeDefault: true });

  // Register Item Sheets
  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("merc", MercWeaponSheet, { types: ["weapon"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("merc", MercAmmoSheet, { types: ["ammo"], makeDefault: true });

  Hooks.on("preCreateCombat", (combat, data) => {
    data.flags = data.flags || {};
    data.flags.merc = data.flags.merc || {};
    if (data.flags.merc.segment === undefined) {
      data.flags.merc.segment = SEGMENT_MAX;
    }
  });

  Hooks.on("updateCombat", async (combat, changes, options) => {
    if (options?.mercSegmentUpdate) return;
    if (changes.round !== undefined) {
      const turns = buildSegmentTurns(combat, SEGMENT_MAX);
      const eligibleIds = getEligibleIdsForSegment(combat, SEGMENT_MAX);
      let firstEligible = turns.findIndex((combatant) => eligibleIds.has(combatant.id));
      if (firstEligible === -1) firstEligible = 0;
      await combat.update({
        "flags.merc.segment": SEGMENT_MAX,
        turn: firstEligible
      }, { mercSegmentUpdate: true });
    }
  });

  Hooks.on("renderCombatTracker", (app, html) => {
    const combat = game.combat;
    if (!combat || !(combat instanceof MercCombat)) return;

    const root = html?.[0] ?? html;
    if (!root) return;

    root.classList.add("merc-combat-tracker");

    const rollControls = root.querySelectorAll(
      '[data-control="rollAll"], [data-control="rollNPC"], [data-control="rollPC"], [data-control="roll"], .combatant-control.roll'
    );
    rollControls.forEach((control) => {
      control.style.display = "none";
      control.setAttribute("aria-hidden", "true");
      control.setAttribute("tabindex", "-1");
    });

    const existing = root.querySelector(".merc-segment-controls");
    if (existing) existing.remove();

    const header = root.querySelector(".combat-tracker-header") || root.querySelector("header") || root;
    if (!header) return;

    const container = document.createElement("div");
    container.className = "merc-segment-controls";

    const segmentLabel = game.i18n.format("MERC.UI.combat.segments.label", { segment: combat.currentSegment });
    const orderLabel = getSegmentOrderLabel(combat.currentSegment);
    const orderText = game.i18n.format("MERC.UI.combat.segments.order", { order: orderLabel });
    const prevTitle = game.i18n.localize("MERC.UI.combat.segments.previous");
    const nextTitle = game.i18n.localize("MERC.UI.combat.segments.next");
    const entries = buildSegmentEntries(combat, combat.currentSegment);
    const eligibleList = entries
      .map((entry) => {
        const degreeLabel = entry.degree >= 6 ? "6+" : String(entry.degree);
        return `${entry.name} (R${degreeLabel})`;
      })
      .join(", ");
    const eligibleText = entries.length
      ? game.i18n.format("MERC.UI.combat.segments.eligible", { list: eligibleList })
      : game.i18n.localize("MERC.UI.combat.segments.eligibleEmpty");

    container.innerHTML = `
      <button type="button" class="merc-segment-button" data-segment-delta="1" title="${prevTitle}">${prevTitle}</button>
      <span class="merc-segment-label">${segmentLabel}</span>
      <button type="button" class="merc-segment-button" data-segment-delta="-1" title="${nextTitle}">${nextTitle}</button>
      <span class="merc-segment-order">${orderText}</span>
    `;

    const eligibleSpan = document.createElement("span");
    eligibleSpan.className = "merc-segment-eligible";
    eligibleSpan.textContent = eligibleText;
    container.appendChild(eligibleSpan);

    container.querySelectorAll(".merc-segment-button").forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        const delta = Number(button.dataset.segmentDelta || 0);
        await combat.setSegment(combat.currentSegment + delta);
      });
    });

    header.appendChild(container);

    const eligibleIds = getEligibleIdsForSegment(combat, combat.currentSegment);
    const combatantElements = root.querySelectorAll(".combatant");
    combatantElements.forEach((element) => {
      const id = element.dataset?.combatantId;
      const combatant = id ? combat.combatants?.get(id) : null;
      if (combatant) {
        const degree = getReactionDegreeFromCombatant(combatant);
        const degreeLabel = degree >= 6 ? "6+" : String(degree);
        const reactionTitle = game.i18n.localize("MERC.Skills.reaction");
        const tokenInitiative = element.querySelector(".token-initiative");
        if (tokenInitiative) {
          tokenInitiative.textContent = `${degreeLabel}`;
          tokenInitiative.title = reactionTitle;
          tokenInitiative.classList.add("merc-reaction-initiative");
          tokenInitiative.setAttribute("aria-label", reactionTitle);
        }
      }
      if (id && !eligibleIds.has(id)) {
        element.classList.add("merc-combatant--ineligible");
      } else {
        element.classList.remove("merc-combatant--ineligible");
      }
    });
  });

  Hooks.on("createCombatant", (combatant) => {
    const combat = combatant?.combat;
    if (!combat || !(combat instanceof MercCombat)) return;
    ui.combat?.render(true);
  });
});

const DEFAULT_BIOGRAPHY = {
  age: "",
  height: 0,
  weight: 0,
  gender: "",
  origin: "",
  year: 0,
  renown: 0
};

const DEFAULT_ATTRIBUTES = {
  intelligence: { origin: 0, current: 0 },
  will: { origin: 0, current: 0 },
  mental: { origin: 0, current: 0 },
  charisma: { origin: 0, current: 0 },
  chance: { origin: 0, current: 0 },
  adaptation: { origin: 0, current: 0 },
  strength: { origin: 0, current: 0 },
  dexterity: { origin: 0, current: 0 },
  speed: { origin: 0, current: 0 },
  constitution: { origin: 0, current: 0 },
  perception: 0,
  perceptionDetail: {
    sight: 0,
    hearing: 0,
    taste: 0,
    smell: 0,
    touch: 0
  }
};

const DEFAULT_COMBAT = {
  endurance: 0,
  pointCorporence: 0,
  capaciteCharge: 0,
  bonusDiscretion: 0,
  bonusDissimulation: 0,
  corpulence: 0,
  baseDamageMelee: "1",
  baseDamageBladed: "1",
  specializationBaseDamage: {}
};

const DEFAULT_MOVEMENT = {
  reptation: 0,
  marche: 0,
  course: 0
};

// Locate the closest lower/equal value index in a lookup table.
const findTableIndex = (value, table) => {
  if (!value || value <= 0) return 0;
  for (let i = table.length - 1; i >= 0; i--) {
    if (value >= table[i]) return i;
  }
  return 0;
};

// Base combat calculations (movement, corpulence, bonuses), without damage formulas.
const computeCombatStatsBase = (system) => {
  const attrs = system?.attributes || {};
  const height = system?.biography?.height || 0;
  const weight = system?.biography?.weight || 0;
  const rapidite = attrs.speed?.current ?? attrs.speed ?? 0;

  const indexTaille = findTableIndex(height, STATS_TABLES.taille);
  const indexPoids = findTableIndex(weight, STATS_TABLES.poids);

  const attTaille = indexTaille - 11;
  const attPoids = indexPoids - 11;

  const avgAtt = (attTaille + attPoids) / 2;
  const corpulence = avgAtt > 5 ? Math.ceil(avgAtt) : Math.floor(avgAtt);
  const corpulenceTableIdx = Math.max(0, Math.min(31, corpulence + 11));
  const indexVitesse = Math.max(0, Math.min(31, corpulence + rapidite - 5 + 11));

  const volonte = attrs.will?.current ?? attrs.will ?? 0;
  const constitution = attrs.constitution?.current ?? attrs.constitution ?? 0;
  const endurance = Math.floor((volonte + constitution) / 2);

  const pcAjust = STATS_TABLES.ajustementPC[corpulenceTableIdx] || 0;
  const pointCorporence = constitution + pcAjust;

  const force = attrs.strength?.current ?? attrs.strength ?? 0;
  const capaciteCharge = (force + constitution) * 2;

  const bonusDiscretion = STATS_TABLES.discretion[corpulenceTableIdx] || 0;
  const bonusDissimulation = STATS_TABLES.dissimulation[corpulenceTableIdx] || 0;

  return {
    endurance: Math.max(0, endurance),
    pointCorporence: Math.max(0, pointCorporence),
    capaciteCharge: Math.max(0, capaciteCharge),
    bonusDiscretion,
    bonusDissimulation,
    corpulence,
    vitesses: {
      reptation: STATS_TABLES.reptation[indexVitesse] || 0,
      marche: STATS_TABLES.marche[indexVitesse] || 0,
      course: STATS_TABLES.course[indexVitesse] || 0
    },
    indexVitesse,
    indexTaille,
    indexPoids,
    force
  };
};

// Full combat calculations including base damage from skills/force.
const computeCombatStatsFromSystem = (system) => {
  const baseStats = computeCombatStatsBase(system);
  const skills = system?.skills || {};

  const meleeSkill = { abilities: CONFIG.MERC.skills?.melee?.abilities || [], ...(skills.melee || {}) };
  const bladedSkill = { abilities: CONFIG.MERC.skills?.bladed_weapons?.abilities || [], ...(skills.bladed_weapons || {}) };
  const meleeDegree = computeSkillDegreeFromSystem(system, "melee", meleeSkill);
  const bladedDegree = computeSkillDegreeFromSystem(system, "bladed_weapons", bladedSkill);
  const baseDamageMelee = getBaseDamageFromTable(baseStats.force, meleeDegree);
  const baseDamageBladed = getBaseDamageFromTable(baseStats.force, bladedDegree);

  const specializationBaseDamage = {};
  const customSpecializations = system?.customSpecializations || {};
  for (const [specName, specData] of Object.entries(customSpecializations)) {
    if (!specData) continue;
    const baseSkillKey = specData.baseSkill || "";
    if (baseSkillKey !== "melee" && baseSkillKey !== "bladed_weapons") continue;
    const skillData = { ...specData, abilities: specData.abilities || [] };
    const degree = computeSkillDegreeFromSystem(system, `custom_spec_${specName}`, skillData);
    specializationBaseDamage[`custom_spec_${specName}`] = getBaseDamageFromTable(baseStats.force, degree);
  }

  return {
    ...baseStats,
    baseDamageMelee,
    baseDamageBladed,
    specializationBaseDamage
  };
};

// Build migration patch to fill missing fields on existing actors.
const getActorMigrationData = (actor) => {
  const updateData = {};
  const system = actor.system || {};

  // --- Vehicle migration (separate data model) ---
  if (actor.type === "vehicle") {
    const vehicleDefaults = {
      price: 0,
      rarity: "common",
      fireControlBonus: 0,
      fuelType: "diesel",
      stabilization: "none",
      load: 0,
      ptac: 0,
      crew: "",
      maintenance: "",
      nightVision: "headlights",
      nrbc: "open",
      trMov: 0,
      comMov: 0,
      fuelCap: 0,
      fuelCons: 0,
      notes: ""
    };
    for (const [key, defaultValue] of Object.entries(vehicleDefaults)) {
      if (system[key] === undefined || system[key] === null) {
        updateData[`system.${key}`] = defaultValue;
      }
    }
    return updateData;
  }

  // --- Character / NPC migration below ---

  if (system.skills?.language_serbian && !system.skills?.language_native) {
    updateData["system.skills.language_native"] = foundry.utils.duplicate(system.skills.language_serbian);
    updateData["system.skills.-=language_serbian"] = null;
  }

  // Ensure notes field exists
  if (system.notes === undefined || system.notes === null) {
    updateData["system.notes"] = "";
  }

  // Ensure customLanguages exists
  if (system.customLanguages === undefined || system.customLanguages === null) {
    updateData["system.customLanguages"] = {};
  }

  // Ensure customSpecializations exists
  if (system.customSpecializations === undefined || system.customSpecializations === null) {
    updateData["system.customSpecializations"] = {};
  }

  // Remove obsolete hardcoded specialization skills (replaced by user-defined customSpecializations)
  const obsoleteSkills = ["spec_melee_mma", "spec_blades_knife", "spec_powder_ak47"];
  if (system.skills) {
    for (const key of obsoleteSkills) {
      if (system.skills[key] !== undefined) {
        updateData[`system.skills.-=${key}`] = null;
      }
    }
  }

  if (!system.biography) {
    for (const [key, value] of Object.entries(DEFAULT_BIOGRAPHY)) {
      updateData[`system.biography.${key}`] = value;
    }
  }

  if (!system.attributes) {
    for (const [key, value] of Object.entries(DEFAULT_ATTRIBUTES)) {
      updateData[`system.attributes.${key}`] = foundry.utils.duplicate(value);
    }
  } else {
    for (const [key, value] of Object.entries(DEFAULT_ATTRIBUTES)) {
      const current = foundry.utils.getProperty(system, `attributes.${key}`);
      const path = `system.attributes.${key}`;

      if (current === undefined) {
        updateData[path] = foundry.utils.duplicate(value);
        continue;
      }

      if (typeof value === "object" && value !== null && ("origin" in value || "current" in value)) {
        if (typeof current !== "object" || current === null) {
          const num = Number(current ?? 0);
          updateData[path] = { origin: num, current: num };
        } else {
          if (current.origin === undefined) updateData[`${path}.origin`] = Number(current.current ?? 0);
          if (current.current === undefined) updateData[`${path}.current`] = Number(current.origin ?? 0);
        }
      }
    }

    const perceptionDetail = system.attributes?.perceptionDetail;
    if (!perceptionDetail) {
      updateData["system.attributes.perceptionDetail"] = foundry.utils.duplicate(DEFAULT_ATTRIBUTES.perceptionDetail);
    } else {
      for (const [subKey, subValue] of Object.entries(DEFAULT_ATTRIBUTES.perceptionDetail)) {
        if (perceptionDetail[subKey] === undefined) {
          updateData[`system.attributes.perceptionDetail.${subKey}`] = subValue;
        }
      }
    }
  }

  if (!system.skills) {
    for (const [key, def] of Object.entries(CONFIG.MERC.skills)) {
      updateData[`system.skills.${key}`] = {
        base: 0,
        dev: 0,
        bonus: 0,
        degree: 0,
        abilities: def.abilities || []
      };
    }
  } else {
    for (const [key, def] of Object.entries(CONFIG.MERC.skills)) {
      const skill = system.skills[key];
      if (!skill) {
        updateData[`system.skills.${key}`] = {
          base: 0,
          dev: 0,
          bonus: 0,
          degree: 0,
          abilities: def.abilities || []
        };
        continue;
      }

      if (skill.base === undefined) updateData[`system.skills.${key}.base`] = 0;
      if (skill.dev === undefined) updateData[`system.skills.${key}.dev`] = 0;
      if (skill.bonus === undefined) updateData[`system.skills.${key}.bonus`] = 0;
      if (skill.degree === undefined) updateData[`system.skills.${key}.degree`] = 0;
      if (skill.abilities === undefined) updateData[`system.skills.${key}.abilities`] = def.abilities || [];
    }
  }

  if (!system.combat) {
    for (const [key, value] of Object.entries(DEFAULT_COMBAT)) {
      updateData[`system.combat.${key}`] = value;
    }
  } else {
    for (const [key, value] of Object.entries(DEFAULT_COMBAT)) {
      if (system.combat?.[key] === undefined) {
        updateData[`system.combat.${key}`] = value;
      }
    }
  }

  if (!system.movement) {
    for (const [key, value] of Object.entries(DEFAULT_MOVEMENT)) {
      updateData[`system.movement.${key}`] = value;
    }
  } else {
    for (const [key, value] of Object.entries(DEFAULT_MOVEMENT)) {
      if (system.movement?.[key] === undefined) {
        updateData[`system.movement.${key}`] = value;
      }
    }
  }

  const needsCombatValues =
    system.combat?.endurance === undefined ||
    system.combat?.pointCorporence === undefined ||
    system.combat?.capaciteCharge === undefined ||
    system.combat?.bonusDiscretion === undefined ||
    system.combat?.bonusDissimulation === undefined ||
    system.movement?.reptation === undefined ||
    system.movement?.marche === undefined ||
    system.movement?.course === undefined;

  if (needsCombatValues) {
    const mergedSystem = foundry.utils.mergeObject(
      foundry.utils.duplicate(system),
      foundry.utils.expandObject(updateData),
      { inplace: false }
    );
    const computed = computeCombatStatsFromSystem(mergedSystem);

    updateData["system.combat.endurance"] = computed.endurance;
    updateData["system.combat.pointCorporence"] = computed.pointCorporence;
    updateData["system.combat.capaciteCharge"] = computed.capaciteCharge;
    updateData["system.combat.bonusDiscretion"] = computed.bonusDiscretion;
    updateData["system.combat.bonusDissimulation"] = computed.bonusDissimulation;
    updateData["system.combat.corpulence"] = computed.corpulence;
    updateData["system.combat.baseDamageMelee"] = computed.baseDamageMelee;
    updateData["system.combat.baseDamageBladed"] = computed.baseDamageBladed;
    updateData["system.combat.specializationBaseDamage"] = computed.specializationBaseDamage;
    updateData["system.movement.reptation"] = computed.vitesses.reptation;
    updateData["system.movement.marche"] = computed.vitesses.marche;
    updateData["system.movement.course"] = computed.vitesses.course;
  }

  return updateData;
};

Hooks.once("ready", async () => {
  if (!game.user.isGM) return;

  const currentVersion = game.system.version;
  const lastMigrated = game.settings.get("merc", "systemMigrationVersion");

  if (currentVersion !== lastMigrated) {
    console.log(`MERC | Migration needed: ${lastMigrated || "none"} → ${currentVersion}`);
    await migrateWorld();
    await game.settings.set("merc", "systemMigrationVersion", currentVersion);
    console.log(`MERC | Migration complete. Version set to ${currentVersion}`);
  }
});

// Hook for initializing actor data
Hooks.on("preCreateActor", (actor, data, options, userId) => {
  // Vehicles use their own data model — skip character defaults
  if (data.type === "vehicle") return;

  if (!data.system) {
    data.system = {};
  }
  
  const systemData = {
    biography: foundry.utils.deepClone(DEFAULT_BIOGRAPHY),
    attributes: foundry.utils.deepClone(DEFAULT_ATTRIBUTES),
    combat: foundry.utils.deepClone(DEFAULT_COMBAT),
    movement: foundry.utils.deepClone(DEFAULT_MOVEMENT),
    notes: "",
    customLanguages: {},
    customSpecializations: {},
    skills: Object.fromEntries(
      Object.entries(CONFIG.MERC.skills).map(([key, def]) => [
        key,
        {
          base: 0,
          dev: 0,
          bonus: 0,
          degree: 0,
          abilities: def.abilities || []
        }
      ])
    )
  };
  
  data.system = foundry.utils.mergeObject(data.system, systemData);
});

// Hook to update combat statistics when actor data changes
Hooks.on("updateActor", async (actor, changes, options, userId) => {
  // Only update for character and npc actors
  if (actor.type !== "character" && actor.type !== "npc") return;
  
  // Prevent recursion when we're the ones updating combat stats
  if (options.isRecalculatingCombatStats) return;
  
  // Check if we need to recalculate combat stats
  const needsUpdate =
    changes.system?.biography?.height !== undefined ||
    changes.system?.biography?.weight !== undefined ||
    changes.system?.attributes?.will !== undefined ||
    changes.system?.attributes?.constitution !== undefined ||
    changes.system?.attributes?.strength !== undefined ||
    changes.system?.attributes?.speed !== undefined;
  
  // Check if linked skills changed (melee or bladed_weapons dev/bonus/degree)
  const meleeChanged = 
    changes.system?.skills?.melee?.dev !== undefined ||
    changes.system?.skills?.melee?.bonus !== undefined ||
    changes.system?.skills?.melee?.degree !== undefined;
    
  const bladedChanged = 
    changes.system?.skills?.bladed_weapons?.dev !== undefined ||
    changes.system?.skills?.bladed_weapons?.bonus !== undefined ||
    changes.system?.skills?.bladed_weapons?.degree !== undefined;
  
  const customSpecChanged = changes.system?.customSpecializations !== undefined;
  const skillsChanged = meleeChanged || bladedChanged || customSpecChanged;
  
  if (!needsUpdate && !skillsChanged) return;
  
  // Recalculate using the current actor data (which now has the updates)
  const stats = computeCombatStatsFromSystem(actor.system);
  
  if (stats) {
    const updateData = {};
    
    // Always update base damage if skills changed
    if (skillsChanged) {
      updateData["system.combat.baseDamageMelee"] = stats.baseDamageMelee;
      updateData["system.combat.baseDamageBladed"] = stats.baseDamageBladed;
      updateData["system.combat.specializationBaseDamage"] = stats.specializationBaseDamage;
    }
    
    // Update combat stats if attributes/biometrics changed
    if (needsUpdate) {
      updateData["system.combat.endurance"] = stats.endurance;
      updateData["system.combat.pointCorporence"] = stats.pointCorporence;
      updateData["system.combat.capaciteCharge"] = stats.capaciteCharge;
      updateData["system.combat.bonusDiscretion"] = stats.bonusDiscretion;
      updateData["system.combat.bonusDissimulation"] = stats.bonusDissimulation;
      updateData["system.combat.corpulence"] = stats.corpulence;
      updateData["system.movement.reptation"] = stats.vitesses.reptation;
      updateData["system.movement.marche"] = stats.vitesses.marche;
      updateData["system.movement.course"] = stats.vitesses.course;
      updateData["system.combat.specializationBaseDamage"] = stats.specializationBaseDamage;
    }
    
    // Update base damage in both cases (needs recalc)
    if (!skillsChanged && needsUpdate) {
      updateData["system.combat.baseDamageMelee"] = stats.baseDamageMelee;
      updateData["system.combat.baseDamageBladed"] = stats.baseDamageBladed;
      updateData["system.combat.specializationBaseDamage"] = stats.specializationBaseDamage;
    }
    
    if (Object.keys(updateData).length > 0) {
      await actor.update(updateData, { render: true, isRecalculatingCombatStats: true });
    }
  }
});

// Re-render open weapon sheets when ammo items change
function rerenderWeaponSheetsForAmmo(ammoItem) {
  const raw = ammoItem?.system?.parentWeaponId;
  if (!raw) return;

  const actor = ammoItem.parent;
  if (actor) {
    // Embedded item — single parentWeaponId
    const weapon = actor.items.get(raw);
    if (weapon?.sheet?.rendered) weapon.sheet.render();
  } else {
    // World-level item — may have multiple comma-separated weapon IDs
    const weaponIds = raw.split(",").filter(id => id);
    for (const wid of weaponIds) {
      const weapon = game.items?.get(wid);
      if (weapon?.sheet?.rendered) weapon.sheet.render();
    }
  }
}

// Also cascade-delete world-level ammo when a world-level weapon is deleted
Hooks.on("deleteItem", (item, options, userId) => {
  if (item.type === "ammo") {
    rerenderWeaponSheetsForAmmo(item);
  }
  // Cascade unlink: if a world-level weapon is deleted, remove its ID from linked world ammo
  // Delete the ammo only if it has no remaining weapon links
  if (item.type === "weapon" && !item.parent) {
    const linkedAmmo = game.items?.filter(i => i.type === "ammo" && ammoIsLinkedToWeapon(i, item.id)) ?? [];
    for (const ammo of linkedAmmo) {
      const newIds = removeWeaponIdFromAmmo(ammo.system?.parentWeaponId, item.id);
      if (!newIds) {
        ammo.delete();
      } else {
        ammo.update({ "system.parentWeaponId": newIds });
      }
    }
  }
});

Hooks.on("updateItem", (item, changes, options, userId) => {
  if (item.type === "ammo") {
    rerenderWeaponSheetsForAmmo(item);
  }
});

Hooks.on("createItem", (item, options, userId) => {
  if (item.type === "ammo") {
    rerenderWeaponSheetsForAmmo(item);
  }
});





