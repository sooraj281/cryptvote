import { useState } from 'react';

function ManageAdminsTab({ contract, showMessage }) {
  const [formData, setFormData] = useState({
    address: '',
    role: '3'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return;

    try {
      setSubmitting(true);
      const tx = await contract.addAdmin(formData.address, formData.role);
      
      showMessage('success', 'Adding admin... Waiting for confirmation...');
      await tx.wait();
      showMessage('success', 'Admin added successfully!');
      
      setFormData({ address: '', role: '2' });
    } catch (error) {
      console.error('Error adding admin:', error);
      showMessage('error', error.reason || 'Failed to add admin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Manage Administrators</h2>
      
      <div className="info-box" style={{marginBottom: '20px', padding: '15px', background: '#f0f4ff', borderRadius: '8px'}}>
        <h4>Admin Roles:</h4>
        <ul style={{marginLeft: '20px', color: '#666'}}>
          <li><strong>Locality Officer (1):</strong> Verify candidates</li>
          <li><strong>Polling Officer (2):</strong> Verify voters</li>
          <li><strong>Election Authority (3):</strong> Create elections, end elections</li>
          <li><strong>Super Admin (4):</strong> Full control, can add other admins</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Admin Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="0x..."
            required
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            required
          >
            <option value="1">Locality Officer</option>
            <option value="2">Polling Officer</option>
            <option value="3">Election Authority</option>
            <option value="4">Super Admin</option>
          </select>
        </div>
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Admin'}
        </button>
      </form>
    </div>
  );
}

export default ManageAdminsTab;
