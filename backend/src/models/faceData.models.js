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

    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length === 128;
        },
        message: 'Face embedding must be 128-dimensional'
      }
    }
  },
  {
    timestamps: true
  }
);

export const FaceData = mongoose.model('FaceData', faceDataSchema);
