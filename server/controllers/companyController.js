const Company = require('../models/Company');

const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ userId: req.session.userId })
      .sort({ createdAt: -1 });
    res.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Server error while fetching companies' });
  }
};

const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findOne({ 
      _id: req.params.id, 
      userId: req.session.userId 
    });
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({ company });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Server error while fetching company' });
  }
};

const createCompany = async (req, res) => {
  try {
    const companyData = {
      ...req.body,
      userId: req.session.userId
    };
    
    const company = new Company(companyData);
    await company.save();
    
    res.status(201).json({ 
      success: true, 
      company,
      message: 'Company created successfully' 
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Server error while creating company' });
  }
};

const updateCompany = async (req, res) => {
  try {
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({ 
      success: true, 
      company,
      message: 'Company updated successfully' 
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Server error while updating company' });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.session.userId 
    });
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Company deleted successfully' 
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Server error while deleting company' });
  }
};

// Helper function to normalize column headers
const normalizeHeader = (header) => {
  if (!header) return '';
  return header.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '');
};

// Mapping function for flexible column headers
const mapHeaders = (headers) => {
  const headerMap = {};
  
  const fieldMappings = {
    companyName: ['companyname', 'company', 'employer', 'organization', 'companyname'],
    positionTitle: ['positiontitle', 'position', 'title', 'jobtitle', 'role'],
    status: ['status', 'applicationstatus', 'jobstatus'],
    positionType: ['positiontype', 'type', 'jobtype', 'employmenttype'],
    applicationDate: ['applicationdate', 'dateapplied', 'applied', 'date'],
    nextActionDate: ['nextactiondate', 'nextaction', 'followup', 'followupdate'],
    interviewRounds: ['interviewrounds', 'rounds', 'interviews', 'interviewcount'],
    salaryExpectation: ['salaryexpectation', 'salary', 'expectedsalary', 'pay'],
    contactPerson: ['contactperson', 'contact', 'recruiter', 'hr'],
    notes: ['notes', 'comments', 'description', 'remarks'],
    applicationPlatform: ['applicationplatform', 'platform', 'source', 'website']
  };

  headers.forEach((header, index) => {
    const normalizedHeader = normalizeHeader(header);
    
    for (const [field, variations] of Object.entries(fieldMappings)) {
      if (variations.includes(normalizedHeader)) {
        headerMap[field] = index;
        break;
      }
    }
  });

  return headerMap;
};

// Helper function to parse and normalize date
const parseDate = (dateValue) => {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // If it's an Excel serial number
  if (typeof dateValue === 'number' && dateValue > 25000) {
    // Excel date serial number to JS Date
    const excelEpoch = new Date(1900, 0, 1);
    const jsDate = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
    return jsDate;
  }
  
  // Try to parse as string
  const parsed = new Date(dateValue);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// Helper function to normalize status values
const normalizeStatus = (status) => {
  if (!status) return 'Applied';
  
  const statusStr = status.toString().toLowerCase().trim();
  const statusMappings = {
    'applied': 'Applied',
    'interview': 'Interview Scheduled',
    'interview scheduled': 'Interview Scheduled',
    'technical': 'Technical Round',
    'technical round': 'Technical Round',
    'hr': 'HR Round',
    'hr round': 'HR Round',
    'final': 'Final Round',
    'final round': 'Final Round',
    'offer': 'Offer Received',
    'offer received': 'Offer Received',
    'rejected': 'Rejected',
    'withdrawn': 'Withdrawn'
  };
  
  return statusMappings[statusStr] || 'Applied';
};

// Helper function to normalize position type
const normalizePositionType = (type) => {
  if (!type) return 'Full-time';
  
  const typeStr = type.toString().toLowerCase().trim();
  const typeMappings = {
    'internship': 'Internship',
    'intern': 'Internship',
    'fulltime': 'Full-time',
    'full-time': 'Full-time',
    'full time': 'Full-time',
    'contract': 'Contract',
    'contractor': 'Contract',
    'leadstofulltime': 'Leads to Full Time',
    'leads to full time': 'Leads to Full Time'
  };
  
  return typeMappings[typeStr] || 'Full-time';
};

const importExcelData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    // Read the uploaded file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'File must contain at least a header row and one data row'
      });
    }

    const headers = jsonData[0];
    const dataRows = jsonData.slice(1);
    
    // Map headers to schema fields
    const headerMap = mapHeaders(headers);
    
    // Check if we have required fields
    if (!headerMap.companyName) {
      return res.status(400).json({
        success: false,
        error: 'Could not find a column for Company Name. Please ensure your file has a column with headers like: Company, Company Name, or Employer'
      });
    }

    const results = {
      inserted: 0,
      skipped: [],
      errors: []
    };

    const validCompanies = [];

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNumber = i + 2; // +2 because we start from row 1 and skip header
      
      try {
        // Skip empty rows
        if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
          results.skipped.push({
            row: rowNumber,
            reason: 'Empty row'
          });
          continue;
        }

        // Extract company name (required)
        const companyName = row[headerMap.companyName];
        if (!companyName || companyName.toString().trim() === '') {
          results.skipped.push({
            row: rowNumber,
            reason: 'Missing company name'
          });
          continue;
        }

        // Build company object
        const companyData = {
          userId: req.session.userId,
          companyName: companyName.toString().trim(),
          positionTitle: headerMap.positionTitle ? (row[headerMap.positionTitle] || 'N/A').toString().trim() : 'N/A',
          status: headerMap.status ? normalizeStatus(row[headerMap.status]) : 'Applied',
          positionType: headerMap.positionType ? normalizePositionType(row[headerMap.positionType]) : 'Full-time',
          applicationDate: headerMap.applicationDate ? parseDate(row[headerMap.applicationDate]) || new Date() : new Date(),
          nextActionDate: headerMap.nextActionDate ? parseDate(row[headerMap.nextActionDate]) : null,
          interviewRounds: headerMap.interviewRounds ? parseInt(row[headerMap.interviewRounds]) || 0 : 0,
          salaryExpectation: headerMap.salaryExpectation ? parseFloat(row[headerMap.salaryExpectation]) || null : null,
          contactPerson: headerMap.contactPerson ? (row[headerMap.contactPerson] || 'N/A').toString().trim() : 'N/A',
          notes: headerMap.notes ? (row[headerMap.notes] || '').toString().trim() : '',
          applicationPlatform: headerMap.applicationPlatform ? (row[headerMap.applicationPlatform] || 'N/A').toString().trim() : 'N/A',
          isPrivate: false // Default to public for imported applications
        };

        validCompanies.push(companyData);
        
      } catch (error) {
        results.skipped.push({
          row: rowNumber,
          reason: `Data processing error: ${error.message}`
        });
      }
    }

    // Insert valid companies
    if (validCompanies.length > 0) {
      try {
        const insertedCompanies = await Company.insertMany(validCompanies, { ordered: false });
        results.inserted = insertedCompanies.length;
      } catch (error) {
        // Handle partial inserts
        if (error.writeErrors) {
          results.inserted = validCompanies.length - error.writeErrors.length;
          error.writeErrors.forEach(writeError => {
            results.errors.push({
              row: writeError.index + 2,
              reason: writeError.errmsg
            });
          });
        } else {
          throw error;
        }
      }
    }

    // Prepare response
    const response = {
      success: true,
      message: `Import completed. ${results.inserted} companies imported successfully.`,
      summary: {
        totalRows: dataRows.length,
        inserted: results.inserted,
        skipped: results.skipped.length,
        errors: results.errors.length
      },
      details: {
        skippedRows: results.skipped,
        errorRows: results.errors
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Excel import error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while processing file: ' + error.message 
    });
  }
};

// Get past action notifications for all companies
const getPastActionNotifications = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Getting past action notifications for user:', req.session.userId);
    console.log('Today (start of day):', today);
    
    const companies = await Company.find({ 
      userId: req.session.userId,
      nextActionDate: { $lt: today },
      status: { $ne: 'Rejected' } // Exclude rejected jobs from notifications
    });
    
    console.log('Found', companies.length, 'companies with past action dates');
    
    const notifications = [];
    
    for (const company of companies) {
      // Check if we already have a notification for this past action date
      const existingNotification = company.pastActionNotifications.find(
        notification => notification.actionDate.getTime() === company.nextActionDate.getTime()
      );
      
      if (!existingNotification) {
        // Create a new notification entry
        company.pastActionNotifications.push({
          actionDate: company.nextActionDate,
          notificationCreated: new Date(),
          isCompleted: false
        });
        await company.save();
        
        notifications.push({
          companyId: company._id,
          companyName: company.companyName,
          positionTitle: company.positionTitle,
          status: company.status,
          actionDate: company.nextActionDate,
          notificationId: company.pastActionNotifications[company.pastActionNotifications.length - 1]._id
        });
      } else if (!existingNotification.isCompleted) {
        // Include existing unresponded notifications
        notifications.push({
          companyId: company._id,
          companyName: company.companyName,
          positionTitle: company.positionTitle,
          status: company.status,
          actionDate: existingNotification.actionDate,
          notificationId: existingNotification._id
        });
      }
    }
    
    console.log('Returning', notifications.length, 'notifications');
    res.json({ notifications });
  } catch (error) {
    console.error('Get past action notifications error:', error);
    res.status(500).json({ error: 'Server error while fetching notifications' });
  }
};

// Respond to a past action notification
const respondToPastActionNotification = async (req, res) => {
  try {
    const { companyId, notificationId, isCompleted, completionResponse } = req.body;
    
    const company = await Company.findOne({
      _id: companyId,
      userId: req.session.userId
    });
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const notification = company.pastActionNotifications.id(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notification.isCompleted = isCompleted;
    notification.completionResponse = completionResponse || '';
    notification.respondedAt = new Date();
    
    await company.save();
    
    res.json({ 
      success: true, 
      message: 'Response recorded successfully' 
    });
  } catch (error) {
    console.error('Respond to past action notification error:', error);
    res.status(500).json({ error: 'Server error while recording response' });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  importExcelData,
  getPastActionNotifications,
  respondToPastActionNotification
};