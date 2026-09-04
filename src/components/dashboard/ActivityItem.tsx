interface ActivityItemProps {
  text: string;
  timestamp: string;
}

export default function ActivityItem({ text, timestamp }: ActivityItemProps) {
  return (
    <div className="activity-item">
      <span className="activity-dot" aria-hidden="true" />
      <div className="activity-body">
        <p className="activity-text">{text}</p>
        <p className="activity-time">{timestamp}</p>
      </div>
    </div>
  );
}
