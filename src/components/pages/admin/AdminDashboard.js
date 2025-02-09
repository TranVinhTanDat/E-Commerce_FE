import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import API_BASE_URL from '../../../utils/config';

Chart.register(...registerables);

const AdminDashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [salesOverTime, setSalesOverTime] = useState([]);
  
  const navigate = useNavigate(); // Hook điều hướng

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    axios.get(`${API_BASE_URL}/orders/statistics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      const { totalOrders, totalRevenue, newUsers, totalProducts, salesOverTime } = response.data;
      setTotalOrders(totalOrders);
      setTotalRevenue(totalRevenue);
      setNewUsers(newUsers);
      setTotalProducts(totalProducts);
      setSalesOverTime(salesOverTime);
    })
    .catch(error => {
      console.error("Error fetching statistics:", error);
    });
  }, []);

  // Dữ liệu biểu đồ
  const data = {
    labels: salesOverTime.map(item => item[0]),
    datasets: [
      {
        label: 'Sales',
        data: salesOverTime.map(item => item[1]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Tùy chọn biểu đồ
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      <p className="dashboard-welcome">Welcome to the admin panel.</p>

      <div className="dashboard-cards">
        <div className="card" onClick={() => navigate('/admin/orderList')}>
          <h2>Total Orders</h2>
          <p>{totalOrders}</p>
        </div>
        <div className="card" onClick={() => navigate('#')}>
          <h2>Total Revenue</h2>
          <p>${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="card" onClick={() => navigate('/admin/customers')}>
          <h2>New Users</h2>
          <p>{newUsers}</p>
        </div>
        <div className="card" onClick={() => navigate('/admin/productList')}>
          <h2>Total Products</h2>
          <p>{totalProducts}</p>
        </div>
      </div>

      <div className="dashboard-chart">
        <h2>Sales Over Time</h2>
        <div style={{ position: 'relative', height: '250px', width: '100%' }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
