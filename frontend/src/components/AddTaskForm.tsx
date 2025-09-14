import React, { useState } from 'react';

interface AddTaskFormProps {
  onAddTask: (taskData: { title: string; description: string; totalItems: number; date: string }) => Promise<void>;
  selectedDate: string;
  isEndedDay: boolean;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask, selectedDate, isEndedDay }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalItems: 1
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalItems' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onAddTask({
        ...formData,
        date: selectedDate
      });
      
      setFormData({
        title: '',
        description: '',
        totalItems: 1
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isEndedDay) {
    return null;
  }

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-accent hover:bg-accent-hover text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          + Add New Task
        </button>
      ) : (
        <div className="bg-bg-secondary border border-border-color rounded-lg p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-bg-tertiary border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Enter task title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description (optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 bg-bg-tertiary border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Enter task description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Total Items *
              </label>
              <input
                type="number"
                name="totalItems"
                required
                min="1"
                value={formData.totalItems}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-bg-tertiary border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="e.g., 4 for 4 questions"
              />
              <p className="text-text-muted text-xs mt-1">
                How many items/questions/parts does this task have?
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded font-medium disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Task'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-bg-tertiary hover:bg-border-color text-text-primary px-4 py-2 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddTaskForm;