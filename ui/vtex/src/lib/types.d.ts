/* eslint-disable no-unused-vars */
import {ReactNode} from "react";
export type Children = {children?: ReactNode};
export type Constructor<T = {}> = new (...args: any[]) => T;
export type Orientation =  'top'|'right'|'bottom'|'left';
export type Anchor = "start" | "middle" | "end";
export type Pair<t> = [t, t];
export type Triple<t> = [t, t, t];
export type Quad<t> = [t, t, t, t];
export type N2 = [number, number];
export type N3 = [number, number, number];