import React, { useState } from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onUpdateProgress: (taskId: string, progressData: { completedItems: number; note: string }) => Promise<void>;
  onDelete: (taskId: string) => void;
  isEndedDay: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateProgress, onDelete, isEndedDay }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [completedItems, setCompletedItems] = useState(task.completedItems);
  const [note, setNote] = useState(task.note || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdateProgress(task._id, { completedItems, note });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCompletedItems(task.completedItems);
    setNote(task.note || '');
    setIsEditing(false);
  };

  const getProgressColor = () => {
    if (task.completionPercentage >= 80) return 'bg-productive';
    if (task.completionPercentage >= 50) return 'bg-moderate';
    return 'bg-not-productive';
  };

  return (
    <div className="bg-bg-secondary border border-border-color rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-text-primary">{task.title}</h3>
        {!isEndedDay && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-accent hover:text-accent-hover text-sm"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-text-secondary text-sm mb-3">{task.description}</p>
      )}

      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-secondary text-sm">
            Progress: {task.completedItems}/{task.totalItems} ({task.completionPercentage}%)
          </span>
        </div>
        
        <div className="w-full bg-bg-tertiary rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getProgressColor()}`}
            style={{ width: `${task.completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {isEditing && !isEndedDay ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Completed Items
            </label>
            <input
              type="number"
              min="0"
              max={task.totalItems}
              value={completedItems}
              onChange={(e) => setCompletedItems(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Add a note about your progress..."
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded text-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="bg-bg-tertiary hover:bg-border-color text-text-primary px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        task.note && (
          <div className="mt-3">
            <p className="text-text-secondary text-sm">
              <span className="font-medium">Note:</span> {task.note}
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default TaskCard;