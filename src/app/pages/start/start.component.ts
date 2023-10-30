import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

    // emits each document that was received from the remote
    this.diaryEntryService.replication.received$.subscribe((doc: any) => console.dir(doc));

    // emits each document that was send to the remote
    this.diaryEntryService.replication.send$.subscribe((doc: any) => console.dir(doc));

    // emits all errors that happen when running the push- & pull-handlers.
    this.diaryEntryService.replication.error$.subscribe((error: any) => console.dir(error));

    // emits true when the replication was canceled, false when not.
    this.diaryEntryService.replication.canceled$.subscribe((bool: boolean) => console.dir(bool));

    // emits true when a replication cycle is running, false when not.
    this.diaryEntryService.replication.active$.subscribe((bool: boolean) => console.dir(bool));

    this.initialized = true;
  }

}
