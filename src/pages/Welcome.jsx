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
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const Welcome = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, inactive: 0, growth: 12 },
    orders: { total: 0, pending: 0, processing: 0, completed: 0, revenue: 0, growth: 8 },
    services: { total: 0, active: 0, inactive: 0, growth: 15 },
    blogs: { total: 0, published: 0, views: 0, growth: 22 }
  });
  const [loading, setLoading] = useState(true);
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
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values if API calls fail
      setStats({
        users: { total: 0, active: 0, inactive: 0, growth: 12 },
        orders: { total: 0, pending: 0, processing: 0, completed: 0, revenue: 0, growth: 8 },
        services: { total: 0, active: 0, inactive: 0, growth: 15 },
        blogs: { total: 0, published: 0, views: 0, growth: 22 }
      });
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

  const RevenueLineChart = () => {
    const data = [
      { month: 'Jan', revenue: 12500, orders: 45 },
      { month: 'Feb', revenue: 15800, orders: 52 },
      { month: 'Mar', revenue: 14200, orders: 48 },
      { month: 'Apr', revenue: 18900, orders: 63 },
      { month: 'May', revenue: 22100, orders: 74 },
      { month: 'Jun', revenue: 19800, orders: 66 },
      { month: 'Jul', revenue: 23400, orders: 78 },
      { month: 'Aug', revenue: 26700, orders: 89 },
      { month: 'Sep', revenue: 28900, orders: 96 },
      { month: 'Oct', revenue: 31200, orders: 104 },
      { month: 'Nov', revenue: 29800, orders: 99 },
      { month: 'Dec', revenue: 34500, orders: 115 }
    ];

    return (
      <div className="dark-card p-6">
        <h3 className="text-lg font-semibold dark-text mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value, name) => [
                name === 'revenue' ? `$${value.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : 'Orders'
              ]}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stackId="1"
              stroke="#10B981" 
              fill="#10B981" 
              fillOpacity={0.3}
            />
            <Area 
              type="monotone" 
              dataKey="orders" 
              stackId="2"
              stroke="#3B82F6" 
              fill="#3B82F6" 
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const ServiceBarChart = () => {
    const data = [
      { name: 'Mixing & Mastering', orders: 156, revenue: 23400, rating: 4.9 },
      { name: 'Vocal Mixing', orders: 89, revenue: 13350, rating: 4.7 },
      { name: 'Beat Production', orders: 67, revenue: 10050, rating: 4.8 },
      { name: 'Audio Restoration', orders: 45, revenue: 6750, rating: 4.6 },
      { name: 'Sound Design', orders: 34, revenue: 5100, rating: 4.5 }
    ];

    return (
      <div className="dark-card p-6">
        <h3 className="text-lg font-semibold dark-text mb-4">Service Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={10}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value, name) => [
                name === 'revenue' ? `$${value.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : 'Orders'
              ]}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="orders" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const OrderStatusPieChart = () => {
    const data = [
      { name: 'Pending', value: stats.orders.pending, color: '#F59E0B' },
      { name: 'Processing', value: stats.orders.processing, color: '#3B82F6' },
      { name: 'Completed', value: stats.orders.completed, color: '#10B981' }
    ];

    return (
      <div className="dark-card p-6">
        <h3 className="text-lg font-semibold dark-text mb-4">Order Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const CustomerActivityBarChart = () => {
    const data = [
      { activity: 'New Registrations', count: 23, trend: '+12%' },
      { activity: 'Active Users', count: 156, trend: '+8%' },
      { activity: 'Completed Orders', count: 89, trend: '+15%' },
      { activity: 'Customer Reviews', count: 45, trend: '+22%' }
    ];

    return (
      <div className="dark-card p-6">
        <h3 className="text-lg font-semibold dark-text mb-4">Customer Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              type="number"
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              dataKey="activity" 
              type="category"
              stroke="#9CA3AF"
              fontSize={12}
              width={120}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Bar dataKey="count" fill="#EF4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RevenueLineChart />
        <ServiceBarChart />
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderStatusPieChart />
        <CustomerActivityBarChart />
      </div>
    </div>
  );
};

export default Welcome;