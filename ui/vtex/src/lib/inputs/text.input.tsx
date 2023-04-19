import {useState} from "react";

export type _TextInput = {
	act: (data: string) => void;
	val: string;
	temp?: string;
	className?: string;
}

export function TextInput({
	val,
	act,
	temp="",
	className=""
}: _TextInput) {
	const [value, setValue] = useState(val);
	return (
		<input
			type={'text'}
			placeholder={temp}
			className={className}
			value={value}
			onChange={(event) => {
				event.stopPropagation();
				setValue(event.target.value);
				act(event.target.value);
			}}
		/>
	)
}