import { Point } from './Game';
import './Tile.css';
type Props = {
  children: string | null,
  textColor: string,
  background: string,
  newTile: boolean,
  mergedTile: boolean,
  transform: Point
};
const TileComponent = (props: Props) => {
  const { textColor, background, newTile, mergedTile, children, transform } = props;
  const { x, y } = transform;
  const data = {
    "--x-from": x + "px",
    "--y-from": y + "px"
  }
  return (
    <div
      className={`tile${newTile ? " new-tile" : ""}`}
      style={{
        color: textColor,
        background: background,
        ...data
      }}
    >
      <div className={`tile-text`}>
        {children}
      </div>
    </div>
  );
};
export default TileComponent;