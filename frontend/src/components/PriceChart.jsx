import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', labels: { color: '#94a3b8' } },
  },
  scales: {
    y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
    x: { grid: { display: false }, ticks: { color: '#94a3b8', maxTicksLimit: 10 } },
  },
};

/**
 * Reusable line chart wrapping Chart.js.
 * Props:
 *   data    — Chart.js data object (labels + datasets)
 *   options — optional Chart.js options override
 *   height  — CSS height string, default '300px'
 */
const PriceChart = ({ data, options = {}, height = '300px' }) => (
  <div style={{ position: 'relative', height, width: '100%' }}>
    <Line options={{ ...defaultOptions, ...options }} data={data} />
  </div>
);

export default PriceChart;
