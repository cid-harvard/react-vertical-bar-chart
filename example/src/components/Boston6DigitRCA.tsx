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

// 8 = 3
// 16 = 4
// 32 = 5
// 64 = 3
// 128 = 7
// 256 = 4
// 512 = 3
// 1024 = 5

function pow2ceil(v: number) {
  let p = 2;
  // eslint-disable-next-line
  while (v >>= 1) {
    p <<= 1;
  }
  return p;
}
// function nearestPowerOf2(n: number) {
//    return 1 << 31 - Math.clz32(n);
// }
const filteredRCA = RCA_DATA.data.cityIndustryYearList.filter(d => d.rcaNumCompany && d.rcaNumCompany >= 1);
const max = Math.ceil((Math.max(...filteredRCA.map(d => d.rcaNumCompany)) * 1.1) / 10) * 10;
const logMax = pow2ceil(250);
console.log(logMax, max)
const scale = scaleLog()
  .domain([1, logMax])
  .range([ 0, 100 ])
  .base(2)

const numberOfXAxisTicks = 4;

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
  const scaledValue = parseFloat(scale.invert(value).toFixed(2));
  return scaledValue;
  // return nearestPowerOf2(scaledValue);
}

const BostonNewYork6Digit = () => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

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
    <Root>
      <ComparisonBarChart
        data={data}
        formatValue={formatValue}
        axisLabel={'Specialization'}
        onRowHover={e => setHovered(e)}
        numberOfXAxisTicks={numberOfXAxisTicks}
      />
      <RapidTooltipRoot ref={tooltipRef} />
    </Root>
  )
}

export default BostonNewYork6Digit;
