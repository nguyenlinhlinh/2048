import React from 'react';
import { Point } from './Game';
import './Tile.css';
type Props = {
  children: string | null,
  textColor: string,
  background: string,
  newTile: boolean,
  mergedTile: boolean,
};

const Tile = (props: Props) => {
  const { textColor, background, newTile, mergedTile, children } = props
  return (
    <div
      className={`tile ${newTile ? "new-tile" : ""} ${mergedTile ? "merged-tile" : ""}`}
      style={{
        color: textColor,
        background: background,
      }}
    >
      {children}
    </div>
  );
};
export default Tile;