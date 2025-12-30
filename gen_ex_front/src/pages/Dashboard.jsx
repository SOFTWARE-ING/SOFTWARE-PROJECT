import React, { useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useProjectStore } from '../stores/projectStore';
import { Plus, FileText, Clock, CheckCircle } from 'lucide-react';

/**
 * Dashboard page showing overview of projects
 */
export const Dashboard = () => {
  const { projects, loading, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FileText },
    { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, icon: CheckCircle },
    { label: 'In Progress', value: projects.filter(p => p.status === 'processing').length, icon: Clock }
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
            <p className="text-muted mt-1">Welcome back! Here's your project overview.</p>
          </div>
          <Button>
            <Plus size={20} className="mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center">
                <div className="p-3 bg-accent-primary/10 rounded-xl mr-4">
                  <stat.icon size={24} className="text-accent-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-muted text-sm">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border border-primary rounded-xl hover:bg-tertiary transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-accent-primary/10 rounded-lg">
                        <FileText size={20} className="text-accent-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-primary">{project.title}</h3>
                        <p className="text-sm text-muted">
                          Created {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={project.status === 'completed' ? 'success' : 'warning'}>
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};