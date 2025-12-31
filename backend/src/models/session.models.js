import mongoose from "mongoose";

const geofenceSchema = {
    lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90
    },
    lng: {
        type: Number,
        required: true,
        min: -180,
        max: 180
    },
    radius: {
        type: Number,
        required: true,
        min: 1 // meters
    }
};

const sessionSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
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

        geofence: {
            type: geofenceSchema,
            required: true
        },

        isActive: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    { timestamps: true }
);


sessionSchema.index(
    { classId: 1, isActive: 1 },
    { unique: true, partialFilterExpression: { isActive: true } }
);

export const Session = mongoose.model("Session", sessionSchema);
