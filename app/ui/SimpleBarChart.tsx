"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// #region Sample data
const data = [
  {
    name: 'Mark',
    budget: 4000,
    spending: 2400,
    Income: 2400,
  },
];

// #endregion
const SimpleBarChart = () => {
  return (
    <BarChart
      style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive
      data={data}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis width="auto" />
      <Tooltip />
      <Legend />
      <Bar dataKey="budget" fill="#82ca9d" activeBar={{ fill: 'lime', stroke: 'green' }} radius={[10, 10, 0, 0]} />
      <Bar dataKey="spending" fill="#df4a4a" activeBar={{ fill: 'pink', stroke: 'purple' }} radius={[10, 10, 0, 0]} />
      <Bar dataKey="Income" fill="#8884d8" activeBar={{ fill: 'gold', stroke: 'blue' }} radius={[10, 10, 0, 0]} />
    </BarChart>
  );
};

export default SimpleBarChart;