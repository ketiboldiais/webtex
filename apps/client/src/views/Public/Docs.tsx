import Styles from '@styles/DocPage.module.css';
import { Plot2d } from '@components/chips/Plot2d';

const Docs = () => {
  return (
    <article className={Styles.DocPage}>
      <section>
        <h3>Function Plotting</h3>
        <p>Functions can be plotted as follows:</p>
        <Plot2d f={(x) => 1/x} />
        <p>Equations are rendered with Webtex's parser.</p>
      </section>
    </article>
  );
};

export default Docs;
