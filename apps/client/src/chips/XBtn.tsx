import close from "../ui/styles/XBtn.module.scss";

interface XBtnProps {
  onClose?: () => void | undefined;
  className?: string;
}
export function XBtn({ onClose, className }: XBtnProps) {
  return (
    <div className={className}>
      <button onClick={onClose} className={close.closeButton}>
        <span className={close.cross}></span>
        <span className={close.hidden}>close</span>
      </button>
    </div>
  );
}
