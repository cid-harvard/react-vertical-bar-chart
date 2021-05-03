import React from 'react'
import Root, {
  Props as VerticalBarChartProps,
} from './components/Root';
import {
  BarDatum,
  RowHoverEvent,
} from './components/Utils';

const VerticalBarChart = (props: VerticalBarChartProps) => {
  return (
    <Root {...props} />
  );
}

export {
  VerticalBarChartProps,
  BarDatum,
  RowHoverEvent,
}

export default VerticalBarChart;
