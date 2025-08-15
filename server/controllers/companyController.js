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

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
};