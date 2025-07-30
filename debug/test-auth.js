// Test script para verificar endpoints de autenticación
const testAuthEndpoints = async () => {
  const baseURL = "https://squid-app-fr38f.ondigitalocean.app"
  
  console.log("🧪 Probando endpoints de autenticación...")
  
  // Test 1: Health check (debería funcionar sin auth)
  try {
    const healthResponse = await fetch(`${baseURL}/health`)
    console.log("✅ Health check:", healthResponse.status)
  } catch (error) {
    console.log("❌ Health check failed:", error.message)
  }
  
  // Test 2: Signup (debería funcionar sin auth)
  try {
    const signupResponse = await fetch(`${baseURL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User'
      })
    })
    
    const signupData = await signupResponse.json()
    console.log("✅ Signup response:", signupResponse.status, signupData)
  } catch (error) {
    console.log("❌ Signup failed:", error.message)
  }
  
  // Test 3: Signin (debería funcionar sin auth)
  try {
    const signinResponse = await fetch(`${baseURL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    })
    
    const signinData = await signinResponse.json()
    console.log("✅ Signin response:", signinResponse.status, signinData)
  } catch (error) {
    console.log("❌ Signin failed:", error.message)
  }
}

// Ejecutar tests
testAuthEndpoints() 