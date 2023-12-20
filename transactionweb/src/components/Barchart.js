// Barchart.js
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Barchart(props) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            weight: 'bold', // Make x-axis labels bold
            size: 20,
          },
        },
      },
      y: {
        ticks: {
          font: {
            weight: 'bold', // Make y-axis values bold
            size: 20,
          },
        },
      },
    },
  };
  const data = {
    labels: props.labels,
    datasets: [
      {
        label: "Items",
        data: props.data1,
        backgroundColor: "rgba(67, 233, 179, 0.72)",
      },
    ],
  };

  return (
    <div className='mx-5 my-5'>
      <h3>Bar Chart - {props.month}</h3>

      <Bar options={options} data={data} />

    </div>
  );
}
