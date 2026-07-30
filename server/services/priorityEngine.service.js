export class PriorityEngine {
  /**
   * Prioritize and sort missing questions based on clinical urgency
   * @param {Array<Object>} missingList - List of missing question objects
   * @returns {Array<Object>} Sorted list of missing questions with priority scores
   */
  prioritize(missingList) {
    if (!Array.isArray(missingList)) return [];

    const scored = missingList.map((item) => {
      let score = 20; // Default priority for basic/unknown parameters

      if (item.type === "red_flag") {
        score = 100; // Red flags are critical
      } else if (item.type === "required") {
        const param = String(item.paramName).toLowerCase();
        if (param === "severity") {
          score = 70;
        } else if (param === "duration") {
          score = 50;
        } else if (param === "location") {
          score = 30;
        } else if (param === "radiation") {
          score = 35; // Put radiation slightly higher than general location for chest pain
        }
      }

      return {
        ...item,
        score,
      };
    });

    // Sort descending by score. If scores are equal, sort alphabetically by key
    return scored.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return String(a.key).localeCompare(String(b.key));
    });
  }
}
