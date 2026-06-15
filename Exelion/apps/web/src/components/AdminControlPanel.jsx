'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { validateBackend, checkBackendStatus } from '@/lib/api-client.js';

const AdminControlPanel = () => {
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [results, setResults] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleValidateBackend = async () => {
    setLoading(true);
    setActiveAction('validate');
    try {
      const data = await validateBackend();
      
      setResults((prev) => ({
        ...prev,
        validate: {
          success: !data.error,
          data: data.error ? null : data,
          error: data.error ? data.message : null,
          timestamp: new Date().toISOString(),
        },
      }));
      setExpandedSections((prev) => ({
        ...prev,
        validate: true,
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        validate: {
          success: false,
          data: null,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
      setExpandedSections((prev) => ({
        ...prev,
        validate: true,
      }));
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    setActiveAction('status');
    try {
      const data = await checkBackendStatus();
      
      setResults((prev) => ({
        ...prev,
        status: {
          success: !data.error,
          data: data.error ? null : data,
          error: data.error ? data.message : null,
          timestamp: new Date().toISOString(),
        },
      }));
      setExpandedSections((prev) => ({
        ...prev,
        status: true,
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        status: {
          success: false,
          data: null,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
      setExpandedSections((prev) => ({
        ...prev,
        status: true,
      }));
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const ResultCard = ({ title, actionKey, result }) => {
    if (!result) return null;

    const isExpanded = expandedSections[actionKey];

    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <CardTitle className="text-base">{title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection(actionKey)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          <CardDescription>
            {result.success ? (
              <span className="text-green-600 font-medium">
                ✓ Success
              </span>
            ) : (
              <span className="text-red-600 font-medium">✗ Failed</span>
            )}
          </CardDescription>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-3">
            {result.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm font-medium text-red-800">Error:</p>
                <p className="text-sm text-red-700 mt-1 font-mono break-words">
                  {result.error}
                </p>
              </div>
            )}

            {result.data && (
              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <p className="text-sm font-medium text-slate-800 mb-2">
                  Response Data:
                </p>
                <pre className="text-xs bg-white border border-slate-200 rounded p-2 overflow-auto max-h-96 text-slate-700">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}

            <div className="text-xs text-slate-500">
              <p>Timestamp: {new Date(result.timestamp).toLocaleString()}</p>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Admin Control Panel</CardTitle>
          <CardDescription>
            Monitor and validate the backend API server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Validate Backend Button */}
          <div>
            <Button
              onClick={handleValidateBackend}
              disabled={loading}
              className="w-full"
              variant="default"
            >
              {activeAction === 'validate' && loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating Backend...
                </>
              ) : (
                'Validate Backend'
              )}
            </Button>
            {results.validate && (
              <ResultCard
                title="Validate Backend"
                actionKey="validate"
                result={results.validate}
              />
            )}
          </div>

          {/* Check Status Button */}
          <div>
            <Button
              onClick={handleCheckStatus}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {activeAction === 'status' && loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Status...
                </>
              ) : (
                'Check Status'
              )}
            </Button>
            {results.status && (
              <ResultCard
                title="Backend Status"
                actionKey="status"
                result={results.status}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminControlPanel;