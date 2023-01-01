// hooks
import Styles from "../../../styles/Workspace.module.css";
import { Editor } from "../../../components/Editor";
import { DEFAULT_NOTE } from "src/config";

const Workspace = () => {
  const content = (
    <article className={Styles.Home}>
      <section className={Styles.Workspace}>
        <Editor init={DEFAULT_NOTE.content} />
      </section>
    </article>
  );

  return content;
};

export default Workspace;
