import { check, sleep } from 'k6';
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 50 },  // Stay at 50 users for 1 minute
    { duration: '30s', target: 100 }, // Ramp up to 100 users
    { duration: '2m', target: 100 },  // Stay at 100 users for 2 minutes
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.05'],   // Error rate must be below 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const users = [
  { email: 'user1@example.com', password: 'password123', username: 'user1' },
  { email: 'user2@example.com', password: 'password123', username: 'user2' },
  { email: 'user3@example.com', password: 'password123', username: 'user3' },
];

let authTokens = [];

export function setup() {
  // Register test users
  users.forEach((user, index) => {
    const registerRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (registerRes.status === 201 || registerRes.status === 409) { // Created or already exists
      // Login to get token
      const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        email: user.email,
        password: user.password,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (loginRes.status === 200) {
        const token = JSON.parse(loginRes.body).accessToken;
        authTokens.push(token);
      }
    }
  });
  
  return { authTokens };
}

export default function(data) {
  const token = data.authTokens[Math.floor(Math.random() * data.authTokens.length)];
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Test scenario 1: User Profile Access
  const profileRes = http.get(`${BASE_URL}/user/profile`, { headers });
  check(profileRes, {
    'profile status is 200': (r) => r.status === 200,
    'profile response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // Test scenario 2: Quests List
  const questsRes = http.get(`${BASE_URL}/quests`, { headers });
  check(questsRes, {
    'quests status is 200': (r) => r.status === 200,
    'quests response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);

  // Test scenario 3: Guilds List
  const guildsRes = http.get(`${BASE_URL}/guilds`, { headers });
  check(guildsRes, {
    'guilds status is 200': (r) => r.status === 200,
    'guilds response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);

  // Test scenario 4: Notifications
  const notificationsRes = http.get(`${BASE_URL}/notifications`, { headers });
  check(notificationsRes, {
    'notifications status is 200': (r) => r.status === 200,
    'notifications response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // Test scenario 5: AI Chat (intermittent)
  if (Math.random() < 0.3) { // 30% chance to test AI chat
    const chatRes = http.post(`${BASE_URL}/aichat/chat`, JSON.stringify({
      message: 'Hello, how can I improve my learning?',
    }), { headers });
    
    check(chatRes, {
      'ai chat status is 200': (r) => r.status === 200,
      'ai chat response time < 2000ms': (r) => r.timings.duration < 2000,
    });
  }

  sleep(2);
}

export function teardown(data) {
  // Cleanup if needed
  console.log('Load test completed');
}
