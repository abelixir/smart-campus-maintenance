const DEFAULT_ESTIMATED_DURATION_MINUTES = 60;

const normalizeString = (value) => {
  if (typeof value === 'string') {
    return value.trim();
  }

  return '';
};

const getComplaintCategoryName = (complaint) => {
  if (!complaint) {
    return '';
  }

  if (complaint.category && typeof complaint.category === 'object') {
    return normalizeString(complaint.category.name);
  }

  return normalizeString(complaint.category);
};

const getTechnicianSkillSet = (technician) => {
  if (!technician || !Array.isArray(technician.skills)) {
    return [];
  }

  return technician.skills
    .map((skill) => normalizeString(skill).toLowerCase())
    .filter(Boolean);
};

const hasMatchingSkill = (complaint, technician) => {
  const complaintSkill = getComplaintCategoryName(complaint).toLowerCase();
  if (!complaintSkill) {
    return false;
  }

  const skillSet = getTechnicianSkillSet(technician);
  return skillSet.includes(complaintSkill);
};

const getEstimatedDurationMinutes = (complaint) => {
  const estimatedDuration = Number(complaint?.estimatedDuration ?? DEFAULT_ESTIMATED_DURATION_MINUTES);

  if (!Number.isFinite(estimatedDuration) || estimatedDuration <= 0) {
    return DEFAULT_ESTIMATED_DURATION_MINUTES;
  }

  return estimatedDuration;
};

const buildWorkloadMap = (technicians = []) => {
  const map = new Map();

  technicians.forEach((technician, index) => {
    const technicianId = technician?._id || technician?.id || `placeholder-${index}`;
    map.set(String(technicianId), Number(technician?.currentWorkload || 0));
  });

  return map;
};

const getStandardDeviation = (values = []) => {
  if (!values.length) {
    return 0;
  }

  const mean = values.reduce((total, value) => total + Number(value || 0), 0) / values.length;
  const variance =
    values.reduce((total, value) => total + (Number(value || 0) - mean) ** 2, 0) / values.length;

  return Number(Math.sqrt(variance).toFixed(2));
};

const formatImprovement = (betterValue, worseValue) => {
  if (!Number.isFinite(betterValue) || !Number.isFinite(worseValue) || worseValue === 0) {
    return '0% better';
  }

  const percentage = Math.max(0, ((worseValue - betterValue) / worseValue) * 100);
  return `${Number(percentage.toFixed(1))}% better`;
};

const generateRecommendations = ({ complaints = [], technicians = [] }) => {
  const sortedComplaints = [...complaints].sort((a, b) => {
    const priorityA = Number(a?.priorityScore || 0);
    const priorityB = Number(b?.priorityScore || 0);
    return priorityB - priorityA;
  });

  const workloadMap = buildWorkloadMap(technicians);

  return sortedComplaints.map((complaint) => {
    const eligibleTechnicians = technicians.filter((technician) => {
      if (!technician || technician.role !== 'technician' || technician.isAvailable === false) {
        return false;
      }

      return hasMatchingSkill(complaint, technician);
    });

    if (eligibleTechnicians.length === 0) {
      return {
        complaintId: complaint?._id || complaint?.id || null,
        complaintTitle: complaint?.title || 'Untitled complaint',
        recommendedTechnicianId: null,
        recommendedTechnicianName: 'Supervisor action needed',
        priorityScore: Number(complaint?.priorityScore || 0),
        reason: 'No available technician matches the complaint category skill set.',
        requiresSupervisorAction: true,
        method: 'Priority-Aware',
      };
    }

    const selectedTechnician = eligibleTechnicians.reduce((bestCandidate, currentCandidate) => {
      const bestCandidateKey = String(bestCandidate?._id || bestCandidate?.id);
      const currentCandidateKey = String(currentCandidate?._id || currentCandidate?.id);
      const bestWorkload = Number(workloadMap.get(bestCandidateKey) || 0);
      const currentWorkload = Number(workloadMap.get(currentCandidateKey) || 0);

      if (currentWorkload < bestWorkload) {
        return currentCandidate;
      }

      return bestCandidate;
    }, eligibleTechnicians[0]);

    const selectedTechnicianKey = String(selectedTechnician?._id || selectedTechnician?.id);
    workloadMap.set(selectedTechnicianKey, (workloadMap.get(selectedTechnicianKey) || 0) + 1);

    return {
      complaintId: complaint?._id || complaint?.id || null,
      complaintTitle: complaint?.title || 'Untitled complaint',
      recommendedTechnicianId: selectedTechnician?._id || selectedTechnician?.id || null,
      recommendedTechnicianName: selectedTechnician?.name || 'Unknown technician',
      priorityScore: Number(complaint?.priorityScore || 0),
      reason: `Best match: ${selectedTechnician?.name || 'Technician'} has the required skill and the lowest current workload.`,
      requiresSupervisorAction: false,
      method: 'Priority-Aware',
    };
  });
};

const generateFCFSRecommendations = ({ complaints = [], technicians = [] }) => {
  const sortedComplaints = [...complaints].sort((a, b) => {
    const timeA = new Date(a?.createdAt || 0).getTime();
    const timeB = new Date(b?.createdAt || 0).getTime();

    return timeA - timeB;
  });

  const workloadMap = buildWorkloadMap(technicians);

  return sortedComplaints.map((complaint) => {
    const eligibleTechnicians = technicians.filter((technician) => {
      if (!technician || technician.role !== 'technician' || technician.isAvailable === false) {
        return false;
      }

      return hasMatchingSkill(complaint, technician);
    });

    if (eligibleTechnicians.length === 0) {
      return {
        complaintId: complaint?._id || complaint?.id || null,
        complaintTitle: complaint?.title || 'Untitled complaint',
        recommendedTechnicianId: null,
        recommendedTechnicianName: 'No technician available',
        priorityScore: Number(complaint?.priorityScore || 0),
        reason: 'No available technician matches the complaint category skill set.',
        requiresSupervisorAction: true,
        method: 'FCFS',
      };
    }

    const selectedTechnician = eligibleTechnicians[0];
    const selectedTechnicianKey = String(selectedTechnician?._id || selectedTechnician?.id);
    workloadMap.set(selectedTechnicianKey, (workloadMap.get(selectedTechnicianKey) || 0) + 1);

    return {
      complaintId: complaint?._id || complaint?.id || null,
      complaintTitle: complaint?.title || 'Untitled complaint',
      recommendedTechnicianId: selectedTechnician?._id || selectedTechnician?.id || null,
      recommendedTechnicianName: selectedTechnician?.name || 'Unknown technician',
      priorityScore: Number(complaint?.priorityScore || 0),
      reason: `Assigned in FCFS order to ${selectedTechnician?.name || 'the first available technician'} with the required skill.`,
      requiresSupervisorAction: false,
      method: 'FCFS',
    };
  });
};

const comparePriorityAwareVsFCFS = ({ complaints = [], technicians = [] }) => {
  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  const safeTechnicians = Array.isArray(technicians) ? technicians : [];

  const complaintMap = new Map(
    safeComplaints.map((complaint) => [String(complaint?._id || complaint?.id), complaint])
  );

  const evaluateMethod = ({ recommendations = [], methodLabel }) => {
    const workloadByTechnician = new Map();
    safeTechnicians.forEach((technician, index) => {
      const technicianId = technician?._id || technician?.id || `placeholder-${index}`;
      workloadByTechnician.set(String(technicianId), Number(technician?.currentWorkload || 0));
    });

    const waitingTimes = [];
    const criticalWaitingTimes = [];
    let assignedCount = 0;
    let matchedSkillAssignments = 0;
    let unassignedCount = 0;

    recommendations.forEach((recommendation) => {
      const complaint = complaintMap.get(String(recommendation?.complaintId || recommendation?.complaint?._id || ''));
      const technicianId = recommendation?.recommendedTechnicianId
        ? String(recommendation.recommendedTechnicianId)
        : null;
      const technician = safeTechnicians.find(
        (candidate) => String(candidate?._id || candidate?.id) === technicianId
      );

      const durationMinutes = complaint ? getEstimatedDurationMinutes(complaint) : DEFAULT_ESTIMATED_DURATION_MINUTES;
      const queuedMinutes = technicianId ? Number(workloadByTechnician.get(technicianId) || 0) * durationMinutes : 0;

      if (technicianId) {
        workloadByTechnician.set(technicianId, (workloadByTechnician.get(technicianId) || 0) + 1);
        assignedCount += 1;
        waitingTimes.push(queuedMinutes);

        if (complaint && technician && hasMatchingSkill(complaint, technician)) {
          matchedSkillAssignments += 1;
        }

        if (complaint && Number(complaint.priorityScore || 0) >= 4.0) {
          criticalWaitingTimes.push(queuedMinutes);
        }
      } else {
        unassignedCount += 1;
      }
    });

    const technicianWorkloads = safeTechnicians.map((technician, index) => {
      const technicianId = technician?._id || technician?.id || `placeholder-${index}`;
      return Number(workloadByTechnician.get(String(technicianId)) || 0);
    });

    const averageWaitingTime = waitingTimes.length
      ? Number(
          (
            waitingTimes.reduce((total, value) => total + Number(value || 0), 0) / waitingTimes.length
          ).toFixed(2)
        )
      : 0;

    const criticalResponseTime = criticalWaitingTimes.length
      ? Number(
          (
            criticalWaitingTimes.reduce((total, value) => total + Number(value || 0), 0) /
            criticalWaitingTimes.length
          ).toFixed(2)
        )
      : 0;

    const workloadBalance = getStandardDeviation(technicianWorkloads);
    const assignmentSuitability = assignedCount
      ? Number((((matchedSkillAssignments / assignedCount) * 100)).toFixed(2))
      : 0;

    return {
      method: methodLabel,
      averageWaitingTime,
      criticalResponseTime,
      workloadBalance,
      assignmentSuitability,
      unassignedCount,
      executionTimeMs: 0,
      assignments: recommendations,
    };
  };

  const startPriorityAware = Date.now();
  const priorityAwareRecommendations = generateRecommendations({
    complaints: safeComplaints,
    technicians: safeTechnicians,
  });
  const priorityAwareResult = evaluateMethod({
    recommendations: priorityAwareRecommendations,
    methodLabel: 'Priority-Aware',
  });
  priorityAwareResult.executionTimeMs = Date.now() - startPriorityAware;

  const startFcfs = Date.now();
  const fcfsRecommendations = generateFCFSRecommendations({
    complaints: safeComplaints,
    technicians: safeTechnicians,
  });
  const fcfsResult = evaluateMethod({
    recommendations: fcfsRecommendations,
    methodLabel: 'First-Come-First-Served',
  });
  fcfsResult.executionTimeMs = Date.now() - startFcfs;

  const priorityAwareScore =
    priorityAwareResult.averageWaitingTime +
    priorityAwareResult.criticalResponseTime +
    priorityAwareResult.workloadBalance;
  const fcfsScore =
    fcfsResult.averageWaitingTime + fcfsResult.criticalResponseTime + fcfsResult.workloadBalance;

  let betterMethod = 'Similar';
  if (Math.abs(priorityAwareScore - fcfsScore) <= 0.05 * Math.max(priorityAwareScore, fcfsScore, 1)) {
    betterMethod = 'Similar';
  } else if (priorityAwareScore < fcfsScore) {
    betterMethod = 'Priority-Aware';
  } else if (fcfsScore < priorityAwareScore) {
    betterMethod = 'FCFS';
  }

  const waitingTimeReduction =
    priorityAwareResult.averageWaitingTime <= fcfsResult.averageWaitingTime
      ? formatImprovement(
          priorityAwareResult.averageWaitingTime,
          fcfsResult.averageWaitingTime || 1
        )
      : formatImprovement(fcfsResult.averageWaitingTime, priorityAwareResult.averageWaitingTime || 1);

  const criticalResponseImprovement =
    priorityAwareResult.criticalResponseTime <= fcfsResult.criticalResponseTime
      ? formatImprovement(
          priorityAwareResult.criticalResponseTime,
          fcfsResult.criticalResponseTime || 1
        )
      : formatImprovement(fcfsResult.criticalResponseTime, priorityAwareResult.criticalResponseTime || 1);

  const workloadBalanceImprovement =
    priorityAwareResult.workloadBalance <= fcfsResult.workloadBalance
      ? formatImprovement(
          priorityAwareResult.workloadBalance,
          fcfsResult.workloadBalance || 1
        )
      : formatImprovement(fcfsResult.workloadBalance, priorityAwareResult.workloadBalance || 1);

  return {
    priorityAware: {
      method: 'Priority-Aware',
      averageWaitingTime: priorityAwareResult.averageWaitingTime,
      criticalResponseTime: priorityAwareResult.criticalResponseTime,
      workloadBalance: priorityAwareResult.workloadBalance,
      assignmentSuitability: priorityAwareResult.assignmentSuitability,
      unassignedCount: priorityAwareResult.unassignedCount,
      executionTimeMs: priorityAwareResult.executionTimeMs,
      assignments: priorityAwareRecommendations,
    },
    fcfs: {
      method: 'First-Come-First-Served',
      averageWaitingTime: fcfsResult.averageWaitingTime,
      criticalResponseTime: fcfsResult.criticalResponseTime,
      workloadBalance: fcfsResult.workloadBalance,
      assignmentSuitability: fcfsResult.assignmentSuitability,
      unassignedCount: fcfsResult.unassignedCount,
      executionTimeMs: fcfsResult.executionTimeMs,
      assignments: fcfsRecommendations,
    },
    summary: {
      betterMethod,
      improvements: {
        waitingTimeReduction,
        criticalResponseImprovement: criticalResponseImprovement,
        workloadBalanceImprovement: workloadBalanceImprovement,
      },
    },
  };
};

module.exports = {
  generateRecommendations,
  generateFCFSRecommendations,
  comparePriorityAwareVsFCFS,
};