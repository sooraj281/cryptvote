import { useState } from 'react';

function CreateElectionTab({ contract, showMessage, loadElections }) {
  const [formData, setFormData] = useState({
    name: '',
    constituency: '',
    startTime: '',
    endTime: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return;

    try {
      setSubmitting(true);
      const startTimestamp = Math.floor(new Date(formData.startTime).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(formData.endTime).getTime() / 1000);

      const tx = await contract.createElection(
        formData.name,
        startTimestamp,
        endTimestamp,
        formData.constituency
      );
      
      showMessage('success', 'Creating election... Waiting for confirmation...');
      await tx.wait();
      showMessage('success', 'Election created successfully!');
      
      setFormData({ name: '', constituency: '', startTime: '', endTime: '' });
      loadElections(contract);
    } catch (error) {
      console.error('Error creating election:', error);
      showMessage('error', error.reason || 'Failed to create election');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Create New Election</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Election Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g., General Election 2024"
            required
          />
        </div>
        <div className="form-group">
          <label>Constituency</label>
          <input
            type="text"
            value={formData.constituency}
            onChange={(e) => setFormData({...formData, constituency: e.target.value})}
            placeholder="e.g., Mumbai North"
            required
          />
        </div>
        <div className="form-group">
          <label>Start Date & Time</label>
          <input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>End Date & Time</label>
          <input
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Election'}
        </button>
      </form>
    </div>
  );
}

export default CreateElectionTab;
