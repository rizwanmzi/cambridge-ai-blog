import type { Comment, CommentNode } from "./comment-types";

export function buildCommentTree(flatComments: Comment[]): CommentNode[] {
  const map = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  // Initialise all nodes
  for (const c of flatComments) {
    map.set(c.id, { ...c, replies: [] });
  }

  for (const c of flatComments) {
    const node = map.get(c.id)!;

    if (c.parent_id === null) {
      // Top-level comment
      roots.push(node);
    } else {
      const parent = map.get(c.parent_id);
      if (parent) {
        if (parent.parent_id === null) {
          // Parent is root → attach as reply (level 2)
          parent.replies.push(node);
        } else {
          // Parent is already a reply → flatten up to grandparent (max 2 levels)
          const grandparent = map.get(parent.parent_id);
          if (grandparent) {
            grandparent.replies.push(node);
          } else {
            roots.push(node);
          }
        }
      } else {
        // Orphan — treat as root
        roots.push(node);
      }
    }
  }

  return roots;
}
