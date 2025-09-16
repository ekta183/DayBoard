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
    <div style={{ marginBottom: '1.5rem' }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          + Add New Task
        </button>
      ) : (
        <div className="bg-bg-secondary" style={{
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '0.5rem',
          padding: '1rem'
        }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div>
              <label className="text-text-primary" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter task title"
              />
            </div>
            
            <div>
              <label className="text-text-primary" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Description (optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="form-control"
                style={{ resize: 'vertical' }}
                placeholder="Enter task description"
              />
            </div>
            
            <div>
              <label className="text-text-primary" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Total Items *
              </label>
              <input
                type="number"
                name="totalItems"
                required
                min="1"
                value={formData.totalItems}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., 4 for 4 questions"
              />
              <p className="text-text-muted" style={{
                fontSize: '0.75rem',
                marginTop: '0.25rem'
              }}>
                How many items/questions/parts does this task have?
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  'Add Task'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddTaskForm;