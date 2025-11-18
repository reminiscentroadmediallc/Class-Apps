import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { PERIOD_MAPPING } from '../data/initialStudents';
import { Save, Upload, AlertCircle } from 'lucide-react';

const STEMCareers = () => {
  const { state, dispatch } = useApp();
  const [editingCareers, setEditingCareers] = useState({});
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const handleCareerChange = (podKey, career) => {
    setEditingCareers({
      ...editingCareers,
      [podKey]: career
    });
  };

  const handleSaveAllCareers = () => {
    // Save all edited careers
    Object.entries(editingCareers).forEach(([podKey, career]) => {
      if (career && career.trim()) {
        dispatch({
          type: 'UPDATE_STEM_CAREER',
          payload: { podKey, career: career.trim() }
        });
      }
    });
    setEditingCareers({});
    alert('STEM Careers saved successfully!');
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setImportError('');
        setImportSuccess('');
        const csv = event.target.result;
        const lines = csv.trim().split('\n');

        if (lines.length < 2) {
          setImportError('CSV must have header and at least one data row');
          return;
        }

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const periodIdx = headers.indexOf('period');
        const podIdx = headers.indexOf('pod number');
        const careerIdx = headers.indexOf('stem career');

        if (periodIdx === -1 || podIdx === -1 || careerIdx === -1) {
          setImportError('CSV must have columns: Period, Pod Number, STEM Career');
          return;
        }

        const careersToImport = {};
        let importCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.trim());
          if (parts.length < 3 || !parts[periodIdx] || !parts[podIdx]) continue;

          const period = parseInt(parts[periodIdx]);
          const podNumber = parseInt(parts[podIdx]);
          const career = parts[careerIdx];

          // Validate pod exists
          const podKey = `${period}_${podNumber}`;
          const podExists = Object.values(state.pods).some(p => p.id === podKey);

          if (!podExists && !state.students.some(s => s.period === period && s.podNumber === podNumber)) {
            console.warn(`Pod ${podKey} not found, skipping`);
            continue;
          }

          careersToImport[podKey] = career;
          importCount++;
        }

        if (importCount === 0) {
          setImportError('No valid careers found in CSV');
          return;
        }

        dispatch({
          type: 'IMPORT_STEM_CAREERS',
          payload: careersToImport
        });

        setImportSuccess(`Successfully imported ${importCount} STEM careers!`);
        e.target.value = ''; // Reset file input
      } catch (err) {
        setImportError(`Error parsing CSV: ${err.message}`);
      }
    };

    reader.readAsText(file);
  };

  const periods = useMemo(
    () => Object.entries(PERIOD_MAPPING)
      .sort((a, b) => a[1].period - b[1].period)
      .map(([code, info]) => ({ code, ...info })),
    []
  );

  // Memoize pod data to prevent expensive recalculations on every keystroke
  const periodPodsData = useMemo(() => {
    const data = {};
    periods.forEach(period => {
      const podsInPeriod = Array.from(new Set(
        state.students
          .filter(s => s.period === period.period && s.podNumber)
          .map(s => s.podNumber)
      )).sort((a, b) => a - b);

      data[period.period] = {
        pods: podsInPeriod,
        podDetails: {}
      };

      podsInPeriod.forEach(podNum => {
        const podKey = `${period.period}_${podNum}`;
        const podMembers = state.students.filter(s => s.period === period.period && s.podNumber === podNum);
        data[period.period].podDetails[podKey] = {
          members: podMembers
        };
      });
    });
    return data;
  }, [state.students, periods]);

  const hasChanges = Object.keys(editingCareers).length > 0;

  return (
    <div>
      <h2>STEM Careers Management</h2>

      {importSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          {importSuccess}
        </div>
      )}

      {importError && (
        <div className="alert alert-danger" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          {importError}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3>Import STEM Careers from CSV</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
          Upload a CSV file with columns: Period, Pod Number, STEM Career
        </p>
        <label style={{ display: 'inline-block' }}>
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVImport}
            style={{ display: 'none' }}
          />
          <span className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} /> Import CSV
          </span>
        </label>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
          Example: <code>1,1,Marine Biology</code>
        </p>
      </div>

      {periods.map(period => {
        const periodData = periodPodsData[period.period];
        const podsInPeriod = periodData?.pods || [];

        if (podsInPeriod.length === 0) {
          return null;
        }

        return (
          <div key={period.period} className="card" style={{ marginBottom: '20px' }}>
            <h3>{period.name} ({period.code})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
              {podsInPeriod.map(podNum => {
                const podKey = `${period.period}_${podNum}`;
                const podMembers = periodData.podDetails[podKey]?.members || [];
                const currentCareer = editingCareers[podKey] ?? state.stemCareers[podKey] ?? '';

                return (
                  <div key={podKey} style={{
                    border: '1px solid #ddd',
                    padding: '15px',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Pod {podNum}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {podMembers.length} student{podMembers.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '13px' }}>STEM Career</label>
                      <input
                        type="text"
                        value={currentCareer}
                        onChange={(e) => handleCareerChange(podKey, e.target.value)}
                        placeholder="e.g., Marine Biology, Robotics, Climate Science"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', fontSize: '14px' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {hasChanges && (
        <div style={{ marginTop: '20px' }}>
          <button
            className="btn btn-success btn-lg"
            onClick={handleSaveAllCareers}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={18} /> Save All STEM Careers
          </button>
          <div className="alert alert-warning" style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <span>You have unsaved changes. Click "Save All STEM Careers" to persist them.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default STEMCareers;
