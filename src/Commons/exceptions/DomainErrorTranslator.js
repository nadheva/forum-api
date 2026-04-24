import InvariantError from "./InvariantError.js";

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  "REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada",
  ),
  "REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat membuat user baru karena tipe data tidak sesuai",
  ),
  "REGISTER_USER.USERNAME_LIMIT_CHAR": new InvariantError(
    "tidak dapat membuat user baru karena karakter username melebihi batas limit",
  ),
  "REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER": new InvariantError(
    "tidak dapat membuat user baru karena username mengandung karakter terlarang",
  ),
  "USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "harus mengirimkan username dan password",
  ),
  "USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "username dan password harus string",
  ),
  "REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN":
    new InvariantError("harus mengirimkan token refresh"),
  "REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION":
    new InvariantError("refresh token harus string"),
  "DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN":
    new InvariantError("harus mengirimkan token refresh"),
  "DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION":
    new InvariantError("refresh token harus string"),
  "REGISTERED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "payload thread tidak boleh kosong",
  ),
  "REGISTERED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "payload thread tidak valid",
  ),
  "NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "payload comment tidak boleh kosong",
  ),
  "NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "payload comment tidak valid",
  ),
  "COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "payload comment detail tidak boleh kosong",
  ),
  "COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "payload comment detail tidak valid",
  ),
  "ADDED_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "payload added reply tidak boleh kosong",
  ),
  "ADDED_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "payload added reply tidak valid",
  ),
  "NEW_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "payload new reply tidak boleh kosong",
  ),
  "NEW_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "payload new reply tidak valid",
  ),
  "LIKE.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "payload like tidak boleh kosong",
  ),
  "LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "payload like tidak valid",
  ),
};

export default DomainErrorTranslator;
