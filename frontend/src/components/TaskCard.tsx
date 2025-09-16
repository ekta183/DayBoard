import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { Edit, Check, Settings, Trash2, MessageSquare, SquarePen } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onUpdateTask: (taskId: string, taskData: { title?: string; description?: string; totalItems?: number; completedItems?: number; note?: string }) => Promise<void>;
  onDelete: (taskId: string) => void;
  isEndedDay: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateTask, onDelete, isEndedDay }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [completedItems, setCompletedItems] = useState(task.completedItems);
  const [note, setNote] = useState(task.note || '');
  const [currentTitle, setCurrentTitle] = useState(task.title);
  const [currentDescription, setCurrentDescription] = useState(task.description || '');
  const [currentTotalItems, setCurrentTotalItems] = useState(task.totalItems);
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
      await onUpdateTask(task._id, { completedItems, note });
      setLastUpdateTime(new Date());

      // Show celebration for milestones
      if (completedItems === currentTotalItems && !task.isCompleted) {
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
      await onUpdateTask(task._id, {
        title: currentTitle,
        description: currentDescription,
        totalItems: currentTotalItems
      });
      setIsEditing(false);
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentTitle(task.title);
    setCurrentDescription(task.description || '');
    setCurrentTotalItems(task.totalItems);
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
    if (task.completionPercentage >= 80) return '#059669';
    if (task.completionPercentage >= 50) return '#d97706';
    return '#dc2626';
  };

  const getProgressTextColor = () => {
    return '#ffffff';
  };

  const getProgressGradient = () => {
    if (task.completionPercentage >= 80) return 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
    if (task.completionPercentage >= 50) return 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
    return 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)';
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
      className={`card hover-lift animate-fade-in ${showCelebration ? 'animate-pulse' : ''}`}
      style={{ position: 'relative', borderColor: getUrgencyColor() === 'border-red-500' ? '#ef4444' : getUrgencyColor() === 'border-yellow-500' ? '#f59e0b' : 'transparent' }}
      onTouchStart={handleTouchStart}
    >
      {/* Celebration overlay */}
      {showCelebration && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <div style={{ fontSize: '2.25rem', animation: 'bounce 1s infinite' }}>🎉</div>
        </div>
      )}
      
      {/* Auto-save indicator */}
      {isAutoSaving && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.75rem',
          color: 'var(--text-accent)'
        }}>
          <div style={{
            width: '0.5rem',
            height: '0.5rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '50%',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}></div>
          <span>Saving...</span>
        </div>
      )}
      
      {/* Last update time */}
      {lastUpdateTime && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          left: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-subtle)'
        }}>
          {getTimeAwareness()}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
          <div style={{ flexShrink: 0, marginTop: '0.25rem' }}>
            {task.isCompleted ? (
              <div style={{
                width: '1.5rem',
                height: '1.5rem',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Check style={{ width: '1rem', height: '1rem', color: 'white' }} />
              </div>
            ) : (
              <div style={{
                width: '1.5rem',
                height: '1.5rem',
                border: '2px solid var(--border-secondary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  borderRadius: '50%',
                  backgroundColor: getProgressColor()
                }}></div>
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="text-lg font-semibold text-text-primary mb-1">{currentTitle}</h3>
            {currentDescription && (
              <p className="text-text-muted text-sm leading-relaxed">{currentDescription}</p>
            )}
            {/* Progress tip */}
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-accent)',
              fontWeight: '500'
            }}>
              {getProgressTip()}
            </div>
          </div>
        </div>
        {!isEndedDay && (
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
            >
              <Settings style={{ width: '1rem', height: '1rem' }} />
              Quick
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
            >
              <Edit style={{ width: '0.75rem', height: '0.75rem' }} />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="btn btn-danger"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
            >
              <Trash2 style={{ width: '1rem', height: '1rem' }} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && !isEndedDay && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #262626 0%, #333333 100%)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border-secondary)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem'
          }}>
            <h4 className="text-sm font-semibold text-text-primary">Quick Actions</h4>
            <button
              onClick={() => setShowQuickActions(false)}
              className="text-text-muted hover:text-text-primary"
            >
              ✕
            </button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.5rem'
          }}>
            <button
              onClick={() => handleQuickAction('increment-1')}
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              disabled={completedItems >= task.totalItems}
            >
              +1
            </button>
            <button
              onClick={() => handleQuickAction('increment-5')}
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              disabled={completedItems >= task.totalItems}
            >
              +5
            </button>
            <button
              onClick={() => handleQuickAction('increment-10')}
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              disabled={completedItems >= task.totalItems}
            >
              +10
            </button>
            <button
              onClick={() => handleQuickAction('complete-all')}
              className="btn btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              disabled={completedItems >= task.totalItems}
            >
              Complete All
            </button>
            <button
              onClick={() => handleQuickAction('decrement-1')}
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              disabled={completedItems <= 0}
            >
              -1
            </button>
            <button
              onClick={() => handleQuickAction('decrement-5')}
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              disabled={completedItems <= 0}
            >
              -5
            </button>
            <button
              onClick={() => handleQuickAction('reset')}
              className="btn btn-danger"
              style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              disabled={completedItems <= 0}
            >
              Reset
            </button>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              Swipe → Complete
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="text-text-muted text-sm font-medium">
              Productivity
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              background: getProgressGradient(),
              color: task.completionPercentage >= 80 ? 'var(--productive-bg)' : task.completionPercentage >= 50 ? 'var(--moderate-bg)' : 'var(--not-productive-bg)'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                {Math.round((completedItems / task.totalItems) * 100)}%
              </span>
            </div>
            {task.isCompleted && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: 'var(--productive)'
              }}>
                <Check style={{ width: '1rem', height: '1rem' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Complete</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced Progress Bar with Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100%',
              background: 'linear-gradient(135deg, #333333 0%, #404040 100%)',
              borderRadius: '9999px',
              height: '1rem',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <div style={{
                height: '1rem',
                borderRadius: '9999px',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                background: getProgressGradient(),
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                width: `${(completedItems / task.totalItems) * 100}%`
              }}></div>
            </div>
          </div>

          {/* Touch-friendly slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="text-xs text-text-subtle">0</span>
            <input
              type="range"
              min="0"
              max={currentTotalItems}
              value={completedItems}
              onChange={handleSliderChange}
              className="slider"
              style={{
                flex: 1,
                height: '0.5rem',
                background: 'linear-gradient(135deg, #333333 0%, #404040 100%)',
                borderRadius: '0.5rem',
                appearance: 'none',
                cursor: 'pointer'
              }}
              disabled={isEndedDay}
            />
            <span className="text-xs text-text-subtle">{currentTotalItems}</span>
          </div>

          {/* Progress stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <span>{completedItems} of {currentTotalItems} items</span>
            <span>{currentTotalItems - completedItems} remaining</span>
          </div>
        </div>

        {/* Note section for progress */}
        {!isEndedDay && (
          <div style={{ marginTop: '0.75rem', position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.25rem'
            }}>
              <label className="block text-xs font-medium text-text-primary">
                Progress Note (optional)
              </label>
              {!isEditingNote && (
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="text-accent"
                  title="Edit note"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                    e.currentTarget.style.borderRadius = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <SquarePen size={16} />
                </button>
              )}
            </div>

            {isEditingNote ? (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="form-control"
                style={{
                  resize: 'none',
                  fontSize: '0.75rem'
                }}
                placeholder="Add a note about your progress..."
                autoFocus
              />
            ) : (
              <div style={{
                minHeight: '2.5rem',
                padding: '0.5rem',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                {note || "Click edit to add a progress note..."}
              </div>
            )}

            {isEditingNote && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}>
                <button
                  onClick={() => {
                    setNote(task.note || '');
                    setIsEditingNote(false);
                  }}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: 'var(--text-muted)',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #262626 0%, #333333 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await onUpdateTask(task._id, { note });
                      setIsEditingNote(false);
                    } catch (error) {
                      console.error('Error saving note:', error);
                    }
                  }}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: 'white',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: '1px solid var(--accent)',
                    borderRadius: '0.375rem',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
                  }}
                >
                  <Check style={{ width: '0.75rem', height: '0.75rem' }} />
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing && !isEndedDay && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #262626 0%, #333333 100%)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border-secondary)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <Edit style={{ width: '1rem', height: '1rem', color: 'var(--text-accent)' }} />
            <h4 className="text-sm font-semibold text-text-primary">Edit Task Details</h4>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              className="form-control"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description (optional)
            </label>
            <textarea
              value={currentDescription}
              onChange={(e) => setCurrentDescription(e.target.value)}
              rows={3}
              className="form-control"
              style={{ resize: 'none' }}
              placeholder="Enter task description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Total Items
            </label>
            <input
              type="number"
              min="1"
              value={currentTotalItems}
              onChange={(e) => setCurrentTotalItems(parseInt(e.target.value))}
              className="form-control"
              placeholder="Enter total items"
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '0.75rem',
            paddingTop: '0.5rem'
          }}>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <Check style={{ width: '1rem', height: '1rem' }} />
              )}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-secondary"
              style={{ padding: '0 1.5rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;