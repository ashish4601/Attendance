import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
            index: true
        },

        startTime: {
            type: Date,
            required: true
        },

        endTime: {
            type: Date,
            required: true
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    { timestamps: true }
);

// Only one active session per class
sessionSchema.index(
    { classId: 1, isActive: 1 },
    { unique: true, partialFilterExpression: { isActive: true } }
);

export default mongoose.model('Session', sessionSchema);
