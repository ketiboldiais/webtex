import css from "./App.module.scss";
import "./index.css";
import { Pages } from "./docs.links";
import 'katex/dist/katex.min.css';

function App() {
  return (
    <div className={css.app}>
      <Pages />
    </div>
  );
}

export default App;
