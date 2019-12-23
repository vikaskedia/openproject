import {Component, OnInit} from "@angular/core";
import {FilterOperator} from "core-components/api/api-v3/api-v3-filter-builder";
import {WidgetTimeEntriesListComponent} from "core-app/modules/grids/widgets/time-entries/list/time-entries-list.component";

@Component({
  templateUrl: './time-entries-current-user.component.html',
})
export class WidgetTimeEntriesCurrentUserComponent extends WidgetTimeEntriesListComponent implements OnInit {
  protected dmFilters():Array<[string, FilterOperator, [string]]> {
    return [['spentOn', '>t-', ['7']] as [string, FilterOperator, [string]],
            ['user_id', '=', ['me']] as [string, FilterOperator, [string]]];
  }
}
