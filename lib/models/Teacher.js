import mongoose from 'mongoose';

// 연결이 없으면 연결 생성
const connectDB = async () => {
  try {
    // 이미 연결되어 있으면 기존 연결 사용
    if (mongoose.connection.readyState >= 1) {
      console.log('기존 MongoDB 연결 사용');
      return;
    }
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
    }
    
    console.log('MongoDB 연결 시도...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10초 타임아웃
    });
    
    console.log('MongoDB 연결 성공');
    
    // 연결 이벤트 리스너 추가
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB 연결 오류:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB 연결이 끊어졌습니다.');
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    throw new Error(`데이터베이스 연결에 실패했습니다: ${error.message}`);
  }
};

// 교사 계정 스키마 정의
const teacherSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, '이메일은 필수입니다'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [100, '이메일은 100자를 초과할 수 없습니다'],
  },
  name: {
    type: String,
    required: [true, '교사 이름은 필수입니다'],
    trim: true,
    maxlength: [50, '이름은 50자를 초과할 수 없습니다'],
  },
  password: {
    type: String,
    required: [true, '비밀번호는 필수입니다'],
    minlength: [6, '비밀번호는 최소 6자 이상이어야 합니다'],
  },
  naverOAuthId: {
    type: String,
    sparse: true, // 값이 있는 경우에만 고유성 적용
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
});

// 모델이 이미 있으면 재사용, 없으면 생성
export default async function getTeacherModel() {
  try {
    await connectDB();
    
    // 모델이 이미 등록되어 있는지 확인
    if (mongoose.models.Teacher) {
      return mongoose.models.Teacher;
    }
    
    // 새 모델 생성
    return mongoose.model('Teacher', teacherSchema);
  } catch (error) {
    console.error('Teacher 모델 가져오기 실패:', error);
    throw error;
  }
} 