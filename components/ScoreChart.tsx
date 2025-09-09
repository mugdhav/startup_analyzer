
import React, { useState, useEffect } from 'react';

interface ChartDataItem {
    name: string;
    score: number;
}

interface ScoreChartProps {
    data: ChartDataItem[];
}

const ScoreChart: React.FC<ScoreChartProps> = ({ data }) => {
    const [Recharts, setRecharts] = useState<any>(null);

    useEffect(() => {
        const checkRecharts = () => {
            if ((window as any).Recharts?.ResponsiveContainer) {
                setRecharts((window as any).Recharts);
                return true;
            }
            return false;
        };
        if (checkRecharts()) return;
        const intervalId = setInterval(() => {
            if (checkRecharts()) clearInterval(intervalId);
        }, 100);
        return () => clearInterval(intervalId);
    }, []);

    if (!Recharts) {
        return <div className="flex items-center justify-center w-full h-full"><p className="text-text-secondary">Loading Chart...</p></div>;
    }

    const { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } = Recharts;

    const colors = ['#8b5cf6', '#3b82f6', '#22c55e', '#f97316'];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#D1D5DB' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#D1D5DB' }} />
                <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                    contentStyle={{
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                        borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: '#F9FAFB' }}
                    itemStyle={{ color: '#F9FAFB' }}
                />
                <Bar dataKey="score" fill="#8884d8" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ScoreChart;
