function hasPartialMatch(tag, target) {
  for (let i = 0; i <= tag.length - 5; i++) {
    const substring = tag.substring(i, i + 6).toLowerCase();
    if (target.toLowerCase().includes(substring)) {
      return true;
    }
  }
  return false;
}

function hasPartialMatchV2(tag, target) {
  // Convert both tag and target to lowercase to ensure case-insensitive comparison
  tag = tag.toLowerCase();
  target = target.toLowerCase();

  // Check if the target contains the full tag
  if (target.includes(tag)) {
    return true;
  }

  // Check for partial match: substrings of at least 6 characters
  for (let i = 0; i <= tag.length - 6; i++) {
    const substring = tag.substring(i, i + 6);
    if (target.includes(substring)) {
      return true;
    }
  }

  return false;
}

function getRandomSelection(arr, count) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

module.exports = { hasPartialMatch, hasPartialMatchV2, getRandomSelection };
