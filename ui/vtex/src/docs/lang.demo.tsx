import { useState } from "react";
import css from './demos.module.scss';
import {evaluate, expr} from "@/lang/main";

export function LangDemo() {
  const [code, setCode] = useState("");
	const [output, setOutput] = useState('');
	const execute = () => {
		const result = expr(code).parse();
		const val = evaluate(result);
		setOutput(JSON.stringify(val, null, 2));
	}
  return (
    <div className={css.ide}>
      <textarea 
				value={code} 
				onChange={(e) => setCode(e.currentTarget.value)}
			/>
			<div className={css.out}>
				<pre>
					{output}
				</pre>
			</div>
			<button onClick={execute}>
				Run
			</button>
    </div>
  );
}
