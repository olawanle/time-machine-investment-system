"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search, Database, Webhook } from 'lucide-react'

export default function DebugStripePage() {
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [specificDebug, setSpecificDebug] = useState<any>(null)

  const loadDebugData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/webhook-logs')
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error('Error loading debug data:', error)
    } finally {
      setLoading(false)
    }
  }

  const debugSpecific = async () => {
    if (!userId && !sessionId) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/debug/webhook-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, session_id: sessionId })
      })
      const data = await response.json()
      setSpecificDebug(data)
    } catch (error) {
      console.error('Error debugging specific records:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDebugData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stripe Webhook Debug
          </h1>
          <p className="text-gray-600">
            Debug payment transactions and user balance updates
          </p>
        </div>

        {/* Debug Specific Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Debug Specific Records
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">User ID</label>
                <Input
                  placeholder="Enter user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Session ID</label>
                <Input
                  placeholder="Enter Stripe session ID"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={debugSpecific} disabled={loading || (!userId && !sessionId)}>
              <Search className="w-4 h-4 mr-2" />
              Debug Records
            </Button>

            {specificDebug && (
              <div className="mt-4 space-y-4">
                {specificDebug.debug_results.user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">User Record:</h4>
                    <pre className="text-xs bg-white p-2 rounded overflow-auto">
                      {JSON.stringify(specificDebug.debug_results.user, null, 2)}
                    </pre>
                  </div>
                )}
                
                {specificDebug.debug_results.transaction && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Transaction Record:</h4>
                    <pre className="text-xs bg-white p-2 rounded overflow-auto">
                      {JSON.stringify(specificDebug.debug_results.transaction, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Recent Payment Transactions
              <Button
                onClick={loadDebugData}
                disabled={loading}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debugData?.recent_transactions?.length > 0 ? (
              <div className="space-y-4">
                {debugData.recent_transactions.map((transaction: any) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Status:</span>
                        <div className={`inline-block px-2 py-1 rounded text-xs ml-2 ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span> ${transaction.amount}
                      </div>
                      <div>
                        <span className="font-medium">User ID:</span>
                        <div className="text-xs text-gray-600 break-all">{transaction.user_id}</div>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <div className="text-xs text-gray-600">
                          {new Date(transaction.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Session: {transaction.stripe_session_id}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent transactions found</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              Recent User Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debugData?.recent_users?.length > 0 ? (
              <div className="space-y-4">
                {debugData.recent_users.map((user: any) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Username:</span> {user.username}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {user.email}
                      </div>
                      <div>
                        <span className="font-medium">Balance:</span> ${user.balance || 0}
                      </div>
                      <div>
                        <span className="font-medium">Total Invested:</span> ${user.total_invested || 0}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      ID: {user.id}
                    </div>
                    <div className="text-xs text-gray-500">
                      Updated: {new Date(user.updated_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent users found</p>
            )}
          </CardContent>
        </Card>

        {/* Debug Info */}
        {debugData && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Transactions:</span> {debugData.debug_info.transaction_count}
                </div>
                <div>
                  <span className="font-medium">Users:</span> {debugData.debug_info.user_count}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <div className="text-xs text-gray-600">
                    {new Date(debugData.debug_info.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}