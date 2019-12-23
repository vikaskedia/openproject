import {Component, ElementRef, Input, OnDestroy, OnInit, SecurityContext, ViewChild, AfterViewInit, Output, EventEmitter} from "@angular/core";
import {FullCalendarComponent} from '@fullcalendar/angular';
import {States} from "core-components/states.service";
import * as moment from "moment";
import { Moment } from 'moment';
import {StateService} from "@uirouter/core";
import {I18nService} from "core-app/modules/common/i18n/i18n.service";
import {NotificationsService} from "core-app/modules/common/notifications/notifications.service";
import {DomSanitizer} from "@angular/platform-browser";
import timeGrid from '@fullcalendar/timegrid';
import { EventInput, EventApi } from '@fullcalendar/core';
import { EventSourceError } from '@fullcalendar/core/structs/event-source';
import { ToolbarInput } from '@fullcalendar/core/types/input-types';
import {ConfigurationService} from "core-app/modules/common/config/configuration.service";
import {TimeEntryDmService} from "core-app/modules/hal/dm-services/time-entry-dm.service";
import {FilterOperator} from "core-components/api/api-v3/api-v3-filter-builder";
import {TimeEntryResource} from "core-app/modules/hal/resources/time-entry-resource";
import {TimezoneService} from "core-components/datetime/timezone.service";
import {CollectionResource} from "core-app/modules/hal/resources/collection-resource";

interface CalendarViewEvent {
  el:HTMLElement;
  event:EventApi;
  jsEvent:MouseEvent;
}

@Component({
  templateUrl: './te-calendar.template.html',
  selector: 'te-calendar',
})
export class TimeEntryCalendarComponent implements OnInit, OnDestroy {
  @ViewChild(FullCalendarComponent, { static: false }) ucCalendar:FullCalendarComponent;
  @Input() projectIdentifier:string;
  @Input() static:boolean = false;
  @Output() entries = new EventEmitter<CollectionResource<TimeEntryResource>>();

  public calendarPlugins = [timeGrid];
  public calendarEvents:Function;
  public calendarHeader:ToolbarInput|boolean = false;
  public calendarSlotLabelFormat = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
  };
  public calendarScrollTime = '00:00:00';
  public calendarContentHeight = 618;
  public calendarAllDaySlot = false;
  public calendarDisplayEventTime = false;

  constructor(readonly states:States,
              readonly timeEntryDm:TimeEntryDmService,
              readonly $state:StateService,
              private element:ElementRef,
              readonly i18n:I18nService,
              readonly notificationsService:NotificationsService,
              private sanitizer:DomSanitizer,
              private configuration:ConfigurationService,
              private timezone:TimezoneService) { }

  ngOnInit() {
    this.initializeCalendar();
  }

  ngOnDestroy() {
    // nothing to do
  }


  public calendarEventsFunction(fetchInfo:{ start:Date, end:Date, timeZone:string },
                                successCallback:(events:EventInput[]) => void,
                                failureCallback:(error:EventSourceError) => void ):void | PromiseLike<EventInput[]> {

    this.timeEntryDm.list({ filters: this.dmFilters(fetchInfo) })
      .then((collection) => {
        this.entries.emit(collection);
        successCallback(this.buildEntries(collection.elements));
      });
  }

  private buildEntries(entries:TimeEntryResource[]) {
    let calendarEntries = [];

    let hoursDistribution:{ [key:string]:Moment } = {};

    return entries.map((entry) => {
      let start:Moment;

      if (hoursDistribution[entry.spentOn]) {
        start = hoursDistribution[entry.spentOn];
      } else {
        start = moment(entry.spentOn);
      }

      let end = start.clone().add(this.timezone.toHours(entry.hours), 'h');

      hoursDistribution[entry.spentOn] = end;

      return {
        title: entry.workPackage && entry.workPackage.name || entry.project.name,
        start: start.format(),
        end: end.format(),
        entry: entry
      };
    });
  }

  protected dmFilters(fetchInfo:{ start:Date, end:Date, timeZone:string }):Array<[string, FilterOperator, string[]]> {
    let startDate = moment(fetchInfo.start).format('YYYY-MM-DD');
    let endDate = moment(fetchInfo.end).format('YYYY-MM-DD');
    return [['spentOn', '<>d', [startDate, endDate]] as [string, FilterOperator, string[]],
      ['user_id', '=', ['me']] as [string, FilterOperator, [string]]];
  }

  private initializeCalendar() {
    this.calendarEvents = this.calendarEventsFunction.bind(this);
  }

  public get calendarEditable() {
    return false;
  }

  public get calendarEventLimit() {
    return false;
  }

  public get calendarLocale() {
    return this.i18n.locale;
  }

  public get calendarFixedWeekCount() {
    return false;
  }

  public get calendarDefaultView() {
    return 'timeGridWeek';
  }

  public get calendarFirstDay() {
    return this.configuration.startOfWeek();
  }

  private get calendarElement() {
    return jQuery(this.element.nativeElement).find('.fc-view-container');
  }
}
