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

// 학생 계정 스키마 정의
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '학생 이름은 필수입니다'],
    trim: true,
    maxlength: [50, '이름은 50자를 초과할 수 없습니다'],
  },
  className: {
    type: String,
    required: [true, '학급 정보는 필수입니다'],
    trim: true,
    maxlength: [50, '학급 정보는 50자를 초과할 수 없습니다'],
  },
  accessCode: {
    type: String,
    required: [true, '고유번호는 필수입니다'],
    trim: true,
    minlength: [4, '고유번호는 최소 4자 이상이어야 합니다'],
    maxlength: [20, '고유번호는 20자를 초과할 수 없습니다'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    required: [true, '계정 생성자 정보는 필수입니다'],
  },
  isActive: {
    type: Boolean,
    default: true,
  }
});

// name과 accessCode 조합으로 unique 인덱스 생성
studentSchema.index({ name: 1, accessCode: 1 }, { unique: true });

// 모델이 이미 있으면 재사용, 없으면 생성
export default async function getStudentModel() {
  try {
    await connectDB();
    return mongoose.models.Student || mongoose.model('Student', studentSchema);
  } catch (error) {
    console.error('Student 모델 가져오기 실패:', error);
    throw error;
  }
} 