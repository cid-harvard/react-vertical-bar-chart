# react-vertical-bar-chart

## by the Growth Lab at Harvard's Center for International Development

Vertical scrolling bar chart for React.

> This package is part of Harvard Growth Lab’s portfolio of software packages, digital products and interactive data visualizations.  To browse our entire portfolio, please visit [growthlab.app](https://growthlab.app/).  To learn more about our research, please visit [Harvard Growth Lab’s](https://growthlab.cid.harvard.edu/) home page.

[![NPM](https://img.shields.io/npm/v/react-vertical-bar-chart.svg)](https://www.npmjs.com/package/react-vertical-bar-chart) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

### [View live example ↗](https://cid-harvard.github.io/react-vertical-bar-chart/)

## Install

```bash
npm install --save react-vertical-bar-chart
```

## Usage

```tsx
import React from 'react'
import VerticalBarChart from 'react-vertical-bar-chart';

const App = () => {

  ...

  return (
    <VerticalBarChart
      data={data}
    />
  )
}

export default App

```

<a name="props"/>

#### Props

The VerticalBarChart component takes the following props:

- **data**: `BarDatum[]`
- **formatValue** *(optional)*: `(value: number) => string | number`
- **axisLabel** *(optional)*: `React.ReactElement<any> | string | undefined | null`
- **onRowHover** *(optional)*: `(event: RowHoverEvent) => void`
- **layout** *(optional)*: `Layout`
- **highlighted** *(optional)*: `string`
- **onHighlightError** *(optional)*: `(value: string) => void`
- **numberOfXAxisTicks** *(optional)*: `number`

<a name="bardatum"/>

#### BarDatum

The BarDatum type is an interface of the following values:

- **id**: `string`
- **title**: `string`
- **value**: `number`
- **color**: `string`

<a name="rowhoverevent"/>

#### RowHoverEvent

The RowHoverEvent type is an interface of the following values:

- **datum**: [`BarDatum[]`](#bardatum) \| `undefined`
- **mouseCoords**: {**x**: `number`, **y**: `number`}

<a name="layout"/>

#### Layout

The Layout type is an enum with the following values:

- **Layout.Left** = `left`
- **Layout.Right** = `right`

## License

MIT © [The President and Fellows of Harvard College](https://www.harvard.edu/)
