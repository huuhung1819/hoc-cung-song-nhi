require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

async function analyzeExerciseGeneration() {
  console.log('🔍 ANALYZING EXERCISE GENERATION TOKEN USAGE...\n')

  try {
    // Get recent exercise generation logs (high token usage)
    const { data: exerciseLogs, error } = await supabase
      .from('token_logs')
      .select('*')
      .gt('total_tokens', 300)
      .order('timestamp', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('❌ Error:', error.message)
      return
    }
    
    console.log('📊 HIGH TOKEN USAGE FOR EXERCISE GENERATION:')
    console.log('=' .repeat(80))
    
    exerciseLogs.forEach((log, index) => {
      const inputRatio = (log.prompt_tokens / log.total_tokens) * 100
      const outputRatio = (log.completion_tokens / log.total_tokens) * 100
      const efficiency = log.completion_tokens / log.prompt_tokens
      
      console.log(`\n🔍 Exercise Generation ${index + 1}:`)
      console.log(`   Total Tokens: ${log.total_tokens}`)
      console.log(`   Input Tokens: ${log.prompt_tokens} (${inputRatio.toFixed(1)}%)`)
      console.log(`   Output Tokens: ${log.completion_tokens} (${outputRatio.toFixed(1)}%)`)
      console.log(`   Efficiency: ${efficiency.toFixed(2)} (output/input)`)
      console.log(`   Model: ${log.model}`)
      console.log(`   Cost: $${log.cost}`)
      console.log(`   Time: ${new Date(log.timestamp).toLocaleString('vi-VN')}`)
      
      // Analysis
      if (log.prompt_tokens > 200) {
        console.log(`   ⚠️  HIGH INPUT: System prompt or context too long`)
      }
      if (efficiency < 0.3) {
        console.log(`   ⚠️  LOW EFFICIENCY: Much input for little output`)
      }
      if (log.total_tokens > 400) {
        console.log(`   ⚠️  VERY HIGH: Consider optimizing generation`)
      }
    })
    
    // Calculate character estimates
    console.log('\n📝 CHARACTER ESTIMATION:')
    console.log('=' .repeat(80))
    
    const avgInputTokens = exerciseLogs.reduce((sum, log) => sum + log.prompt_tokens, 0) / exerciseLogs.length
    const avgOutputTokens = exerciseLogs.reduce((sum, log) => sum + log.completion_tokens, 0) / exerciseLogs.length
    const avgTotalTokens = exerciseLogs.reduce((sum, log) => sum + log.total_tokens, 0) / exerciseLogs.length
    
    console.log(`Average Input Tokens: ${avgInputTokens.toFixed(1)}`)
    console.log(`Average Output Tokens: ${avgOutputTokens.toFixed(1)}`)
    console.log(`Average Total Tokens: ${avgTotalTokens.toFixed(1)}`)
    console.log(`Estimated Input Characters: ${(avgInputTokens * 4).toFixed(0)}`)
    console.log(`Estimated Output Characters: ${(avgOutputTokens * 4).toFixed(0)}`)
    console.log(`Estimated Total Characters: ${(avgTotalTokens * 4).toFixed(0)}`)
    
    // Expected vs Actual comparison
    console.log('\n🎯 EXPECTED VS ACTUAL:')
    console.log('=' .repeat(80))
    console.log('Expected for 5 exercises:')
    console.log('  • 5 questions × 50 chars = 250 chars')
    console.log('  • 5 × 4 options × 10 chars = 200 chars')
    console.log('  • UI text + buttons = 100 chars')
    console.log('  • Total expected: ~550 chars = ~138 tokens')
    console.log('')
    console.log(`Actual usage: ${avgTotalTokens.toFixed(1)} tokens = ${(avgTotalTokens * 4).toFixed(0)} chars`)
    console.log(`Overhead: ${(avgTotalTokens * 4 - 550).toFixed(0)} extra characters`)
    console.log(`Overhead ratio: ${((avgTotalTokens * 4 - 550) / 550 * 100).toFixed(1)}%`)
    
    // Recommendations
    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:')
    console.log('=' .repeat(80))
    console.log('1. ✅ Reduce system prompt length')
    console.log('2. ✅ Minimize conversation history')
    console.log('3. ✅ Use simpler exercise generation prompts')
    console.log('4. ✅ Consider JSON structure optimization')
    console.log('5. ✅ Implement exercise template caching')
    
    // Cost analysis
    const totalCost = exerciseLogs.reduce((sum, log) => sum + log.cost, 0)
    const avgCost = totalCost / exerciseLogs.length
    
    console.log('\n💰 COST ANALYSIS:')
    console.log('=' .repeat(80))
    console.log(`Average cost per generation: $${avgCost.toFixed(4)}`)
    console.log(`Cost per exercise: $${(avgCost / 5).toFixed(4)}`)
    console.log(`Monthly cost (100 generations): $${(avgCost * 100).toFixed(2)}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    process.exit(0)
  }
}

analyzeExerciseGeneration()
