import mongoose from 'mongoose';

const payoutSchema = mongoose.Schema({
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    earnings: {
        type: Number, // Gross earnings
        required: true
    },
    commission: {
        type: Number, // Platform's cut
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'paid', 'rejected'],
        default: 'pending'
    },
    paymentId: {
        type: String // After payment is processed
    },
    method: {
        type: String,
        default: 'Direct Transfer'
    },
    adminNotes: String
}, {
    timestamps: true
});

const Payout = mongoose.model('Payout', payoutSchema);
export default Payout;
