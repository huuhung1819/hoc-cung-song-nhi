require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

async function testTokenOptimization() {
  console.log('🔧 TESTING TOKEN OPTIMIZATION...\n')

  try {
    // Get recent high token usage logs
    const { data: highUsageLogs, error } = await supabase
      .from('token_logs')
      .select('*')
      .gt('total_tokens', 200)
      .order('timestamp', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('❌ Error:', error.message)
      return
    }
    
    console.log('📊 HIGH TOKEN USAGE ANALYSIS:')
    console.log('=' .repeat(60))
    
    highUsageLogs.forEach((log, index) => {
      const efficiency = log.completion_tokens / log.prompt_tokens
      const costPerToken = log.cost / log.total_tokens
      
      console.log(`\n🔍 Log ${index + 1}:`)
      console.log(`   Total: ${log.total_tokens} tokens`)
      console.log(`   Input: ${log.prompt_tokens} tokens (${((log.prompt_tokens/log.total_tokens)*100).toFixed(1)}%)`)
      console.log(`   Output: ${log.completion_tokens} tokens (${((log.completion_tokens/log.total_tokens)*100).toFixed(1)}%)`)
      console.log(`   Efficiency: ${efficiency.toFixed(2)} (output/input)`)
      console.log(`   Cost: $${log.cost} ($${costPerToken.toFixed(4)} per token)`)
      
      // Token optimization suggestions
      if (log.prompt_tokens > 300) {
        console.log(`   ⚠️  HIGH INPUT TOKENS: Consider reducing conversation history`)
      }
      if (efficiency < 0.2) {
        console.log(`   ⚠️  LOW EFFICIENCY: Consider optimizing prompts`)
      }
      if (log.total_tokens > 400) {
        console.log(`   ⚠️  VERY HIGH USAGE: Consider message length limits`)
      }
    })
    
    // Calculate potential savings
    const totalHighTokens = highUsageLogs.reduce((sum, log) => sum + log.total_tokens, 0)
    const avgTokens = totalHighTokens / highUsageLogs.length
    
    console.log(`\n💰 POTENTIAL SAVINGS:`)
    console.log(`   Current average: ${avgTokens.toFixed(1)} tokens per request`)
    console.log(`   Target (30% reduction): ${(avgTokens * 0.7).toFixed(1)} tokens per request`)
    console.log(`   Potential savings: ${(avgTokens * 0.3).toFixed(1)} tokens per request`)
    
    // Cost analysis
    const totalCost = highUsageLogs.reduce((sum, log) => sum + log.cost, 0)
    const avgCost = totalCost / highUsageLogs.length
    const potentialCostSavings = avgCost * 0.3
    
    console.log(`\n💵 COST ANALYSIS:`)
    console.log(`   Current average cost: $${avgCost.toFixed(4)} per request`)
    console.log(`   Potential savings: $${potentialCostSavings.toFixed(4)} per request`)
    console.log(`   Monthly savings (1000 requests): $${(potentialCostSavings * 1000).toFixed(2)}`)
    
    console.log(`\n🎯 OPTIMIZATION RECOMMENDATIONS:`)
    console.log(`   1. ✅ Reduce conversation history from 10 to 3 messages`)
    console.log(`   2. ✅ Limit system prompt to 500 characters`)
    console.log(`   3. ✅ Add token usage logging`)
    console.log(`   4. 🔄 Consider implementing message length limits`)
    console.log(`   5. 🔄 Consider using smaller models for simple queries`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    process.exit(0)
  }
}

testTokenOptimization()
