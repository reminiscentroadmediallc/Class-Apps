import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { PERIOD_MAPPING, SELF_EVAL_QUESTIONS, PEER_EVAL_QUESTIONS } from '../data/initialStudents';
import { User, CheckCircle, AlertCircle, Save } from 'lucide-react';

const SelfAssessment = () => {
  const { state, dispatch, getStudentsByPeriod, getPodsByPeriod, getPodMembers } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [step, setStep] = useState('select'); // select, self-eval, peer-eval, advocacy, complete
  const [selfScores, setSelfScores] = useState({});
  const [selfExplanations, setSelfExplanations] = useState({});
  const [biggestContribution, setBiggestContribution] = useState('');
  const [biggestChallenge, setBiggestChallenge] = useState('');
  const [peerEvaluations, setPeerEvaluations] = useState({});
  const [teamWorkedWell, setTeamWorkedWell] = useState(true);
  const [participationIssues, setParticipationIssues] = useState('');
  const [currentPeerIndex, setCurrentPeerIndex] = useState(0);

  const periods = Object.entries(PERIOD_MAPPING).sort((a, b) => a[1].period - b[1].period);

  const resetForm = () => {
    setSelfScores({});
    setSelfExplanations({});
    setBiggestContribution('');
    setBiggestChallenge('');
    setPeerEvaluations({});
    setTeamWorkedWell(true);
    setParticipationIssues('');
    setCurrentPeerIndex(0);
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    resetForm();
    setStep('self-eval');
  };

  const getPeersToEvaluate = () => {
    if (!selectedStudent || !selectedStudent.podNumber) return [];
    const podKey = `${selectedStudent.period}_${selectedStudent.podNumber}`;
    return getPodMembers(podKey).filter(m => m.id !== selectedStudent.id);
  };

  const handleSaveSelfEval = () => {
    setStep('peer-eval');
  };

  const handleSavePeerEval = () => {
    const peers = getPeersToEvaluate();
    if (currentPeerIndex < peers.length - 1) {
      setCurrentPeerIndex(currentPeerIndex + 1);
    } else {
      setStep('advocacy');
    }
  };

  const handleSubmitAll = () => {
    // Save self-evaluation as an assessment on self
    const selfAssessment = {
      assessorId: selectedStudent.id,
      assesseeId: selectedStudent.id,
      podId: `${selectedStudent.period}_${selectedStudent.podNumber}`,
      roleScores: {},
      generalScores: selfScores,
      comments: JSON.stringify({
        explanations: selfExplanations,
        biggestContribution,
        biggestChallenge,
        teamWorkedWell,
        participationIssues
      }),
      assesseeRole: selectedStudent.role,
      isSelfEval: true
    };
    dispatch({ type: 'ADD_ASSESSMENT', payload: selfAssessment });

    // Save peer evaluations
    Object.entries(peerEvaluations).forEach(([peerId, evalData]) => {
      const assessment = {
        assessorId: selectedStudent.id,
        assesseeId: peerId,
        podId: `${selectedStudent.period}_${selectedStudent.podNumber}`,
        roleScores: {},
        generalScores: evalData.scores,
        comments: evalData.comments || '',
        assesseeRole: state.students.find(s => s.id === peerId)?.role
      };
      dispatch({ type: 'ADD_ASSESSMENT', payload: assessment });
    });

    setStep('complete');
    alert('Your evaluation has been submitted successfully!');
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
      <h2>Self & Peer Evaluation Form</h2>

      {step === 'select' && (
        <>
          <div className="period-selector">
            {periods.map(([homeroom, info]) => (
              <button
                key={homeroom}
                className={`period-btn ${selectedPeriod === info.period ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(info.period)}
              >
                {info.name}
              </button>
            ))}
          </div>

          <div className="card">
            <h3>Select Your Name</h3>
            <div className="alert alert-info mb-4">
              This form is <strong>INDIVIDUAL</strong>. Every pod member must complete their own evaluation.
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {getStudentsByPeriod(selectedPeriod).filter(s => s.podNumber).map(student => {
                const hasCompleted = state.assessments.some(
                  a => a.assessorId === student.id && a.isSelfEval
                );
                return (
                  <div key={student.id} className="member-item">
                    <div>
                      <div className="member-name">{student.firstName} {student.lastName}</div>
                      <div className="member-role">Pod {student.podNumber} - {student.role || 'No Role'}</div>
                    </div>
                    {hasCompleted ? (
                      <span className="badge badge-success">
                        <CheckCircle size={14} /> Completed
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSelectStudent(student)}
                      >
                        Start Evaluation
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {step === 'self-eval' && selectedStudent && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>Part 1: Self-Evaluation</h3>
            <button className="btn btn-secondary" onClick={() => setStep('select')}>
              Back
            </button>
          </div>

          <div className="alert alert-info mb-4">
            <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong><br />
            Pod {selectedStudent.podNumber} - {selectedStudent.role || 'No Role'}
          </div>

          <p className="mb-4">Be honest about your own performance. (1 = Strongly Disagree, 5 = Strongly Agree)</p>

          {SELF_EVAL_QUESTIONS.map(question => (
            <div key={question.id} className="form-group" style={{ marginBottom: '24px' }}>
              <label>{question.text}</label>
              <StarRating
                value={selfScores[question.id] || 0}
                onChange={(score) => setSelfScores({ ...selfScores, [question.id]: score })}
              />
              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '13px' }}>Explain your contribution:</label>
                <textarea
                  value={selfExplanations[question.id] || ''}
                  onChange={(e) => setSelfExplanations({ ...selfExplanations, [question.id]: e.target.value })}
                  placeholder="Describe what you did..."
                  rows={3}
                />
              </div>
            </div>
          ))}

          <div className="form-group">
            <label>What was your single biggest contribution to this project?</label>
            <textarea
              value={biggestContribution}
              onChange={(e) => setBiggestContribution(e.target.value)}
              placeholder="Describe your biggest contribution..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>What was the biggest challenge you faced, and how did you (or the team) overcome it?</label>
            <textarea
              value={biggestChallenge}
              onChange={(e) => setBiggestChallenge(e.target.value)}
              placeholder="Describe the challenge and how it was resolved..."
              rows={4}
            />
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleSaveSelfEval}
            style={{ width: '100%' }}
            disabled={Object.keys(selfScores).length < SELF_EVAL_QUESTIONS.length}
          >
            Continue to Peer Evaluation
          </button>
        </div>
      )}

      {step === 'peer-eval' && selectedStudent && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>Part 2: Peer Evaluation</h3>
            <button className="btn btn-secondary" onClick={() => setStep('self-eval')}>
              Back
            </button>
          </div>

          {(() => {
            const peers = getPeersToEvaluate();
            const currentPeer = peers[currentPeerIndex];

            if (!currentPeer) {
              return <div className="alert alert-warning">No peers to evaluate.</div>;
            }

            const currentEval = peerEvaluations[currentPeer.id] || { scores: {}, comments: '' };

            return (
              <>
                <div className="alert alert-info mb-4">
                  Evaluating Teammate {currentPeerIndex + 1} of {peers.length}:<br />
                  <strong>{currentPeer.firstName} {currentPeer.lastName}</strong>
                  {currentPeer.role && <span> - {currentPeer.role}</span>}
                </div>

                {PEER_EVAL_QUESTIONS.map(question => (
                  <div key={question.id} className="form-group">
                    <label>{question.text}</label>
                    <StarRating
                      value={currentEval.scores[question.id] || 0}
                      onChange={(score) => {
                        setPeerEvaluations({
                          ...peerEvaluations,
                          [currentPeer.id]: {
                            ...currentEval,
                            scores: { ...currentEval.scores, [question.id]: score }
                          }
                        });
                      }}
                    />
                  </div>
                ))}

                <div className="form-group">
                  <label>Comments (Optional):</label>
                  <textarea
                    value={currentEval.comments}
                    onChange={(e) => {
                      setPeerEvaluations({
                        ...peerEvaluations,
                        [currentPeer.id]: {
                          ...currentEval,
                          comments: e.target.value
                        }
                      });
                    }}
                    placeholder="Any additional comments about this teammate..."
                    rows={3}
                  />
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSavePeerEval}
                  style={{ width: '100%' }}
                  disabled={Object.keys(currentEval.scores).length < PEER_EVAL_QUESTIONS.length}
                >
                  {currentPeerIndex < peers.length - 1 ? 'Next Teammate' : 'Continue to Team Advocacy'}
                </button>
              </>
            );
          })()}
        </div>
      )}

      {step === 'advocacy' && selectedStudent && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>Part 3: Team Advocacy (Confidential)</h3>
            <button className="btn btn-secondary" onClick={() => setStep('peer-eval')}>
              Back
            </button>
          </div>

          <div className="alert alert-warning mb-4">
            <AlertCircle size={18} />
            This section is for accountability. Use this space if you need to privately flag any major participation issues.
            Remember the "ASAP" rule: this is a final confirmation, not the first notification.
          </div>

          <div className="form-group">
            <div className="checkbox-group" style={{ marginBottom: '16px' }}>
              <input
                type="radio"
                id="workedWell"
                name="teamAdvocacy"
                checked={teamWorkedWell}
                onChange={() => setTeamWorkedWell(true)}
              />
              <label htmlFor="workedWell" style={{ marginBottom: 0 }}>
                My team worked well together, and everyone contributed fairly.
              </label>
            </div>
            <div className="checkbox-group">
              <input
                type="radio"
                id="hadIssues"
                name="teamAdvocacy"
                checked={!teamWorkedWell}
                onChange={() => setTeamWorkedWell(false)}
              />
              <label htmlFor="hadIssues" style={{ marginBottom: 0 }}>
                My team had some participation issues.
              </label>
            </div>
          </div>

          {!teamWorkedWell && (
            <div className="form-group">
              <label>Please briefly and professionally explain the issue:</label>
              <textarea
                value={participationIssues}
                onChange={(e) => setParticipationIssues(e.target.value)}
                placeholder="Describe the participation issues..."
                rows={4}
              />
            </div>
          )}

          <button
            className="btn btn-success btn-lg"
            onClick={handleSubmitAll}
            style={{ width: '100%' }}
          >
            <Save size={18} /> Submit Complete Evaluation
          </button>
        </div>
      )}

      {step === 'complete' && (
        <div className="card">
          <div className="empty-state">
            <CheckCircle size={64} style={{ color: '#059669' }} />
            <h3>Evaluation Submitted Successfully!</h3>
            <p>Thank you for completing your self and peer evaluation.</p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => {
                setStep('select');
                setSelectedStudent(null);
                resetForm();
              }}
            >
              Back to Student List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfAssessment;
