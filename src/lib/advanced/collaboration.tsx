import { useState, useEffect, useCallback, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Send, User, Users, Eye, Edit, MessageCircle, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  status?: "online" | "away" | "offline";
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  edited?: boolean;
  replies?: Comment[];
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: Date;
  details?: Record<string, any>;
}

interface CollaboratorPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  entityId: string;
  entityType: string;
  action: "viewing" | "editing";
  timestamp: Date;
}

export class CollaborationService {
  private static instance: CollaborationService;
  private presence: Map<string, CollaboratorPresence[]> = new Map();
  private listeners: Set<(presence: CollaboratorPresence[]) => void> = new Set();

  private constructor() {}

  static getInstance() {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  announce(presence: CollaboratorPresence) {
    const key = `${presence.entityType}:${presence.entityId}`;
    const existing = this.presence.get(key) || [];

    const filtered = existing.filter(
      (p) => p.userId !== presence.userId || Date.now() - p.timestamp.getTime() > 30000
    );

    this.presence.set(key, [...filtered, presence]);
    this.notifyListeners(key);

    setTimeout(() => {
      this.removePresence(presence);
    }, 30000);
  }

  removePresence(presence: CollaboratorPresence) {
    const key = `${presence.entityType}:${presence.entityId}`;
    const existing = this.presence.get(key) || [];
    const filtered = existing.filter((p) => p.userId !== presence.userId);
    this.presence.set(key, filtered);
    this.notifyListeners(key);
  }

  getPresence(entityType: string, entityId: string): CollaboratorPresence[] {
    const key = `${entityType}:${entityId}`;
    return this.presence.get(key) || [];
  }

  subscribe(
    entityType: string,
    entityId: string,
    callback: (presence: CollaboratorPresence[]) => void
  ) {
    this.listeners.add(callback);
    callback(this.getPresence(entityType, entityId));

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(key: string) {
    const [entityType, entityId] = key.split(":");
    const presence = this.getPresence(entityType, entityId);
    this.listeners.forEach((listener) => listener(presence));
  }
}

interface UsePresenceOptions {
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: "viewing" | "editing";
}

export function usePresence({
  entityType,
  entityId,
  userId,
  userName,
  userAvatar,
  action,
}: UsePresenceOptions) {
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();
  const service = CollaborationService.getInstance();

  const announcePresence = useCallback(() => {
    service.announce({
      userId,
      userName,
      userAvatar,
      entityId,
      entityType,
      action,
      timestamp: new Date(),
    });
  }, [entityType, entityId, userId, userName, userAvatar, action, service]);

  useEffect(() => {
    announcePresence();
    intervalRef.current = setInterval(announcePresence, 15000);

    const unsubscribe = service.subscribe(entityType, entityId, setCollaborators);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      unsubscribe();
      service.removePresence({
        userId,
        userName,
        userAvatar,
        entityId,
        entityType,
        action,
        timestamp: new Date(),
      });
    };
  }, [entityType, entityId, userId, userName, userAvatar, action, service, announcePresence]);

  const otherCollaborators = collaborators.filter((c) => c.userId !== userId);

  return {
    collaborators: otherCollaborators,
    viewerCount: otherCollaborators.filter((c) => c.action === "viewing").length,
    editorCount: otherCollaborators.filter((c) => c.action === "editing").length,
  };
}

interface CollaboratorAvatarsProps {
  collaborators: CollaboratorPresence[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CollaboratorAvatars({
  collaborators,
  maxDisplay = 3,
  size = "md",
  className,
}: CollaboratorAvatarsProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  const displayed = collaborators.slice(0, maxDisplay);
  const remaining = Math.max(0, collaborators.length - maxDisplay);

  if (collaborators.length === 0) return null;

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {displayed.map((collab) => (
        <Avatar
          key={collab.userId}
          className={cn(
            "border-2 border-background ring-2",
            collab.action === "editing"
              ? "ring-yellow-500"
              : "ring-green-500",
            sizeClasses[size]
          )}
          title={`${collab.userName} is ${collab.action}`}
        >
          <AvatarImage src={collab.userAvatar} />
          <AvatarFallback>
            {collab.userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground font-medium",
            sizeClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

interface PresenceIndicatorProps {
  collaborators: CollaboratorPresence[];
  className?: string;
}

export function PresenceIndicator({
  collaborators,
  className,
}: PresenceIndicatorProps) {
  if (collaborators.length === 0) return null;

  const viewers = collaborators.filter((c) => c.action === "viewing");
  const editors = collaborators.filter((c) => c.action === "editing");

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {viewers.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Eye className="h-4 w-4 text-green-500" />
          <span className="text-muted-foreground">{viewers.length} viewing</span>
        </div>
      )}
      {editors.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Edit className="h-4 w-4 text-yellow-500" />
          <span className="text-muted-foreground">{editors.length} editing</span>
        </div>
      )}
      <CollaboratorAvatars collaborators={collaborators} />
    </div>
  );
}

interface CommentThreadProps {
  comments: Comment[];
  currentUserId: string;
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onEditComment?: (commentId: string, content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  className?: string;
}

export function CommentThread({
  comments,
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  className,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await onAddComment(newComment, replyTo || undefined);
      setNewComment("");
      setReplyTo(null);
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    } catch (error) {
      toast({
        title: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim() || !onEditComment) return;

    try {
      await onEditComment(commentId, editContent);
      setEditingId(null);
      setEditContent("");
      toast({
        title: "Comment updated",
      });
    } catch (error) {
      toast({
        title: "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">
          Comments ({comments.length})
        </h3>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.userAvatar} />
                <AvatarFallback>
                  {comment.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                    {comment.edited && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Edited
                      </Badge>
                    )}
                  </div>

                  {comment.userId === currentUserId && (
                    <div className="flex gap-1">
                      {onEditComment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                      {onDeleteComment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteComment(comment.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(comment.id)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setEditContent("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(comment.id)}
                  className="h-7 text-xs"
                >
                  Reply
                </Button>

                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-6 mt-3 space-y-3 border-l-2 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={reply.userAvatar} />
                          <AvatarFallback className="text-xs">
                            {reply.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs">{reply.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs mt-1">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        {replyTo && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Replying to comment</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(null)}
            >
              Cancel
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px]"
          />
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  className?: string;
}

export function ActivityFeed({
  activities,
  maxItems = 10,
  className,
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Recent Activity</h3>
      </div>

      <div className="space-y-2">
        {displayedActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.userAvatar} />
              <AvatarFallback>
                {activity.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{activity.userName}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {activities.length > maxItems && (
        <Button variant="outline" className="w-full" size="sm">
          View all activity ({activities.length})
        </Button>
      )}
    </div>
  );
}
