type Props = {
  wordCount: number;
};

function StatusBar({ wordCount }: Props) {
  return (
    <footer className="status-bar">
      <span className="status-item">{wordCount} words</span>
    </footer>
  );
}

export default StatusBar;
