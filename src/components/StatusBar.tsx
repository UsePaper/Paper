type Props = {
  wordCount: number;
  fileName: string;
};

function StatusBar({ wordCount, fileName }: Props) {
  return (
    <footer className="status-bar">
      <span className="status-item">{fileName}</span>
      <span className="status-item">{wordCount} words</span>
    </footer>
  );
}

export default StatusBar;
