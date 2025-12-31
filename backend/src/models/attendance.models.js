import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
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
    markedAt: {
      type: Date,
      required: true
    }
    ,
    similarityScore: {
      type: Number,
      required: true
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

export const Attendance = mongoose.model('Attendance', attendanceSchema);
