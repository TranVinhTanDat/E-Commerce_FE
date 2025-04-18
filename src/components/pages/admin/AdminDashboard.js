import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../../utils/config';

Chart.register(...registerables);

const AdminDashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading
  const [error, setError] = useState(null); // Thêm trạng thái lỗi

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Chuyển hướng nếu không có token
      return;
    }

    axios
      .get(`${API_BASE_URL}/orders/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const { totalOrders, totalRevenue, newUsers, totalProducts, salesOverTime } = response.data;
        setTotalOrders(totalOrders || 0);
        setTotalRevenue(totalRevenue || 0); // Gán giá trị mặc định nếu null
        setNewUsers(newUsers || 0);
        setTotalProducts(totalProducts || 0);
        setSalesOverTime(salesOverTime || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching statistics:', error);
        setError('Failed to load statistics');
        setLoading(false);
      });
  }, [navigate]);

  // Hiển thị loading hoặc lỗi
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Dữ liệu biểu đồ
  const data = {
    labels: salesOverTime.map((item) => item[0]),
    datasets: [
      {
        label: 'Sales',
        data: salesOverTime.map((item) => item[1]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

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
          <p>${(totalRevenue || 0).toFixed(2)}</p> {/* Xử lý null/undefined */}
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