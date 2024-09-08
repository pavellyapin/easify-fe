function hasPartialMatch(tag, target) {
  for (let i = 0; i <= tag.length - 5; i++) {
    const substring = tag.substring(i, i + 6).toLowerCase();
    if (target.toLowerCase().includes(substring)) {
      return true;
    }
  }
  return false;
}

function getRandomSelection(arr, count) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

module.exports = { hasPartialMatch, getRandomSelection };
