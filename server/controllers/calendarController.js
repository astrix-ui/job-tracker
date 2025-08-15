const Company = require('../models/Company');

const getCalendarEvents = async (req, res) => {
  try {
    const companies = await Company.find({ 
      userId: req.session.userId,
      nextActionDate: { $exists: true, $ne: null }
    }).select('companyName status nextActionDate positionTitle positionType notes');
    
    console.log(`Found ${companies.length} companies with next action dates for user ${req.session.userId}`);
    
    const events = companies.map(company => {
      // Ensure the date is properly formatted
      const nextActionDate = new Date(company.nextActionDate);
      
      // Create a more descriptive title based on status
      let actionTitle = '';
      switch (company.status) {
        case 'Applied':
          actionTitle = 'Follow up';
          break;
        case 'Interview Scheduled':
          actionTitle = 'Interview';
          break;
        case 'Technical Round':
          actionTitle = 'Technical Interview';
          break;
        case 'HR Round':
          actionTitle = 'HR Interview';
          break;
        case 'Final Round':
          actionTitle = 'Final Interview';
          break;
        case 'Offer Received':
          actionTitle = 'Respond to Offer';
          break;
        default:
          actionTitle = 'Next Action';
      }
      
      const event = {
        id: company._id.toString(),
        title: `${company.companyName} - ${actionTitle}`,
        start: nextActionDate.toISOString(),
        end: nextActionDate.toISOString(),
        allDay: true,
        resource: {
          companyId: company._id.toString(),
          companyName: company.companyName,
          status: company.status,
          positionTitle: company.positionTitle,
          positionType: company.positionType,
          actionTitle: actionTitle,
          nextActionDate: nextActionDate.toISOString()
        }
      };
      
      console.log('Created event:', event);
      return event;
    });
    
    console.log(`Returning ${events.length} calendar events`);
    res.json({ events });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Server error while fetching calendar events' });
  }
};

module.exports = {
  getCalendarEvents
};