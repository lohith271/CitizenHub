const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'for',
  'from',
  'in',
  'is',
  'of',
  'on',
  'the',
  'to',
  'with',
]);

const tokenize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

const buildTermFrequency = (tokens) => {
  const frequencies = new Map();
  tokens.forEach((token) => frequencies.set(token, (frequencies.get(token) || 0) + 1));
  return frequencies;
};

const cosineSimilarity = (left, right) => {
  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  const terms = new Set([...left.keys(), ...right.keys()]);

  terms.forEach((term) => {
    const leftValue = left.get(term) || 0;
    const rightValue = right.get(term) || 0;
    dotProduct += leftValue * rightValue;
    leftMagnitude += leftValue ** 2;
    rightMagnitude += rightValue ** 2;
  });

  if (!leftMagnitude || !rightMagnitude) return 0;
  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
};

const buildTfidfVectors = (documents) => {
  const termFrequencies = documents.map((document) => buildTermFrequency(tokenize(document)));
  const documentFrequency = new Map();

  termFrequencies.forEach((frequencies) => {
    frequencies.forEach((unusedValue, term) => {
      documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
    });
  });

  return termFrequencies.map((frequencies) => {
    const vector = new Map();
    frequencies.forEach((frequency, term) => {
      const inverseDocumentFrequency = Math.log(
        (documents.length + 1) / ((documentFrequency.get(term) || 0) + 1)
      ) + 1;
      vector.set(term, frequency * inverseDocumentFrequency);
    });
    return vector;
  });
};

const getTaskRecommendations = (user, tasks) => {
  const profileText = [user.skills, user.causes, user.city, user.state].flat().join(' ');
  const taskTexts = tasks.map((task) => [
    task.title,
    task.description,
    task.requiredSkills,
    task.city,
    task.campaignId?.title,
    task.campaignId?.category,
    task.campaignId?.summary,
  ].flat().join(' '));
  const vectors = buildTfidfVectors([profileText, ...taskTexts]);
  const profileVector = vectors[0];

  return tasks
    .map((task, index) => {
      const matchingSkills = (task.requiredSkills || []).filter((skill) =>
        (user.skills || []).some((userSkill) => userSkill.toLowerCase() === skill.toLowerCase())
      );
      const locationMatch =
        !task.city || task.city.toLowerCase() === 'remote' || task.city.toLowerCase() === user.city?.toLowerCase();
      const similarity = cosineSimilarity(profileVector, vectors[index + 1]);
      const skillScore = matchingSkills.length ? Math.min(1, matchingSkills.length / task.requiredSkills.length) : 0;
      const locationScore = locationMatch ? 1 : 0;
      const urgencyScore = { urgent: 1, high: 0.75, medium: 0.45, low: 0.2 }[task.urgency] || 0;
      const reliabilityScore = Math.min(1, Math.max(0, (user.reliabilityScore || 0) / 100));
      const score = Math.round(
        (similarity * 0.45 + skillScore * 0.3 + locationScore * 0.1 + urgencyScore * 0.1 + reliabilityScore * 0.05) * 100
      );
      const reasons = [];

      if (matchingSkills.length) reasons.push(`Matches your ${matchingSkills.join(', ')} skill`);
      if (locationMatch) reasons.push(task.city?.toLowerCase() === 'remote' ? 'Can be done remotely' : 'Available in your city');
      if (task.urgency === 'urgent' || task.urgency === 'high') reasons.push(`${task.urgency} priority`);
      if (!reasons.length) reasons.push('Similar to your interests and activity profile');

      return {
        ...task.toObject(),
        recommendationScore: score,
        recommendationReasons: reasons.slice(0, 2),
      };
    })
    .sort((left, right) => right.recommendationScore - left.recommendationScore);
};

module.exports = { getTaskRecommendations };