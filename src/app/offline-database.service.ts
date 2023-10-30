import { isDevMode } from '@angular/core';
import { Injectable } from '@angular/core';
import {
  addRxPlugin,
  createRevision,
  createRxDatabase,
  parseRevision,
  RxDatabaseBase,
  RxJsonSchema,
  RxStorage
} from 'rxdb';

import {
  getRxStorageDexie
} from 'rxdb/plugins/storage-dexie';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';

const DATABASE_NAME = 'diary_db';

@Injectable({
  providedIn: 'root'
})
export class OfflineDatabaseService {

  private _database: any;

  private waitForDbSetup: Promise<any>;

  constructor() {
    this.waitForDbSetup = new Promise(async (resolve, reject) => {
      // set up data base
      if (isDevMode()) {
        addRxPlugin(RxDBDevModePlugin);
      }

      addRxPlugin(RxDBUpdatePlugin);

      const database = await createRxDatabase({
        name: DATABASE_NAME,
        storage: getRxStorageDexie(),  // Uses IndexedDB
      });

      this._database = database;

      resolve(database);
    });
  }

  async getDatabase() {
    if (!this._database) {
      return this.waitForDbSetup;
    }

    return this._database;
  }

  async addSchema(name: string, schema: any) {
    const database = await this.getDatabase();

    const collection: any = {};
    collection[name] = {
      schema: schema
    }

    return await database.addCollections(collection);
  }

}
