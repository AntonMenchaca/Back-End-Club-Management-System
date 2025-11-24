// Dashboard Controller
// Handles dashboard statistics for admin users

const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Membership = require('../models/Membership');
const Budget = require('../models/Budget');
const db = require('../config/database');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const users = await User.getAll();
    const totalUsers = users.length;

    // Get clubs by status
    const allClubs = await Club.getAll();
    const activeClubs = allClubs.filter(c => c.STATUS === 'Active').length;
    const pendingClubs = allClubs.filter(c => c.STATUS === 'Pending').length;
    const totalClubs = allClubs.length;

    // Get events
    const allEvents = await Event.getAll();
    const totalEvents = allEvents.length;
    const upcomingEvents = allEvents.filter(e => {
      const eventDate = new Date(e.Event_Date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }).length;

    // Get memberships
    const allMemberships = await Membership.getAll();
    const totalMembers = allMemberships.length;
    const activeMembers = allMemberships.filter(m => m.Status === 'Active').length;

    // Get budget statistics
    const [budgetStats] = await db.query(`
      SELECT 
        COALESCE(SUM(Total_Allocated), 0) as totalBudgetAllocated,
        COALESCE(SUM(Total_Spent), 0) as totalBudgetSpent
      FROM BUDGET
    `);

    // Get recent activities (last 10)
    const [recentActivities] = await db.query(`
      SELECT 
        'New member joined' as activity,
        CONCAT(p.First_Name, ' ', p.Last_Name) as user,
        c.Club_Name as club,
        cm.Date_Joined as date
      FROM CLUB_MEMBERSHIP cm
      JOIN PERSON p ON cm.Person_ID = p.Person_ID
      JOIN CLUB c ON cm.Club_ID = c.Club_ID
      WHERE cm.Status = 'Active'
      ORDER BY cm.Date_Joined DESC
      LIMIT 5
    `);

    const [recentEvents] = await db.query(`
      SELECT 
        'Event created' as activity,
        c.Club_Name as club,
        e.Event_Name as eventName,
        e.Event_Date as date
      FROM EVENT e
      JOIN CLUB c ON e.Club_ID = c.Club_ID
      ORDER BY e.Event_Date DESC
      LIMIT 5
    `);

    // Combine and format recent activities
    const activities = [
      ...recentActivities.map(a => ({
        activity: a.activity,
        user: a.user,
        club: a.club,
        date: a.date ? new Date(a.date).toISOString().split('T')[0] : null,
      })),
      ...recentEvents.map(e => ({
        activity: e.activity,
        user: null,
        club: e.club,
        eventName: e.eventName,
        date: e.date ? new Date(e.date).toISOString().split('T')[0] : null,
      })),
    ]
      .sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .slice(0, 10)
      .map((a, index) => ({
        key: String(index + 1),
        activity: a.eventName ? `${a.activity}: ${a.eventName}` : a.activity,
        user: a.user || 'System',
        club: a.club,
        date: a.date,
      }));

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalClubs,
        activeClubs,
        pendingClubs,
        totalEvents,
        upcomingEvents,
        totalMembers,
        activeMembers,
        totalBudgetAllocated: parseFloat(budgetStats[0]?.totalBudgetAllocated || 0),
        totalBudgetSpent: parseFloat(budgetStats[0]?.totalBudgetSpent || 0),
        recentActivities: activities,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard statistics',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};

