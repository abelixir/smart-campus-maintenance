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

module.exports = {
  generateRecommendations,
};
