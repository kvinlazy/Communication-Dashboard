import React from 'react';
import Plot from 'react-plotly.js';

const Chart = ({ data, type, title, xLabel, yLabel }) => {
  const fig = {
    data: [
      {
        x: data.dates,
        y: data[type],
        type: type === 'line' ? 'scatter' : 'bar',
        mode: type === 'line' ? 'lines+markers' : 'markers',
        marker: { color: 'blue' },
      },
    ],
    layout: {
      title: title,
      xaxis: { title: xLabel },
      yaxis: { title: yLabel },
    },
  };

  return <Plot data={fig.data} layout={fig.layout} />;
};

export default Chart;
