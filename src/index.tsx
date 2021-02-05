import React from 'react'
import Root, {
  Props as VerticalBarChartProps,
} from './components/Root';
import {
  BarDatum,
  RowHoverEvent,
  Layout,
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
  Layout,
}

export default VerticalBarChart;
