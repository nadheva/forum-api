/* eslint-disable camelcase */
class ReplyDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, date, username, is_delete = false } = payload;

    this.id = id;
    this.content = is_delete ? "**balasan telah dihapus**" : content;
    this.date = date;
    this.username = username;
  }

  _verifyPayload(payload) {
    const { id, content, date, username, is_delete = false } = payload;

    if (!id || !content || !date || !username) {
      throw new Error("REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof id !== "string" ||
      typeof content !== "string" ||
      (typeof date !== "string" && typeof date !== "object") ||
      typeof username !== "string" ||
      typeof is_delete !== "boolean"
    ) {
      throw new Error("REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

export default ReplyDetail;