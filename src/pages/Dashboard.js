import React from 'react';
import { useApp } from '../contexts/AppContext';
import { PERIOD_MAPPING } from '../data/initialStudents';
import { Users, CheckCircle, Clock, AlertCircle, BarChart3, TrendingUp, Target, Zap } from 'lucide-react';

const Dashboard = () => {
  const { state, getStudentsByPeriod, getPodsByPeriod, calculateStudentGrade } = useApp();

  const periods = Object.entries(PERIOD_MAPPING).sort((a, b) => a[1].period - b[1].period);

  const getOverallStats = () => {
    const totalStudents = state.students.length;
    const studentsInPods = state.students.filter(s => s.podNumber).length;
    const studentsWithRoles = state.students.filter(s => s.role).length;
    const totalAssessments = state.assessments.length;
    const studentsGraded = Object.keys(state.teacherGrades).length;

    const studentsNeedingGrades = state.students.filter(s => {
      const grade = calculateStudentGrade(s.id);
      return !grade || grade.assessmentCount === 0;
    }).length;

    return {
      totalStudents,
      studentsInPods,
      studentsWithRoles,
      totalAssessments,
      studentsGraded,
      studentsNeedingGrades
    };
  };

  const getPeriodStats = (period) => {
    const students = getStudentsByPeriod(period);
    const pods = getPodsByPeriod(period);

    const inPods = students.filter(s => s.podNumber).length;
    const withRoles = students.filter(s => s.role).length;
    const assessed = students.filter(s => {
      const assessments = state.assessments.filter(a => a.assesseeId === s.id);
      return assessments.length > 0;
    }).length;
    const teacherGraded = students.filter(s => state.teacherGrades[s.id]).length;

    const podStages = {
      not_started: 0,
      in_progress: 0,
      completed: 0
    };

    pods.forEach(pod => {
      podStages[pod.stage || 'not_started']++;
    });

    return {
      total: students.length,
      inPods,
      withRoles,
      assessed,
      teacherGraded,
      podsCount: pods.length,
      podStages
    };
  };

  const getStudentsNeedingAssessment = () => {
    return state.students.filter(s => {
      if (!s.podNumber) return false;
      const assessments = state.assessments.filter(a => a.assesseeId === s.id);
      return assessments.length === 0;
    });
  };

  const getStudentsNeedingTeacherGrade = () => {
    return state.students.filter(s => {
      return s.podNumber && !state.teacherGrades[s.id];
    });
  };

  const stats = getOverallStats();
  const needingAssessment = getStudentsNeedingAssessment();
  const needingTeacherGrade = getStudentsNeedingTeacherGrade();

  // Calculate completion percentages
  const podsCompletionPercent = stats.totalStudents > 0
    ? ((stats.studentsInPods / stats.totalStudents) * 100).toFixed(0)
    : 0;
  const assessmentCompletionPercent = stats.studentsInPods > 0
    ? ((stats.totalAssessments / (stats.studentsInPods * 2)) * 100).toFixed(0)
    : 0;
  const gradeCompletionPercent = stats.studentsInPods > 0
    ? ((stats.studentsGraded / stats.studentsInPods) * 100).toFixed(0)
    : 0;

  return (
    <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #f0f4f8 100%)', minHeight: '100vh', paddingBottom: '40px' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>Overview Dashboard</h2>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Track progress across all periods and pods</p>
      </div>

      {/* Key Metrics - Modern Cards */}
      <div className="grid grid-4" style={{ marginBottom: '40px', gap: '20px' }}>
        {/* Total Students */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '160px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.15)';
        }}>
          <div style={{ fontSize: '14px', opacity: '0.9', fontWeight: '500' }}>Total Students</div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>{stats.totalStudents}</div>
            <div style={{ fontSize: '13px', opacity: '0.85' }}>Registered in system</div>
          </div>
          <Users size={24} style={{ opacity: '0.6' }} />
        </div>

        {/* Students in Pods */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '160px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.15)';
        }}>
          <div style={{ fontSize: '14px', opacity: '0.9', fontWeight: '500' }}>Pod Assignment</div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>{stats.studentsInPods}</div>
            <div style={{ fontSize: '13px', opacity: '0.85' }}>{podsCompletionPercent}% of students</div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            height: '4px',
            borderRadius: '2px',
            marginTop: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              height: '100%',
              width: `${podsCompletionPercent}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>

        {/* Peer Assessments */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '160px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.15)';
        }}>
          <div style={{ fontSize: '14px', opacity: '0.9', fontWeight: '500' }}>Peer Assessments</div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>{stats.totalAssessments}</div>
            <div style={{ fontSize: '13px', opacity: '0.85' }}>{assessmentCompletionPercent}% target</div>
          </div>
          <Zap size={24} style={{ opacity: '0.6' }} />
        </div>

        {/* Teacher Grades */}
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '160px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.15)';
        }}>
          <div style={{ fontSize: '14px', opacity: '0.9', fontWeight: '500' }}>Teacher Grades</div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>{stats.studentsGraded}</div>
            <div style={{ fontSize: '13px', opacity: '0.85' }}>{gradeCompletionPercent}% complete</div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            height: '4px',
            borderRadius: '2px',
            marginTop: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              height: '100%',
              width: `${gradeCompletionPercent}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Period-by-Period Overview */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '28px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        marginBottom: '40px'
      }}>
        <h3 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '24px'
        }}>
          <TrendingUp size={22} style={{ color: '#3b82f6' }} />
          Period-by-Period Status
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 100%)',
                borderBottom: '2px solid #d1d5db'
              }}>
                <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Period</th>
                <th style={{ padding: '14px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Students</th>
                <th style={{ padding: '14px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>In Pods</th>
                <th style={{ padding: '14px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>With Roles</th>
                <th style={{ padding: '14px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Pods</th>
                <th style={{ padding: '14px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Not Started</th>
                <th style={{ padding: '14px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>In Progress</th>
                <th style={{ padding: '14px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Completed</th>
                <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {periods.map(([homeroom, info]) => {
                const pStats = getPeriodStats(info.period);
                const progress = pStats.total > 0
                  ? ((pStats.assessed / pStats.total) * 100).toFixed(0)
                  : 0;

                return (
                  <tr key={homeroom} style={{
                    borderBottom: '1px solid #e5e7eb',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '14px', fontWeight: '600', color: '#1f2937' }}>{info.name}</td>
                    <td style={{ padding: '14px', textAlign: 'center', color: '#374151' }}>{pStats.total}</td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span style={{
                        color: pStats.inPods === pStats.total ? '#059669' : '#f59e0b',
                        fontWeight: '600'
                      }}>
                        {pStats.inPods}/{pStats.total}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span style={{
                        color: pStats.withRoles === pStats.total ? '#059669' : '#f59e0b',
                        fontWeight: '600'
                      }}>
                        {pStats.withRoles}/{pStats.total}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center', color: '#374151', fontWeight: '600' }}>{pStats.podsCount}</td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span style={{
                        background: '#e5e7eb',
                        color: '#374151',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontWeight: '500',
                        fontSize: '13px'
                      }}>
                        {pStats.podStages.not_started}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontWeight: '500',
                        fontSize: '13px'
                      }}>
                        {pStats.podStages.in_progress}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span style={{
                        background: '#d1fae5',
                        color: '#065f46',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontWeight: '500',
                        fontSize: '13px'
                      }}>
                        {pStats.podStages.completed}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          flex: 1,
                          background: '#e5e7eb',
                          height: '6px',
                          borderRadius: '3px',
                          overflow: 'hidden',
                          minWidth: '60px'
                        }}>
                          <div style={{
                            background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                            height: '100%',
                            width: `${progress}%`,
                            transition: 'width 0.5s ease'
                          }} />
                        </div>
                        <span style={{
                          fontWeight: '600',
                          color: '#374151',
                          minWidth: '35px',
                          textAlign: 'right'
                        }}>{progress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Students Needing Assessment & Teacher Grade */}
      <div className="grid grid-2" style={{ gap: '24px', marginBottom: '40px' }}>
        {/* Students Needing Assessment */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            <AlertCircle size={20} style={{ color: '#f59e0b' }} />
            Students Needing Peer Assessment
            <span style={{
              background: '#fef3c7',
              color: '#92400e',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '14px',
              fontWeight: '600',
              marginLeft: '8px'
            }}>
              {needingAssessment.length}
            </span>
          </h3>
          {needingAssessment.length === 0 ? (
            <div style={{
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              border: '1px solid #6ee7b7',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#065f46'
            }}>
              <CheckCircle size={20} />
              <span style={{ fontWeight: '500' }}>All pod members have been assessed!</span>
            </div>
          ) : (
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Name</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Period</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Pod</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {needingAssessment.slice(0, 20).map((student, idx) => (
                    <tr key={student.id} style={{
                      borderBottom: '1px solid #e5e7eb',
                      background: idx % 2 === 0 ? 'transparent' : '#f9fafb'
                    }}>
                      <td style={{ padding: '10px', color: '#1f2937', fontWeight: '500' }}>{student.firstName} {student.lastName}</td>
                      <td style={{ padding: '10px', color: '#6b7280' }}>{student.periodName}</td>
                      <td style={{ padding: '10px', color: '#6b7280' }}>Pod {student.podNumber}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          background: student.role ? '#dbeafe' : '#f3f4f6',
                          color: student.role ? '#1e40af' : '#6b7280',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {student.role || 'No Role'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {needingAssessment.length > 20 && (
                <p style={{ color: '#6b7280', marginTop: '12px', fontSize: '13px' }}>
                  And {needingAssessment.length - 20} more students...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Students Needing Teacher Grade */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          borderLeft: '4px solid #ef4444'
        }}>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            <Clock size={20} style={{ color: '#ef4444' }} />
            Students Needing Teacher Grade
            <span style={{
              background: '#fee2e2',
              color: '#7f1d1d',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '14px',
              fontWeight: '600',
              marginLeft: '8px'
            }}>
              {needingTeacherGrade.length}
            </span>
          </h3>
          {needingTeacherGrade.length === 0 ? (
            <div style={{
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              border: '1px solid #6ee7b7',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#065f46'
            }}>
              <CheckCircle size={20} />
              <span style={{ fontWeight: '500' }}>All students have teacher grades!</span>
            </div>
          ) : (
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Name</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Period</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Pod</th>
                  </tr>
                </thead>
                <tbody>
                  {needingTeacherGrade.slice(0, 20).map((student, idx) => (
                    <tr key={student.id} style={{
                      borderBottom: '1px solid #e5e7eb',
                      background: idx % 2 === 0 ? 'transparent' : '#f9fafb'
                    }}>
                      <td style={{ padding: '10px', color: '#1f2937', fontWeight: '500' }}>{student.firstName} {student.lastName}</td>
                      <td style={{ padding: '10px', color: '#6b7280' }}>{student.periodName}</td>
                      <td style={{ padding: '10px', color: '#6b7280' }}>Pod {student.podNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {needingTeacherGrade.length > 20 && (
                <p style={{ color: '#6b7280', marginTop: '12px', fontSize: '13px' }}>
                  And {needingTeacherGrade.length - 20} more students...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pod Stage Summary by Period */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '28px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <h3 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '28px'
        }}>
          <Target size={22} style={{ color: '#3b82f6' }} />
          Pod Assessment Stages by Period
        </h3>

        {periods.map(([homeroom, info]) => {
          const pods = getPodsByPeriod(info.period);
          if (pods.length === 0) return null;

          return (
            <div key={homeroom} style={{ marginBottom: '32px' }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '2px solid #e5e7eb'
              }}>
                {info.name}
              </h4>
              <div className="grid grid-4" style={{ gap: '16px' }}>
                {pods.sort((a, b) => a.podNumber - b.podNumber).map(pod => {
                  const members = pod.members.map(id =>
                    state.students.find(s => s.id === id)
                  ).filter(Boolean);

                  const stageConfig = {
                    not_started: {
                      color: '#e5e7eb',
                      textColor: '#6b7280',
                      label: 'Not Started',
                      borderColor: '#d1d5db'
                    },
                    in_progress: {
                      color: '#fef3c7',
                      textColor: '#92400e',
                      label: 'In Progress',
                      borderColor: '#fde68a'
                    },
                    completed: {
                      color: '#d1fae5',
                      textColor: '#065f46',
                      label: 'Completed',
                      borderColor: '#a7f3d0'
                    }
                  };

                  const stage = stageConfig[pod.stage || 'not_started'];

                  return (
                    <div
                      key={pod.id}
                      style={{
                        background: 'white',
                        border: `2px solid ${stage.borderColor}`,
                        borderRadius: '10px',
                        padding: '16px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#1f2937'
                        }}>
                          Pod {pod.podNumber}
                        </div>
                        <span style={{
                          background: stage.color,
                          color: stage.textColor,
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {stage.label}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        marginBottom: '12px',
                        fontWeight: '500'
                      }}>
                        {members.length} {members.length === 1 ? 'member' : 'members'}
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        {members.map(m => (
                          <div
                            key={m.id}
                            style={{
                              fontSize: '12px',
                              color: '#374151',
                              padding: '6px 0',
                              borderBottom: '1px solid #f3f4f6'
                            }}
                          >
                            <div style={{ fontWeight: '500' }}>{m.firstName} {m.lastName}</div>
                            {m.role && (
                              <div style={{
                                fontSize: '11px',
                                color: '#3b82f6',
                                marginTop: '2px',
                                fontWeight: '500'
                              }}>
                                {m.role}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
