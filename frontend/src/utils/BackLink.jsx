const BackLink = ({ onClick, label = "Back" }) => {
  if (!onClick) return null;

  return (
    <p
      onClick={onClick}
      className="text-blue-400 cursor-pointer inline-flex items-center gap-1"
    >
      ← {label}
    </p>
  );
};

export default BackLink;
