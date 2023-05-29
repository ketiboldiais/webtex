import css from './tile.module.scss';
import {ReactNode} from "react"

type TileProps = {
	children: ReactNode;
}
export function Tile({children}:TileProps) {
	return (
		<div className={css.tile}>
			{children}
		</div>
	)
}