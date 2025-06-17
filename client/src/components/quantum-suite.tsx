import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { NDAModal } from './nda-modal';
import type { QuantumProject, SecureMessage, SecureFile, SystemStatus } from '@/lib/types';

export function QuantumSuite() {
  const [terminalCommand, setTerminalCommand] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [showNDA, setShowNDA] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectPriority, setNewProjectPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery<QuantumProject[]>({
    queryKey: ['/api/quantum/projects'],
  });

  const { data: messages = [] } = useQuery<SecureMessage[]>({
    queryKey: ['/api/quantum/messages'],
  });

  const { data: files = [] } = useQuery<SecureFile[]>({
    queryKey: ['/api/quantum/files'],
  });

  const { data: systemStatus } = useQuery<SystemStatus>({
    queryKey: ['/api/system/status'],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await apiRequest('POST', '/api/quantum/projects', projectData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quantum/projects'] });
      setNewProjectName('');
      setNewProjectDescription('');
      toast({
        title: "Project Created",
        description: "New quantum project created successfully",
      });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await apiRequest('POST', '/api/quantum/messages', messageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quantum/messages'] });
      setChatMessage('');
    }
  });

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    createProjectMutation.mutate({
      name: newProjectName,
      description: newProjectDescription,
      priority: newProjectPriority,
      totalTasks: Math.floor(Math.random() * 20) + 5,
      dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      members: ["ER", "AI"]
    });
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    sendMessageMutation.mutate({
      content: chatMessage,
      author: "Ervin Radosavlevici"
    });
  };

  const handleTerminalCommand = () => {
    if (!terminalCommand.trim()) return;

    // Simulate terminal command processing
    toast({
      title: "Command Executed",
      description: `Quantum command "${terminalCommand}" processed securely`,
    });
    setTerminalCommand('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-secondary/20 text-secondary';
      case 'low': return 'bg-accent/20 text-accent';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'No date';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Project Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">RADOS Quantum Suite</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-accent hover:bg-accent/80 text-white">
                    <i className="fas fa-plus mr-2"></i>New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                      <Input
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-slate-200"
                        placeholder="Enter project name..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                      <Textarea
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-slate-200"
                        placeholder="Project description..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                      <Select value={newProjectPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewProjectPriority(value)}>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateProject} disabled={createProjectMutation.isPending} className="w-full">
                      {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Project Cards */}
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <i className="fas fa-project-diagram text-3xl mb-4"></i>
                  <p>No projects yet. Create your first quantum project!</p>
                </div>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-slate-200">{project.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(project.priority)}`}>
                            {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{project.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-400">
                          <span><i className="fas fa-tasks mr-1"></i>{project.completedTasks}/{project.totalTasks} tasks</span>
                          <span><i className="fas fa-calendar mr-1"></i>Due {formatDate(project.dueDate)}</span>
                          <span><i className="fas fa-users mr-1"></i>{Array.isArray(project.members) ? project.members.length : 0} members</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden mb-2">
                          <div 
                            className="h-full bg-accent rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400">{project.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* NLP Terminal */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quantum Terminal</h3>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
              <div className="text-accent mb-2">RADOS-QUANTUM v1.0.0 - Secure Terminal</div>
              <div className="text-slate-400 mb-2">$ quantum status --all</div>
              <div className="text-slate-300 mb-1">[✓] Biometric authentication: {systemStatus?.biometricLock?.toUpperCase() || 'ACTIVE'}</div>
              <div className="text-slate-300 mb-1">[✓] Anti-copy protection: ENABLED</div>
              <div className="text-slate-300 mb-1">[✓] Session logging: {systemStatus?.sessionLog?.toUpperCase() || 'SECURE'}</div>
              <div className="text-slate-300 mb-4">[✓] Root access: {systemStatus?.rootAccess?.toUpperCase() || 'VERIFIED'}</div>
              <div className="flex items-center">
                <span className="text-accent mr-2">quantum></span>
                <input 
                  type="text" 
                  value={terminalCommand}
                  onChange={(e) => setTerminalCommand(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTerminalCommand()}
                  className="bg-transparent border-none outline-none text-slate-200 flex-1" 
                  placeholder="Enter command..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Team Chat */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Secure Chat</h3>
            <div className="space-y-3 h-64 overflow-y-auto mb-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <i className="fas fa-comments text-2xl mb-2"></i>
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="chat-message">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {message.author.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">
                          {message.author} • {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : 'Now'}
                        </div>
                        <p className="text-sm text-slate-200">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex space-x-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-700/50 border-slate-600 text-slate-200 placeholder-slate-400"
                placeholder="Secure message..."
              />
              <Button 
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending}
                className="bg-primary hover:bg-primary/80"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
          </div>

          {/* File Sharing */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Secure Files</h3>
            <div className="space-y-3 mb-4">
              {files.length === 0 ? (
                <div className="text-center py-4 text-slate-400">
                  <i className="fas fa-folder-open text-2xl mb-2"></i>
                  <p className="text-sm">No files uploaded yet</p>
                </div>
              ) : (
                files.map((file) => (
                  <div key={file.id} className="bg-slate-700/30 rounded-lg p-3 hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                        <i className={`fas ${
                          file.mimeType.includes('image') ? 'fa-file-image' :
                          file.mimeType.includes('pdf') ? 'fa-file-pdf' :
                          file.mimeType.includes('code') ? 'fa-file-code' :
                          'fa-file'
                        } text-primary text-sm`}></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-200">{file.originalName}</h4>
                        <p className="text-xs text-slate-400">
                          {formatFileSize(file.size)} • {file.encrypted ? 'Encrypted' : 'Unencrypted'} {file.watermarked && '• Watermarked'}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                        <i className="fas fa-download"></i>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <i className="fas fa-cloud-upload-alt text-slate-400 text-2xl mb-2"></i>
              <p className="text-sm text-slate-400">Drop files here or click to upload</p>
              <p className="text-xs text-slate-500">Auto-encrypted with quantum security</p>
            </div>
          </div>
        </div>

        {/* Security & Analytics */}
        <div className="space-y-6">
          {/* Biometric Status */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Security Center</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Biometric Lock</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-accent text-sm">{systemStatus?.biometricLock || 'Active'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">VM Detection</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-accent text-sm">{systemStatus?.vmDetection || 'Blocked'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Root Access</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-accent text-sm">{systemStatus?.rootAccess || 'Verified'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Session Log</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-accent text-sm">{systemStatus?.sessionLog || 'Secure'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quantum Toolkit */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quantum Tools</h3>
            <div className="space-y-3">
              <Button 
                variant="outline"
                className="w-full bg-slate-700/50 hover:bg-slate-700 border-slate-600 justify-start"
                onClick={() => toast({ title: "Key Generator", description: "Quantum encryption key generated" })}
              >
                <i className="fas fa-key text-primary mr-3"></i>
                Key Generator
              </Button>
              <Button 
                variant="outline"
                className="w-full bg-slate-700/50 hover:bg-slate-700 border-slate-600 justify-start"
                onClick={() => toast({ title: "Encrypt File", description: "File encryption module activated" })}
              >
                <i className="fas fa-shield-alt text-accent mr-3"></i>
                Encrypt File
              </Button>
              <Button 
                variant="outline"
                className="w-full bg-slate-700/50 hover:bg-slate-700 border-slate-600 justify-start"
                onClick={() => toast({ title: "Network Scan", description: "Quantum network scan initiated" })}
              >
                <i className="fas fa-network-wired text-secondary mr-3"></i>
                Network Scan
              </Button>
            </div>
          </div>

          {/* NDA Modal Trigger */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <Button 
              onClick={() => setShowNDA(true)}
              className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 justify-start"
            >
              <i className="fas fa-file-contract text-red-400 mr-3"></i>
              <div className="text-left">
                <div className="text-red-400 font-medium">NDA Required</div>
                <div className="text-xs text-red-300">Click to view terms</div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <NDAModal isOpen={showNDA} onClose={() => setShowNDA(false)} />
    </>
  );
}
