"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Database, AlertCircle } from 'lucide-react'

export default function CheckUserPage() {
  const [localStorageData, setLocalStorageData] = useState<any>(null)
  const [userCheckResult, setUserCheckResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Get data from localStorage
    const currentUserId = localStorage.getItem('chronostime_current_user')
    const usersData = localStorage.getItem('chronostime_users')
    
    setLocalStorageData({
      current_user_id: currentUserId,
      users_data: usersData ? JSON.parse(usersData) : null,
      all_keys: Object.keys(localStorage).filter(key => key.includes('chronos'))
    })
  }, [])

  const checkUserInDatabase = async () => {
    if (!localStorageData?.current_user_id) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/debug/user-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: localStorageData.current_user_id })
      })
      
      const result = await response.json()
      setUserCheckResult(result)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User ID Debug Check
          </h1>
          <p className="text-gray-600">
            Check localStorage vs Database user ID format
          </p>
        </div>

        {/* LocalStorage Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              LocalStorage Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {localStorageData ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Current User ID:</h4>
                  <code className="bg-gray-100 p-2 rounded block text-sm break-all">
                    {localStorageData.current_user_id || 'Not found'}
                  </code>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">All ChronosTime Keys:</h4>
                  <div className="space-y-1">
                    {localStorageData.all_keys.map((key: string) => (
                      <div key={key} className="text-sm">
                        <code className="bg-gray-100 p-1 rounded">{key}</code>
                      </div>
                    ))}
                  </div>
                </div>

                {localStorageData.users_data && (
                  <div>
                    <h4 className="font-medium mb-2">Users Data Sample:</h4>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(localStorageData.users_data, null, 2)}
                    </pre>
                  </div>
                )}

                <Button 
                  onClick={checkUserInDatabase}
                  disabled={loading || !localStorageData.current_user_id}
                  className="w-full"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {loading ? 'Checking...' : 'Check User in Database'}
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">Loading localStorage data...</p>
            )}
          </CardContent>
        </Card>

        {/* Database Check Result */}
        {userCheckResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Check Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${
                  userCheckResult.exact_match.found 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <h4 className="font-medium mb-2">Exact ID Match:</h4>
                  <p className={`text-sm ${
                    userCheckResult.exact_match.found ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {userCheckResult.exact_match.found ? '✅ Found' : '❌ Not Found'}
                  </p>
                  {userCheckResult.exact_match.error && (
                    <p className="text-xs text-red-600 mt-1">
                      Error: {userCheckResult.exact_match.error}
                    </p>
                  )}
                </div>

                <div className={`p-4 rounded-lg border ${
                  userCheckResult.email_match.found 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <h4 className="font-medium mb-2">Email Match:</h4>
                  <p className={`text-sm ${
                    userCheckResult.email_match.found ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {userCheckResult.email_match.found ? '✅ Found' : '❌ Not Found'}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Debug Info:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>ID Type: {userCheckResult.debug_info.user_id_type}</p>
                  <p>ID Length: {userCheckResult.debug_info.user_id_length}</p>
                  <p>Is UUID Format: {userCheckResult.debug_info.is_uuid_format ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {userCheckResult.sample_users.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Sample Users in Database:</h4>
                  <div className="space-y-2">
                    {userCheckResult.sample_users.map((user: any) => (
                      <div key={user.id} className="bg-gray-50 p-3 rounded text-sm">
                        <div><strong>ID:</strong> {user.id}</div>
                        <div><strong>Email:</strong> {user.email}</div>
                        <div><strong>Username:</strong> {user.username}</div>
                        <div><strong>Balance:</strong> ${user.balance || 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!userCheckResult.exact_match.found && !userCheckResult.email_match.found && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">User ID Mismatch Found!</h4>
                      <p className="text-sm text-yellow-700">
                        Your localStorage user ID doesn't match any user in the database. 
                        This is why balance updates are failing. You need to log in again 
                        or fix the user ID format.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}