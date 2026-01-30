/**
 * Initialize portrait image selection functionality
 * Uses Foundry's native FilePicker API to browse the image library
 */
function initPortraitSelection(actor) {
  const browseBtn = document.querySelector('.portrait-browse-btn');
  const portraitImg = document.querySelector('.character-portrait');
  
  if (!browseBtn) return;
  
  // Click button to open Foundry's FilePicker
  browseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    new FilePicker({
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
    new FilePicker({
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

function setCharacterPortrait(imageUrl) {
  const portraitElement = document.querySelector('.character-portrait');
  if (portraitElement) {
    portraitElement.src = imageUrl;
  }
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

// Define MercCharacterSheet here directly
class MercCharacterSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    classes: ["merc", "sheet", "actor"],
    width: 800,
    height: 900,
    resizable: true,
    minWidth: 800,
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
    
    const attrs = actor.system?.attributes;
    if (!attrs) return 0;
    
    // Get current values of linked attributes
    const getAttrValue = (attrKey) => {
      const attr = attrs[attrKey];
      return typeof attr === 'object' ? (attr.current ?? 0) : (attr ?? 0);
    };
    
    const abilities = skillData.abilities || [];
    if (abilities.length === 0) return 0;
    
    if (abilities.length === 1) {
      // Single attribute: 30 - (ATTR * 2)
      const attrValue = getAttrValue(abilities[0]);
      return 30 - (attrValue * 2);
    } else if (abilities.length === 2) {
      // Two attributes: 30 - (ATTR1 + ATTR2)
      const attr1Value = getAttrValue(abilities[0]);
      const attr2Value = getAttrValue(abilities[1]);
      return 30 - (attr1Value + attr2Value);
    }
    
    return 0;
  }

  // Calculate Degré using the lookup table based on base and dev
  computeSkillDegree(actor, skillKey, skillData) {
    if (!actor || !skillData) return 0;
    
    // Get base value (computed from attributes)
    const base = this.computeSkillBase(actor, skillKey, skillData);
    
    // Get dev value (directly from skill data)
    const dev = Number(skillData.dev ?? 0);
    
    // Use the lookup table to find degree
    return getDegreeFromTable(base, dev);
  }

  async _prepareContext(options) {
    const data = await super._prepareContext(options);
    const actorDoc = this.actor ?? this.document;

    // Migrate existing actors without biography data
    if (actorDoc && !actorDoc.system?.biography) {
      await actorDoc.update({
        "system.biography": {
          age: "",
          height: 0,
          weight: 0,
          gender: "",
          origin: "",
          year: 0,
          renown: 0
        }
      });
    }

    const defaultAttributes = {
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
      const mergedAttributes = foundry.utils.mergeObject(defaultAttributes, normalizedAttributes, { inplace: false, overwrite: true });

      const hasMissingAttributes =
        typeof currentAttributes.intelligence !== "object" ||
        currentAttributes.intelligence?.origin === undefined ||
        currentAttributes.intelligence?.current === undefined ||
        typeof currentAttributes.will !== "object" ||
        currentAttributes.will?.origin === undefined ||
        currentAttributes.will?.current === undefined ||
        typeof currentAttributes.mental !== "object" ||
        currentAttributes.mental?.origin === undefined ||
        currentAttributes.mental?.current === undefined ||
        typeof currentAttributes.charisma !== "object" ||
        currentAttributes.charisma?.origin === undefined ||
        currentAttributes.charisma?.current === undefined ||
        typeof currentAttributes.chance !== "object" ||
        currentAttributes.chance?.origin === undefined ||
        currentAttributes.chance?.current === undefined ||
        typeof currentAttributes.adaptation !== "object" ||
        currentAttributes.adaptation?.origin === undefined ||
        currentAttributes.adaptation?.current === undefined ||
        typeof currentAttributes.strength !== "object" ||
        currentAttributes.strength?.origin === undefined ||
        currentAttributes.strength?.current === undefined ||
        typeof currentAttributes.dexterity !== "object" ||
        currentAttributes.dexterity?.origin === undefined ||
        currentAttributes.dexterity?.current === undefined ||
        typeof currentAttributes.speed !== "object" ||
        currentAttributes.speed?.origin === undefined ||
        currentAttributes.speed?.current === undefined ||
        typeof currentAttributes.constitution !== "object" ||
        currentAttributes.constitution?.origin === undefined ||
        currentAttributes.constitution?.current === undefined ||
        currentAttributes.perception === undefined ||
        currentAttributes.perceptionDetail?.sight === undefined ||
        currentAttributes.perceptionDetail?.hearing === undefined ||
        currentAttributes.perceptionDetail?.taste === undefined ||
        currentAttributes.perceptionDetail?.smell === undefined ||
        currentAttributes.perceptionDetail?.touch === undefined;

      if (hasMissingAttributes) {
        await actorDoc.update({ "system.attributes": mergedAttributes });
      }
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
      data.actor.system.biography = {
        age: "",
        height: 0,
        weight: 0,
        gender: "",
        origin: "",
        year: 0,
        renown: 0
      };
    }
    if (!data.actor.system.attributes) {
      data.actor.system.attributes = defaultAttributes;
    }
    const defaultSkills = {
        reaction: { value: 0, abilities: ["speed"] },
        melee: { value: 0, abilities: ["strength", "dexterity"] },
        bladed_weapons: { value: 0, abilities: ["strength", "dexterity"] },
        mechanical_projectiles: { value: 0, abilities: ["dexterity", "perception"] },
        powder_projectiles: { value: 0, abilities: ["dexterity", "perception"] },
        throwing: { value: 0, abilities: ["strength", "perception"] },
        maneuvers: { value: 0, abilities: ["dexterity", "speed"] },
        heavy_weapons: { value: 0, abilities: ["strength", "perception"] },
        electronic_weapons: { value: 0, abilities: ["intelligence", "dexterity"] },
        running: { value: 0, abilities: ["constitution", "speed"] },
        climbing: { value: 0, abilities: ["adaptation", "dexterity"] },
        swimming: { value: 0, abilities: ["constitution", "dexterity"] },
        sliding: { value: 0, abilities: ["dexterity", "speed"] },
        air_sliding: { value: 0, abilities: ["dexterity", "speed"] },
        drive_wheeled: { value: 0, abilities: ["dexterity", "perception"] },
        drive_motorcycle: { value: 0, abilities: ["dexterity", "perception"] },
        drive_boats: { value: 0, abilities: ["dexterity", "perception"] },
        drive_tracked: { value: 0, abilities: ["dexterity", "perception"] },
        drive_planes: { value: 0, abilities: ["speed", "perception"] },
        drive_helicopters: { value: 0, abilities: ["speed", "perception"] },
        riding: { value: 0, abilities: ["charisma", "mental"] },
        tracking: { value: 0, abilities: ["intelligence", "perception"] },
        stealth: { value: 0, abilities: ["dexterity", "charisma"] },
        concealment: { value: 0, abilities: ["adaptation", "perception"] },
        pickpocket: { value: 0, abilities: ["dexterity", "charisma"] },
        lockpicking: { value: 0, abilities: ["dexterity", "perception"] },
        tinkering: { value: 0, abilities: ["adaptation", "dexterity"] },
        forgery: { value: 0, abilities: ["will", "dexterity"] },
        survival: { value: 0, abilities: ["adaptation", "speed"] },
        eloquence: { value: 0, abilities: ["intelligence", "charisma"] },
        acting: { value: 0, abilities: ["charisma", "adaptation"] },
        interrogation: { value: 0, abilities: ["intelligence", "adaptation"] },
        command: { value: 0, abilities: ["will", "charisma"] },
        instruction: { value: 0, abilities: ["intelligence", "charisma"] },
        language_serbian: { value: 0, abilities: ["intelligence", "charisma"] },
        language_arabic: { value: 0, abilities: ["intelligence", "charisma"] },
        language_english: { value: 0, abilities: ["intelligence", "charisma"] },
        language_russian: { value: 0, abilities: ["intelligence", "charisma"] },
        language_french: { value: 0, abilities: ["intelligence", "charisma"] },
        language_other_1: { value: 0, abilities: ["intelligence", "charisma"] },
        language_other_2: { value: 0, abilities: ["intelligence", "charisma"] },
        bureaucracy: { value: 0, abilities: ["intelligence", "charisma"] },
        illegality: { value: 0, abilities: ["intelligence", "charisma"] },
        mathematics: { value: 0, abilities: ["intelligence"] },
        metallurgy: { value: 0, abilities: ["intelligence"] },
        engineering: { value: 0, abilities: ["intelligence", "perception"] },
        electricity_electronics: { value: 0, abilities: ["intelligence"] },
        computer_science: { value: 0, abilities: ["intelligence", "mental"] },
        geography: { value: 0, abilities: ["intelligence", "perception"] },
        meteorology: { value: 0, abilities: ["intelligence", "adaptation"] },
        navigation: { value: 0, abilities: ["intelligence"] },
        history_politics: { value: 0, abilities: ["intelligence", "charisma"] },
        chemistry: { value: 0, abilities: ["intelligence", "will"] },
        geology: { value: 0, abilities: ["intelligence", "perception"] },
        nature: { value: 0, abilities: ["intelligence", "adaptation"] },
        biology: { value: 0, abilities: ["intelligence", "adaptation"] },
        human_medicine: { value: 0, abilities: ["intelligence", "will"] },
        surgery: { value: 0, abilities: ["will", "mental"] },
        construction_avionics: { value: 0, abilities: ["intelligence", "dexterity"] },
        construction_vehicle: { value: 0, abilities: ["intelligence", "dexterity"] },
        construction_weaponry: { value: 0, abilities: ["intelligence", "dexterity"] },
        construction_tools: { value: 0, abilities: ["intelligence", "dexterity"] },
        spec_melee_mma: { value: 0, abilities: ["strength", "perception"] },
        spec_blades_knife: { value: 0, abilities: ["strength", "dexterity"] },
        spec_powder_ak47: { value: 0, abilities: ["dexterity", "perception"] }
    };
    const buildDefaultSkillSet = (skillDefs) => {
      const result = {};
      for (const [key, def] of Object.entries(skillDefs)) {
        result[key] = {
          base: 0,
          dev: 0,
          bonus: 0,
          degree: 0,
          abilities: def.abilities || []
        };
      }
      return result;
    };

    const defaultSkillSet = buildDefaultSkillSet(defaultSkills);
    if (!data.actor.system.skills) {
      data.actor.system.skills = foundry.utils.deepClone(defaultSkillSet);
      // Persist skills to actor if they were just created
      await actorDoc.update({ "system.skills": data.actor.system.skills });
    } else {
      data.actor.system.skills = foundry.utils.mergeObject(defaultSkillSet, data.actor.system.skills, {
        inplace: false,
        overwrite: true
      });
    }

    // Prepare skills list for display
    data.skillList = [];
    if (data.actor.system.skills) {
      for (const skillKey of Object.keys(defaultSkills)) {
        const skillData = data.actor.system.skills[skillKey] ?? defaultSkillSet[skillKey];
        const base = this.computeSkillBase(actorDoc, skillKey, skillData);
        const dev = Number(skillData.dev ?? skillData.value ?? 0);
        const degree = this.computeSkillDegree(actorDoc, skillKey, skillData);
        const bonus = Number(skillData.bonus ?? 0);
        
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
        const displayLabel = requiredText ? `${baseLabel} (${requiredText})` : baseLabel;
        
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
          prerequisitesText: prereqsText
        });
      }
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
      makeGroup("languages", game.i18n.localize("MERC.SkillGroups.languages"), [
        "language_serbian",
        "language_arabic",
        "language_english",
        "language_russian",
        "language_french",
        "language_other_1",
        "language_other_2"
      ]),
      makeGroup("knowledge", game.i18n.localize("MERC.SkillGroups.knowledge"), [
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
      ]),
      makeGroup("construction", game.i18n.localize("MERC.SkillGroups.construction"), [
        "construction_avionics",
        "construction_vehicle",
        "construction_weaponry",
        "construction_tools"
      ]),
      makeGroup("specializations", game.i18n.localize("MERC.SkillGroups.specializations"), [
        "spec_melee_mma",
        "spec_blades_knife",
        "spec_powder_ak47"
      ])
    ];

    const remaining = data.skillList.filter(skill => !usedKeys.has(skill.key));
    if (remaining.length) {
      data.skillGroups.push({ id: "other", label: game.i18n.localize("MERC.SkillGroups.other"), skills: remaining });
    }

    return data;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    
    const html = this.element;
    if (!html) return;

    // Initialize portrait selection with Foundry FilePicker
    initPortraitSelection(this.actor);

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

          console.log(`[Merc] Field persisted -> ${fieldPath}:`, value);
          
          // Special handling for attribute current changes
          if (fieldPath.startsWith("system.attributes.") && fieldPath.endsWith(".current")) {
            // Update actor first (this updates this.actor.system)
            await this.actor.update({ [fieldPath]: value });
            
            // Now calculate stats with the updated data
            const stats = this.calculateCombatStats();
            if (stats) {
              const updateData = {
                "system.combat.endurance": stats.endurance,
                "system.combat.pointCorporence": stats.pointCorporence,
                "system.combat.capaciteCharge": stats.capaciteCharge,
                "system.combat.bonusDiscretion": stats.bonusDiscretion,
                "system.combat.bonusDissimulation": stats.bonusDissimulation,
                "system.combat.corpulence": stats.corpulence,
                "system.combat.baseDamageMelee": stats.baseDamageMelee,
                "system.combat.baseDamageBladed": stats.baseDamageBladed,
                "system.movement.reptation": stats.vitesses.reptation,
                "system.movement.marche": stats.vitesses.marche,
                "system.movement.course": stats.vitesses.course
              };
              
              await this.actor.update(updateData, { render: false });
            }
            
            await this.render();
            return;
          }
          
          // Special handling for melee/bladed_weapons dev changes
          if (fieldPath === "system.skills.melee.dev" || fieldPath === "system.skills.bladed_weapons.dev") {
            const skillKey = fieldPath.includes("melee.") ? "melee" : "bladed_weapons";
            const skillData = { ...this.actor.system.skills[skillKey], dev: value };
            const newDegree = this.computeSkillDegree(this.actor, skillKey, skillData);
            
            // Update local actor data to match what we're about to persist
            this.actor.system.skills[skillKey].dev = value;
            this.actor.system.skills[skillKey].degree = newDegree;
            
            // Calculate stats with updated local data
            const stats = this.calculateCombatStats();
            
            // Update combat stats in local data
            this.actor.system.combat.baseDamageMelee = stats.baseDamageMelee;
            this.actor.system.combat.baseDamageBladed = stats.baseDamageBladed;
            // Single update with all changes
            const updateData = {
              [fieldPath]: value,
              [fieldPath.replace(".dev", ".degree")]: newDegree,
              "system.combat.baseDamageMelee": stats.baseDamageMelee,
              "system.combat.baseDamageBladed": stats.baseDamageBladed
            };
            
            // Update without triggering render (we'll do it manually)
            await this.actor.update(updateData, { render: false });
            
            // Render immediately with updated data already in memory
            await this.render();
          } else {
            await this.actor.update({ [fieldPath]: value });
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
        const originPath = input.name; // e.g., "system.attributes.strength.origin"
        const currentPath = originPath.replace(".origin", ".current");
        const value = Number(input.value) || 0;
        
        // Update actor first (this updates this.actor.system)
        await this.actor.update({ [currentPath]: value });
        
        // Now calculate stats with the updated data
        const stats = this.calculateCombatStats();
        
        // Update all derived combat stats
        const updateData = {};
        
        if (stats) {
          updateData["system.combat.endurance"] = stats.endurance;
          updateData["system.combat.pointCorporence"] = stats.pointCorporence;
          updateData["system.combat.capaciteCharge"] = stats.capaciteCharge;
          updateData["system.combat.bonusDiscretion"] = stats.bonusDiscretion;
          updateData["system.combat.bonusDissimulation"] = stats.bonusDissimulation;
          updateData["system.combat.corpulence"] = stats.corpulence;
          updateData["system.combat.baseDamageMelee"] = stats.baseDamageMelee;
          updateData["system.combat.baseDamageBladed"] = stats.baseDamageBladed;
          updateData["system.movement.reptation"] = stats.vitesses.reptation;
          updateData["system.movement.marche"] = stats.vitesses.marche;
          updateData["system.movement.course"] = stats.vitesses.course;
          
          await this.actor.update(updateData, { render: false });
        }
        
        await this.render();
        console.log(`[Merc] Synced ${originPath} to ${currentPath}:`, value);
      });
    });

    // Synchronize perception main value to all sub-attributes
    const perceptionMainInput = html.querySelector('input[name="system.attributes.perception"]');
    if (perceptionMainInput) {
      perceptionMainInput.addEventListener("change", async (event) => {
        const perceptionValue = Number(perceptionMainInput.value) || 0;
        const perceptionDetail = {
          "system.attributes.perceptionDetail.sight": perceptionValue,
          "system.attributes.perceptionDetail.hearing": perceptionValue,
          "system.attributes.perceptionDetail.taste": perceptionValue,
          "system.attributes.perceptionDetail.smell": perceptionValue,
          "system.attributes.perceptionDetail.touch": perceptionValue
        };
        
        await this.actor.update(perceptionDetail);
        console.log(`[Merc] Synced perception to all sub-attributes:`, perceptionValue);
      });
    }

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
        const skillItem = btn.closest(".skill-item");
        const skillKey = skillItem.dataset.skill;
        this.rollSkillCheck(skillKey);
      });
    });

    // Update button colors when degree or bonus inputs change
    const skillInputs = html.querySelectorAll(".skill-item input");
    skillInputs.forEach(input => {
      input.addEventListener("change", (event) => {
        const skillItem = input.closest(".skill-item");
        const btn = skillItem?.querySelector(".skill-roll-btn");
        if (btn) {
          updateButtonColor(btn);
        }
        
        // If dev input changed, validate prerequisites
        if (input.name && input.name.includes(".dev")) {
          const skillKey = skillItem?.dataset.skill;
          if (skillKey) {
            const unlockStatus = checkSkillUnlocked(this.actor, skillKey);
            
            // If skill is locked, prevent adding dev points
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
            
            // Recalculate base damage if melee or bladed weapons changed
            if (skillKey === "melee" || skillKey === "bladed_weapons") {
              const stats = this.calculateCombatStats();
              if (stats) {
                this.actor.update({
                  "system.combat.baseDamageMelee": stats.baseDamageMelee,
                  "system.combat.baseDamageBladed": stats.baseDamageBladed
                }, { render: false });
              }
            }
          }
        }
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

    // Initialize combat statistics calculations
    const stats = this.calculateCombatStats();
    if (stats) {
      this.actor.update({
        "system.combat.endurance": stats.endurance,
        "system.combat.pointCorporence": stats.pointCorporence,
        "system.combat.capaciteCharge": stats.capaciteCharge,
        "system.combat.bonusDiscretion": stats.bonusDiscretion,
        "system.combat.bonusDissimulation": stats.bonusDissimulation,
        "system.combat.corpulence": stats.corpulence,
        "system.combat.baseDamageMelee": stats.baseDamageMelee,
        "system.combat.baseDamageBladed": stats.baseDamageBladed,
        "system.movement.reptation": stats.vitesses.reptation,
        "system.movement.marche": stats.vitesses.marche,
        "system.movement.course": stats.vitesses.course
      }, { render: false });
      
    }
  }

  async _updateObject(event, formData) {
    // Only update fields that actually changed and ignore null/undefined values
    const updateData = {};
    for (const [path, rawValue] of Object.entries(formData)) {
      if (rawValue === null || rawValue === undefined) continue;

      const currentValue = foundry.utils.getProperty(this.actor, path);
      let value = rawValue;

      if (typeof currentValue === "number" && rawValue !== "" && rawValue !== null) {
        const numberValue = Number(rawValue);
        if (!Number.isNaN(numberValue)) {
          value = numberValue;
        }
      }

      if (value === currentValue) continue;
      updateData[path] = value;
    }

    if (Object.keys(updateData).length === 0) {
      console.log("[Merc] Form submit: no changes detected");
      return;
    }

    console.log("[Merc] Form submit update:", updateData);
    return this.actor.update(updateData);
  }

  async rollAbilityCheck(abilityKey) {
    const actor = this.actor ?? this.document;
    const systemData = actor.system || actor._source?.system || {};
    
    // If no attributes, initialize them from the actor update
    if (!systemData.attributes) {
      await actor.update({
        "system.attributes": {
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
        }
      });
      ui.notifications.info(game.i18n.localize("MERC.Labels.attributesInitialized"));
      return;
    }
    
    const rawAbility = systemData.attributes?.[abilityKey];
    const abilityScore = Number(typeof rawAbility === "object" ? (rawAbility.current ?? 0) : (rawAbility ?? 0));
    const abilityName = game.i18n.localize(CONFIG.MERC.abilities[abilityKey]);
    
    const roll = new Roll("1d20");
    await roll.evaluate();
    
    const total = roll.total + abilityScore;
    
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      rolls: [roll],
      content: `<div class="merc-roll">
        <div class="merc-roll-header">
          <span class="merc-roll-label">${actor.name} - ${game.i18n.localize("MERC.Labels.check")} ${abilityName}</span>
          <span class="merc-roll-badge">${total}</span>
        </div>
        <div class="merc-roll-breakdown">
          <span class="roll-d20">d20: <strong>${roll.total}</strong></span>
          <span class="roll-modifier">${abilityScore > 0 ? ' + ' : ' - '}${Math.abs(abilityScore)}</span>
        </div>
      </div>`
    };
    
    await ChatMessage.create(chatData);
  }

  async rollSkillCheck(skillKey) {
    const actor = this.actor ?? this.document;
    const systemData = actor.system || actor._source?.system || {};
    const skillData = systemData.skills?.[skillKey];
    
    if (!skillData) {
      console.error(game.i18n.localize("MERC.Labels.skillNotFound") + ":", skillKey);
      return;
    }
    
    const base = this.computeSkillBase(actor, skillKey, skillData);
    const dev = Number(skillData.dev ?? skillData.value ?? 0);
    const degree = this.computeSkillDegree(actor, skillKey, skillData);
    const bonus = Number(skillData.bonus ?? 0);
    const total_modifier = degree + bonus;
    
    const skillName = game.i18n.localize(CONFIG.MERC.skills[skillKey]?.label) || skillKey;
    
    const roll = new Roll("1d20");
    await roll.evaluate();
    
    const total = roll.total + total_modifier;
    
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      rolls: [roll],
      content: `<div class="merc-roll">
        <div class="merc-roll-header">
          <span class="merc-roll-label">${actor.name} - ${skillName}</span>
          <span class="merc-roll-badge">${total}</span>
        </div>
        <div class="merc-roll-breakdown">
          <span class="roll-d20">d20: <strong>${roll.total}</strong></span>
          <span class="roll-modifier">${total_modifier > 0 ? ' + ' : ' - '}${Math.abs(total_modifier)}</span>
          <!--<span class="roll-modifier">(Base ${base} / Dev ${dev} / Degré ${degree} / Bonus ${bonus})</span>-->
        </div>
      </div>`
    };
    
    await ChatMessage.create(chatData);
  }

  async rollBaseDamage(formula, skillLabel) {
    const actor = this.actor ?? this.document;
    if (!formula) return;

    const roll = new Roll(formula);
    await roll.evaluate();

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
          <span class="roll-d20">${formula}: <strong>${roll.total}</strong></span>
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
    const label = `${perceptionName} - ${subLabel}`;

    const roll = new Roll("1d20");
    await roll.evaluate();

    const total = roll.total + subValue;

    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      rolls: [roll],
      content: `<div class="merc-roll">
        <div class="merc-roll-header">
          <span class="merc-roll-label">${actor.name} - ${game.i18n.localize("MERC.Labels.check")} ${label}</span>
          <span class="merc-roll-badge">${total}</span>
        </div>
        <div class="merc-roll-breakdown">
          <span class="roll-d20">d20: <strong>${roll.total}</strong></span>
          <span class="roll-modifier">${subValue > 0 ? ' + ' : ' - '}${Math.abs(subValue)}</span>
        </div>
      </div>`
    };

    await ChatMessage.create(chatData);
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
    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  async editItem(event) {
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    item.sheet.render(true);
  }

  // ===== Combat & Movement Calculations =====
  
  /**
   * Find index in table based on value
   * Returns the index of the immediately lower value
   */
  findTableIndex(value, table) {
    if (!value || value <= 0) return 0;
    for (let i = table.length - 1; i >= 0; i--) {
      if (value >= table[i]) {
        return i;
      }
    }
    return 0;
  }

  /**
   * Calculate combat statistics for the character
   */
  calculateCombatStats() {
    const system = this.actor.system;
    const attrs = system.attributes || {};
    
    // Get height and weight from biography
    const height = system.biography?.height || 0;
    const weight = system.biography?.weight || 0;
    
    // Rapidité is derived from speed attribute (Rapidité = Vitesse)
    const rapidite = attrs.speed?.current || 0;
    
    // Find indices in tables
    const indexTaille = this.findTableIndex(height, STATS_TABLES.taille);
    const indexPoids = this.findTableIndex(weight, STATS_TABLES.poids);
    
    // Get attribute values (-11 to 20 = indices 0-31)
    // The table position directly represents the attribute value
    // index 0 = attribute -11, index 11 = attribute 0, index 20 = attribute 9, etc.
    const attTaille = indexTaille - 11;
    const attPoids = indexPoids - 11;
    
    // Calculate corpulence
    const avgAtt = (attTaille + attPoids) / 2;
    const corpulence = avgAtt > 5 ? Math.ceil(avgAtt) : Math.floor(avgAtt);
    
    // Clamp corpulence to valid table range (-11 to 20)
    const corpulenceTableIdx = Math.max(0, Math.min(31, corpulence + 11));
    
    // Calculate index_vitesse (clamped to valid range)
    const indexVitesse = Math.max(0, Math.min(31, corpulence + rapidite - 5 + 11));
    
    // Endurance = floor((Volonté + Constitution) / 2)
    const volonte = attrs.will?.current || 0;
    const constitution = attrs.constitution?.current || 0;
    const endurance = Math.floor((volonte + constitution) / 2);
    
    // Point de corpulence = Constitution + ajustement PC
    const pcAjust = STATS_TABLES.ajustementPC[corpulenceTableIdx] || 0;
    const pointCorporence = constitution + pcAjust;
    
    // Capacité de Charge = Force + Constitution * 2
    const force = attrs.strength?.current || 0;
    const capaciteCharge = (force + constitution) * 2;
    
    // Bonus discrétion et dissimulation
    const bonusDiscretion = STATS_TABLES.discretion[corpulenceTableIdx] || 0;
    const bonusDissimulation = STATS_TABLES.dissimulation[corpulenceTableIdx] || 0;
    
    // Vitesses de déplacement (using indexVitesse)
    const vitesses = {
      reptation: STATS_TABLES.reptation[indexVitesse] || 0,
      marche: STATS_TABLES.marche[indexVitesse] || 0,
      course: STATS_TABLES.course[indexVitesse] || 0
    };

    // Base damage calculations (melee + bladed weapons)
    const skills = system.skills || {};
    const meleeSkill = { abilities: CONFIG.MERC.skills?.melee?.abilities || [], ...(skills.melee || {}) };
    const bladedSkill = { abilities: CONFIG.MERC.skills?.bladed_weapons?.abilities || [], ...(skills.bladed_weapons || {}) };
    const meleeDegree = this.computeSkillDegree(this.actor, "melee", meleeSkill);
    const bladedDegree = this.computeSkillDegree(this.actor, "bladed_weapons", bladedSkill);
    const baseDamageMelee = getBaseDamageFromTable(force, meleeDegree);
    const baseDamageBladed = getBaseDamageFromTable(force, bladedDegree);
    
    // Return calculated values
    return {
      endurance: Math.max(0, endurance),
      pointCorporence: Math.max(0, pointCorporence),
      capaciteCharge: Math.max(0, capaciteCharge),
      bonusDiscretion,
      bonusDissimulation,
      vitesses,
      baseDamageMelee,
      baseDamageBladed,
      corpulence,
      indexVitesse,
      indexTaille,
      indexPoids
    };
  }
}


// Initialize the system
Hooks.once("init", () => {
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
      reaction: { label: "MERC.Skills.reaction", abilities: ["speed"] },
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
      language_serbian: { label: "MERC.Skills.language_serbian", abilities: ["intelligence", "charisma"] },
      language_arabic: { label: "MERC.Skills.language_arabic", abilities: ["intelligence", "charisma"] },
      language_english: { label: "MERC.Skills.language_english", abilities: ["intelligence", "charisma"] },
      language_russian: { label: "MERC.Skills.language_russian", abilities: ["intelligence", "charisma"] },
      language_french: { label: "MERC.Skills.language_french", abilities: ["intelligence", "charisma"] },
      language_other_1: { label: "MERC.Skills.language_other_1", abilities: ["intelligence", "charisma"] },
      language_other_2: { label: "MERC.Skills.language_other_2", abilities: ["intelligence", "charisma"] },
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
      construction_tools: { label: "MERC.Skills.construction_tools", abilities: ["intelligence", "dexterity"] },
      spec_melee_mma: { label: "MERC.Skills.spec_melee_mma", abilities: ["strength", "perception"] },
      spec_blades_knife: { label: "MERC.Skills.spec_blades_knife", abilities: ["strength", "dexterity"] },
      spec_powder_ak47: { label: "MERC.Skills.spec_powder_ak47", abilities: ["dexterity", "perception"] }
    }
  };

  // Register Handlebars helpers
  Handlebars.registerHelper("filterItems", function(items, type) {
    if (!items) return [];
    return items.filter(item => item.type === type);
  });
  Handlebars.registerHelper("gt", function(a, b) {
    return a > b;
  });
  Handlebars.registerHelper("eq", function(a, b) {
    return a === b;
  });
  Handlebars.registerHelper("mod", function(a, b) {
    return a % b;
  });

  // Register Actor Sheets
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("merc", MercCharacterSheet, { types: ["character", "npc"], makeDefault: true });
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
  initiative: 0,
  defense: 0,
  health: 0,
  fatigue: 0,
  endurance: 0,
  pointCorporence: 0,
  capaciteCharge: 0,
  bonusDiscretion: 0,
  bonusDissimulation: 0,
  corpulence: 0
};

const DEFAULT_MOVEMENT = {
  walk: 0,
  run: 0,
  sprint: 0,
  charge: 0,
  reptation: 0,
  marche: 0,
  course: 0
};

const buildSkillDefaults = () => Object.fromEntries(
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
);

const findTableIndex = (value, table) => {
  if (!value || value <= 0) return 0;
  for (let i = table.length - 1; i >= 0; i--) {
    if (value >= table[i]) return i;
  }
  return 0;
};

const computeCombatStatsFromSystem = (system) => {
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
  const capaciteCharge = force + (constitution * 2);

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
    }
  };
};

const getActorMigrationData = (actor) => {
  const updateData = {};
  const system = actor.system || {};

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
    updateData["system.movement.reptation"] = computed.vitesses.reptation;
    updateData["system.movement.marche"] = computed.vitesses.marche;
    updateData["system.movement.course"] = computed.vitesses.course;
  }

  return updateData;
};

Hooks.once("ready", async () => {
  if (!game.user.isGM) return;

  const actors = game.actors?.contents ?? [];
  for (const actor of actors) {
    if (!actor || !["character", "npc"].includes(actor.type)) continue;
    const updateData = getActorMigrationData(actor);
    if (Object.keys(updateData).length > 0) {
      await actor.update(updateData, { render: false });
    }
  }
});

// Hook for initializing actor data
Hooks.on("preCreateActor", (actor, data, options, userId) => {
  // Initialize system data in the data object
  if (!data.system) {
    data.system = {};
  }
  
  const systemData = {
    biography: {
      age: "",
      height: 0,
      weight: 0,
      gender: "",
      origin: "",
      year: 0,
      renown: 0
    },
    attributes: {
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
    },
    combat: {
      initiative: 0,
      defense: 0,
      health: 0,
      fatigue: 0,
      endurance: 0,
      pointCorporence: 0,
      capaciteCharge: 0,
      bonusDiscretion: 0,
      bonusDissimulation: 0,
      corpulence: 0,
      baseDamageMelee: "1",
      baseDamageBladed: "1"
    },
    movement: {
      walk: 0,
      run: 0,
      sprint: 0,
      charge: 0,
      reptation: 0,
      marche: 0,
      course: 0
    },
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
Hooks.on("updateActor", (actor, changes, options, userId) => {
  // Only update for character actors
  if (actor.type !== "character") return;
  
  // Check if we need to recalculate combat stats
  const needsUpdate = 
    changes.system?.biography?.height ||
    changes.system?.biography?.weight ||
    changes.system?.attributes?.will ||
    changes.system?.attributes?.constitution ||
    changes.system?.attributes?.strength ||
    changes.system?.attributes?.speed;
  
  // Check if linked skills changed (melee or bladed_weapons dev/bonus/degree)
  const meleeChanged = 
    changes.system?.skills?.melee?.dev !== undefined ||
    changes.system?.skills?.melee?.bonus !== undefined ||
    changes.system?.skills?.melee?.degree !== undefined;
    
  const bladedChanged = 
    changes.system?.skills?.bladed_weapons?.dev !== undefined ||
    changes.system?.skills?.bladed_weapons?.bonus !== undefined ||
    changes.system?.skills?.bladed_weapons?.degree !== undefined;
  
  const skillsChanged = meleeChanged || bladedChanged;
  
  if (!needsUpdate && !skillsChanged) return;
  
  // Get the sheet instance if it's open
  const sheets = actor.apps;
  for (const [key, sheet] of Object.entries(sheets)) {
    if (sheet instanceof MercCharacterSheet) {
      const stats = sheet.calculateCombatStats();
      if (stats) {
        const updateData = {};
        
        // Always update base damage if skills changed
        if (skillsChanged) {
          updateData["system.combat.baseDamageMelee"] = stats.baseDamageMelee;
          updateData["system.combat.baseDamageBladed"] = stats.baseDamageBladed;
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
        }
        
        // Update base damage in both cases (needs recalc)
        if (!skillsChanged && needsUpdate) {
          updateData["system.combat.baseDamageMelee"] = stats.baseDamageMelee;
          updateData["system.combat.baseDamageBladed"] = stats.baseDamageBladed;
        }
        
        if (Object.keys(updateData).length > 0) {
          actor.update(updateData, { render: false });
        }
      }
      break;
    }
  }
});

console.log("Mercenary System - system.js loaded successfully ✓");

