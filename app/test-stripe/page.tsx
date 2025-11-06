"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react'

export default function TestStripePage() {
  const [configTest, setConfigTest] = useState<any>(null)
  const [databaseTest, setDatabaseTest] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const runTests = async () => {
    setLoading(true)
    
    try {
      // Test configuration
      const configResponse = await fetch('/api/test/stripe-config')
      const configData = await configResponse.json()
      setConfigTest(configData)

      // Test database
      const dbResponse = await fetch('/api/setup/stripe-database', {
        method: 'POST'
      })
      const dbData = await dbResponse.json()
      setDatabaseTest(dbData)

    } catch (error) {
      console.error('Test error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-500" />
    )
  }

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stripe Integration Test
          </h1>
          <p className="text-gray-600">
            Verify your Stripe setup is working correctly
          </p>
        </div>

        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <Clock className="w-6 h-6 animate-spin mr-2" />
              <span>Running tests...</span>
            </CardContent>
          </Card>
        )}

        {!loading && (
          <>
            {/* Configuration Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {configTest && getStatusIcon(configTest.success)}
                  Environment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {configTest && (
                  <div className="space-y-4">
                    <p className={`font-medium ${getStatusColor(configTest.success)}`}>
                      {configTest.message}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(configTest.environment_variables).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          {getStatusIcon(value as boolean)}
                          <span className="text-sm">{key.replace(/_/g, ' ').toUpperCase()}</span>
                        </div>
                      ))}
                    </div>

                    {configTest.missing_variables.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">Missing Variables:</h4>
                        <ul className="text-sm text-red-700">
                          {configTest.missing_variables.map((variable: string) => (
                            <li key={variable}>• {variable.replace(/_/g, ' ').toUpperCase()}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {getStatusIcon(configTest.stripe_connection)}
                      <span className="text-sm">Stripe API Connection</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Database Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {databaseTest && getStatusIcon(databaseTest.success)}
                  Database Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {databaseTest && (
                  <div className="space-y-4">
                    <p className={`font-medium ${getStatusColor(databaseTest.success)}`}>
                      {databaseTest.message}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(databaseTest.table_exists)}
                        <span className="text-sm">Payment Transactions Table</span>
                      </div>
                      
                      {databaseTest.table_exists && (
                        <div className="flex items-center gap-2">
                          {getStatusIcon(databaseTest.insert_test)}
                          <span className="text-sm">Database Insert Test</span>
                        </div>
                      )}
                    </div>

                    {!databaseTest.table_exists && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">Action Required:</h4>
                        <p className="text-sm text-yellow-700">
                          Please run the SQL migration file: <code>stripe-payment-transactions-table.sql</code> in your Supabase database.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {configTest?.success && databaseTest?.success ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">✅ Ready for Testing!</h4>
                      <p className="text-sm text-green-700 mb-3">
                        Your Stripe integration is properly configured. You can now test payments.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => window.location.href = '/balance-topup'}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Test Payment Flow
                        </Button>
                        <Button 
                          onClick={() => window.location.href = '/dashboard'}
                          variant="outline"
                        >
                          Go to Dashboard
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 mb-2">⚠️ Configuration Issues</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Please fix the issues above before testing payments.
                      </p>
                      <Button 
                        onClick={runTests}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Re-run Tests
                      </Button>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <h4 className="font-medium mb-2">Test Cards (Test Mode):</h4>
                    <ul className="space-y-1">
                      <li>• <code>4242 4242 4242 4242</code> - Success</li>
                      <li>• <code>4000 0000 0000 0002</code> - Decline</li>
                      <li>• <code>4000 0025 0000 3155</code> - Requires authentication</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}