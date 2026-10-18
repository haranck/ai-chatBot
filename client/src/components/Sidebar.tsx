import { LogOut, MessageSquare, SquarePen, Trash2, X } from 'lucide-react';
import type { Conversation, User } from '../types/chat';

interface Props {
  user: User;
  conversations: Conversation[];
  activeId: string | null;
  loading: boolean;
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onSignOut: () => void;
}

const DAY = 24 * 60 * 60 * 1000;

// Conversations arrive newest first, so groups come out in order
function groupByDate(conversations: Conversation[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = today.getTime();

  const groups: { label: string; items: Conversation[] }[] = [];
  for (const chat of conversations) {
    const t = new Date(chat.updatedAt).getTime();
    const label =
      t >= start ? 'Today'
      : t >= start - DAY ? 'Yesterday'
      : t >= start - 7 * DAY ? 'Previous 7 days'
      : t >= start - 30 * DAY ? 'Previous 30 days'
      : 'Older';

    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(chat);
    else groups.push({ label, items: [chat] });
  }
  return groups;
}

export function Sidebar({
  user,
  conversations,
  activeId,
  loading,
  open,
  onClose,
  onNewChat,
  onSelect,
  onDelete,
  onSignOut,
}: Props) {
  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Chat history">
        <div className="sidebar-head">
          <span className="sidebar-brand">Pseudo AI</span>
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <button className="sidebar-new" onClick={onNewChat}>
          <SquarePen size={16} />
          <span>New chat</span>
        </button>

        <nav className="sidebar-list">
          {loading ? (
            <div className="sidebar-skeleton">
              {Array.from({ length: 6 }, (_, i) => <span key={i} />)}
            </div>
          ) : conversations.length === 0 ? (
            <p className="sidebar-empty">
              <MessageSquare size={15} />
              No chats yet. Your conversations will show up here.
            </p>
          ) : (
            groupByDate(conversations).map((group) => (
              <div key={group.label} className="sidebar-group">
                <div className="sidebar-group-label">{group.label}</div>
                {group.items.map((chat) => (
                  <div key={chat.id} className={`conv-item ${chat.id === activeId ? 'active' : ''}`}>
                    <button className="conv-title" onClick={() => onSelect(chat.id)} title={chat.title}>
                      {chat.title}
                    </button>
                    <button
                      className="conv-delete"
                      onClick={() => onDelete(chat.id)}
                      aria-label={`Delete "${chat.title}"`}
                      title="Delete chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </nav>

        <div className="sidebar-user">
          {user.avatar ? (
            <img className="avatar" src={user.avatar} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className="avatar avatar-fallback">{user.name.charAt(0).toUpperCase()}</span>
          )}
          <div className="user-meta">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
          </div>
          <button className="icon-btn" onClick={onSignOut} title="Sign out" aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {open && <div className="sidebar-backdrop" onClick={onClose} />}
    </>
  );
}
