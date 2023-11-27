import { Component, OnInit } from '@angular/core';
import { DiaryEntryService } from 'src/app/diary-entry.service';
import { OfflineDatabaseService } from 'src/app/offline-database.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

  constructor(
    private readonly offlineDatabase: OfflineDatabaseService,
    private readonly diaryEntryService: DiaryEntryService
  ) {

  }

  initialized = false;

  async ngOnInit() {
    const database = await this.offlineDatabase.getDatabase();
    console.log('Database created');

    await this.diaryEntryService.startReplication();
    console.log('Replication started');

    if (navigator.onLine) {
      await this.diaryEntryService.replication.awaitInitialReplication();
      console.log('Initial replication completed');
    } else {
      console.log('Device offline, skip initial replication.')
    }

    // emits all errors that happen when running the push- & pull-handlers.
    this.diaryEntryService.replication.error$.subscribe((error: any) => console.log('Synchronization Error', error));

    this.initialized = true;
  }

}
