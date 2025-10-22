"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronDown, 
  ChevronRight,
  Copy,
  Play,
  Save,
  Trash2,
  Eye,
  Code,
  FileText,
  Grid,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Lock,
  Globe,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  Shield,
  BarChart3,
  Target,
  Activity,
  Award,
  Star,
  PieChart,
  Wallet,
  CreditCard,
  Settings,
  HelpCircle,
  Plus,
  MoreHorizontal
} from "lucide-react"

interface APIEndpointViewProps {
  endpoint: {
    method: string
    path: string
    title: string
    description: string
    parameters?: Array<{
      name: string
      type: string
      required: boolean
      description: string
      example?: string
    }>
    responses?: Array<{
      code: number
      name: string
      description: string
      schema?: any
    }>
  }
  onSave?: () => void
  onRun?: () => void
  onDelete?: () => void
}

export function APIEndpointView({ endpoint, onSave, onRun, onDelete }: APIEndpointViewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [activeResponse, setActiveResponse] = useState(0)
  const [schemaView, setSchemaView] = useState("preview")

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "POST": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "PUT": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "DELETE": return "bg-red-500/20 text-red-400 border-red-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusCodeColor = (code: number) => {
    if (code >= 200 && code < 300) return "text-green-400"
    if (code >= 400 && code < 500) return "text-red-400"
    if (code >= 500) return "text-orange-400"
    return "text-gray-400"
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge className={`px-3 py-1 ${getMethodColor(endpoint.method)}`}>
              {endpoint.method}
            </Badge>
            <code className="text-lg font-mono text-white bg-gray-800 px-3 py-1 rounded">
              {endpoint.path}
            </code>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={onRun}>
            <Play className="w-4 h-4 mr-2" />
            Run
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete} className="text-red-400 hover:text-red-300">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6">
        {["Overview", "Endpoint", "Edit", "Run", "Mock"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.toLowerCase()
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            {tab}
          </button>
        ))}
        <div className="flex-1" />
        <Button variant="ghost" size="sm">
          <Plus className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Endpoint Details */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Badge className={`px-3 py-1 ${getMethodColor(endpoint.method)}`}>
            {endpoint.method}
          </Badge>
          <code className="text-xl font-mono text-white bg-gray-800 px-4 py-2 rounded">
            {endpoint.path}
          </code>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">{endpoint.title}</h1>
        <p className="text-gray-400 text-lg">{endpoint.description}</p>
      </div>

      {/* Responses Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Responses</h2>
        
        <div className="flex items-center gap-2 mb-4">
          {endpoint.responses?.map((response, index) => (
            <button
              key={index}
              onClick={() => setActiveResponse(index)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeResponse === index
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              {response.name}({response.code})
            </button>
          ))}
          <Button variant="outline" size="sm">
            + Add
          </Button>
        </div>

        {endpoint.responses && endpoint.responses[activeResponse] && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className={`font-mono text-lg ${getStatusCodeColor(endpoint.responses[activeResponse].code)}`}>
                    HTTP Status Code: {endpoint.responses[activeResponse].code}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-400">Name: </span>
                  <span className="text-white">{endpoint.responses[activeResponse].name}</span>
                </div>
                
                <div>
                  <span className="text-gray-400">Content Type: </span>
                  <select className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm ml-2">
                    <option>JSON</option>
                    <option>XML</option>
                    <option>Text</option>
                  </select>
                </div>
                
                <div className="text-sm text-gray-400">
                  application/json
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Data Schema Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Data Schema</h2>
        
        <div className="flex items-center gap-2 mb-4">
          {[
            { id: "preview", label: "Preview", icon: <Eye className="w-4 h-4" /> },
            { id: "code", label: "Generate Code", icon: <Code className="w-4 h-4" /> },
            { id: "json", label: "JSON Schema", icon: <FileText className="w-4 h-4" /> },
            { id: "generate", label: "Generate from JSON etc.", icon: <Grid className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSchemaView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                schemaView === tab.id
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">ROOT</span>
                  <Badge variant="outline" className="text-xs">object</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">StoreCustomersRes</Button>
                  <Button variant="outline" size="sm">Dereference</Button>
                  <Button variant="outline" size="sm">Hide</Button>
                </div>
              </div>

              {/* Sample Schema Fields */}
              <div className="ml-4 space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">customer</span>
                    <Badge variant="outline" className="text-xs">object</Badge>
                    <span className="text-xs text-gray-500">* N</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">StoreCustomersRes</Button>
                    <Button variant="outline" size="sm">Dereference</Button>
                    <Button variant="outline" size="sm">Hide</Button>
                  </div>
                </div>

                <div className="ml-4 space-y-2">
                  {[
                    { name: "id", type: "string", required: true, description: "The customer's ID" },
                    { name: "email", type: "string<email>", required: true, description: "The customer's email" },
                    { name: "first_name", type: "string", required: true, nullable: true, description: "The customer's first name" },
                    { name: "last_name", type: "string", required: true, nullable: true, description: "The customer's last name" },
                    { name: "balance", type: "number", required: true, description: "The customer's balance" },
                    { name: "created_at", type: "string<date-time>", required: true, description: "The date when the customer was created" }
                  ].map((field, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800/50">
                      <div className="flex items-center gap-2">
                        <span className="text-white">{field.name}</span>
                        <Badge variant="outline" className="text-xs">{field.type}</Badge>
                        {field.required && <span className="text-xs text-red-400">*</span>}
                        {field.nullable && <span className="text-xs text-gray-500">N</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Mock</span>
                        <span className="text-xs text-gray-400">{field.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Design-first Mode
          </Button>
          <Button variant="outline" size="sm">
            Request-first Mode
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>System Proxy</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Cookies</span>
          </div>
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Trash</span>
          </div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            <span>Help & support</span>
          </div>
        </div>
      </div>
    </div>
  )
}
