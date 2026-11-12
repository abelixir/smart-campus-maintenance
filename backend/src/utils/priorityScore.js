const calculatePriorityScore = ({ severity, safetyRisk, affectedPeople, waitingLevel }) => {
  const values = {
    severity: Number(severity) || 0,
    safetyRisk: Number(safetyRisk) || 0,
    affectedPeople: Number(affectedPeople) || 0,
    waitingLevel: Number(waitingLevel) || 0,
  };

  const score =
    0.35 * values.severity +
    0.3 * values.safetyRisk +
    0.2 * values.affectedPeople +
    0.15 * values.waitingLevel;

  return Number(score.toFixed(2));
};

module.exports = { calculatePriorityScore };
