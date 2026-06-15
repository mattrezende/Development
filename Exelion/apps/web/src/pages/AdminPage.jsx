import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import AdminControlPanel from '@/components/AdminControlPanel.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { AlertCircle, CheckCircle2, Server, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  return (
    <>
      <Helmet>
        <title>Admin control panel</title>
        <meta name="description" content="Backend server management and diagnostics for administrators" />
      </Helmet>

      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 p-6 lg:p-8">
            <div className="mx-auto max-w-5xl space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Admin control panel</h1>
                <p className="text-muted-foreground leading-relaxed">
                  Manage and monitor the backend server infrastructure. Use these tools to restart services, validate endpoints, and check system status.
                </p>
              </div>

              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Important information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Understanding HTTP 200 responses</h3>
                    <p className="text-muted-foreground">
                      When you see an HTTP 200 status code in the results, this confirms that the health check endpoint responded successfully. 
                      A 200 response means the server is running and able to process requests correctly.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Admin access only</h3>
                    <p className="text-muted-foreground">
                      These controls affect the entire backend infrastructure. Only use them when necessary, and verify results after each operation.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <RefreshCw className="h-4 w-4 text-primary" />
                      Restart backend
                    </CardTitle>
                    <CardDescription>
                      Stops the current backend process and starts a fresh instance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>This operation will:</p>
                    <ul className="ml-4 space-y-1 list-disc">
                      <li>Kill existing Node.js processes on port 3001</li>
                      <li>Wait 2 seconds for clean shutdown</li>
                      <li>Spawn a new backend process</li>
                      <li>Wait 3 seconds for startup</li>
                      <li>Test the health check endpoint</li>
                    </ul>
                    <p className="pt-2 text-xs">
                      Use this when the backend becomes unresponsive or after deploying code changes.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Validate backend
                    </CardTitle>
                    <CardDescription>
                      Tests both local and remote health check endpoints
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>This operation will:</p>
                    <ul className="ml-4 space-y-1 list-disc">
                      <li>Test local endpoint at localhost:3001</li>
                      <li>Test remote endpoint at exelion.com.br</li>
                      <li>Check HTTP status codes</li>
                      <li>Parse and display JSON responses</li>
                    </ul>
                    <p className="pt-2 text-xs">
                      Use this to verify that both development and production endpoints are responding correctly.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Server className="h-4 w-4 text-primary" />
                      Check status
                    </CardTitle>
                    <CardDescription>
                      Verifies if the backend process is currently running
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>This operation will:</p>
                    <ul className="ml-4 space-y-1 list-disc">
                      <li>Check for processes on port 3001</li>
                      <li>Return process information if running</li>
                      <li>Show port number and timestamp</li>
                    </ul>
                    <p className="pt-2 text-xs">
                      Use this for quick diagnostics to confirm the backend is active without making changes.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-base">Response indicators</CardTitle>
                    <CardDescription>
                      How to interpret the results
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Green indicators</p>
                        <p className="text-muted-foreground text-xs">Operation completed successfully, all checks passed</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Red indicators</p>
                        <p className="text-muted-foreground text-xs">Operation failed or endpoint is not responding</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Server className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">HTTP 200 status</p>
                        <p className="text-muted-foreground text-xs">Confirms successful health check response from server</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Control panel</h2>
                  <p className="text-sm text-muted-foreground">
                    Click any button below to execute the corresponding operation. Results will appear in expandable sections with detailed response data.
                  </p>
                </div>
                <AdminControlPanel />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}