import Dexie, { Table } from 'dexie';
import { ChatLog } from '../_const/chatconstants'

export class ChatDB extends Dexie {
  chatLists!: Table<ChatLog, number>;
  constructor() {
    super('ChatDB');
    this.version(1).stores({
      chatLists: '++id'
    });
  }

  deleteList(chatListId: number) {
    return this.transaction('rw', this.chatLists, () => {
      this.chatLists.delete(chatListId);
    });
  }
}

export const db = new ChatDB();

export function resetDatabase() {
  return db.transaction('rw', db.chatLists,  async () => {
    await Promise.all(db.tables.map(table => table.clear()));
  });
}