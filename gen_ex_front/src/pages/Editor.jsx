import React, { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Stepper } from '../components/ui/Stepper';
import { FileUploader } from '../components/features/FileUploader';
import { ExerciseEditor } from '../components/features/ExerciseEditor';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useProjectStore } from '../stores/projectStore';
import { useExerciseStore } from '../stores/exerciseStore';
import { ArrowLeft, ArrowRight, Download, Share } from 'lucide-react';

/**
 * Editor page with stepper workflow
 */
export const Editor = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [config, setConfig] = useState({
    difficulty: 'medium',
    language: 'en',
    type: 'qcm'
  });

  const { createProject } = useProjectStore();
  const { exercises, generateExercises, loading } = useExerciseStore();

  const steps = [
    { title: 'Upload', description: 'Select PDF file' },
    { title: 'Configure', description: 'Set AI parameters' },
    { title: 'Edit', description: 'Review & edit questions' },
    { title: 'Export', description: 'Download or share' }
  ];

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleNext = async () => {
    if (currentStep === 0 && selectedFile) {
      // Create project
      await createProject({
        title: selectedFile.name.replace('.pdf', ''),
        source_file_url: URL.createObjectURL(selectedFile),
        status: 'processing'
      });
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Generate exercises
      await generateExercises('temp-id', config);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="max-w-2xl mx-auto">
            <FileUploader onFileSelect={handleFileSelect} loading={loading} />
          </div>
        );

      case 1:
        return (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={config.difficulty}
                    onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Language
                  </label>
                  <select
                    value={config.language}
                    onChange={(e) => setConfig({ ...config, language: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Exercise Type
                  </label>
                  <select
                    value={config.type}
                    onChange={(e) => setConfig({ ...config, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="qcm">Multiple Choice (QCM)</option>
                    <option value="fill-in-the-blank">Fill in the Blank</option>
                    <option value="open-ended">Open Ended</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return exercises.length > 0 ? (
          <ExerciseEditor
            exercise={exercises[0]}
            onUpdate={() => {
              // Update the exercise in store
            }}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600">Generating exercises...</p>
          </div>
        );

      case 3:
        return (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Export & Share</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="flex items-center justify-center">
                    <Download size={20} className="mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center">
                    <Download size={20} className="mr-2" />
                    Download JSON
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Share Link
                  </label>
                  <div className="flex">
                    <Input
                      value="https://genex.app/share/abc123"
                      readOnly
                      className="flex-1"
                    />
                    <Button variant="outline" className="ml-2">
                      <Share size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={handlePrevious} disabled={currentStep === 0}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </div>

        <Stepper steps={steps} currentStep={currentStep} />

        <div className="mb-8">
          {renderStepContent()}
        </div>

        {currentStep < steps.length - 1 && (
          <div className="flex justify-end">
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 0 && !selectedFile) ||
                loading
              }
            >
              {loading ? 'Processing...' : 'Next'}
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};