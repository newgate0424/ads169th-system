/**
 * Load Test Script
 * ทดสอบความสามารถรองรับ concurrent users
 * 
 * วิธีใช้: node load-test.js
 */

const CONCURRENT_USERS = 50
const TEST_DURATION_MS = 60000 // 1 นาที
const BASE_URL = 'http://localhost:3000'

// Simulated user session
class SimulatedUser {
  constructor(id) {
    this.id = id
    this.requestCount = 0
    this.errorCount = 0
    this.totalResponseTime = 0
  }

  async makeRequest(endpoint) {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'User-Agent': `LoadTestUser-${this.id}`,
        }
      })
      
      const responseTime = Date.now() - startTime
      this.totalResponseTime += responseTime
      this.requestCount++
      
      if (!response.ok) {
        this.errorCount++
        console.error(`❌ User ${this.id}: ${endpoint} - ${response.status} (${responseTime}ms)`)
      }
      
      return { success: response.ok, responseTime }
    } catch (error) {
      this.errorCount++
      console.error(`❌ User ${this.id}: ${endpoint} - ${error.message}`)
      return { success: false, responseTime: Date.now() - startTime }
    }
  }

  async simulateActivity() {
    // Simulate real user behavior
    const endpoints = [
      '/api/system/stats',
      '/api/admin/sessions',
      '/api/admin/users',
      '/api/admin/activity-logs?page=1&limit=20',
    ]
    
    while (true) {
      // Random endpoint
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
      await this.makeRequest(endpoint)
      
      // Random delay (5-15 seconds)
      await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 10000))
    }
  }

  getStats() {
    return {
      id: this.id,
      requests: this.requestCount,
      errors: this.errorCount,
      avgResponseTime: this.requestCount > 0 
        ? Math.round(this.totalResponseTime / this.requestCount) 
        : 0,
      errorRate: this.requestCount > 0 
        ? ((this.errorCount / this.requestCount) * 100).toFixed(2) + '%' 
        : '0%'
    }
  }
}

async function runLoadTest() {
  console.log('🚀 เริ่ม Load Test')
  console.log(`👥 Concurrent Users: ${CONCURRENT_USERS}`)
  console.log(`⏱️  Test Duration: ${TEST_DURATION_MS / 1000}s`)
  console.log('=' .repeat(60))
  
  // Create users
  const users = Array.from({ length: CONCURRENT_USERS }, (_, i) => new SimulatedUser(i + 1))
  
  // Start simulation
  const userPromises = users.map(user => user.simulateActivity())
  
  // Run for specified duration
  await Promise.race([
    Promise.all(userPromises),
    new Promise(resolve => setTimeout(resolve, TEST_DURATION_MS))
  ])
  
  // Stop all users
  console.log('\n⏹️  หยุด Load Test')
  console.log('=' .repeat(60))
  
  // Calculate statistics
  const stats = users.map(user => user.getStats())
  const totalRequests = stats.reduce((sum, s) => sum + s.requests, 0)
  const totalErrors = stats.reduce((sum, s) => sum + s.errors, 0)
  const avgResponseTime = Math.round(
    stats.reduce((sum, s) => sum + s.avgResponseTime, 0) / stats.length
  )
  
  console.log('\n📊 สรุปผลการทดสอบ:')
  console.log(`   Total Requests: ${totalRequests}`)
  console.log(`   Total Errors: ${totalErrors}`)
  console.log(`   Error Rate: ${((totalErrors / totalRequests) * 100).toFixed(2)}%`)
  console.log(`   Avg Response Time: ${avgResponseTime}ms`)
  console.log(`   Requests/Second: ${(totalRequests / (TEST_DURATION_MS / 1000)).toFixed(2)}`)
  
  // Show top 5 fastest users
  console.log('\n⚡ Top 5 Fastest Users:')
  stats.sort((a, b) => a.avgResponseTime - b.avgResponseTime)
  stats.slice(0, 5).forEach((s, i) => {
    console.log(`   ${i + 1}. User ${s.id}: ${s.avgResponseTime}ms (${s.requests} requests)`)
  })
  
  // Show users with errors
  const usersWithErrors = stats.filter(s => s.errors > 0)
  if (usersWithErrors.length > 0) {
    console.log(`\n⚠️  Users with Errors: ${usersWithErrors.length}`)
    usersWithErrors.forEach(s => {
      console.log(`   User ${s.id}: ${s.errors} errors (${s.errorRate})`)
    })
  }
  
  // Verdict
  console.log('\n' + '='.repeat(60))
  if (totalErrors === 0 && avgResponseTime < 500) {
    console.log('✅ ผ่าน! ระบบรองรับ ' + CONCURRENT_USERS + ' users ได้ดี')
  } else if (totalErrors < totalRequests * 0.05 && avgResponseTime < 1000) {
    console.log('⚠️  ผ่านแบบมีเงื่อนไข (มี errors เล็กน้อย)')
  } else {
    console.log('❌ ไม่ผ่าน! ระบบต้องปรับปรุง')
  }
  
  process.exit(0)
}

runLoadTest().catch(console.error)
