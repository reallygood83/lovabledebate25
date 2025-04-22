import mongoose from 'mongoose';

// 연결이 없으면 연결 생성
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  return mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

// 스키마 정의
const opinionSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: [true, '토론 주제는 필수입니다'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, '학생 의견은 필수입니다'],
    trim: true,
  },
  studentName: {
    type: String,
    required: [true, '학생 이름은 필수입니다'],
    trim: true,
  },
  studentClass: {
    type: String,
    required: [true, '학급 정보는 필수입니다'],
    trim: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed'],
    default: 'pending',
  },
  feedback: {
    type: String,
    default: '',
  },
  teacherNote: {
    type: String,
    default: '',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  referenceCode: {
    type: String,
    unique: true,
  }
});

// 모델이 이미 있으면 재사용, 없으면 생성
export default async function getOpinionModel() {
  await connectDB();
  
  return mongoose.models.Opinion || mongoose.model('Opinion', opinionSchema);
} 