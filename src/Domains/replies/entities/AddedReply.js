class AddedReplies {
  constructor(payload) {
    this._verify(payload);

    const { content } = payload;

    this.content = content;
  }

  _verify(payload) {
    const { content } = payload;
    if (!content) {
      throw new Error("ADDED_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (typeof content !== "string") {
      throw new Error("ADDED_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

export default AddedReplies;
