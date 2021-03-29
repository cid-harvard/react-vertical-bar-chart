import React, {useRef} from 'react';
import ComparisonBarChart, {
  BarDatum,
  RowHoverEvent,
} from 'react-vertical-bar-chart';
import styled from 'styled-components/macro';
import {rgba} from 'polished';
import {RapidTooltipRoot, getStandardTooltip} from './rapidTooltip';
import RCA_DATA from '../data/boston-6-digit-rca.json';
import NAICS_DATA from '../data/naics_2017.json';
import {scaleLog} from 'd3-scale';

const tickMarksForMinMax = (min: number, max: number) => {
  const digits = min.toString().length + max.toString().length;
  return digits - 3;
}

const filteredRCA = RCA_DATA.data.cityIndustryYearList.filter(d => d.rcaNumCompany && d.rcaNumCompany > 0);
let max = Math.ceil((Math.max(...filteredRCA.map(d => d.rcaNumCompany as number)) * 1.1) / 10) * 10;
let min = Math.min(...filteredRCA.map(d => d.rcaNumCompany as number));
if (max < 10) {
  max = 10;
}
if (min >= 1) {
  min = 0.1;
}
const scale = scaleLog()
  .domain([min, max])
  .range([ 0, 100 ])
  .nice();
const numberOfXAxisTicks = tickMarksForMinMax(
  parseFloat(scale.invert(0).toFixed(5)),
  parseFloat(scale.invert(100).toFixed(5))
);

const data: BarDatum[] = filteredRCA.map(d => {
  const industry = NAICS_DATA.find(n => n.naics_id.toString() === d.naicsId);
  return {
    id: d.naicsId,
    title: industry ? industry.name : '',
    value: scale(d.rcaNumCompany) as number,
    color: 'gray',
  }
});

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 3rem;

  @media (max-width: 720px) {
    padding: 0.75rem;
  }
`;

const formatValue = (value: number) => {
  const scaledValue = parseFloat(scale.invert(value).toFixed(4));
  // const scaledValue = parseFloat(scale.invert(value).toFixed(2));
  return scaledValue;
  // return nearestPowerOf2(scaledValue);
}

const BostonNewYork6Digit = () => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [highlighted, setHighlighted] = React.useState<string | undefined>(undefined);

  const setHovered = (e: RowHoverEvent | undefined) => {
    const node = tooltipRef.current;
    if (node) {
      if (e && e.datum) {
        const {datum, mouseCoords} = e;
        node.innerHTML = getStandardTooltip({
          title: datum.title,
          color: rgba(datum.color, 0.3),
          rows: [
            ['RCA', scale.invert(datum.value).toFixed(3)],
          ],
          boldColumns: [1, 2],
        });
        node.style.top = mouseCoords.y + 'px';
        node.style.left = mouseCoords.x + 'px';
        node.style.display = 'block';
      } else {
        node.style.display = 'none';
      }
    }
  };

  return (
    <>
      <button onClick={() => setHighlighted(c => !c ? '2022' : undefined)}>highlight</button>
      <Root>
        <ComparisonBarChart
          data={data}
          highlighted={highlighted}
          formatValue={formatValue}
          axisLabel={'Specialization'}
          onRowHover={e => setHovered(e)}
          numberOfXAxisTicks={numberOfXAxisTicks}
          centerLineValue={scale(1) as number}
          centerLineLabel={'Expected Specialization'}
          overMideLineLabel={'Over Specialized'}
          underMideLineLabel={'Under Specialized'}
          scrollDownText={'Scroll down to see under specialization'}
        />
        <RapidTooltipRoot ref={tooltipRef} />
      </Root>
    </>
  )
}

export default BostonNewYork6Digit;
