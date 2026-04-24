class NewReply {
  constructor(payload) {
    this._verify(payload);
    const { id, content, owner } = payload;
    this.id = id;
    this.content = content;
    this.owner = owner;
  }

  _verify({ id, content, owner }) {
    if (!id || !content || !owner) {
      throw new Error("NEW_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof id !== "string" ||
      typeof content !== "string" ||
      typeof owner !== "string"
    ) {
      throw new Error("NEW_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

export default NewReply;
