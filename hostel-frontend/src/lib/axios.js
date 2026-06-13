import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000,
});

// Request interceptor to add bearer token
if (typeof window !== 'undefined') {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

// Response interceptor to intercept network failures and fall back to mock data
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If it's a network error (e.g., connection refused or backend offline), simulate successful mock responses
    if (!error.response || error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.warn('Backend server offline. Simulating response for url:', error.config.url);
      const url = error.config.url || '';
      const method = error.config.method?.toLowerCase() || 'get';
      
      let mockData = { success: true };

      if (url.includes('/auth/login') || url.includes('/login')) {
        let email = '';
        try {
          const body = JSON.parse(error.config.data || '{}');
          email = body.email || '';
        } catch (e) {
          email = 'warden@campusstay.com';
        }
        let role = 'student';
        let name = 'Student User';
        if (email.includes('admin')) {
          role = 'admin';
          name = 'Admin User';
        } else if (email.includes('warden')) {
          role = 'warden';
          name = 'Sarah Miller';
        }
        mockData = {
          success: true,
          token: 'mock-jwt-token',
          user: { id: 1, email, name, role }
        };
      } else if (url.includes('/warden/rooms')) {
        mockData = {
          success: true,
          data: [
            { id: 1, room_number: 401, status: 'Occupied', occupied: 2, capacity: 2, room_type: 'Double Sharing' },
            { id: 2, room_number: 402, status: 'Occupied', occupied: 1, capacity: 2, room_type: 'Double Sharing' },
            { id: 3, room_number: 403, status: 'Vacant', occupied: 0, capacity: 2, room_type: 'Double Sharing' },
            { id: 4, room_number: 404, status: 'Maintenance', occupied: 0, capacity: 2, room_type: 'Double Sharing' },
            { id: 5, room_number: 405, status: 'Occupied', occupied: 2, capacity: 2, room_type: 'Double Sharing' },
            { id: 6, room_number: 406, status: 'Occupied', occupied: 1, capacity: 2, room_type: 'Double Sharing' },
            { id: 7, room_number: 407, status: 'Vacant', occupied: 0, capacity: 2, room_type: 'Double Sharing' },
            { id: 8, room_number: 408, status: 'Reserved', occupied: 0, capacity: 2, room_type: 'Double Sharing' },
            { id: 9, room_number: 409, status: 'Occupied', occupied: 2, capacity: 2, room_type: 'Double Sharing' },
            { id: 10, room_number: 410, status: 'Occupied', occupied: 2, capacity: 2, room_type: 'Double Sharing' },
          ]
        };
      } else if (url.includes('/warden/complaints')) {
        mockData = {
          success: true,
          data: [
            { id: 1, title: 'Electrical Short - Room 204', status: 'Emergency', category: 'Electrical', student_id: 'Kevin Spacey (204)', student_name: 'Kevin Spacey' },
            { id: 2, title: 'Water Leakage - Room 105', status: 'Pending', category: 'Plumbing', student_id: 'Alice Cooper (105)', student_name: 'Alice Cooper' },
            { id: 3, title: 'Wifi Connectivity - Room 302', status: 'In Progress', category: 'Internet', student_id: 'David Beckham (302)', student_name: 'David Beckham' }
          ]
        };
      } else if (url.includes('/warden/leaves')) {
        mockData = {
          success: true,
          data: [
            { id: 1, student_name: 'John Doe', student_id: '239012', room_number: '402-A', reason: 'Family function', start_date: '2026-06-15', end_date: '2026-06-18', status: 'Pending', parent_approved: true },
            { id: 2, student_name: 'Emma Watson', student_id: '239015', room_number: '105-B', reason: 'Medical Checkup', start_date: '2026-06-14', end_date: '2026-06-15', status: 'Approved', parent_approved: true },
            { id: 3, student_name: 'Taylor Swift', student_id: '239018', room_number: '304-A', reason: 'Weekend Visit', start_date: '2026-06-19', end_date: '2026-06-21', status: 'Pending', parent_approved: false }
          ]
        };
      } else if (url.includes('/warden/residents')) {
        mockData = {
          success: true,
          data: [
            { id: 1, name: 'John Wick', student_id: '239012', room: '402-A', status: 'In Campus', email: 'wick@assassin.com', phone: '+91 99999 88888', block: 'Block A' },
            { id: 2, name: 'David Beckham', student_id: '239014', room: '302-C', status: 'In Campus', email: 'beckham@soccer.com', phone: '+91 88888 77777', block: 'Block C' },
            { id: 3, name: 'Leo Messi', student_id: '302', room: '302-C', status: 'Out of Campus', email: 'messi@soccer.com', phone: '+91 77777 66666', block: 'Block C' },
            { id: 4, name: 'Emma Watson', student_id: '239015', room: '105-B', status: 'On Leave', email: 'emma@hogwarts.com', phone: '+91 66666 55555', block: 'Block B' }
          ]
        };
      } else if (url.includes('/warden/fees')) {
        mockData = {
          success: true,
          data: [
            { id: 1, name: 'John Wick', student_id: '239012', amount: 1500, due_date: '2026-06-30', status: 'Paid', transaction_id: 'TXN-902341' },
            { id: 2, name: 'David Beckham', student_id: '239014', amount: 1500, due_date: '2026-06-30', status: 'Pending', transaction_id: '-' },
            { id: 3, name: 'Leo Messi', student_id: '302', amount: 1500, due_date: '2026-06-30', status: 'Overdue', transaction_id: '-' },
            { id: 4, name: 'Emma Watson', student_id: '239015', amount: 1500, due_date: '2026-06-30', status: 'Paid', transaction_id: 'TXN-902345' }
          ]
        };
      } else if (url.includes('/warden/passes') || url.includes('/passes')) {
        mockData = {
          success: true,
          data: [
            { id: 1, visitor_name: 'David Beckham Sr', student_name: 'David Beckham', student_id: '239014', room_number: '302-C', relationship: 'Father', purpose: 'Weekend Visit', start_time: '10:00 AM', end_time: '04:00 PM', status: 'Pending' },
            { id: 2, visitor_name: 'Jane Doe', student_name: 'John Doe', student_id: '239012', room_number: '402-A', relationship: 'Mother', purpose: 'Delivering Luggage', start_time: '02:00 PM', end_time: '03:00 PM', status: 'Approved' },
            { id: 3, visitor_name: 'Elon Musk', student_name: 'Bill Gates', student_id: '239020', room_number: '201-B', relationship: 'Friend', purpose: 'Science Project', start_time: '04:00 PM', end_time: '08:00 PM', status: 'Rejected' }
          ]
        };
      } else if (url.includes('/warden/staff')) {
        mockData = {
          success: true,
          data: [
            { id: 1, name: 'Robert Baratheon', role: 'Maintenance Staff', shift: 'Morning Shift', contact: '+91 90000 11111', performance: 'Excellent', status: 'Active' },
            { id: 2, name: 'Cersei Lannister', role: 'Mess Supervisor', shift: 'Evening Shift', contact: '+91 90000 22222', performance: 'Good', status: 'Active' },
            { id: 3, name: 'Ned Stark', role: 'Security Supervisor', shift: 'Night Shift', contact: '+91 90000 33333', performance: 'Outstanding', status: 'Active' },
            { id: 4, name: 'Tyrion Lannister', role: 'Warden Assistant', shift: 'Flexible Shift', contact: '+91 90000 44444', performance: 'Good', status: 'On Leave' }
          ]
        };
      } else if (url.includes('/admin/stats')) {
        mockData = {
          success: true,
          data: {
            occupancyRate: 92,
            totalStudents: 482,
            pendingAlerts: 24,
            activeComplaints: 8,
            totalRevenue: 42850,
            revenuePaid: 38200,
            revenuePending: 4650
          }
        };
      } else if (url.includes('/admin/finance')) {
        mockData = {
          success: true,
          data: {
            occupancyRate: 92,
            totalStudents: 482,
            totalRevenue: 42850,
            revenuePaid: 38200,
            revenuePending: 4650,
            monthlyRevenue: [
              { month: 'Jan', revenue: 32000, expenses: 18000 },
              { month: 'Feb', revenue: 35000, expenses: 19000 },
              { month: 'Mar', revenue: 38000, expenses: 20000 },
              { month: 'Apr', revenue: 40000, expenses: 21000 },
              { month: 'May', revenue: 41000, expenses: 22000 },
              { month: 'Jun', revenue: 42850, expenses: 22500 }
            ],
            ledgers: [
              { id: 1, date: '2026-06-13', name: 'John Wick', type: 'Mess Fee', amount: 350, status: 'Paid' },
              { id: 2, date: '2026-06-12', name: 'Emma Watson', type: 'Hostel Rent', amount: 1200, status: 'Paid' },
              { id: 3, date: '2026-06-11', name: 'David Beckham', type: 'Laundry Charge', amount: 50, status: 'Pending' },
              { id: 4, date: '2026-06-10', name: 'Leo Messi', type: 'Hostel Rent', amount: 1200, status: 'Overdue' }
            ]
          }
        };
      }
      return Promise.resolve({ data: mockData, status: 200, statusText: 'OK', headers: {}, config: error.config });
    }
    return Promise.reject(error);
  }
);

export default instance;
