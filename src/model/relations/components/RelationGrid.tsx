import React, { CSSProperties } from 'react';

type Props = {
    dimensions: [number, number];
    checkedMap: { [key: string]: boolean | undefined; };
    onClick?: (coords: [number, number]) => void;
}

const blockSize = 50;
const spacingSize = 5;

const range = (s: number) => [...Array(s).keys()];

export default function RelationGrid({ dimensions, checkedMap, onClick = () => {}}: Props) {
    const [rows, cols] = dimensions;
    
    const areaStyle: CSSProperties = {
        height: rows*blockSize + (rows + 1)*spacingSize,
        width: cols*blockSize + (cols + 1)*spacingSize,
        backgroundColor: '#393940',
        position: 'relative'
    }
    const coordsToKey = (x: number, y: number) => `${x}-${y}`;
    const blockStyle = (x: number, y: number) => ({
        height: blockSize, width: blockSize,
        backgroundColor: checkedMap[coordsToKey(x, y)] ? '#5a5cd1' : '#bfc0c9',
        position: 'absolute',
        top: spacingSize + (spacingSize + blockSize) * x,
        left: spacingSize + (spacingSize + blockSize) * y,
        cursor: 'pointer',
    } as CSSProperties);
    
    return (<>
        <div style={areaStyle}>
            {range(rows).map(x => range(cols).map(y => {
                return (
                    <div 
                        key={coordsToKey(x, y)} 
                        style={blockStyle(x, y)} 
                        onClick={() => onClick([x, y])}/>
                );
            }))}
        </div>
    </>);
}