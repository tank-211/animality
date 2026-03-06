const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create inquiry
exports.createInquiry = async (req, res) => {
  try {
    const { subject, message, priority, attachmentUrl } = req.body;
    const userId = req.userId;

    const inquiry = await prisma.inquiry.create({
      data: {
        userId,
        subject,
        message,
        priority: priority || 'MEDIUM',
        attachmentUrl
      }
    });

    res.status(201).json({ message: 'Inquiry created', inquiry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
};

// Get user inquiries
exports.getUserInquiries = async (req, res) => {
  try {
    const { userId } = req.params;

    const inquiries = await prisma.inquiry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
};

// Get all inquiries (Admin)
exports.getAllInquiries = async (req, res) => {
  try {
    const { status, priority } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const inquiries = await prisma.inquiry.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
};

// Update inquiry
exports.updateInquiry = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { status, adminNotes } = req.body;

    const inquiry = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: {
        status,
        adminNotes,
        resolvedAt: status === 'RESOLVED' ? new Date() : undefined
      }
    });

    res.json({ message: 'Inquiry updated', inquiry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
};

// Delete inquiry
exports.deleteInquiry = async (req, res) => {
  try {
    const { inquiryId } = req.params;

    await prisma.inquiry.delete({
      where: { id: inquiryId }
    });

    res.json({ message: 'Inquiry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
};
