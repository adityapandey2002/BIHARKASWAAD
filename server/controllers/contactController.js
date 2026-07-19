const { Op } = require('sequelize');
const { Contact, ContactNote, User } = require('../models/index');
const { sendContactNotification, sendCustomerConfirmation, sendCustomerReply } = require('../services/emailService');

// ── SUBMIT Contact Form ───────────────────────────────────────────────────────
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contact = await Contact.create({ name, email, phone, subject, message, status: 'new' });

    console.log('✅ Contact inquiry created:', contact.id);

    // Notify admins and support staff
    const staff = await User.findAll({ where: { role: { [Op.in]: ['admin', 'support'] } } });
    const recipients = staff.map((u) => u.email);

    if (recipients.length > 0) {
      await sendContactNotification({ name, email, phone, subject, message }, recipients);
    }
    await sendCustomerConfirmation({ name, email, subject, message });

    res.status(201).json({
      status: 'success',
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: contact,
    });
  } catch (error) {
    console.error('❌ Error submitting contact:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── GET All Contacts (Admin/Support) ─────────────────────────────────────────
exports.getAllContacts = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    if (req.user.role === 'support') {
      where[Op.or] = [{ assignedTo: req.user.id }, { assignedTo: null }];
    }

    const contacts = await Contact.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        {
          model: ContactNote,
          as: 'notes',
          include: [{ model: User, as: 'addedByUser', attributes: ['id', 'name'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ status: 'success', results: contacts.length, data: contacts });
  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── GET Single Contact ────────────────────────────────────────────────────────
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        {
          model: ContactNote,
          as: 'notes',
          include: [{ model: User, as: 'addedByUser', attributes: ['id', 'name'] }],
        },
      ],
    });

    if (!contact) return res.status(404).json({ status: 'error', message: 'Contact not found' });

    if (req.user.role === 'support' && contact.assignedTo && contact.assignedTo !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Not authorized' });
    }

    res.status(200).json({ status: 'success', data: contact });
  } catch (error) {
    console.error('❌ Error fetching contact:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── UPDATE Contact ────────────────────────────────────────────────────────────
exports.updateContact = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;

    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ status: 'error', message: 'Contact not found' });

    if (status) contact.status = status;
    if (priority) contact.priority = priority;
    if (assignedTo !== undefined) contact.assignedTo = assignedTo || null;
    if (status === 'resolved' && !contact.resolvedAt) contact.resolvedAt = new Date();

    await contact.save();

    console.log('✅ Contact updated:', contact.id);
    res.status(200).json({ status: 'success', data: contact });
  } catch (error) {
    console.error('❌ Error updating contact:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── ADD Note to Contact ───────────────────────────────────────────────────────
exports.addNote = async (req, res) => {
  try {
    const { text } = req.body;

    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ status: 'error', message: 'Contact not found' });

    await ContactNote.create({ contactId: contact.id, text, addedBy: req.user.id, addedAt: new Date() });

    const updatedContact = await Contact.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        {
          model: ContactNote,
          as: 'notes',
          include: [{ model: User, as: 'addedByUser', attributes: ['id', 'name'] }],
        },
      ],
    });

    res.status(200).json({ status: 'success', data: updatedContact });
  } catch (error) {
    console.error('❌ Error adding note:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── REPLY to Contact (Admin/Support) ──────────────────────────────────────────
exports.replyToContact = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ status: 'error', message: 'Reply message is required' });

    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ status: 'error', message: 'Contact not found' });

    // Send email to customer
    await sendCustomerReply(contact, message);

    // Save reply as a note
    await ContactNote.create({
      contactId: contact.id,
      text: `[Reply Sent to Customer]: ${message}`,
      addedBy: req.user.id,
      addedAt: new Date()
    });

    // Update status to resolved
    contact.status = 'resolved';
    if (!contact.resolvedAt) contact.resolvedAt = new Date();
    await contact.save();

    const updatedContact = await Contact.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        {
          model: ContactNote,
          as: 'notes',
          include: [{ model: User, as: 'addedByUser', attributes: ['id', 'name'] }],
        },
      ],
    });

    res.status(200).json({ status: 'success', data: updatedContact });
  } catch (error) {
    console.error('❌ Error replying to contact:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── DELETE Contact (Admin) ────────────────────────────────────────────────────
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ status: 'error', message: 'Contact not found' });

    await ContactNote.destroy({ where: { contactId: contact.id } });
    await contact.destroy();

    console.log('🗑️ Contact deleted:', req.params.id);
    res.status(200).json({ status: 'success', message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting contact:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
