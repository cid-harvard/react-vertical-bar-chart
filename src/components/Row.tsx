import React from 'react';
import styled from 'styled-components/macro';
import {
  WithDyanmicFont,
  BarDatum,
  RowHoverEvent,
  Layout,
  fadeIn,
} from './Utils';

export const highlightedIdName = 'react-comparison-bar-chart-highlighted-item';

const GreaterThan1Root = styled.div`
  display: flex;

  &:hover {
    background-color: #f1f1f1;
  }
`;

const LessThan1Root = styled.div`
  display: flex;
  background-color: #f1f1f1;

  &:hover {
    background-color: #fff;
  }
`;

const LabelText = styled.div<WithDyanmicFont>`
  width: 100%;
  font-size: ${({$dynamicFont}) => $dynamicFont};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  animation: ${fadeIn} 0.15s linear 1 forwards 0.3s;
  background-color: #fff;
`;

export const Cell = styled.div`
  transition: height 0.3s ease-in-out;
  overflow: hidden;
  display: flex;
  align-items: center;
`;

const TextCell = styled(Cell)`
  background-color: #fff;
`;

const BarCell = styled(Cell)`
  display: flex;
`;

const Range = styled.div`
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border-left: solid 1px #333;
`;

const Bar = styled.div`
  height: 70%;
  transition: width 0.2s ease-in-out;
`;

interface Props {
  d: BarDatum;
  rowHeight: number;
  gridHeight: number;
  max: number;
  onRowHover: undefined | ((event: RowHoverEvent) => void);
  layout: Layout | undefined;
  highlighted: string | undefined;
  chartWidth: number;
  textWidth: number;
  centerLineValue: number;
  lessThan1: boolean;
}

const Row = (props: Props) => {
  const {
    d, rowHeight, gridHeight,
    max, onRowHover,
    layout, highlighted, chartWidth, textWidth,
    lessThan1,
    centerLineValue,
  } = props;

  const Root = lessThan1 ? LessThan1Root : GreaterThan1Root;

  
  const style: React.CSSProperties = {
    height: rowHeight,
    backgroundColor: highlighted === d.id
      ? lessThan1 ? '#fff' : '#f1f1f1'
      : undefined,
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (onRowHover) {
      onRowHover({
        datum: d,
        mouseCoords: {
          x: e.clientX,
          y: e.clientY,
        },
      })
    }
  }

  const onMouseLeave = (e: React.MouseEvent) => {
    if (onRowHover) {
      onRowHover({
        datum: undefined,
        mouseCoords: {
          x: e.clientX,
          y: e.clientY,
        },
      })
    }
  }

  const percent = d.value / max * 100;

  if (layout === Layout.Right) {

    return (
      <Root>
        <BarCell
          id={highlighted === d.id ? highlightedIdName : undefined}
          style={{...style, width: chartWidth}}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          <Range style={{width: `${max}%`}}>
            <Bar
              className={'react-comparison-bar-chart-bar'}
              style={{
                backgroundColor: d.color,
                width: `${percent}%`,
                transitionDelay: '0.3s',
              }}
            />
          </Range>
        </BarCell>
        <TextCell
          style={{...style, width: '2rem'}}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        />
        <TextCell
          style={{...style, width: textWidth}}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          <LabelText
            className={'react-comparison-bar-chart-row-label'}
            $dynamicFont={`clamp(0.5rem, ${gridHeight * 0.04}px, 0.9rem)`}
          >
            {d.title}
          </LabelText>
        </TextCell>
      </Root>
    );
  } else {
    let bar: React.ReactElement<any> | null;
    if (percent > centerLineValue) {
      bar = (
        <React.Fragment>
          <Bar
            className={'react-comparison-bar-chart-bar'}
            style={{
              backgroundColor: 'transparent',
              width: `${centerLineValue}%`,
              transition: 'none',
            }}
          />
          <Bar
            className={'react-comparison-bar-chart-bar'}
            style={{
              backgroundColor: d.color,
              width: `${percent - centerLineValue}%`,
              transitionDelay: '0.3s',
            }}
          />
        </React.Fragment>
      );
    } else if (percent < centerLineValue) {
      bar = (
        <React.Fragment>
          <Bar
            className={'react-comparison-bar-chart-bar'}
            style={{
              backgroundColor: 'transparent',
              width: `${percent}%`,
              transition: 'none',
            }}
          />
          <Bar
            className={'react-comparison-bar-chart-bar'}
            style={{
              backgroundColor: d.color,
              width: `${centerLineValue - percent}%`,
              transitionDelay: '0.3s',
            }}
          />
        </React.Fragment>
      );
    } else {
      bar = null;
    }
    return (
      <Root>
        <TextCell
          style={{...style, width: textWidth}}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          <LabelText
            className={'react-comparison-bar-chart-row-label'}
            style={{
              textAlign: 'left',
            }}
            $dynamicFont={`clamp(0.5rem, ${gridHeight * 0.04}px, 0.9rem)`}
          >
            {d.title}
          </LabelText>
        </TextCell>
        <TextCell
          style={{...style, width: '2rem'}}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        />
        <BarCell
          id={highlighted === d.id ? highlightedIdName : undefined}
          style={{...style, width: chartWidth}}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          <Range style={{width: `${max}%`}}>
            {bar}
          </Range>
        </BarCell>
      </Root>
    );
  }

}

export default React.memo(Row);
