import { useState } from 'react';

function NominateTab({ contract, elections, showMessage }) {
    const [formData, setFormData] = useState({
        electionId: '',
        name: '',
        partyName: '',
        partySymbol: '',
        bio: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contract) return;

        // Check if election has ended
        const selectedElection = elections.find(e => e.id === parseInt(formData.electionId));
        if (selectedElection) {
            const now = Math.floor(Date.now() / 1000);
            if (now >= selectedElection.endTime) {
                showMessage('error', 'Cannot nominate for an ended election');
                return;
            }
        }

        try {
            setSubmitting(true);
            const tx = await contract.submitNomination(
                formData.electionId,
                formData.name,
                formData.partyName,
                formData.partySymbol,
                formData.bio
            );

            showMessage('success', 'Nomination submitted! Waiting for confirmation...');
            await tx.wait();
            showMessage('success', 'Nomination successful! Awaiting verification.');

            setFormData({ electionId: '', name: '', partyName: '', partySymbol: '', bio: '' });
        } catch (error) {
            console.error('Error nominating:', error);
            showMessage('error', error.reason || 'Nomination failed');
        } finally {
            setSubmitting(false);
        }
    };

    // Filter elections to show only active or upcoming ones
    const availableElections = elections.filter(election => {
        const now = Math.floor(Date.now() / 1000);
        return election.active && now < election.endTime;
    });

    return (
        <div>
            <h2>Submit Nomination</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Select Election</label>
                    <select
                        value={formData.electionId}
                        onChange={(e) => setFormData({ ...formData, electionId: e.target.value })}
                        required
                    >
                        <option value="">Choose an election</option>
                        {availableElections.length === 0 ? (
                            <option value="" disabled>No active elections available</option>
                        ) : (
                            availableElections.map(election => {
                                const now = Math.floor(Date.now() / 1000);
                                const status = now < election.startTime ? ' (Upcoming)' : ' (Active)';
                                return (
                                    <option key={election.id} value={election.id}>
                                        {election.name} - {election.constituency}{status}
                                    </option>
                                );
                            })
                        )}
                    </select>
                </div>
                <div className="form-group">
                    <label>Candidate Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Party Name</label>
                    <input
                        type="text"
                        value={formData.partyName}
                        onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                        placeholder="e.g., Democratic Party"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Party Symbol</label>
                    <input
                        type="text"
                        value={formData.partySymbol}
                        onChange={(e) => setFormData({ ...formData, partySymbol: e.target.value })}
                        placeholder="e.g., 🐘 or DEM"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Bio (IPFS CID)</label>
                    <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Enter IPFS CID for candidate bio"
                        rows="3"
                        required
                    />
                </div>
                <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Nomination'}
                </button>
            </form>
        </div>
    );
}

export default NominateTab;
