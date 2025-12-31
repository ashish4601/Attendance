import mongoose from 'mongoose';

const faceDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    faceEmbedding: {
      type: [Number],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length === 128;
        },
        message: 'Face embedding must be 128-dimensional'
      }
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    

  },
  {
    timestamps: true
  }
);

export const FaceData = mongoose.model('FaceData', faceDataSchema);
