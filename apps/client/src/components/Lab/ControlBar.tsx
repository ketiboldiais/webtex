import Styles from '@styles/ControlBar.module.css'

export const ControlBar = () => {
  return (
    <div className={Styles.ControlBarContainer}>
      <button>Undo</button>
      <button>Redo</button>
    </div>
  );
};
