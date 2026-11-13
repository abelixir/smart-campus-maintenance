const generateRecommendations = ({ complaints = [], technicians = [] }) => {
  const sortedComplaints = [...complaints].sort((a, b) => {
    const priorityA = Number(a.priorityScore || 0);
    const priorityB = Number(b.priorityScore || 0);
    return priorityB - priorityA;
  });

  return sortedComplaints.map((complaint) => {
    const categoryName = complaint.category?.name || complaint.category || '';
    const normalizedCategory = typeof categoryName === 'string' ? categoryName.trim() : '';

    const eligibleTechnicians = technicians.filter((technician) => {
      if (!technician || technician.role !== 'technician' || technician.isAvailable === false) {
        return false;
      }

      const skills = Array.isArray(technician.skills) ? technician.skills : [];
      return skills.some((skill) => skill && skill.toLowerCase() === normalizedCategory.toLowerCase());
    });

    if (eligibleTechnicians.length === 0) {
      return {
        complaintId: complaint._id,
        complaintTitle: complaint.title,
        recommendedTechnicianId: null,
        recommendedTechnicianName: 'Supervisor action needed',
        priorityScore: Number(complaint.priorityScore || 0),
        reason: 'No available technician matches the complaint category skill set.',
        requiresSupervisorAction: true,
      };
    }

    const selectedTechnician = eligibleTechnicians.reduce((bestCandidate, currentCandidate) => {
      const bestWorkload = Number(bestCandidate.currentWorkload || 0);
      const currentWorkload = Number(currentCandidate.currentWorkload || 0);

      if (!bestCandidate || currentWorkload < bestWorkload) {
        return currentCandidate;
      }

      return bestCandidate;
    }, eligibleTechnicians[0]);

    return {
      complaintId: complaint._id,
      complaintTitle: complaint.title,
      recommendedTechnicianId: selectedTechnician._id,
      recommendedTechnicianName: selectedTechnician.name,
      priorityScore: Number(complaint.priorityScore || 0),
      reason: `Best match: ${selectedTechnician.name} has the required skill and the lowest current workload.`,
      requiresSupervisorAction: false,
    };
  });
};

const getAverageWaitingTimeHours = (queue = []) => {
  if (!queue.length) return 0;

  const totalQueueTime = queue.reduce((sum, _, index) => sum + (index + 1) * 8, 0);
  return Number((totalQueueTime / queue.length).toFixed(1));
};

const comparePriorityAwareVsFCFS = ({ complaints = [], technicians = [] }) => {
  const priorityAwareQueue = [...complaints].sort((a, b) => Number(b.priorityScore || 0) - Number(a.priorityScore || 0));
  const fcfsQueue = [...complaints].sort(
    (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  );

  const priorityAware = {
    averageWaitingTimeHours: getAverageWaitingTimeHours(priorityAwareQueue),
    highPriorityHandledFirst: getHighPriorityHandledCount(priorityAwareQueue),
    workloadDistribution: (technicians || []).map((technician) => ({
      technicianId: technician._id,
      name: technician.name,
      currentWorkload: Number(technician.currentWorkload || 0),
    })),
  };

  const fcfs = {
    averageWaitingTimeHours: getAverageWaitingTimeHours(fcfsQueue),
    highPriorityHandledFirst: getHighPriorityHandledCount(fcfsQueue),
    workloadDistribution: (technicians || []).map((technician) => ({
      technicianId: technician._id,
      name: technician.name,
      currentWorkload: Number(technician.currentWorkload || 0),
    })),
  };

  return {
    pendingComplaintCount: complaints.length,
    comparisonWindow: 'Submitted and Reviewed complaints',
    priorityAware,
    fcfs,
    summary: {
      priorityAwareWins: priorityAware.highPriorityHandledFirst >= fcfs.highPriorityHandledFirst,
      priorityAwareAverageWaitingTimeBonus:
        Number((fcfs.averageWaitingTimeHours - priorityAware.averageWaitingTimeHours).toFixed(1)),
    },
  };
};

const getHighPriorityHandledCount = (queue = [], threshold = 8) => {
  let seenLowerPriorityComplaint = false;
  let count = 0;

  queue.forEach((complaint) => {
    const score = Number(complaint.priorityScore || 0);

    if (score >= threshold && !seenLowerPriorityComplaint) {
      count += 1;
      return;
    }

    if (score < threshold) {
      seenLowerPriorityComplaint = true;
    }
  });

  return count;
};

module.exports = {
  generateRecommendations,
  comparePriorityAwareVsFCFS,
};
