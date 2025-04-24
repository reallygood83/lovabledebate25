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

// 반(클래스) 스키마 정의
const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '반 이름은 필수입니다'],
    trim: true,
    maxlength: [100, '반 이름은 100자를 초과할 수 없습니다'],
  },
  joinCode: {
    type: String,
    required: [true, '참여 코드는 필수입니다'],
    unique: true,
    trim: true,
    minlength: [4, '참여 코드는 최소 4자 이상이어야 합니다'],
    maxlength: [4, '참여 코드는 4자여야 합니다'],
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, '담당 교사 정보는 필수입니다'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, '설명은 500자를 초과할 수 없습니다'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  topics: [
    {
      title: {
        type: String,
        required: [true, '토론 주제는 필수입니다'],
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      deadline: {
        type: Date,
      },
      status: {
        type: String,
        enum: ['active', 'completed', 'draft'],
        default: 'active',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }
  ]
});

// 모델이 이미 있으면 재사용, 없으면 생성
export default async function getClassModel() {
  try {
    await connectDB();
    return mongoose.models.Class || mongoose.model('Class', classSchema);
  } catch (error) {
    console.error('Class 모델 가져오기 실패:', error);
    throw error;
  }
} 