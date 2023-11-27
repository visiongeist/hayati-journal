import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core'
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { FormBuilder } from '@angular/forms'
import { AuthSession } from '@supabase/supabase-js'
import { SupabaseService } from '../../supabase.service'
import * as DateFns from 'date-fns';
import { DiaryEntryService } from '../../diary-entry.service';
import { Subscription, fromEvent, map, merge, of, take } from 'rxjs';
import { RxDocument } from 'rxdb';

@Component({
  selector: 'app-diary-entry',
  templateUrl: './diary-entry.component.html',
  styleUrls: ['./diary-entry.component.scss'],
})
export class DiaryEntryComponent implements OnInit, OnDestroy {
  loading = false

  @Output() dateChangeEvent: EventEmitter<any> = new EventEmitter();

  session!: AuthSession

  // feeling map
  public readonly feelingMap = {
    'happy': '😀',
    'sad': '😢',
    'fear': '😱',
    'anger': '😡',
    'love': '❤️',
  };

  // all entries of the day
  entries: any[] = [];

  diaryEntryForm = this.formBuilder.group({
    id: '',
    day: 1,
    month: 1,
    year: 2023,
    content: '',
    feeling: '',
  })

  previousDate: Date = new Date();
  nextDate: Date = new Date();
  _currentDate: Date = new Date();

  onDateChangeSubscription: Subscription;
  onCollectionChangeSubscription: Subscription;

  networkStatus = false;
  networkStatusSubscription: Subscription = null;

  replicationInProgress = false;
  replicationStatusSubscription: Subscription = null;

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly diaryEntryService: DiaryEntryService,
    private formBuilder: FormBuilder,
    private _ngZone: NgZone
  ) {

  }

  async ngOnInit(): Promise<void> {
    // subscribe to date changes
    this.onDateChangeSubscription = this.dateChangeEvent.subscribe((date) => this.onDateChange(date));
    // just set today
    this.currentDate = new Date();
    // save session to supabase
    this.session = await this.supabase.getSession();
    // subscribe to collection changes
    const collection = await this.diaryEntryService.getCollection();
    this.onCollectionChangeSubscription = collection.$.subscribe((changeEvent: any) => this.onCollectionChange(changeEvent));
    // subscribe to network connection status
    this.subscribeNetworkStatus();
    // subscribe to replication status
    this.replicationStatusSubscription = this.diaryEntryService.replication.active$.subscribe((bool: boolean) => this.replicationInProgress = bool);
  }

  async ngOnDestroy(): Promise<void> {
    if (this.onDateChangeSubscription) {
      this.onDateChangeSubscription.unsubscribe();
    }
    if (this.onCollectionChangeSubscription) {
      this.onCollectionChangeSubscription.unsubscribe();
    }
    if (this.networkStatusSubscription) {
      this.networkStatusSubscription.unsubscribe();
    }
    if (this.replicationStatusSubscription) {
      this.replicationStatusSubscription.unsubscribe();
    }
  }

  subscribeNetworkStatus() {
    this.networkStatus = navigator.onLine;
    this.networkStatusSubscription = merge(
      of(null),
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    )
      .pipe(map(() => navigator.onLine))
      .subscribe(status => {
        console.log('status', status);
        this.networkStatus = status;
      });
  }

  /**
   * 
   */
  public get currentDate(): Date {
    return this._currentDate;
  }

  /**
   * 
   */
  public set currentDate(date: Date) {
    this._currentDate = date || (new Date()); // set today if null
    this.previousDate = DateFns.add(this.currentDate, { days: -1 }); // needed for UI
    this.nextDate = DateFns.add(this.currentDate, { days: 1 }); // needed for UI
    this.dateChangeEvent.emit(this._currentDate);
  }

  /**
   * On collection changes this function checks if it impacts the current date
   * @param changeEvent 
   */
  public async onCollectionChange(changeEvent: any) {
    const impactedDocument = changeEvent.documentData;

    if (impactedDocument.day === this.currentDate.getDate() &&
      impactedDocument.month === this.currentDate.getMonth() &&
      impactedDocument.year === this.currentDate.getFullYear()) {
        this.diaryEntryForm.patchValue(impactedDocument);
    }
  }

  public async onDateChange(date: Date) {
    // extract date parts 
    const dateParts = {
      day: DateFns.getDate(date),
      month: DateFns.getMonth(date),
      year: DateFns.getYear(date),
      user_id: (await this.diaryEntryService.getSession()).user.id
    };
    // update form
    this.diaryEntryForm.patchValue(dateParts);

    const res = await this.diaryEntryService.getEntries(dateParts.day, dateParts.month);
    const thisYearsEntry = res.find((e: any) => e.year === dateParts.year);

    this.entries = res
      .sort((a: any, b: any) => { return a.year < b.year ? -1 : 1 })
      .reverse();

    if (thisYearsEntry) {
      this.diaryEntryForm.patchValue(thisYearsEntry.toJSON());
    } else {
      this.diaryEntryForm.patchValue({
        id: '',
        content: '',
        feeling: ''
      });
    }
  }

  /**
   * For the textarea resizing
   */
  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  async onSubmit(): Promise<void> {
    const MINIMUM_BLOCK_TIME = 1500; //ms
    const startTime = Date.now();
    try {
      this.loading = true
      const formVal = this.diaryEntryForm.getRawValue();
      await this.diaryEntryService.upsertEntry(formVal);
      // @todo minimum block time
      this.diaryEntryForm.markAsPristine();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setTimeout(() => { // ensure we don't save to fast on the UI
        this.loading = false;
      }, Math.max(startTime + MINIMUM_BLOCK_TIME - Date.now(), 0));
    }
  }

  // @todo, move that into a component
  async onResetClick() {
    await this.diaryEntryService.reset();
  }

  async signOut() {
    await this.supabase.signOut()
  }
}