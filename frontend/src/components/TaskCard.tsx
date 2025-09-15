import React, { useState, useEffect, useRef } from 'react';
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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const taskRef = useRef<HTMLDivElement>(null);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (completedItems !== task.completedItems || note !== (task.note || '')) {
      autoSaveTimeoutRef.current = setTimeout(async () => {
        await autoSave();
      }, 2000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [completedItems, note]);

  const autoSave = async () => {
    if (completedItems === task.completedItems && note === (task.note || '')) return;
    
    setIsAutoSaving(true);
    try {
      await onUpdateProgress(task._id, { completedItems, note });
      setLastUpdateTime(new Date());
      
      // Show celebration for milestones
      if (completedItems === task.totalItems && !task.isCompleted) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } catch (error) {
      console.error('Error auto-saving task:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdateProgress(task._id, { completedItems, note });
      setIsEditing(false);
      setLastUpdateTime(new Date());
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

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    let newValue = completedItems;
    
    switch (action) {
      case 'increment-1':
        newValue = Math.min(completedItems + 1, task.totalItems);
        break;
      case 'increment-5':
        newValue = Math.min(completedItems + 5, task.totalItems);
        break;
      case 'increment-10':
        newValue = Math.min(completedItems + 10, task.totalItems);
        break;
      case 'decrement-1':
        newValue = Math.max(completedItems - 1, 0);
        break;
      case 'decrement-5':
        newValue = Math.max(completedItems - 5, 0);
        break;
      case 'complete-all':
        newValue = task.totalItems;
        break;
      case 'reset':
        newValue = 0;
        break;
    }
    
    setCompletedItems(newValue);
    
    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setCompletedItems(newValue);
  };

  const getProgressColor = () => {
    if (task.completionPercentage >= 80) return 'bg-productive';
    if (task.completionPercentage >= 50) return 'bg-moderate';
    return 'bg-not-productive';
  };

  const getProgressTextColor = () => {
    if (task.completionPercentage >= 80) return 'text-productive-bg';
    if (task.completionPercentage >= 50) return 'text-moderate-bg';
    return 'text-not-productive-bg';
  };

  // Smart features and contextual help
  const getProgressTip = () => {
    const percentage = Math.round((completedItems / task.totalItems) * 100);
    
    if (percentage === 0) {
      return "🚀 Ready to start? Break it down into smaller steps!";
    } else if (percentage < 25) {
      return "💪 Great start! Keep the momentum going!";
    } else if (percentage < 50) {
      return "🔥 You're making progress! You're almost halfway there!";
    } else if (percentage < 75) {
      return "⚡ More than halfway done! You're on fire!";
    } else if (percentage < 100) {
      return "🎯 Almost there! Just a few more items to go!";
    } else {
      return "🎉 Congratulations! Task completed!";
    }
  };

  const getTimeAwareness = () => {
    if (!lastUpdateTime) return null;
    
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastUpdateTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just updated";
    if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `Updated ${Math.floor(diffMinutes / 60)}h ago`;
    return `Updated ${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const getUrgencyColor = () => {
    const percentage = Math.round((completedItems / task.totalItems) * 100);
    const hoursLeft = 24 - new Date().getHours();
    
    if (percentage < 30 && hoursLeft < 4) return 'border-red-500';
    if (percentage < 50 && hoursLeft < 8) return 'border-yellow-500';
    return 'border-transparent';
  };

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;
      
      // Swipe right to complete, left to reset
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          handleQuickAction('complete-all');
        } else {
          handleQuickAction('reset');
        }
      }
    };
    
    document.addEventListener('touchend', handleTouchEnd, { once: true });
  };

  return (
    <div 
      ref={taskRef}
      className={`card hover-lift animate-fade-in relative ${getUrgencyColor()} ${showCelebration ? 'animate-pulse' : ''}`}
      onTouchStart={handleTouchStart}
    >
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center z-10">
          <div className="text-4xl animate-bounce">🎉</div>
        </div>
      )}
      
      {/* Auto-save indicator */}
      {isAutoSaving && (
        <div className="absolute top-2 right-2 flex items-center space-x-1 text-xs text-accent">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
          <span>Saving...</span>
        </div>
      )}
      
      {/* Last update time */}
      {lastUpdateTime && (
        <div className="absolute top-2 left-2 text-xs text-text-subtle">
          {getTimeAwareness()}
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            {task.isCompleted ? (
              <div className="w-6 h-6 bg-productive rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 border-2 border-border-secondary rounded-full flex items-center justify-center">
                <div className={`w-3 h-3 rounded-full ${getProgressColor()}`}></div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary mb-1">{task.title}</h3>
            {task.description && (
              <p className="text-text-muted text-sm leading-relaxed">{task.description}</p>
            )}
            {/* Progress tip */}
            <div className="mt-2 text-xs text-accent font-medium">
              {getProgressTip()}
            </div>
          </div>
        </div>
        {!isEndedDay && (
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="btn btn-ghost text-xs px-3 py-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Quick
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-ghost text-xs px-3 py-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="btn btn-danger text-xs px-3 py-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && !isEndedDay && (
        <div className="mb-4 p-4 bg-bg-tertiary rounded-lg border border-border-secondary">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-text-primary">Quick Actions</h4>
            <button
              onClick={() => setShowQuickActions(false)}
              className="text-text-muted hover:text-text-primary"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickAction('increment-1')}
              className="btn btn-ghost text-xs py-2"
              disabled={completedItems >= task.totalItems}
            >
              +1
            </button>
            <button
              onClick={() => handleQuickAction('increment-5')}
              className="btn btn-ghost text-xs py-2"
              disabled={completedItems >= task.totalItems}
            >
              +5
            </button>
            <button
              onClick={() => handleQuickAction('increment-10')}
              className="btn btn-ghost text-xs py-2"
              disabled={completedItems >= task.totalItems}
            >
              +10
            </button>
            <button
              onClick={() => handleQuickAction('complete-all')}
              className="btn btn-primary text-xs py-2"
              disabled={completedItems >= task.totalItems}
            >
              Complete All
            </button>
            <button
              onClick={() => handleQuickAction('decrement-1')}
              className="btn btn-ghost text-xs py-2"
              disabled={completedItems <= 0}
            >
              -1
            </button>
            <button
              onClick={() => handleQuickAction('decrement-5')}
              className="btn btn-ghost text-xs py-2"
              disabled={completedItems <= 0}
            >
              -5
            </button>
            <button
              onClick={() => handleQuickAction('reset')}
              className="btn btn-danger text-xs py-2"
              disabled={completedItems <= 0}
            >
              Reset
            </button>
            <div className="text-xs text-text-muted flex items-center justify-center">
              Swipe → Complete
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-text-muted text-sm font-medium">
              Productivity
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full ${getProgressColor()} ${getProgressTextColor()}`}>
              <span className="text-sm font-bold">
                {Math.round((completedItems / task.totalItems) * 100)}%
              </span>
            </div>
            {task.isCompleted && (
              <div className="flex items-center space-x-1 text-productive">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-medium">Complete</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced Progress Bar with Slider */}
        <div className="space-y-3">
          <div className="relative">
            <div className="w-full bg-bg-quaternary rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className={`h-4 rounded-full transition-all duration-500 ease-out ${getProgressColor()} shadow-lg`}
                style={{ width: `${(completedItems / task.totalItems) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Touch-friendly slider */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-text-subtle">0</span>
            <input
              type="range"
              min="0"
              max={task.totalItems}
              value={completedItems}
              onChange={handleSliderChange}
              className="flex-1 h-2 bg-bg-quaternary rounded-lg appearance-none cursor-pointer slider"
              disabled={isEndedDay}
            />
            <span className="text-xs text-text-subtle">{task.totalItems}</span>
          </div>
          
          {/* Progress stats */}
          <div className="flex justify-between text-xs text-text-muted">
            <span>{completedItems} of {task.totalItems} items</span>
            <span>{task.totalItems - completedItems} remaining</span>
          </div>
        </div>
      </div>

      {isEditing && !isEndedDay ? (
        <div className="space-y-4 p-4 bg-bg-tertiary rounded-lg border border-border-secondary">
          <div className="flex items-center space-x-2 mb-3">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h4 className="text-sm font-semibold text-text-primary">Edit Task Progress</h4>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Completed Items
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={task.totalItems}
                value={completedItems}
                onChange={(e) => setCompletedItems(parseInt(e.target.value))}
                className="form-control pr-12"
                placeholder="Enter completed items"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted text-sm">
                / {task.totalItems}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="form-control resize-none"
              placeholder="Add a note about your progress..."
            />
          </div>
          
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-secondary px-6"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        task.note && (
          <div className="mt-4 p-3 bg-bg-tertiary rounded-lg border-l-4 border-accent">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <div>
                <p className="text-xs font-medium text-accent mb-1">Note</p>
                <p className="text-text-secondary text-sm leading-relaxed">{task.note}</p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default TaskCard;