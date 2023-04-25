type _Clip = {
  id: string;
  width: number;
  height: number;
};
export function Clip({
  id,
  width,
  height,
}: _Clip) {
  return (
    <defs>
      <clipPath id={id}>
        <rect width={width} height={height} />
      </clipPath>
    </defs>
  );
}
