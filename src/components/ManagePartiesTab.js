import React, { useState, useEffect } from 'react';

function ManagePartiesTab({ contract, showMessage }) {
  const [parties, setParties] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    symbol: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contract) {
      loadParties();
    }
  }, [contract]);

  const loadParties = async () => {
    try {
      setLoading(true);
      const result = await contract.getParties();
      const partyList = result.names.map((name, index) => ({
        name,
        symbol: result.symbols[index]
      }));
      setParties(partyList);
    } catch (error) {
      console.error('Error loading parties:', error);
      showMessage('error', 'Failed to load parties');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return;

    try {
      setSubmitting(true);
      const tx = await contract.addParty(formData.name, formData.symbol);
      
      showMessage('success', 'Adding party... Waiting for confirmation...');
      await tx.wait();
      showMessage('success', 'Party added successfully!');
      
      setFormData({ name: '', symbol: '' });
      loadParties();
    } catch (error) {
      console.error('Error adding party:', error);
      showMessage('error', error.reason || 'Failed to add party');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Manage Political Parties</h2>
      
      <form onSubmit={handleSubmit} style={{marginBottom: '30px'}}>
        <div className="form-group">
          <label>Party Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g., Democratic Party"
            required
          />
        </div>
        <div className="form-group">
          <label>Party Symbol</label>
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) => setFormData({...formData, symbol: e.target.value})}
            placeholder="e.g., 🐘 or DEMO"
            required
          />
        </div>
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Party'}
        </button>
      </form>

      <h3>Existing Parties</h3>
      {loading && <div className="loading">Loading parties...</div>}
      
      {!loading && parties.length === 0 && (
        <div className="loading">No parties registered yet</div>
      )}

      {!loading && parties.length > 0 && (
        <div className="party-list">
          {parties.map((party, index) => (
            <div key={index} className="party-card">
              <h4>{party.name}</h4>
              <p><strong>Symbol:</strong> {party.symbol}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManagePartiesTab;
