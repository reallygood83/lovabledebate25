import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/feedback-app?retryWrites=true&w=majority";
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('MongoDB URI가 환경 변수에 설정되지 않았습니다.');
}

if (process.env.NODE_ENV === 'development') {
  // 개발 환경에서는 전역 변수를 사용하여 연결 유지
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 프로덕션 환경에서는 새 연결 생성
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise; 