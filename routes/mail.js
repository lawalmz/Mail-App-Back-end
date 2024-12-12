const express = require('express');
const Message = require('../models/message');
const User = require('../models/user'); // Correct import of the User model

const router = express.Router();


/**
 * @swagger
 * /api/messages/{username}:
 *   get:
 *     summary: Get all messages for a specific user
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *       404:
 *         description: User not found
 */


// Get all messages for a specific user
router.get('/messages/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).populate('messages');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a new message
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sender:
 *                 type: string
 *               recipient:
 *                 type: string
 *               subject:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *       404:
 *         description: Sender or recipient not found
 */


router.post('/messages', async (req, res) => {
  const { sender, recipient, subject, body } = req.body;

  try {

    if (!sender || !recipient || !subject || !body) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const senderUser = await User.findOne({ username: sender });
    const recipientUser = await User.findOne({ username: recipient });

    if (!senderUser) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    if (!recipientUser) {
      return res.status(404).json({ message: 'Recipient not found' });
    }


    const messageForSender = new Message({
      sender: senderUser._id,
      recipient: recipientUser._id,
      subject,
      body,
      status: 'sent'
    });

    const messageForRecipient = new Message({
      sender: senderUser._id,
      recipient: recipientUser._id,
      subject,
      body,
      status: 'received'
    });


    await messageForSender.save();
    await messageForRecipient.save();


    senderUser.messages.push(messageForSender);
    recipientUser.messages.push(messageForRecipient);


    await senderUser.save();
    await recipientUser.save();

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * @swagger
 * /api/unread-count/{username}:
 *   get:
 *     summary: Get the number of unread messages for a user
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unread message count
 *       404:
 *         description: User not found
 */


router.patch('/messages/:username/:messageId', async (req, res) => {
  const { username, messageId } = req.params;

  try {
    const message = await Message.findOne({ _id: messageId });

    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.isRead = true;
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * @swagger
 * /api/unread-count/{username}:
 *   get:
 *     summary: Get the number of unread messages for a user
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unread message count
 *       404:
 *         description: User not found
 */

router.get('/unread-count/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).populate('messages');
    if (!user) return res.status(404).json({ message: 'User not found' });


    const unreadCount = user.messages.filter(message => !message.isRead).length;
    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;