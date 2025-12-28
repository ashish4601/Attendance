import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ['accepted', 'rejected'],
      required: true
    },

    reason: {
      type: String,
      enum: [
        'FACE_MISMATCH',
        'GPS_OUTSIDE',
        'GPS_ACCURACY_LOW',
        'TIME_WINDOW',
        'BLINK_FAILED',
        'DUPLICATE_ATTENDANCE',
        'NO_ACTIVE_SESSION'
      ],
      default: null
    },

    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Prevent duplicate attendance per user per session
attendanceSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
