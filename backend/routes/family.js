// ✅ Family Routes
import express from 'express';
import mongoose from 'mongoose';
import FamilyMember from '../models/FamilyMember.js';

const router = express.Router();

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Get all family members
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email address',
        message: 'Please provide a valid email address'
      });
    }

    const members = await FamilyMember.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .lean();

    // Transform data to match frontend expectations
    const transformedMembers = members.map(member => ({
      _id: member._id,
      name: member.name,
      relationship: member.relationship,
      age: member.age,
      gender: member.gender,
      height: member.height,
      weight: member.weight,
      allergies: member.allergies || [],
      diseases: member.diseases || [],
      medications: member.medications || [],
      status: member.vaccinations && member.vaccinations.length > 0 
        ? (member.vaccinations.some(v => v.nextDue && new Date(v.nextDue) < new Date()) 
          ? 'vaccination-due' 
          : 'healthy')
        : 'healthy',
      updatedAt: member.updatedAt,
      createdAt: member.createdAt,
    }));

    res.status(200).json(transformedMembers);
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ 
      error: 'Failed to fetch family members',
      message: error.message 
    });
  }
});

// Add family member
router.post('/', async (req, res) => {
  try {
    const { email, name, relationship, age, gender, height, weight, allergies, diseases, medications, bloodGroup, conditions } = req.body;

    // Validate required fields
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid name',
        message: 'Name is required'
      });
    }

    if (!relationship || relationship.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid relationship',
        message: 'Relationship is required'
      });
    }

    // Validate optional numeric fields
    if (age !== undefined && (isNaN(age) || age < 0 || age > 150)) {
      return res.status(400).json({ 
        error: 'Invalid age',
        message: 'Age must be a number between 0 and 150'
      });
    }

    if (height !== undefined && (isNaN(height) || height <= 0 || height > 300)) {
      return res.status(400).json({ 
        error: 'Invalid height',
        message: 'Height must be a positive number (in cm)'
      });
    }

    if (weight !== undefined && (isNaN(weight) || weight <= 0 || weight > 500)) {
      return res.status(400).json({ 
        error: 'Invalid weight',
        message: 'Weight must be a positive number (in kg)'
      });
    }

    // Create member object
    const memberData = {
      userEmail: email.trim(),
      name: name.trim(),
      relationship: relationship.trim(),
      age: age ? parseInt(age, 10) : undefined,
      gender: gender || undefined,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      allergies: Array.isArray(allergies) ? allergies : (allergies ? [allergies] : []),
      diseases: Array.isArray(conditions) ? conditions : (conditions ? [conditions] : (Array.isArray(diseases) ? diseases : (diseases ? [diseases] : []))),
      medications: Array.isArray(medications) ? medications : (medications ? [medications] : []),
    };

    const member = new FamilyMember(memberData);
    await member.save();

    // Transform response to match frontend expectations
    const response = {
      _id: member._id,
      name: member.name,
      relationship: member.relationship,
      age: member.age,
      gender: member.gender,
      height: member.height,
      weight: member.weight,
      allergies: member.allergies || [],
      diseases: member.diseases || [],
      medications: member.medications || [],
      status: 'healthy',
      updatedAt: member.updatedAt,
      createdAt: member.createdAt,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating family member:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ 
        error: 'Validation error',
        message: messages
      });
    }

    res.status(500).json({ 
      error: 'Failed to create family member',
      message: error.message 
    });
  }
});

// Update family member
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        error: 'Invalid ID',
        message: 'Please provide a valid member ID'
      });
    }

    // Validate optional fields if provided
    const updateData = {};
    const { name, relationship, age, gender, height, weight, allergies, diseases, medications, bloodGroup, conditions } = req.body;

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Invalid name',
          message: 'Name cannot be empty'
        });
      }
      updateData.name = name.trim();
    }

    if (relationship !== undefined) {
      if (!relationship || relationship.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Invalid relationship',
          message: 'Relationship cannot be empty'
        });
      }
      updateData.relationship = relationship.trim();
    }

    if (age !== undefined) {
      if (isNaN(age) || age < 0 || age > 150) {
        return res.status(400).json({ 
          error: 'Invalid age',
          message: 'Age must be a number between 0 and 150'
        });
      }
      updateData.age = parseInt(age, 10);
    }

    if (gender !== undefined) {
      updateData.gender = gender;
    }

    if (height !== undefined) {
      if (isNaN(height) || height <= 0 || height > 300) {
        return res.status(400).json({ 
          error: 'Invalid height',
          message: 'Height must be a positive number (in cm)'
        });
      }
      updateData.height = parseFloat(height);
    }

    if (weight !== undefined) {
      if (isNaN(weight) || weight <= 0 || weight > 500) {
        return res.status(400).json({ 
          error: 'Invalid weight',
          message: 'Weight must be a positive number (in kg)'
        });
      }
      updateData.weight = parseFloat(weight);
    }

    if (allergies !== undefined) {
      updateData.allergies = Array.isArray(allergies) ? allergies : (allergies ? [allergies] : []);
    }

    if (conditions !== undefined) {
      updateData.diseases = Array.isArray(conditions) ? conditions : (conditions ? [conditions] : []);
    } else if (diseases !== undefined) {
      updateData.diseases = Array.isArray(diseases) ? diseases : (diseases ? [diseases] : []);
    }

    if (medications !== undefined) {
      updateData.medications = Array.isArray(medications) ? medications : (medications ? [medications] : []);
    }

    const member = await FamilyMember.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ 
        error: 'Member not found',
        message: 'Family member with the provided ID does not exist'
      });
    }

    // Transform response to match frontend expectations
    const response = {
      _id: member._id,
      name: member.name,
      relationship: member.relationship,
      age: member.age,
      gender: member.gender,
      height: member.height,
      weight: member.weight,
      allergies: member.allergies || [],
      diseases: member.diseases || [],
      medications: member.medications || [],
      status: member.vaccinations && member.vaccinations.length > 0 
        ? (member.vaccinations.some(v => v.nextDue && new Date(v.nextDue) < new Date()) 
          ? 'vaccination-due' 
          : 'healthy')
        : 'healthy',
      updatedAt: member.updatedAt,
      createdAt: member.createdAt,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating family member:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ 
        error: 'Validation error',
        message: messages
      });
    }

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid ID format',
        message: 'Please provide a valid member ID'
      });
    }

    res.status(500).json({ 
      error: 'Failed to update family member',
      message: error.message 
    });
  }
});

// Delete family member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        error: 'Invalid ID',
        message: 'Please provide a valid member ID'
      });
    }

    const member = await FamilyMember.findByIdAndDelete(id);

    if (!member) {
      return res.status(404).json({ 
        error: 'Member not found',
        message: 'Family member with the provided ID does not exist'
      });
    }

    res.status(200).json({ 
      message: 'Family member deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting family member:', error);

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid ID format',
        message: 'Please provide a valid member ID'
      });
    }

    res.status(500).json({ 
      error: 'Failed to delete family member',
      message: error.message 
    });
  }
});

export default router;

