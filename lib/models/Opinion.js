import mongoose from 'mongoose';

// 연결이 없으면 연결 생성
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
    }
    
    return mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error('MongoDB 연결 오류:', error);
    throw new Error(`데이터베이스 연결에 실패했습니다: ${error.message}`);
  }
};

// 스키마 정의
const opinionSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: [true, '토론 주제는 필수입니다'],
    trim: true,
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class.topics',
  },
  content: {
    type: String,
    required: [true, '학생 의견은 필수입니다'],
    trim: true,
    maxlength: [5000, '의견은 5000자를 초과할 수 없습니다'],
  },
  studentName: {
    type: String,
    required: [true, '학생 이름은 필수입니다'],
    trim: true,
    maxlength: [50, '이름은 50자를 초과할 수 없습니다'],
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  studentClass: {
    type: String,
    trim: true,
    maxlength: [50, '학급 정보는 50자를 초과할 수 없습니다'],
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
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
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  referenceCode: {
    type: String,
    unique: true,
    required: true,
  }
});

// 모델이 이미 있으면 재사용, 없으면 생성
export default async function getOpinionModel() {
  try {
    await connectDB();
    return mongoose.models.Opinion || mongoose.model('Opinion', opinionSchema);
  } catch (error) {
    console.error('Opinion 모델 가져오기 실패:', error);
    throw error;
  }
} 