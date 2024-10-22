import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const chatSchema = new Schema({
  rideId: { type: Schema.Types.ObjectId, ref: 'Ride', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Chat = model('Chat', chatSchema);
export default Chat;
