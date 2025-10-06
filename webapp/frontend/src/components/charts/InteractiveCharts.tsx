import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Threat Level Pie Chart
export const ThreatLevelPieChart: React.FC<{
  data: { level: string; count: number; color: string }[];
}> = ({ data }) => {
  const chartData = {
    labels: data.map((item) => `${item.level} (${item.count})`),
    datasets: [
      {
        data: data.map((item) => item.count),
        backgroundColor: data.map((item) => item.color),
        borderColor: '#FFD700',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#FFA000',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#FFFFFF',
          font: {
            family: 'Roboto Mono, monospace',
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle' as const,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        titleColor: '#FFD700',
        bodyColor: '#FFFFFF',
        borderColor: '#FFD700',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: 'Roboto Mono, monospace',
          weight: 'bold' as const,
        },
        bodyFont: {
          family: 'Roboto Mono, monospace',
        },
        callbacks: {
          label: function (context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${percentage}%`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
  };

  return <Pie data={chartData} options={options} />;
};

// Attack Type Horizontal Bar Chart
export const AttackTypeBarChart: React.FC<{
  data: { type: string; count: number }[];
}> = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.type.charAt(0).toUpperCase() + item.type.slice(1)),
    datasets: [
      {
        label: 'Attack Count',
        data: data.map((item) => item.count),
        backgroundColor: 'rgba(255, 215, 0, 0.7)',
        borderColor: '#FFD700',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(255, 160, 0, 0.8)',
        hoverBorderColor: '#FFA000',
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        titleColor: '#FFD700',
        bodyColor: '#FFFFFF',
        borderColor: '#FFD700',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: 'Roboto Mono, monospace',
          weight: 'bold' as const,
        },
        bodyFont: {
          family: 'Roboto Mono, monospace',
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: '#333333',
          drawBorder: false,
        },
        ticks: {
          color: '#E0E0E0',
          font: {
            family: 'Roboto Mono, monospace',
            size: 11,
          },
        },
        border: {
          color: '#FFD700',
        },
      },
      x: {
        grid: {
          color: '#333333',
          drawBorder: false,
        },
        ticks: {
          color: '#E0E0E0',
          font: {
            family: 'Roboto Mono, monospace',
            size: 11,
          },
        },
        border: {
          color: '#FFD700',
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
  };

  return <Bar data={chartData} options={options} />;
};

// Daily Events Line Chart
export const DailyEventsLineChart: React.FC<{
  data: { date: string; count: number }[];
}> = ({ data }) => {
  const chartData = {
    labels: data.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Events per Day',
        data: data.map((item) => item.count),
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#FFD700',
        pointBorderColor: '#FFA000',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#FFA000',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        titleColor: '#FFD700',
        bodyColor: '#FFFFFF',
        borderColor: '#FFD700',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: 'Roboto Mono, monospace',
          weight: 'bold' as const,
        },
        bodyFont: {
          family: 'Roboto Mono, monospace',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#333333',
          drawBorder: false,
        },
        ticks: {
          color: '#E0E0E0',
          font: {
            family: 'Roboto Mono, monospace',
            size: 11,
          },
        },
        border: {
          color: '#FFD700',
        },
      },
      y: {
        grid: {
          color: '#333333',
          drawBorder: false,
        },
        ticks: {
          color: '#E0E0E0',
          font: {
            family: 'Roboto Mono, monospace',
            size: 11,
          },
        },
        border: {
          color: '#FFD700',
        },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutCubic' as const,
    },
  };

  return <Line data={chartData} options={options} />;
};

// TLP Distribution Doughnut Chart
export const TlpDistributionDoughnutChart: React.FC<{
  data: { tlp: string; count: number; color: string }[];
}> = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.tlp.toUpperCase()),
    datasets: [
      {
        data: data.map((item) => item.count),
        backgroundColor: data.map((item) => item.color),
        borderColor: '#FFD700',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#FFA000',
        cutout: '60%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#FFFFFF',
          font: {
            family: 'Roboto Mono, monospace',
            size: 11,
          },
          usePointStyle: true,
          pointStyle: 'circle' as const,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        titleColor: '#FFD700',
        bodyColor: '#FFFFFF',
        borderColor: '#FFD700',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: 'Roboto Mono, monospace',
          weight: 'bold' as const,
        },
        bodyFont: {
          family: 'Roboto Mono, monospace',
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

// Chart Container Component
export const ChartContainer: React.FC<{
  title: string;
  children: React.ReactNode;
  height?: number;
}> = ({ title, children, height = 300 }) => {
  return (
    <Box 
      sx={{ 
        height: height + 60, // Add space for title
        p: 2,
        '& canvas': {
          borderRadius: '8px',
        },
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          color: '#FFD700',
          fontFamily: 'Roboto Mono, monospace',
          fontWeight: 600,
          mb: 2,
          textAlign: 'center',
        }}
      >
        {title}
      </Typography>
      <Box sx={{ height: height }}>
        {children}
      </Box>
    </Box>
  );
};