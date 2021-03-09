import React, {useState, useRef, useEffect} from 'react';
import styled from 'styled-components/macro';
import orderBy from 'lodash/orderBy';
import Row, {Cell, highlightedIdName} from './Row';
import {
  WithDyanmicFont,
  BarDatum,
  RowHoverEvent,
  Layout,
} from './Utils';

const overflowPadding = 1; // in rem. Needed to allow for final axis value to remain visible

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  /* makes this element the relative parent for position: fixed children */
  will-change: transform;
`;

const ChartBlock = styled.div`
  grid-column: 1 / -1;
  width: 100%;
`;

const TitleRoot = styled.div<WithDyanmicFont>`
  margin-left: auto;
  display: flex;
  position: absolute;
  top: 1px;
  font-size: ${({$dynamicFont}) => $dynamicFont};
`;

const ChartOverlayContainer = styled.div`
  pointer-events: none;
  margin-left: auto;
  display: flex;
  position: absolute;
  top: 1px;
`;

const AxisLines = styled.div`
  position: absolute;
  width: 100%;
  display: flex;

  /* makes this element the relative parent for position: fixed children */
  will-change: transform;
`;

const Grid = styled.div`
  width: 100%;
  height: 100%;
  grid-row: 1;
  display: grid;
  position: relative;
  /* both auto and overlay required for browsers that don't support overlay */
  overflow: auto;
  overflow-y: overlay;
  overflow-x: hidden

  ::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0, 0, 0, .3);
  }
  ::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, .1);
  }
`;

const AxisValue = styled.div`
  display: flex;
  flex-shrink: 0;
  background-color: #fff;
  position: relative;
  pointer-events: none;


  &:after {
    content: '';
    width: 100%;
    height: 0;
    position: absolute;
    bottom: 0;
  }

  &:not(:last-child) {
    &:after {
      border-bottom: solid 2px #333;
      z-index: 10;
    }
  }

  :last-child {
    &:after {
      border-bottom: solid 2px transparent;
    }
  }
`;

const AxisText = styled.span<WithDyanmicFont>`
  font-size: ${({$dynamicFont}) => $dynamicFont};
  transform: translate(-50%, calc(100% + 4px));
  position: absolute;
  bottom: 0;
`;

const AxisLine = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  width: 0;
  border-left: solid 1px #dfdfdf;
`;

const AxisTitle = styled.div<WithDyanmicFont>`
  position: absolute;
  bottom: 0;
  z-index: 1;
  font-size: ${({$dynamicFont}) => $dynamicFont};
  padding: 0 0 0.3rem 1rem;
  box-sizing: border-box;
  pointer-events: none;
  transform: translate(-1rem, 0);
`;

const CenterLine = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  width: 0;
  height: 100%;
  border-left: dashed 2px #333;
`;

const CenterLineLabel = styled.div<WithDyanmicFont>`
  font-size: ${({$dynamicFont}) => $dynamicFont};
  white-space: nowrap;
  padding-left: 0.7rem;
  text-shadow:
       1px 1px 0 #fff,
     -1px -1px 0 #fff,  
      1px -1px 0 #fff,
      -1px 1px 0 #fff,
       1px 1px 0 #fff;
`;

const BufferRow = styled.div`
  z-index: 100;
  display: flex;
  align-items: flex-end;
`;

const Midline = styled.div`
  border-top: dashed 2px #333;
  width: 100%;
  position: absolute;
  background-color: #f1f1f1;
  z-index: -1;
  transform: translateY(1px);
`;

const MidlineOverText = styled.div<WithDyanmicFont>`
  font-size: ${({$dynamicFont}) => $dynamicFont};
  position: absolute;
  right: 1rem;
  top: -0.25rem;
  transform: translateY(-100%);
`;
const MidlineUnderText = styled.div<WithDyanmicFont>`
  font-size: ${({$dynamicFont}) => $dynamicFont};
  position: absolute;
  right: 1rem;
  bottom: 0;
`;

const ScrollDownText = styled.div<WithDyanmicFont>`
  font-size: ${({$dynamicFont}) => $dynamicFont};
  position: absolute;
  right: 0.25rem;
  top: 50%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  max-width: 180px;
  pointer-events: none;
  text-shadow:
     1px 1px 0 #fff,
   -1px -1px 0 #fff,  
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
     1px 1px 0 #fff;
`;
const ScrollDownArrow = styled.div`
  margin-right: 0.75rem;
  font-size: 1rem;
`;

export interface Props {
  data: BarDatum[];
  formatValue?: (value: number) => string | number;
  axisLabel?: React.ReactElement<any> | string | undefined | null;
  onRowHover?: (event: RowHoverEvent) => void;
  layout?: Layout;
  highlighted?: string;
  onHighlightError?: (value: string) => void;
  numberOfXAxisTicks?: number;
  centerLineValue: number;
  centerLineLabel: string;
  overMideLineLabel: string;
  underMideLineLabel: string;
  scrollDownText: string;
}

interface Measurements {
  gridHeight: number,
  chartWidth: number,
  textWidth: number,
}

const Root = (props: Props) => {
  const {
    data, formatValue,
    axisLabel, onRowHover, layout, highlighted,
    onHighlightError,
    numberOfXAxisTicks,
    centerLineValue,
    centerLineLabel,
    overMideLineLabel,
    underMideLineLabel,
    scrollDownText,
  } = props;

  if (!data.length) {
    return null;
  }

  const [{gridHeight, chartWidth, textWidth}, setMeasurements] = useState<Measurements>({
    gridHeight: 0, chartWidth: 0, textWidth: 0
  });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (rootRef && rootRef.current && chartRef && chartRef.current && textRef && textRef.current) {
      const chartRect = chartRef.current.getBoundingClientRect();
      const textRect = textRef.current.getBoundingClientRect();
      setMeasurements({
        gridHeight: rootRef.current.offsetHeight, chartWidth: chartRect.width, textWidth: textRect.width,
      });
    }
  }, [rootRef, chartRef])

  useEffect(() => {
    const updateWindowWidth = () => {
      if (rootRef && rootRef.current && chartRef && chartRef.current && textRef && textRef.current) {
        const chartRect = chartRef.current.getBoundingClientRect();
        const textRect = textRef.current.getBoundingClientRect();
        setMeasurements({
          gridHeight: rootRef.current.offsetHeight, chartWidth: chartRect.width, textWidth: textRect.width,
        });
      }
    };
    window.addEventListener('resize', updateWindowWidth);
    return () => {
      window.removeEventListener('resize', updateWindowWidth);
    };
  }, []);

  useEffect(() => {
    if (rootRef && rootRef.current && highlighted !== undefined) {
      const rootNode = rootRef.current;
      const highlightedElm: HTMLElement | null = rootNode.querySelector(`#${highlightedIdName}`);
      if (highlightedElm) {
        highlightedElm.scrollIntoView({behavior: "smooth"});
      } else if (onHighlightError) {
        onHighlightError(highlighted);
      }
    }
  }, [rootRef, highlighted]);

  const orderedData = orderBy(data, ['value'], 'desc');

  const maxValue = 100;

  const totalTopValues = 20;
  const rowHeight = gridHeight ? ((1 / totalTopValues) * gridHeight) : 0;

  const axisIncrement = numberOfXAxisTicks ? maxValue / numberOfXAxisTicks : 25;

  const totalAxisValues = maxValue / axisIncrement;

  let axisFontSize: string;
  if (chartWidth < gridHeight) {
    axisFontSize = `clamp(0.55rem, ${chartWidth * 0.025}px, 1rem)`;
  } else {
    axisFontSize = `clamp(0.55rem, ${gridHeight * 0.025}px, 1rem)`;
  }
  const axisWidth = chartWidth / totalAxisValues;

  const axisLines: React.ReactElement<any>[] = [];

  for (let i = 0; i < totalAxisValues + 1; i++) {
    const value = axisIncrement * i;
    if (value <= maxValue) {
      const formatted = formatValue ? formatValue(value) : value;
      axisLines.push(
        <AxisValue
          key={'axis-line-right-' + i}
          style={{width: axisWidth}}
          className={'react-comparison-bar-chart-axis-value'}
        >
          <AxisText
            $dynamicFont={axisFontSize}
          >
            {formatted}
          </AxisText>
          <AxisLine />
        </AxisValue>
      );
    }
  }

  const rows: React.ReactElement<any>[] = [];
  orderedData.forEach((d, i) => {
    rows.push(
      <Row
        key={d.id}
        d={d}
        rowHeight={rowHeight}
        gridHeight={gridHeight}
        max={maxValue}
        onRowHover={onRowHover}
        range={maxValue}
        layout={layout}
        highlighted={highlighted}
        textWidth={textWidth}
        chartWidth={chartWidth}
        lessThan1={d.value < centerLineValue}
      />
    );
    if (d.value >= centerLineValue && orderedData[i + 1].value < centerLineValue) {
      rows.push(
        <BufferRow
          key={'vertical-bar-chart-midline'}
          style={{height: rowHeight, visibility: chartWidth ? undefined : 'hidden'}}
        >
          <Midline style={{height: rowHeight / 2}}>
            <Cell
              style={{
                height: rowHeight,
                width: `calc(${textWidth}px + 2rem)`,
                backgroundColor: '#fff',
              }}
            />
            <MidlineOverText
              $dynamicFont={`clamp(0.75rem, ${chartWidth * 0.025}px, 1rem)`}
            >
              {overMideLineLabel} ↑
            </MidlineOverText>
            <MidlineUnderText
              $dynamicFont={`clamp(0.75rem, ${chartWidth * 0.025}px, 1rem)`}
            >
              {underMideLineLabel} ↓
            </MidlineUnderText>
          </Midline>
          <Cell
            style={{
              height: rowHeight,
              width: `calc(${textWidth}px + 2rem)`,
              borderRight: 'solid 1px #333',
            }}
          />
        </BufferRow>
      );
    }
  })

  if (layout === Layout.Right) {
    rows.reverse();
  }

  const axisTitle = axisLabel ? (
    <AxisTitle
      style={{
        width: chartWidth,
        right: layout !== Layout.Right ? 0 : undefined,
        textAlign: layout !== Layout.Right ? 'right' : undefined,
      }}
      className={'react-comparison-bar-chart-axis-title'}
      $dynamicFont={`clamp(0.75rem, ${chartWidth * 0.025}px, 1.1rem)`}
    >
      {axisLabel}
    </AxisTitle>
  ) : null;


  const buffer: React.CSSProperties = layout !== Layout.Right
    ? {paddingRight: overflowPadding + 'rem'} : {paddingLeft: overflowPadding + 'rem'};

  const scrollDown = rows.length > 39 ? (
    <ScrollDownText
      style={{visibility: chartWidth ? undefined : 'hidden',}}
      $dynamicFont={`clamp(0.65rem, ${chartWidth * 0.023}px, 0.87rem)`}
    >
      <ScrollDownArrow>↓</ScrollDownArrow>
      {scrollDownText}
    </ScrollDownText>
  ) : null;

  return (
    <Container
      style={{...buffer}}
      className={'react-comparison-bar-chart-root-container'}
    >
      <TitleRoot
        style={{
          width: chartWidth,
          visibility: chartWidth ? undefined : 'hidden',
          marginLeft: layout !== Layout.Right ? undefined : 0,
          right: layout !== Layout.Right ? 0 : undefined,
          left: layout !== Layout.Right ? undefined : 0,
          ...buffer,
        }}
        $dynamicFont={`clamp(0.65rem, ${chartWidth * 0.023}px, 0.87rem)`}
      >
        <AxisLines style={{height: gridHeight}}>
          {axisLines}
        </AxisLines>
      </TitleRoot>
      <ChartContainer>
        <Grid
          ref={rootRef}
          style={{
            gridTemplateRows: 'repeat(${totalValues}, auto)',
            gridTemplateColumns: layout !== Layout.Right
              ? 'clamp(75px, 300px, 15%) 2rem 1fr'
              : '1fr 2rem clamp(75px, 300px, 15%)',
          }}
          className={'react-comparison-bar-chart-grid'}
        >
          <Cell
            ref={layout !== Layout.Right ? textRef : chartRef}
          />
          <Cell />
          <Cell
            ref={layout !== Layout.Right ? chartRef : textRef}
          />
          <ChartBlock>
            <BufferRow style={{height: rowHeight, position: 'sticky', top: '0', background: '#fff'}} />
            {rows}
          </ChartBlock>
          {scrollDown}
        </Grid>
      </ChartContainer>

      <ChartOverlayContainer
        style={{
          width: chartWidth,
          visibility: chartWidth ? undefined : 'hidden',
          marginLeft: layout !== Layout.Right ? undefined : 0,
          right: layout !== Layout.Right ? 0 : undefined,
          left: layout !== Layout.Right ? undefined : 0,
          ...buffer,
        }}
      >
        <AxisLines style={{height: gridHeight, width: chartWidth}}>
          {axisTitle}
          <CenterLine style={{left: centerLineValue + '%'}}>
            <CenterLineLabel
              $dynamicFont={`clamp(0.75rem, ${chartWidth * 0.025}px, 1.1rem)`}
              className={'react-comparison-bar-chart-axis-title'}
            >
              {centerLineLabel}
            </CenterLineLabel>
          </CenterLine>
        </AxisLines>
      </ChartOverlayContainer>
    </Container>
  );
}

export default Root;
