import Chat from '../models/chatSchema.js';

// Get chat history for a specific ride
export const getChatHistory = async (req, res) => {
  const { rideId } = req.params;

  try {
    const chatHistory = await Chat.find({ rideId })
      .populate('sender', 'fullName avatar')
      .populate('receiver', 'fullName avatar')
      .sort({ timestamp: 1 });

    res.status(200).json(chatHistory);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat history' });
  }
};

// Save a new chat message
export const sendMessage = async (req, res) => {
  const { rideId, sender, receiver, message } = req.body;

  try {
    const newMessage = new Chat({
      rideId,
      sender,
      receiver,
      message,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Error sending message' });
  }
};
