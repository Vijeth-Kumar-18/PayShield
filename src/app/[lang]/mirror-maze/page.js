import AppIcon from '@/components/AppIcon';

export default function MirrorMazePage() {
  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Mirror Maze Session</h1>
          <p className="page-subtitle">
            A decoy ledger is active while additional identity verification is in progress.
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="balance-card primary">
            <div className="balance-header">
              <h3>Available Balance</h3>
              <span className="balance-badge">Decoy</span>
            </div>
            <div className="balance-amount">₹50,000.00</div>
            <div className="balance-footer">
              <span className="balance-info"><AppIcon name="shield" size={14} /> This protected view is isolated from your real ledger.</span>
            </div>
          </div>
        </div>

        <p style={{ marginTop: 20 }}>
          Complete Childhood Whisper verification via <strong>/api/security/childhood-whisper</strong> to switch back to the real ledger.
        </p>
      </div>
    </div>
  );
}
