import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseReplication } from 'rxdb-supabase';
import { OfflineDatabaseService } from './offline-database.service';
import { diaryEntrySchema } from './databaseschema/diary-entry.schema';
import { v4 as uuidv4 } from 'uuid'
import { replicateRxCollection } from 'rxdb/plugins/replication';

@Injectable({
  providedIn: 'root'
})
export class DiaryEntryService extends SupabaseService {

  // collection in RxDB
  private _collection: any = null;
  private _replication: any = null;

  constructor(
    private offlineDatabaseService: OfflineDatabaseService
  ) {
    super();
  }

  get replication() {
    return this._replication;
  }

  async getCollection() {
    if (!this._collection) {
      const collections = await this.offlineDatabaseService.addSchema('diaryentries', diaryEntrySchema);
      this._collection = collections.diaryentries;
    }

    return this._collection;
  }

  async startReplication() {
    const collection = await this.getCollection();
    const session = await this.getSession();
    const user = session?.user;

    this._replication = new SupabaseReplication({
      supabaseClient: this.supabase,
      collection: collection,
      replicationIdentifier: user.id.replaceAll('-', ''),
      table: 'app_diary_entries',
      pull: {  // If absent, no data is pulled from Supabase
        realtimePostgresChanges: true,
      },
      push: {}, // If absent, no changes are pushed to Supabase
    });

    //collection.$.subscribe((changeEvent: any) => console.dir(changeEvent));
  }

  async reset() {
    const collection = await this.getCollection();
    await collection.destroy();
    //await this._replication.reSync();
  }

  async getByDate(day: number, month: number, year: number) {
    const collection = await this.getCollection();

    const query = collection
      .findOne({
        selector: {
          day: day,
          month: month,
          year: year
        }
      });

    return query.exec();
  }

  async getById(id: string) {
    const collection = await this.getCollection();

    const query = collection
      .findOne({
        selector: {
          id: id
        }
      });

    return query.exec();
  }

  async getEntries(day: number, month: number) {
    const collection = await this.getCollection();

    const query = collection
      .find({
        selector: {
          day: day,
          month: month
        }
      });

    return query.exec();
  }

  async upsertEntry(entry: any) {
    const collection = await this.getCollection();

    const session = await this.getSession();
    const user = session?.user;
    const update = {
      ...entry,
      user_id: user?.id
    }

    const doc = await this.getByDate(update.day, update.month, update.year);
    if (doc) {
      await doc.update({
        $set: update
      });
    } else { // insert
      update.id = uuidv4();
      await collection.insert(update);
    }
  }
}
