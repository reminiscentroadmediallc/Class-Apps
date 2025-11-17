import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { initialStudents, PERIOD_MAPPING, ROLE_QUESTIONS } from '../data/initialStudents';

const AppContext = createContext();

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initializeStudents = (rawStudents) => {
  return rawStudents.map(student => ({
    ...student,
    id: generateId(),
    period: PERIOD_MAPPING[student.homeroom]?.period || null,
    periodName: PERIOD_MAPPING[student.homeroom]?.name || 'Unassigned',
    podNumber: null,
    roles: [], // Changed from single role to array of roles
    sharedRoles: {} // { roleName: [sharedWithIds] }
  }));
};

const initialState = {
  students: initializeStudents(initialStudents),
  pods: {},
  assessments: [],
  teacherGrades: {},
  currentPeriod: 1,
  currentPod: null
};

const loadState = () => {
  try {
    const saved = localStorage.getItem('podGradingState');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: convert old single role to roles array
      if (parsed.students) {
        parsed.students = parsed.students.map(s => {
          if (s.role && !s.roles) {
            return {
              ...s,
              roles: [s.role],
              sharedRoles: s.sharedRole ? { [s.role]: s.sharedWith || [] } : {}
            };
          }
          if (!s.roles) {
            s.roles = [];
          }
          if (!s.sharedRoles) {
            s.sharedRoles = {};
          }
          return s;
        });
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
  return initialState;
};

const saveState = (state) => {
  try {
    localStorage.setItem('podGradingState', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
};

const appReducer = (state, action) => {
  let newState;

  switch (action.type) {
    case 'IMPORT_STUDENTS':
      const importedStudents = action.payload.map(student => ({
        ...student,
        id: student.id || generateId(),
        period: PERIOD_MAPPING[student.homeroom]?.period || null,
        periodName: PERIOD_MAPPING[student.homeroom]?.name || 'Unassigned',
        podNumber: student.podNumber || null,
        roles: student.roles || (student.role ? [student.role] : []),
        sharedRoles: student.sharedRoles || {}
      }));
      newState = { ...state, students: importedStudents };
      break;

    case 'ADD_STUDENTS':
      const newStudents = action.payload.map(student => ({
        ...student,
        id: generateId(),
        period: PERIOD_MAPPING[student.homeroom]?.period || null,
        periodName: PERIOD_MAPPING[student.homeroom]?.name || 'Unassigned',
        podNumber: student.podNumber || null,
        roles: student.roles || [],
        sharedRoles: {}
      }));
      newState = { ...state, students: [...state.students, ...newStudents] };
      break;

    case 'UPDATE_STUDENT':
      newState = {
        ...state,
        students: state.students.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        )
      };
      break;

    case 'ASSIGN_POD':
      const { studentId, podNumber, period } = action.payload;
      const podKey = `${period}_${podNumber}`;

      const updatedStudents = state.students.map(s =>
        s.id === studentId ? { ...s, podNumber, period } : s
      );

      const existingPod = state.pods[podKey] || {
        id: podKey,
        period,
        podNumber,
        members: [],
        stage: 'not_started'
      };

      if (!existingPod.members.includes(studentId)) {
        existingPod.members = [...existingPod.members, studentId];
      }

      newState = {
        ...state,
        students: updatedStudents,
        pods: { ...state.pods, [podKey]: existingPod }
      };
      break;

    case 'REMOVE_FROM_POD':
      const studentToRemove = state.students.find(s => s.id === action.payload.studentId);
      if (!studentToRemove || !studentToRemove.podNumber) {
        return state;
      }

      const oldPodKey = `${studentToRemove.period}_${studentToRemove.podNumber}`;
      const oldPod = state.pods[oldPodKey];

      newState = {
        ...state,
        students: state.students.map(s =>
          s.id === action.payload.studentId
            ? { ...s, podNumber: null, roles: [], sharedRoles: {} }
            : s
        ),
        pods: oldPod ? {
          ...state.pods,
          [oldPodKey]: {
            ...oldPod,
            members: oldPod.members.filter(id => id !== action.payload.studentId)
          }
        } : state.pods
      };
      break;

    case 'ASSIGN_ROLES':
      newState = {
        ...state,
        students: state.students.map(s =>
          s.id === action.payload.studentId
            ? {
                ...s,
                roles: action.payload.roles || [],
                sharedRoles: action.payload.sharedRoles || {}
              }
            : s
        )
      };
      break;

    case 'BULK_IMPORT_POD_DATA':
      const importData = action.payload;
      let studentsToUpdate = [...state.students];
      let podsToUpdate = { ...state.pods };

      importData.forEach(item => {
        const studentIndex = studentsToUpdate.findIndex(s =>
          s.firstName.toUpperCase() === item.firstName.toUpperCase() &&
          s.lastName.toUpperCase() === item.lastName.toUpperCase() &&
          s.homeroom === item.homeroom
        );

        if (studentIndex !== -1) {
          const student = studentsToUpdate[studentIndex];
          const periodVal = PERIOD_MAPPING[item.homeroom]?.period;

          if (periodVal && item.podNumber) {
            // Handle roles - can be comma-separated string or array
            let rolesArray = [];
            if (item.roles) {
              rolesArray = Array.isArray(item.roles) ? item.roles : item.roles.split(',').map(r => r.trim());
            } else if (item.role) {
              rolesArray = item.role.split(',').map(r => r.trim());
            }

            studentsToUpdate[studentIndex] = {
              ...student,
              podNumber: item.podNumber,
              roles: rolesArray,
              sharedRoles: item.sharedRoles || {}
            };

            const podKey = `${periodVal}_${item.podNumber}`;
            if (!podsToUpdate[podKey]) {
              podsToUpdate[podKey] = {
                id: podKey,
                period: periodVal,
                podNumber: item.podNumber,
                members: [],
                stage: 'not_started'
              };
            }
            if (!podsToUpdate[podKey].members.includes(student.id)) {
              podsToUpdate[podKey].members.push(student.id);
            }
          }
        }
      });

      newState = { ...state, students: studentsToUpdate, pods: podsToUpdate };
      break;

    case 'BULK_DELETE_POD_ASSIGNMENTS':
      const periodToReset = action.payload.period;
      newState = {
        ...state,
        students: state.students.map(s =>
          s.period === periodToReset
            ? { ...s, podNumber: null, roles: [], sharedRoles: {} }
            : s
        ),
        pods: Object.fromEntries(
          Object.entries(state.pods).filter(([key]) => !key.startsWith(`${periodToReset}_`))
        )
      };
      break;

    case 'ADD_ASSESSMENT':
      newState = {
        ...state,
        assessments: [...state.assessments, { ...action.payload, id: generateId(), timestamp: Date.now() }]
      };
      break;

    case 'UPDATE_POD_STAGE':
      const podKeyToUpdate = action.payload.podKey;
      newState = {
        ...state,
        pods: {
          ...state.pods,
          [podKeyToUpdate]: {
            ...state.pods[podKeyToUpdate],
            stage: action.payload.stage
          }
        }
      };
      break;

    case 'ADD_TEACHER_GRADE':
      newState = {
        ...state,
        teacherGrades: {
          ...state.teacherGrades,
          [action.payload.studentId]: action.payload.grades
        }
      };
      break;

    case 'SET_CURRENT_PERIOD':
      newState = { ...state, currentPeriod: action.payload };
      break;

    case 'SET_CURRENT_POD':
      newState = { ...state, currentPod: action.payload };
      break;

    case 'RESET_ALL_DATA':
      newState = {
        ...initialState,
        students: initializeStudents(initialStudents)
      };
      break;

    case 'RESET_ASSESSMENTS':
      newState = {
        ...state,
        assessments: [],
        teacherGrades: {},
        pods: Object.fromEntries(
          Object.entries(state.pods).map(([key, pod]) => [
            key,
            { ...pod, stage: 'not_started' }
          ])
        )
      };
      break;

    default:
      return state;
  }

  saveState(newState);
  return newState;
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, null, loadState);
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('podGradingAdmin') === 'true';
  });

  // Auto-save on state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Save admin status
  useEffect(() => {
    localStorage.setItem('podGradingAdmin', isAdmin.toString());
  }, [isAdmin]);

  const value = {
    state,
    dispatch,
    isAdmin,
    setIsAdmin,
    // Helper functions
    getStudentsByPeriod: (period) => state.students.filter(s => s.period === period),
    getStudentById: (id) => state.students.find(s => s.id === id),
    getPodsByPeriod: (period) => Object.values(state.pods).filter(p => p.period === period),
    getPodMembers: (podKey) => {
      const pod = state.pods[podKey];
      if (!pod) return [];
      return pod.members.map(id => state.students.find(s => s.id === id)).filter(Boolean);
    },
    getStudentAssessments: (studentId) => state.assessments.filter(a => a.assesseeId === studentId),
    getAssessmentsGivenBy: (studentId) => state.assessments.filter(a => a.assessorId === studentId),
    calculateStudentGrade: (studentId) => {
      const student = state.students.find(s => s.id === studentId);
      if (!student) return null;

      const peerAssessments = state.assessments.filter(a => a.assesseeId === studentId && !a.isSelfEval);
      const teacherGrade = state.teacherGrades[studentId];

      if (peerAssessments.length === 0 && !teacherGrade) return null;

      let totalPeerScore = 0;
      let maxPeerScore = 0;

      peerAssessments.forEach(assessment => {
        Object.values(assessment.roleScores || {}).forEach(score => {
          totalPeerScore += score;
          maxPeerScore += 5;
        });
        Object.values(assessment.generalScores || {}).forEach(score => {
          totalPeerScore += score;
          maxPeerScore += 5;
        });
      });

      const peerPercentage = maxPeerScore > 0 ? (totalPeerScore / maxPeerScore) * 100 : 0;

      let teacherPercentage = 0;
      if (teacherGrade) {
        const teacherTotal = (teacherGrade.engagement || 0) + (teacherGrade.activity || 0);
        teacherPercentage = (teacherTotal / 10) * 100;
      }

      // Calculate bonus for multiple roles
      const numRoles = student.roles?.length || 0;
      let bonusPoints = 0;
      let bonusPercentage = 0;

      if (numRoles > 1) {
        // Each additional role adds 5 bonus percentage points (capped at 15%)
        bonusPoints = (numRoles - 1) * 5;
        bonusPercentage = Math.min(bonusPoints, 15);
      }

      // Weight: 60% peer, 40% teacher + bonus
      let finalGrade = teacherGrade
        ? (peerPercentage * 0.6) + (teacherPercentage * 0.4) + bonusPercentage
        : peerPercentage + bonusPercentage;

      // Cap at 110% to allow for some bonus but not unlimited
      finalGrade = Math.min(finalGrade, 110);

      return {
        peerScore: peerPercentage.toFixed(1),
        teacherScore: teacherPercentage.toFixed(1),
        bonusPoints: bonusPercentage,
        finalGrade: finalGrade.toFixed(1),
        assessmentCount: peerAssessments.length,
        numRoles
      };
    }
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
