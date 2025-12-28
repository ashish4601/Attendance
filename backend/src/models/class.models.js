import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ''
        },


        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },


        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                index: true
            }
        ],


        geofence: {
            lat: {
                type: Number,
                required: true
            },
            lng: {
                type: Number,
                required: true
            },
            radius: {
                type: Number,
                required: true
            }
        }
    },
    { timestamps: true }
);


classSchema.index({ name: 1, createdBy: 1 }, { unique: true });

export default mongoose.model('Class', classSchema);
