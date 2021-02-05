import React, {useRef} from 'react';
import ComparisonBarChart, {
  BarDatum,
  RowHoverEvent,
} from 'react-comparison-bar-chart';
import styled from 'styled-components/macro';
import raw from 'raw.macro';
import {rgba} from 'polished';
import {getStandardTooltip, RapidTooltipRoot} from './rapidTooltip';

const primaryTotal = 169706;
const secondaryTotal = 57741;

interface FilteredDatum {
  id: string;
  title: string;
  value: number;
  color: string;
  topLevelParentId: string;
}

const {
  filteredPrimaryData, filteredSecondaryData,
}: {
  filteredPrimaryData: FilteredDatum[], filteredSecondaryData: FilteredDatum[],
} = JSON.parse(raw('../data/boston-aracaju-6-digit-data.json'));

const data: BarDatum[] = [];
  filteredPrimaryData.forEach(d => {
    const secondaryDatum = filteredSecondaryData.find(d2 => d2.id === d.id);
    const primaryShare = d.value / primaryTotal;
    const secondaryShare = secondaryDatum ? secondaryDatum.value / secondaryTotal : 0;
    const difference = primaryShare - secondaryShare;
    if (difference > 0) {
      data.push({...d, value: difference * 100});
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
  return parseFloat((value).toFixed(1)) + '%';
}

const BostonNewYork3Digit = () => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const setHovered = (e: RowHoverEvent | undefined) => {
    const node = tooltipRef.current;
    if (node) {
      if (e && e.datum) {
        const {datum, mouseCoords} = e;
        const primaryDatum = filteredPrimaryData.find(d => d.id === datum.id);
        const secondaryDatum = filteredSecondaryData.find(d => d.id === datum.id);
        const secondaryValue = secondaryDatum ? secondaryDatum.value / secondaryTotal * 100 : 0;
        const primaryValue = primaryDatum ? primaryDatum.value / primaryTotal * 100 : 0;
        const primaryDiff = primaryValue > secondaryValue ? '+' + datum.value.toFixed(2) + '%' : '';
        const secondaryDiff = secondaryValue > primaryValue ? '+' + datum.value.toFixed(2) + '%' : '';
        node.innerHTML = getStandardTooltip({
          title: datum.title,
          color: rgba(datum.color, 0.3),
          rows: [
            ['', 'Aracaju', 'Boston'],
            ['Share of Employees', secondaryValue.toFixed(2) + '%', primaryValue.toFixed(2) + '%'],
            ['Difference', secondaryDiff, primaryDiff],
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
      />
      <RapidTooltipRoot ref={tooltipRef} />
    </Root>
  )
}

export default BostonNewYork3Digit;
