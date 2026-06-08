/**
 * Computes a matching score between a Complaint and a Criminal suspect.
 * Total score is out of 100:
 * - Location proximity (Max 30 points)
 * - Category overlap (Max 40 points)
 * - Physical trait / Description match (Max 30 points)
 * 
 * @param {Object} complaint The Complaint document
 * @param {Object} criminal The Criminal document
 * @returns {Object} { score: Number, reasons: String[] }
 */
const calculateMatchScore = (complaint, criminal) => {
  let score = 0;
  const reasons = [];

  // 1. Proximity Match (Max 30 points)
  if (complaint.theftLocation && criminal.lastKnownLocation) {
    const compLoc = complaint.theftLocation.toLowerCase();
    const suspectLoc = criminal.lastKnownLocation.toLowerCase();
    
    // Check if they share keywords (e.g. "Downtown", "Market", specific street/area name)
    const compWords = compLoc.split(/[\s,.-]+/).filter(w => w.length > 3);
    
    let overlapCount = 0;
    const matchedWords = [];
    compWords.forEach(word => {
      if (suspectLoc.includes(word)) {
        overlapCount++;
        matchedWords.push(word);
      }
    });

    if (overlapCount >= 2) {
      score += 30;
      reasons.push(`High textual location overlap: matching words [${matchedWords.join(', ')}] (+30 pts)`);
    } else if (overlapCount === 1) {
      score += 15;
      reasons.push(`Medium textual location overlap: matching word [${matchedWords[0]}] (+15 pts)`);
    } else {
      reasons.push('No textual location overlap between crime scene and suspect address (0 pts proximity)');
    }
  } else {
    reasons.push('Location details missing (0 pts proximity)');
  }

  // 2. Category / MO Matching (Max 40 points)
  // Check if suspect operates in the same crime category
  const compCategory = (complaint.category || '').toLowerCase();
  const suspectAliases = (criminal.aliases || '').toLowerCase();
  const physicalDetails = criminal.physicalFeatures || {};
  
  let categoryMatched = false;
  
  // Categorize based on typical terms in suspect profile or features
  const isVehicleThief = suspectAliases.includes('slick') || suspectAliases.includes('ride') || suspectAliases.includes('driver');
  const isBurglar = suspectAliases.includes('cat') || suspectAliases.includes('burglar') || suspectAliases.includes('whisper');
  const isJewelrySnatcher = suspectAliases.includes('snatch') || suspectAliases.includes('gold') || suspectAliases.includes('ring');
  const isCashRobber = suspectAliases.includes('iron') || suspectAliases.includes('fist') || suspectAliases.includes('heist');

  if (compCategory === 'vehicle' && isVehicleThief) {
    score += 40;
    categoryMatched = true;
    reasons.push('Suspect history matches vehicle theft patterns (Category Overlap: +40 pts)');
  } else if (compCategory === 'electronics' && isBurglar) {
    score += 40;
    categoryMatched = true;
    reasons.push('Suspect specializes in breaking & entering / electronic theft (Category Overlap: +40 pts)');
  } else if (compCategory === 'jewelry' && isJewelrySnatcher) {
    score += 40;
    categoryMatched = true;
    reasons.push('Suspect has record/aliases associated with jewelry snatching (Category Overlap: +40 pts)');
  } else if (compCategory === 'cash' && isCashRobber) {
    score += 40;
    categoryMatched = true;
    reasons.push('Suspect modus operandi matches physical cash robbery (Category Overlap: +40 pts)');
  }

  // If no specific modus operandi matches but category exists in general description
  if (!categoryMatched) {
    const descLower = complaint.description.toLowerCase();
    const suspectDesc = `${criminal.name} ${suspectAliases} ${physicalDetails.scars || ''} ${physicalDetails.tattoos || ''}`.toLowerCase();
    
    if (descLower.includes(compCategory) || suspectDesc.includes(compCategory)) {
      score += 25;
      reasons.push(`Indirect keyword alignment with category '${compCategory}' (+25 pts)`);
    } else {
      reasons.push('No direct criminal specialty match (0 pts category)');
    }
  }

  // 3. Text Keywords / Physical Traits matching (Max 30 points)
  let textMatchPoints = 0;
  const descTokens = complaint.description.toLowerCase();
  
  // Traits to scan
  const traits = [];
  if (physicalDetails.hairColor) traits.push(physicalDetails.hairColor.toLowerCase());
  if (physicalDetails.eyeColor) traits.push(`${physicalDetails.eyeColor.toLowerCase()} eye`);
  if (physicalDetails.scars && physicalDetails.scars !== 'none') {
    // extract keywords from scars
    physicalDetails.scars.toLowerCase().split(' ').forEach(w => {
      if (w.length > 3) traits.push(w);
    });
  }
  if (physicalDetails.tattoos && physicalDetails.tattoos !== 'none') {
    physicalDetails.tattoos.toLowerCase().split(' ').forEach(w => {
      if (w.length > 3) traits.push(w);
    });
  }

  // Count matches
  const matchedTraits = [];
  traits.forEach(trait => {
    if (descTokens.includes(trait)) {
      matchedTraits.push(trait);
      textMatchPoints += 10;
    }
  });

  if (textMatchPoints > 30) textMatchPoints = 30; // Caps at 30 points

  if (textMatchPoints > 0) {
    score += textMatchPoints;
    reasons.push(`Physical appearance match on traits [${matchedTraits.join(', ')}] (+${textMatchPoints} pts)`);
  } else {
    reasons.push('No matching physical description traits in complaint details (0 pts traits)');
  }

  return {
    score: parseFloat(score.toFixed(2)),
    reasons
  };
};

module.exports = { calculateMatchScore };
