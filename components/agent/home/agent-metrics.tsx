"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function AgentMetrics() {
  const data = [
    { date: '3/1', tickets: 12, responseTime: 1.2 },
    { date: '3/2', tickets: 15, responseTime: 1.1 },
    { date: '3/3', tickets: 10, responseTime: 1.4 },
    { date: '3/4', tickets: 18, responseTime: 0.9 },
    { date: '3/5', tickets: 14, responseTime: 1.0 },
  ]

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="tickets" stroke="#8884d8" name="Tickets" />
          <Line type="monotone" dataKey="responseTime" stroke="#82ca9d" name="Response Time (h)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 