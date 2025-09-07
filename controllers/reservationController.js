// controllers/JS/reservationController.js
import Reservation from '../models/reservation.js';

// Create a new reservation
export const createReservation = async (req, res) => {
  try {
    const { name, email, phone, address, note } = req.body;
    
    const reservation = new Reservation({
      name,
      email,
      phone,
      address,
      note: note || '',
      createdBy: req.user._id
    });
    
    const savedReservation = await reservation.save();
    
    res.status(201).json({
      success: true,
      data: savedReservation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all reservations for admin
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get reservations for the logged-in customer
export const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single reservation
export const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    // Check if user owns the reservation or is admin
    if (reservation.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this reservation'
      });
    }
    
    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a reservation (customer can update their own)
export const updateReservation = async (req, res) => {
  try {
    const { name, email, phone, address, note } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    // Check if user owns the reservation
    if (reservation.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reservation'
      });
    }
    
    // Customers can only update these fields
    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, note },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedReservation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update reservation status (admin only)
export const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedReservation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a reservation (admin only)
export const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    await Reservation.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};