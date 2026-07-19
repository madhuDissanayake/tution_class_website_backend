import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
{
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  title: {
    type: String,
    required: true
  },

  subject: {
    type: String,
    required: true
  },

  grade: {
    type: String,
    required: true
  },

  medium: {
    type: String,
    required: true
  },

  description: {
    type: String
  },


  location: {
    type: {
      type: String,
      enum: ['Point'],
    },

    coordinates: {
      type: [Number]
    },

    address: String
  },


  isOnline: {
    type: Boolean,
    default: false
  },


  isPopular:{
    type:Boolean,
    default:false
  },


  groupLink:String,


  fee:{
    type:Number,
    required:true
  },


  capacity:{
    type:Number,
    required:true
  },


  schedule:[
    {
      day:String,
      startTime:String,
      endTime:String
    }
  ]

},
{
 timestamps:true
});


// Only create geo index for physical classes
classSchema.index({
 location:"2dsphere"
});


export default mongoose.model(
 "Class",
 classSchema
);