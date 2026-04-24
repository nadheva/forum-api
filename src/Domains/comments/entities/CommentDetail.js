/* eslint-disable camelcase */
import ReplyDetail from "../../replies/entities/ReplyDetail.js";

class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id, username, content, date, is_delete = false, likeCount = 0, replies = [] } = payload;

    this.id = id;
    this.username = username;
    this.content = is_delete ? "**komentar telah dihapus**" : content;
    this.date = date;
    this.likeCount = likeCount;
    this.replies = replies.map((reply) => new ReplyDetail(reply));
  }

  _verifyPayload(payload) {
    const { id, username, content, date, is_delete = false } = payload;

    if (!id || !username || !content || !date) {
      throw new Error("COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof id !== "string" ||
      typeof username !== "string" ||
      typeof content !== "string" ||
      (typeof date !== "string" && typeof date !== "object") ||
      typeof is_delete !== "boolean"
    ) {
      throw new Error("COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

export default CommentDetail;