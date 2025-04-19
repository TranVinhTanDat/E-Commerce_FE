import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../../utils/config';

const Profile = () => {
  const [user, setUser] = useState({
    id: '',
    username: '',
    email: '',
    avatar: '',
    role: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    username: '',
    email: '',
    avatar: '',
    password: '',
  });
  const navigate = useNavigate();

  // Lấy thông tin user hiện tại khi component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('❌ Please login first');
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/users/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        setUpdatedUser({
          username: response.data.username,
          email: response.data.email,
          avatar: response.data.avatar,
          password: '',
        });
      } catch (error) {
        toast.error('❌ Failed to fetch user information');
        console.error(error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  // Xử lý cập nhật thông tin user
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/users/edit-user/${user.id}`,
        updatedUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
      setIsEditing(false);
      toast.success('✅ Profile updated successfully!');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || '❌ Failed to update profile';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  // Xử lý thay đổi input trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  // Chuyển đổi giữa chế độ xem và chỉnh sửa
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    toast.success('✅ Logged out successfully!');
    navigate('/login');
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>👤 User Profile</h2>

        {!isEditing ? (
          <div style={styles.profileInfo}>
            <img
              src={user.avatar}
              alt="Avatar"
              style={styles.avatar}
              onError={(e) =>
                (e.target.src =
                  'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg')
              }
            />
            <div style={styles.infoText}>
              <p style={styles.infoItem}>
                <strong style={styles.infoLabel}>Username:</strong> {user.username}
              </p>
              <p style={styles.infoItem}>
                <strong style={styles.infoLabel}>Email:</strong> {user.email}
              </p>
              <p style={styles.infoItem}>
                <strong style={styles.infoLabel}>Role:</strong> {user.role}
              </p>
            </div>
            <div style={styles.buttonGroup}>
              <button style={styles.button} onClick={toggleEdit}>
                ✏️ Edit Profile
              </button>
              <button style={styles.logoutButton} onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username:</label>
              <input
                type="text"
                name="username"
                value={updatedUser.username}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="Enter username"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email:</label>
              <input
                type="email"
                name="email"
                value={updatedUser.email}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="Enter email"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Avatar URL:</label>
              <input
                type="text"
                name="avatar"
                value={updatedUser.avatar}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Enter avatar URL"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>New Password (optional):</label>
              <input
                type="password"
                name="password"
                value={updatedUser.password}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Enter new password"
              />
            </div>
            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.button}>
                💾 Save Changes
              </button>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={toggleEdit}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

const styles = {
    wrapper: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0f7fa, #ede7f6)',
      padding: '20px',
    },
    container: {
      maxWidth: '450px',
      marginTop: '100px',
      width: '100%',
      padding: '30px',
      background: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      textAlign: 'center',
      transition: 'transform 0.3s ease',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#2d3748',
      marginBottom: '25px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    profileInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '4px solid transparent',
      background: 'linear-gradient(45deg, #4b6cb7, #182848)',
      padding: '4px',
      marginBottom: '20px',
      transition: 'transform 0.3s ease',
      cursor: 'pointer',
    },
    infoText: {
      width: '100%',
      textAlign: 'left',
    },
    infoItem: {
      fontSize: '16px',
      color: '#4a5568',
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'center',
    },
    infoLabel: {
      width: '100px',
      color: '#718096',
      fontWeight: '600',
    },
    infoValue: {
      flex: 1,
      textAlign: 'left',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    formGroup: {
      textAlign: 'left',
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#2d3748',
      display: 'block',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      fontSize: '14px',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      outline: 'none',
      background: '#f7fafc',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    },
    inputFocus: {
      borderColor: '#4b6cb7',
      boxShadow: '0 0 0 3px rgba(75, 108, 183, 0.2)',
    },
    buttonGroup: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'center',
      marginTop: '20px',
    },
    button: {
      background: 'linear-gradient(45deg, #4b6cb7, #182848)',
      color: '#ffffff',
      padding: '12px 25px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      border: 'none',
      transition: 'background 0.3s ease, transform 0.2s ease',
    },
    buttonHover: {
      background: 'linear-gradient(45deg, #182848, #4b6cb7)',
      transform: 'translateY(-2px)',
    },
    cancelButton: {
      background: 'linear-gradient(45deg, #a0aec0, #718096)',
      color: '#ffffff',
      padding: '12px 25px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      border: 'none',
      transition: 'background 0.3s ease, transform 0.2s ease',
    },
    cancelButtonHover: {
      background: 'linear-gradient(45deg, #718096, #a0aec0)',
      transform: 'translateY(-2px)',
    },
    logoutButton: {
      background: 'linear-gradient(45deg, #e53e3e, #9b2c2c)',
      color: '#ffffff',
      padding: '12px 25px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      border: 'none',
      transition: 'background 0.3s ease, transform 0.2s ease',
    },
    logoutButtonHover: {
      background: 'linear-gradient(45deg, #9b2c2c, #e53e3e)',
      transform: 'translateY(-2px)',
    },
  };
export default Profile;