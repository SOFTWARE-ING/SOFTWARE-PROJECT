import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Trash2, Edit3 } from 'lucide-react';

/**
 * Exercise editor component with split screen
 * @param {Object} props
 * @param {Exercise} props.exercise - The exercise to edit
 * @param {function} props.onUpdate - Callback when exercise is updated
 */
export const ExerciseEditor = ({ exercise, onUpdate }) => {
  // const [editingQuestion, setEditingQuestion] = useState(null);

  const handleQuestionUpdate = (questionId, field, value) => {
    const updatedQuestions = exercise.questions.map(q =>
      q.id === questionId ? { ...q, [field]: value } : q
    );
    onUpdate({ ...exercise, questions: updatedQuestions });
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: `q${Date.now()}`,
      prompt: 'New question',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: ''
    };
    onUpdate({
      ...exercise,
      questions: [...exercise.questions, newQuestion]
    });
  };

  const handleDeleteQuestion = (questionId) => {
    onUpdate({
      ...exercise,
      questions: exercise.questions.filter(q => q.id !== questionId)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
      {/* Left: Question Editor */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Questions</CardTitle>
          <Button onClick={handleAddQuestion} size="sm">
            <Plus size={16} className="mr-2" />
            Add Question
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[500px]">
          <div className="space-y-6">
            {exercise.questions.map((question, index) => (
              <div key={question.id} className="border border-primary rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-primary">Question {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-error hover:text-error"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Question
                    </label>
                    <Input
                      value={question.prompt}
                      onChange={(e) => handleQuestionUpdate(question.id, 'prompt', e.target.value)}
                      placeholder="Enter your question"
                    />
                  </div>

                  {exercise.type === 'qcm' && (
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">
                        Options
                      </label>
                      {question.options.map((option, optionIndex) => (
                        <Input
                          key={optionIndex}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...question.options];
                            newOptions[optionIndex] = e.target.value;
                            handleQuestionUpdate(question.id, 'options', newOptions);
                          }}
                          placeholder={`Option ${optionIndex + 1}`}
                          className="mb-2"
                        />
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Correct Answer
                    </label>
                    <Input
                      value={question.correct_answer}
                      onChange={(e) => handleQuestionUpdate(question.id, 'correct_answer', e.target.value)}
                      placeholder="Enter the correct answer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Explanation
                    </label>
                    <Input
                      value={question.explanation}
                      onChange={(e) => handleQuestionUpdate(question.id, 'explanation', e.target.value)}
                      placeholder="Explain the answer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right: PDF Preview */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>PDF Preview</CardTitle>
        </CardHeader>
        <CardContent className="h-[500px] bg-tertiary rounded-lg flex items-center justify-center">
          <div className="text-center text-muted">
            <Edit3 size={48} className="mx-auto mb-4 text-muted" />
            <p>PDF preview will be implemented</p>
            <p className="text-sm">Showing page 1 of the document</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};