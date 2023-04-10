import Sheet from "../chips/Sheet/sheet.chip";
import app from "../ui/styles/App.module.scss";

export function Canvas() {
  return (
    <div id={app.canvas}>
      <Sheet />
    </div>
  );
}
