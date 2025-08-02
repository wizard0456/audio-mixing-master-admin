import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_Endpoint } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import { 
  FaUsers, 
  FaMusic, 
  FaClipboardList, 
  FaBlog, 
  FaTags, 
  FaChartLine,
  FaDollarSign,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaChartBar
} from 'react-icons/fa';
import { GoChecklist } from 'react-icons/go';
import { MdCategory } from 'react-icons/md';
import { IoPeople, IoMusicalNotes, IoCheckmarkCircle, IoNewspaper, IoPricetags, IoAnalytics, IoCash, IoEye, IoTime, IoCheckmark, IoWarning, IoRefresh, IoBarChart } from 'react-icons/io5';
import Loading from '../components/Loading';

const Welcome = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, inactive: 0, growth: 12 },
    orders: { total: 0, pending: 0, processing: 0, completed: 0, revenue: 0, growth: 8 },
    services: { total: 0, active: 0, inactive: 0, growth: 15 },
    blogs: { total: 0, published: 0, views: 0, growth: 22 }
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user && user.token) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all statistics in parallel
      const [
        usersResponse,
        ordersResponse,
        servicesResponse,
        blogsResponse
      ] = await Promise.all([
        axios.get(`${API_Endpoint}admin/users?page=1&per_page=10`, {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        axios.get(`${API_Endpoint}admin/order?page=1&per_page=10`, {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        axios.get(`${API_Endpoint}admin/services?page=1&per_page=10`, {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        axios.get(`${API_Endpoint}admin/blogs?page=1&per_page=10`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      ]);

      // Extract statistics from responses
      const users = usersResponse.data.data || [];
      const orders = ordersResponse.data.data || [];
      const services = servicesResponse.data.data || [];
      const blogs = blogsResponse.data.data || [];

      setStats({
        users: {
          total: usersResponse.data.total || users.length,
          active: users.filter(u => u.is_active === 1).length,
          inactive: users.filter(u => u.is_active === 0).length,
          growth: 12
        },
        orders: {
          total: ordersResponse.data.total || orders.length,
          pending: orders.filter(o => o.status === '0').length,
          processing: orders.filter(o => o.status === '1').length,
          completed: orders.filter(o => o.status === '2').length,
          revenue: orders.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0),
          growth: 8
        },
        services: {
          total: servicesResponse.data.total || services.length,
          active: services.filter(s => s.is_active === 1).length,
          inactive: services.filter(s => s.is_active === 0).length,
          growth: 15
        },
        blogs: {
          total: blogsResponse.data.total || blogs.length,
          published: blogs.filter(b => b.is_published === 1).length,
          views: blogs.reduce((sum, b) => sum + (parseInt(b.views) || 0), 0),
          growth: 22
        }
      });

      // Set recent data
      setRecentOrders(orders.slice(0, 5));
      setRecentUsers(users.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values if API calls fail
      setStats({
        users: { total: 0, active: 0, inactive: 0, growth: 12 },
        orders: { total: 0, pending: 0, processing: 0, completed: 0, revenue: 0, growth: 8 },
        services: { total: 0, active: 0, inactive: 0, growth: 15 },
        blogs: { total: 0, published: 0, views: 0, growth: 22 }
      });
      setRecentOrders([]);
      setRecentUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend, growth }) => (
    <div className="dark-card p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className={`flex items-center space-x-1 text-sm font-medium ${
          growth > 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {growth > 0 ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
          <span>{Math.abs(growth)}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium dark-text-secondary mb-1">{title}</p>
        <p className="text-3xl font-bold dark-text mb-2">{value}</p>
        {subtitle && <p className="text-xs dark-text-muted">{subtitle}</p>}
      </div>
    </div>
  );

  const RecentItem = ({ title, subtitle, status, time, statusColor, amount }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${statusColor} group-hover:scale-125 transition-transform duration-200`}></div>
        <div>
          <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{title}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-700">{status}</p>
        <p className="text-xs text-gray-400">{time}</p>
        {amount && <p className="text-sm font-bold text-green-600">${amount}</p>}
      </div>
    </div>
  );

  const ChartCard = ({ title, data, color }) => (
    <div className="dark-card p-6">
      <h3 className="text-lg font-semibold dark-text mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${color}`}></div>
              <span className="text-sm font-medium dark-text-secondary capitalize">{key}</span>
            </div>
            <span className="text-sm font-bold dark-text">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark-bg animated-bg">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="dark-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark-bg animated-bg p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold dark-text mb-2">Dashboard</h1>
            <p className="dark-text-secondary text-lg">Welcome back! Here's what's happening with your audio mixing business.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="dark-card px-4 py-2">
              <p className="text-sm dark-text-muted">Last updated</p>
              <p className="text-sm font-medium dark-text">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.users.total}
                          icon={<IoPeople className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          subtitle={`${stats.users.active} active users`}
          growth={stats.users.growth}
        />
        <StatCard
          title="Total Orders"
          value={stats.orders.total}
                          icon={<IoCheckmarkCircle className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-green-500 to-green-600"
          subtitle={`$${stats.orders.revenue.toFixed(2)} revenue`}
          growth={stats.orders.growth}
        />
        <StatCard
          title="Active Services"
          value={stats.services.total}
                          icon={<IoMusicalNotes className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          subtitle={`${stats.services.active} active services`}
          growth={stats.services.growth}
        />
        <StatCard
          title="Blog Views"
          value={stats.blogs.views}
                          icon={<IoEye className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          subtitle={`${stats.blogs.published} published blogs`}
          growth={stats.blogs.growth}
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Order Status Overview"
          data={{
            pending: stats.orders.pending,
            processing: stats.orders.processing,
            completed: stats.orders.completed
          }}
          color="bg-yellow-500"
        />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <FaClipboardList className="w-5 h-5 mb-2" />
              View Orders
            </button>
            <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <FaMusic className="w-5 h-5 mb-2" />
              Manage Services
            </button>
            <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <FaBlog className="w-5 h-5 mb-2" />
              Create Blog
            </button>
            <button className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <FaUsers className="w-5 h-5 mb-2" />
              View Users
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <FaChartBar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <RecentItem
                  key={order.id}
                  title={`Order #${order.id}`}
                  subtitle={`${order.user?.first_name || 'User'} ${order.user?.last_name || ''}`}
                  status={order.status === '0' ? 'Pending' : order.status === '1' ? 'Processing' : 'Completed'}
                  time={new Date(order.created_at).toLocaleDateString()}
                  statusColor={
                    order.status === '0' ? 'bg-yellow-500' : 
                    order.status === '1' ? 'bg-blue-500' : 'bg-green-500'
                  }
                  amount={order.amount}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No recent orders</p>
                <p className="text-sm">Orders will appear here when they come in</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            <FaUsers className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user, index) => (
                <RecentItem
                  key={user.id}
                  title={`${user.first_name} ${user.last_name}`}
                  subtitle={user.email}
                  status={user.is_active === 1 ? 'Active' : 'Inactive'}
                  time={new Date(user.created_at).toLocaleDateString()}
                  statusColor={user.is_active === 1 ? 'bg-green-500' : 'bg-red-500'}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaUsers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No recent users</p>
                <p className="text-sm">New users will appear here when they register</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;