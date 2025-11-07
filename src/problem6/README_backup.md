# Problem 6: Real-Time Scoreboard Architecture

## Overview
A scalable architecture for a live scoreboard system that displays the top 10 users' scores with real-time updates and protection against malicious score manipulation.

---

## System Architecture

### High-Level Components

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ HTTP/WebSocket
       │
┌──────▼──────────────────────────────────────────┐
│           Load Balancer / API Gateway           │
│                 (nginx/AWS ALB)                 │
└──────┬──────────────────────────────────────────┘
       │
       │
   ┌───┴────┐
   │        │
┌──▼───┐ ┌──▼───┐
│ App  │ │ App  │  Application Servers
│Server│ │Server│  (Node.js/Express)
└──┬───┘ └──┬───┘
   │        │
   └───┬────┘
       │
   ┌───┴────────────────┐
   │                    │
┌──▼──────┐      ┌──────▼───────┐
│ Redis   │      │   Database   │
│ PubSub  │      │  (PostgreSQL)│
└──┬──────┘      └──────────────┘
   │
   │ Subscribe
   │
┌──▼──────────┐
│  WebSocket  │
│   Server    │
│ (Socket.io) │
└─────────────┘
```

---

## Detailed Architecture

### 1. **Client Layer (Frontend)**

#### Components:
- **Scoreboard UI**: Displays top 10 users in real-time
- **WebSocket Client**: Maintains persistent connection for live updates
- **Action Handler**: Triggers score updates when user completes actions

#### Technologies:
- React/Vue/Vanilla JS
- Socket.io Client
- JWT for authentication

#### Flow:
```javascript
// Pseudo-code
1. User authenticates → Receives JWT token
2. Establish WebSocket connection with JWT
3. Display current top 10 scoreboard
4. User completes action → Send authenticated API request
5. Receive real-time updates via WebSocket
```

---

### 2. **API Gateway / Load Balancer**

#### Purpose:
- Distribute traffic across multiple application servers
- SSL/TLS termination
- Rate limiting
- DDoS protection

#### Features:
- **Rate Limiting**: Prevent spam requests (e.g., 10 requests/minute per user)
- **IP Whitelisting/Blacklisting**
- **Request validation**

---

### 3. **Application Server**

#### Responsibilities:
- Handle score update requests
- Authenticate and authorize users
- Validate actions
- Update database
- Publish updates to Redis PubSub

#### Key Endpoints:

```typescript
POST /api/score/update
Headers: Authorization: Bearer <JWT>
Body: {
  action_id: string,
  action_token: string,  // One-time token
  timestamp: number
}
```

#### Security Measures:

##### a) **JWT Authentication**
```typescript
// Verify user identity
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, SECRET_KEY);
const userId = decoded.userId;
```

##### b) **Action Token Verification**
- Generate one-time tokens server-side when action starts
- Token expires after short period (e.g., 5 minutes)
- Token tied to specific user and action

```typescript
// When action starts
POST /api/action/start
Response: {
  action_id: "abc123",
  action_token: "xyz789",  // One-time use
  expires_at: 1699450000
}

// When action completes
POST /api/score/update
Body: {
  action_id: "abc123",
  action_token: "xyz789"  // Must match
}
```

##### c) **Request Signing**
```typescript
// Client computes signature
const signature = HMAC_SHA256(
  action_id + user_id + timestamp,
  user_secret_key
);

// Server verifies signature
const expectedSig = HMAC_SHA256(
  action_id + user_id + timestamp,
  stored_user_secret
);
if (signature !== expectedSig) throw new Error('Invalid signature');
```

##### d) **Timestamp Validation**
```typescript
// Reject old requests (replay attack prevention)
const requestTime = req.body.timestamp;
const currentTime = Date.now();
if (Math.abs(currentTime - requestTime) > 30000) {
  throw new Error('Request expired');
}
```

##### e) **Idempotency**
```typescript
// Prevent duplicate submissions
const idempotencyKey = `${userId}:${actionId}`;
if (await redis.exists(idempotencyKey)) {
  throw new Error('Action already processed');
}
await redis.setex(idempotencyKey, 300, 'processed');
```

##### f) **Rate Limiting per User**
```typescript
const key = `rate_limit:${userId}`;
const requests = await redis.incr(key);
if (requests === 1) {
  await redis.expire(key, 60); // 1 minute window
}
if (requests > 10) {
  throw new Error('Rate limit exceeded');
}
```

##### g) **Server-Side Action Validation**
```typescript
// Verify action was actually performed
const isValid = await validateActionCompletion(
  userId,
  actionId,
  actionData
);
if (!isValid) {
  throw new Error('Invalid action');
}
```

---

### 4. **Database Layer**

#### Schema Design:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  secret_key VARCHAR(255) NOT NULL,  -- For request signing
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scores table
CREATE TABLE scores (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  score INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Score history (audit log)
CREATE TABLE score_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action_id VARCHAR(255) NOT NULL,
  score_change INTEGER NOT NULL,
  new_score INTEGER NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, action_id)  -- Prevent duplicate actions
);

-- Action tokens (one-time use)
CREATE TABLE action_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action_id VARCHAR(255) UNIQUE NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scores_score ON scores(score DESC);
CREATE INDEX idx_score_history_user ON score_history(user_id);
CREATE INDEX idx_action_tokens_lookup ON action_tokens(action_id, token) WHERE NOT used;
```

---

### 5. **Redis Layer**

#### Purpose:
- **PubSub**: Broadcast score updates to all WebSocket servers
- **Caching**: Cache top 10 leaderboard
- **Rate Limiting**: Track request rates per user
- **Idempotency**: Prevent duplicate action processing

#### Key Patterns:

```typescript
// Cache top 10 scoreboard
await redis.zadd('leaderboard', score, userId);
const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');

// Publish update to all subscribers
await redis.publish('scoreboard_updates', JSON.stringify({
  userId,
  username,
  newScore,
  rank
}));

// Rate limiting
const key = `rate_limit:${userId}`;
await redis.incr(key);
await redis.expire(key, 60);
```

---

### 6. **WebSocket Server**

#### Purpose:
- Maintain persistent connections with clients
- Push real-time updates to connected users

#### Flow:

```typescript
// Server-side (Socket.io)
io.use(async (socket, next) => {
  // Authenticate WebSocket connection
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Subscribe to Redis PubSub
redisClient.subscribe('scoreboard_updates');
redisClient.on('message', (channel, message) => {
  const update = JSON.parse(message);
  // Broadcast to all connected clients
  io.emit('scoreboard_update', update);
});

// Client-side
socket.on('scoreboard_update', (data) => {
  updateScoreboardUI(data);
});
```

---

## Security Measures Summary

### Protection Against Malicious Users:

| Attack Vector | Prevention Measure |
|--------------|-------------------|
| **Unauthorized access** | JWT authentication, token verification |
| **Replay attacks** | Timestamp validation, one-time action tokens |
| **Request forgery** | HMAC request signing, CSRF tokens |
| **Score manipulation** | Server-side validation, audit logs |
| **Duplicate submissions** | Idempotency keys, unique constraints |
| **Rate abuse** | Rate limiting per user/IP, throttling |
| **Token theft** | Short token expiry, HTTPS only, secure cookies |
| **Man-in-the-middle** | SSL/TLS, certificate pinning |
| **SQL injection** | Parameterized queries, ORM |
| **DDoS** | Rate limiting, API gateway, CDN |

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    1. User Authentication                    │
│  Client → POST /api/auth/login → JWT Token + Secret         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                2. Establish WebSocket Connection             │
│  Client connects with JWT → Receive initial top 10          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    3. Action Initialization                  │
│  Client → POST /api/action/start → action_token             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    4. User Completes Action                  │
│  Client-side: User performs action (game, task, etc.)       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     5. Score Update Request                  │
│  POST /api/score/update + JWT + action_token + signature    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    6. Server Validation                      │
│  ✓ Verify JWT                                               │
│  ✓ Verify action token (one-time use)                       │
│  ✓ Verify request signature                                 │
│  ✓ Check timestamp (prevent replay)                         │
│  ✓ Check idempotency key                                    │
│  ✓ Rate limit check                                         │
│  ✓ Validate action completion                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    7. Database Update                        │
│  Transaction:                                                │
│    - Update scores table                                     │
│    - Insert score_history (audit)                            │
│    - Mark action_token as used                               │
│    - Update Redis leaderboard cache                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    8. Publish Update                         │
│  Redis PubSub → Broadcast to all WebSocket servers          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    9. Real-Time Push                         │
│  WebSocket → Push to all connected clients                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   10. UI Update                              │
│  Client receives update → Animate scoreboard changes        │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Recommendations

### Backend:
- **Application Server**: Node.js + Express / NestJS
- **WebSocket**: Socket.io
- **Database**: PostgreSQL (for ACID compliance)
- **Cache/PubSub**: Redis
- **Authentication**: JWT (jsonwebtoken)

### Frontend:
- **Framework**: React / Vue.js / Next.js
- **WebSocket Client**: Socket.io-client
- **State Management**: Redux / Zustand / Pinia

### Infrastructure:
- **Load Balancer**: nginx / AWS ALB
- **Container**: Docker
- **Orchestration**: Kubernetes / AWS ECS
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack / CloudWatch

---

## Scalability Considerations

### Horizontal Scaling:
1. **Multiple App Servers**: Behind load balancer
2. **Redis Cluster**: For high availability
3. **Database Replication**: Read replicas for scoreboard queries
4. **WebSocket Servers**: Multiple instances with Redis adapter

### Performance Optimization:
1. **CDN**: Cache static assets
2. **Database Indexing**: On score column for fast leaderboard queries
3. **Redis Caching**: Cache top 10/100 leaderboard
4. **Connection Pooling**: Reuse database connections
5. **Lazy Loading**: Only load top 10, paginate for more

---

## Monitoring & Alerting

### Key Metrics:
- Request rate per endpoint
- WebSocket connection count
- Score update latency
- Failed authentication attempts
- Rate limit violations
- Database query performance

### Alerts:
- Spike in failed authentications (potential attack)
- High rate of duplicate action attempts
- Database connection pool exhaustion
- Redis connection failures
- Unusual score increases

---

## Additional Security Considerations

### 1. **Anomaly Detection**
```typescript
// Flag suspicious patterns
if (scoreIncrease > THRESHOLD || 
    actionsPerMinute > MAX_ACTIONS) {
  await flagForReview(userId);
  await notifyAdmins();
}
```

### 2. **Manual Review Queue**
- Flag high-value score changes
- Review accounts with abnormal patterns
- Ban/suspend suspicious accounts

### 3. **Audit Logging**
- Log all score changes with metadata
- Store IP addresses, user agents
- Enable forensic analysis

### 4. **Penetration Testing**
- Regular security audits
- Third-party penetration testing
- Bug bounty program

---

## Conclusion

This architecture provides:
- ✅ Real-time scoreboard updates via WebSocket
- ✅ Protection against unauthorized score manipulation
- ✅ Scalability for high traffic
- ✅ Comprehensive audit trail
- ✅ Multiple layers of security
- ✅ High availability and fault tolerance

The multi-layered security approach ensures that malicious users cannot easily manipulate scores, while legitimate users enjoy a seamless real-time experience.
