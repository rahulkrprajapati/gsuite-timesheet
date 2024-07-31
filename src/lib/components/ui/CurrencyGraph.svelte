<script>
    import { Line } from 'svelte-chartjs';
    import { 
      Chart as ChartJS, 
      CategoryScale, 
      LinearScale, 
      PointElement, 
      LineElement, 
      Title, 
      Tooltip, 
      Legend
    } from 'chart.js';
  
    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
  
    export let historicalData;
  
    $: chartData = {
      labels: historicalData.map(d => d.date),
      datasets: [{
        label: 'USD to INR',
        data: historicalData.map(d => d.rate),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  
    $: chartOptions = {
      responsive: true,
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Exchange Rate (INR)'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'USD to INR Exchange Rate (Last 7 Days)'
        },
        legend: {
          display: true
        }
      }
    };
  </script>
  
  <Line data={chartData} options={chartOptions} />