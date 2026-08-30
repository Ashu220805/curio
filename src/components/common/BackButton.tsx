import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  fallback?: string;
  label?: string;
  className?: string;
}

function BackButton({
  fallback = "/dashboard",
  label = "Back",
  className = "",
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (globalThis.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallback, {
      replace: true,
    });
  };

  return (
    <button
      type="button"
      className={`curio-back-button ${className}`}
      onClick={handleBack}
      aria-label={label}
    >
      <span
        className="curio-back-button-arrow"
        aria-hidden="true"
      >
        ←
      </span>

      <span>{label}</span>
    </button>
  );
}

export default BackButton;