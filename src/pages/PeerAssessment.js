import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { PERIOD_MAPPING, ROLE_QUESTIONS, GENERAL_QUESTIONS } from '../data/initialStudents';
import { ClipboardCheck, CheckCircle, AlertCircle, Award } from 'lucide-react';

const PeerAssessment = () => {
  const { state, dispatch, getPodsByPeriod, getPodMembers, getAssessmentsGivenBy } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [selectedPod, setSelectedPod] = useState(null);
  const [currentAssessor, setCurrentAssessor] = useState(null);
  const [currentAssessee, setCurrentAssessee] = useState(null);
  const [assessmentStep, setAssessmentStep] = useState('select-pod');
  const [roleScores, setRoleScores] = useState({});
  const [generalScores, setGeneralScores] = useState({});
  const [comments, setComments] = useState('');
  const [memberIndex, setMemberIndex] = useState(0);

  const periods = Object.entries(PERIOD_MAPPING).sort((a, b) => a[1].period - b[1].period);
  const currentPods = getPodsByPeriod(selectedPeriod);

  const resetAssessment = () => {
    setRoleScores({});
    setGeneralScores({});
    setComments('');
  };

  const getMembersToAssess = () => {
    if (!selectedPod || !currentAssessor) return [];
    const members = getPodMembers(selectedPod.id);
    return members.filter(m => m.id !== currentAssessor.id);
  };

  const handleStartPodAssessment = (pod) => {
    setSelectedPod(pod);
    setAssessmentStep('select-assessor');
    dispatch({
      type: 'UPDATE_POD_STAGE',
      payload: { podKey: pod.id, stage: 'in_progress' }
    });
  };

  const handleSelectAssessor = (student) => {
    setCurrentAssessor(student);
    const toAssess = getPodMembers(selectedPod.id).filter(m => m.id !== student.id);
    if (toAssess.length > 0) {
      setCurrentAssessee(toAssess[0]);
      setMemberIndex(0);
      resetAssessment();
      setAssessmentStep('assess-members');
    }
  };

  const handleScoreChange = (questionId, score, isRole = false) => {
    if (isRole) {
      setRoleScores({ ...roleScores, [questionId]: score });
    } else {
      setGeneralScores({ ...generalScores, [questionId]: score });
    }
  };

  const getTotalRequiredRoleQuestions = () => {
    if (!currentAssessee || !currentAssessee.roles) return 0;
    let total = 0;
    currentAssessee.roles.forEach(role => {
      if (ROLE_QUESTIONS[role]) {
        total += ROLE_QUESTIONS[role].length;
      }
    });
    return total;
  };

  const handleSubmitAssessment = () => {
    const assessment = {
      assessorId: currentAssessor.id,
      assesseeId: currentAssessee.id,
      podId: selectedPod.id,
      roleScores,
      generalScores,
      comments,
      assesseeRoles: currentAssessee.roles || []
    };

    dispatch({ type: 'ADD_ASSESSMENT', payload: assessment });

    const toAssess = getMembersToAssess();
    if (memberIndex < toAssess.length - 1) {
      setMemberIndex(memberIndex + 1);
      setCurrentAssessee(toAssess[memberIndex + 1]);
      resetAssessment();
    } else {
      alert(`${currentAssessor.firstName} has completed all assessments!`);
      setCurrentAssessor(null);
      setCurrentAssessee(null);
      setMemberIndex(0);
      setAssessmentStep('select-assessor');
      resetAssessment();
    }
  };

  const getCompletionStatus = (pod) => {
    const members = getPodMembers(pod.id);
    const totalExpected = members.length * (members.length - 1);
    const totalDone = members.reduce((count, member) => {
      const given = getAssessmentsGivenBy(member.id).filter(a => a.podId === pod.id && !a.isSelfEval).length;
      return count + given;
    }, 0);

    return {
      total: totalExpected,
      done: totalDone,
      percentage: totalExpected > 0 ? ((totalDone / totalExpected) * 100).toFixed(0) : 0
    };
  };

  const getRoleDisplay = (roles) => {
    if (!roles || roles.length === 0) return 'No roles assigned';
    return roles.join(', ');
  };

  const StarRating = ({ value, onChange }) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(score => (
        <span
          key={score}
          className={`star ${score <= value ? 'filled' : ''}`}
          onClick={() => onChange(score)}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div>
      <h2>Peer Assessment (Admin)</h2>

      <div className="period-selector">
        {periods.map(([homeroom, info]) => (
          <button
            key={homeroom}
            className={`period-btn ${selectedPeriod === info.period ? 'active' : ''}`}
            onClick={() => {
              setSelectedPeriod(info.period);
              setSelectedPod(null);
              setAssessmentStep('select-pod');
            }}
          >
            {info.name}
          </button>
        ))}
      </div>

      {assessmentStep === 'select-pod' && (
        <div className="card">
          <h3>Select a Pod to Assess</h3>
          {currentPods.length === 0 ? (
            <div className="alert alert-warning">
              <AlertCircle size={18} />
              No pods found for this period. Please assign students to pods first.
            </div>
          ) : (
            <div className="grid grid-3">
              {currentPods.sort((a, b) => a.podNumber - b.podNumber).map(pod => {
                const members = getPodMembers(pod.id);
                const status = getCompletionStatus(pod);
                const hasRoles = members.every(m => m.roles && m.roles.length > 0);

                return (
                  <div key={pod.id} className="pod-card">
                    <div className="pod-header">
                      <div className="pod-title">Pod {pod.podNumber}</div>
                      <span className={`badge ${pod.stage === 'completed' ? 'badge-success' : pod.stage === 'in_progress' ? 'badge-warning' : 'badge-gray'}`}>
                        {status.percentage}% Complete
                      </span>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>{members.length} Members:</strong>
                      {members.map(m => (
                        <div key={m.id} style={{ fontSize: '13px', marginLeft: '10px' }}>
                          • {m.firstName} {m.lastName}
                          <span className="text-muted"> - {getRoleDisplay(m.roles)}</span>
                          {m.roles && m.roles.length > 1 && (
                            <span className="badge badge-success" style={{ marginLeft: '4px', fontSize: '9px' }}>
                              +{(m.roles.length - 1) * 5}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {!hasRoles && (
                      <div className="alert alert-warning" style={{ padding: '8px', marginBottom: '10px' }}>
                        <AlertCircle size={14} />
                        <small>Some members don't have roles assigned</small>
                      </div>
                    )}
                    <button
                      className="btn btn-primary"
                      onClick={() => handleStartPodAssessment(pod)}
                      style={{ width: '100%' }}
                    >
                      <ClipboardCheck size={16} />
                      Start Assessment
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {assessmentStep === 'select-assessor' && selectedPod && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>Who is filling out the assessment?</h3>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelectedPod(null);
                setAssessmentStep('select-pod');
              }}
            >
              Back to Pods
            </button>
          </div>

          <div className="alert alert-info mb-4">
            <strong>Pod {selectedPod.podNumber}</strong> - Select the student who will be assessing their pod members
          </div>

          <div className="grid grid-2">
            {getPodMembers(selectedPod.id).map(member => {
              const assessmentsGiven = getAssessmentsGivenBy(member.id).filter(a => a.podId === selectedPod.id && !a.isSelfEval).length;
              const expectedAssessments = getPodMembers(selectedPod.id).length - 1;
              const completed = assessmentsGiven >= expectedAssessments;

              return (
                <div key={member.id} className="member-item" style={{ padding: '16px' }}>
                  <div>
                    <div className="member-name" style={{ fontSize: '16px' }}>
                      {member.firstName} {member.lastName}
                    </div>
                    <div className="member-role">
                      {getRoleDisplay(member.roles)}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      {completed ? (
                        <span className="badge badge-success">
                          <CheckCircle size={12} /> Completed ({assessmentsGiven}/{expectedAssessments})
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          {assessmentsGiven}/{expectedAssessments} assessed
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSelectAssessor(member)}
                    disabled={completed}
                  >
                    {completed ? 'Done' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>

          {getPodMembers(selectedPod.id).every(m => {
            const given = getAssessmentsGivenBy(m.id).filter(a => a.podId === selectedPod.id && !a.isSelfEval).length;
            const expected = getPodMembers(selectedPod.id).length - 1;
            return given >= expected;
          }) && (
            <div className="alert alert-success mt-4">
              <CheckCircle size={18} />
              All pod members have completed their assessments!
              <button
                className="btn btn-success btn-sm"
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  dispatch({
                    type: 'UPDATE_POD_STAGE',
                    payload: { podKey: selectedPod.id, stage: 'completed' }
                  });
                  setSelectedPod(null);
                  setAssessmentStep('select-pod');
                }}
              >
                Mark Pod as Complete
              </button>
            </div>
          )}
        </div>
      )}

      {assessmentStep === 'assess-members' && currentAssessor && currentAssessee && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>
              Assessing Team Member {memberIndex + 1} of {getMembersToAssess().length}
            </h3>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setCurrentAssessor(null);
                setCurrentAssessee(null);
                setAssessmentStep('select-assessor');
                resetAssessment();
              }}
            >
              Back
            </button>
          </div>

          <div className="alert alert-info mb-4">
            <strong>{currentAssessor.firstName}</strong> is assessing <strong>{currentAssessee.firstName} {currentAssessee.lastName}</strong>
            <br />
            Roles: <strong>{getRoleDisplay(currentAssessee.roles)}</strong>
            {currentAssessee.roles && currentAssessee.roles.length > 1 && (
              <span className="badge badge-success" style={{ marginLeft: '8px' }}>
                <Award size={12} /> +{(currentAssessee.roles.length - 1) * 5}% Multi-Role Bonus
              </span>
            )}
          </div>

          {/* Role-Specific Questions for ALL assigned roles */}
          {currentAssessee.roles && currentAssessee.roles.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              {currentAssessee.roles.map(role => (
                ROLE_QUESTIONS[role] && (
                  <div key={role} style={{ marginBottom: '20px', padding: '16px', background: '#f0f9ff', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '16px', color: '#1e40af' }}>
                      Role: {role}
                    </h4>
                    {ROLE_QUESTIONS[role].map(question => (
                      <div key={`${role}_${question.id}`} className="form-group">
                        <label>{question.text}</label>
                        <StarRating
                          value={roleScores[`${role}_${question.id}`] || 0}
                          onChange={(score) => handleScoreChange(`${role}_${question.id}`, score, true)}
                        />
                      </div>
                    ))}
                  </div>
                )
              ))}
            </div>
          )}

          {/* General Questions */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '16px' }}>General Collaboration Questions</h4>
            {GENERAL_QUESTIONS.map(question => (
              <div key={question.id} className="form-group">
                <label>{question.text}</label>
                <StarRating
                  value={generalScores[question.id] || 0}
                  onChange={(score) => handleScoreChange(question.id, score, false)}
                />
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Additional Comments (Optional)</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any additional feedback about this team member..."
              rows={4}
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-muted">
              Progress: {memberIndex + 1} / {getMembersToAssess().length}
            </div>
            <button
              className="btn btn-success btn-lg"
              onClick={handleSubmitAssessment}
              disabled={
                Object.keys(roleScores).length < getTotalRequiredRoleQuestions() ||
                Object.keys(generalScores).length < GENERAL_QUESTIONS.length
              }
            >
              {memberIndex < getMembersToAssess().length - 1 ? 'Save & Next' : 'Complete All Assessments'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerAssessment;
