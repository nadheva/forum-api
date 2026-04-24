/* eslint-disable camelcase */
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("comments", {
    id: {
      type: "VARCHAR(100)",
      notNull: true,
      primaryKey: true,
    },
    content: {
      type: "TEXT",
      notNull: true,
    },
    owner: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    thread: {
      type: "VARCHAR(100)",
      notNull: true,
    },
    date: {
      type: "TIMESTAMPTZ",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },

    is_delete: {
      type: "BOOLEAN",
      notNull: true,
      default: false,
    },
  });

  pgm.createConstraint("comments", "foreign_key_comments_owner", {
    foreignKeys: {
      columns: "owner",
      references: "users(id)",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  });

  pgm.createConstraint("comments", "foreign_key_comments_threads", {
    foreignKeys: {
      columns: "thread",
      references: "threads(id)",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropConstraint("comments", "foreign_key_comments_owner");
  pgm.dropConstraint("comments", "foreign_key_comments_threads");
};
