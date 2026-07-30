import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 concurrent users
    { duration: '1m', target: 20 },  // Sustained load
    { duration: '15s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // P95 response time must be under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failure rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  // 1. Health Liveness Check
  const liveRes = http.get(`${BASE_URL}/health/live`);
  check(liveRes, {
    'liveness status is 200': (r) => r.status === 200,
  });

  // 2. Health Readiness DB Check
  const readyRes = http.get(`${BASE_URL}/health/ready`);
  check(readyRes, {
    'readiness status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
