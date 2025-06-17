import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { MusicProject } from '@/lib/types';

export function RealArtistStudio() {
  const [lyrics, setLyrics] = useState('');
  const [genre, setGenre] = useState('pop');
  const [mood, setMood] = useState('upbeat');
  const [voiceStyle, setVoiceStyle] = useState('female');
  const [title, setTitle] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery<MusicProject[]>({
    queryKey: ['/api/music/projects'],
  });

  const generateMusicMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await apiRequest('POST', '/api/music/generate', projectData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/music/projects'] });
      setLyrics('');
      setTitle('');
      toast({
        title: "Music Generation Started",
        description: "Your track is being generated. Check back in a few minutes!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate music. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    if (!lyrics.trim() || !title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both title and lyrics for your song.",
        variant: "destructive",
      });
      return;
    }

    generateMusicMutation.mutate({
      title,
      lyrics,
      genre,
      mood,
      voiceStyle
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-accent';
      case 'processing': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Creation Interface */}
      <div className="space-y-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">RealArtist Studio</h2>
          
          {/* Song Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Song Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
              placeholder="Enter your song title..."
            />
          </div>
          
          {/* Lyrics Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Song Lyrics</label>
            <Textarea 
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder-slate-400 h-32 resize-none"
              placeholder="Enter your song lyrics here..."
            />
          </div>

          {/* Genre & Style */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pop">Pop</SelectItem>
                  <SelectItem value="rock">Rock</SelectItem>
                  <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                  <SelectItem value="electronic">Electronic</SelectItem>
                  <SelectItem value="jazz">Jazz</SelectItem>
                  <SelectItem value="classical">Classical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mood</label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upbeat">Upbeat</SelectItem>
                  <SelectItem value="melancholic">Melancholic</SelectItem>
                  <SelectItem value="energetic">Energetic</SelectItem>
                  <SelectItem value="chill">Chill</SelectItem>
                  <SelectItem value="romantic">Romantic</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Voice Style</label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={voiceStyle === 'male' ? 'default' : 'outline'}
                onClick={() => setVoiceStyle('male')}
                className={`flex flex-col p-3 h-auto ${
                  voiceStyle === 'male' 
                    ? 'bg-secondary/20 border-secondary' 
                    : 'bg-slate-700/50 hover:bg-secondary/20 border-slate-600 hover:border-secondary'
                }`}
              >
                <i className="fas fa-male text-blue-400 mb-2"></i>
                <span className="text-xs">Male</span>
              </Button>
              <Button
                variant={voiceStyle === 'female' ? 'default' : 'outline'}
                onClick={() => setVoiceStyle('female')}
                className={`flex flex-col p-3 h-auto ${
                  voiceStyle === 'female' 
                    ? 'bg-secondary/20 border-secondary' 
                    : 'bg-slate-700/50 hover:bg-secondary/20 border-slate-600 hover:border-secondary'
                }`}
              >
                <i className="fas fa-female text-secondary mb-2"></i>
                <span className="text-xs">Female</span>
              </Button>
              <Button
                variant={voiceStyle === 'synthetic' ? 'default' : 'outline'}
                onClick={() => setVoiceStyle('synthetic')}
                className={`flex flex-col p-3 h-auto ${
                  voiceStyle === 'synthetic' 
                    ? 'bg-secondary/20 border-secondary' 
                    : 'bg-slate-700/50 hover:bg-secondary/20 border-slate-600 hover:border-secondary'
                }`}
              >
                <i className="fas fa-robot text-purple-400 mb-2"></i>
                <span className="text-xs">Synthetic</span>
              </Button>
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate}
            disabled={generateMusicMutation.isPending}
            className="w-full bg-gradient-to-r from-secondary to-purple-600 hover:from-secondary/80 hover:to-purple-600/80 py-4"
          >
            {generateMusicMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-magic mr-2"></i>
                Generate Full Track
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview & Dashboard */}
      <div className="space-y-6">
        {/* Audio Player */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
          <div className="bg-slate-700/30 rounded-lg p-6 text-center">
            {/* Waveform visualization placeholder */}
            <div className="mb-4">
              <div className="flex justify-center items-end space-x-1 h-16">
                {Array.from({ length: 20 }, (_, i) => (
                  <div 
                    key={i}
                    className="w-2 bg-gradient-to-t from-secondary to-purple-600 rounded-t-sm opacity-70" 
                    style={{ height: `${Math.random() * 80 + 20}%` }}
                  ></div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Button 
                size="lg"
                className="bg-secondary hover:bg-secondary/80 text-white w-12 h-12 rounded-full p-0"
              >
                <i className="fas fa-play"></i>
              </Button>
              <span className="text-slate-300">0:00 / 3:42</span>
            </div>
          </div>
        </div>

        {/* Project Manager */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Projects</h3>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="bg-slate-700/30 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-slate-600 rounded mb-2"></div>
                  <div className="h-3 bg-slate-600 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <i className="fas fa-music text-3xl mb-4"></i>
              <p>No projects yet. Create your first track!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-200">{project.title}</h4>
                      <p className="text-xs text-slate-400">
                        {project.genre} • {project.duration ? formatDuration(project.duration) : 'Processing...'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${getStatusColor(project.status)}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                      <i className="fas fa-chevron-right text-slate-400"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Button 
            variant="outline"
            className="w-full mt-4 bg-slate-700/50 hover:bg-slate-700 border-slate-600"
            onClick={() => {
              setTitle('');
              setLyrics('');
              toast({ title: "New Project", description: "Ready to create a new track!" });
            }}
          >
            <i className="fas fa-plus mr-2"></i>New Project
          </Button>
        </div>

        {/* Copyright & Export */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Export & Copyright</h3>
          <div className="space-y-3">
            <Button 
              variant="outline"
              className="w-full bg-slate-700/50 hover:bg-slate-700 border-slate-600 justify-start"
              onClick={() => toast({ title: "Download", description: "MP3 download will be available once generation is complete" })}
            >
              <i className="fas fa-download text-accent mr-3"></i>
              Download MP3
            </Button>
            <Button 
              variant="outline"
              className="w-full bg-slate-700/50 hover:bg-slate-700 border-slate-600 justify-start"
              onClick={() => toast({ title: "Video Generation", description: "Video generation feature coming soon!" })}
            >
              <i className="fas fa-video text-secondary mr-3"></i>
              Generate Video
            </Button>
            <Button 
              variant="outline"
              className="w-full bg-slate-700/50 hover:bg-slate-700 border-slate-600 justify-start"
              onClick={() => toast({ title: "Copyright", description: "Copyright protection automatically applied" })}
            >
              <i className="fas fa-copyright text-primary mr-3"></i>
              Copyright Tag
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
