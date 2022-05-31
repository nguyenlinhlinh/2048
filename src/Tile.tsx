import { Point } from './Game';
import './Tile.css';
type Props = {
  children: string | null,
  textColor: string,
  background: string,
  newTile: boolean,
  mergedTile: boolean,
  transform: Point,
  largeTile: boolean
};
const TileComponent = (props: Props) => {
  const { textColor, background, newTile, mergedTile, children, transform, largeTile } = props;
  const { x, y } = transform;
  const classNames = `tile${newTile ? " new-tile" : ""}${mergedTile ? " merged-tile" : ""}${largeTile ? " large-tile-value" : ""}`;
  const data = {
    "--x-from": x + "px",
    "--y-from": y + "px"
  }
  return (
    <div
      className={classNames}
      style={{
        color: textColor,
        background: background,
        ...data
      }}
    >
      <div className="tile-value">
        {children}
      </div>
    </div>
  );
};
export default TileComponent;